import type { Prisma } from '@libs/prisma';
import { z } from 'zod';
import formidable, { errors as formidableErrors } from 'formidable';
import type { Request } from 'express';
import sharp, { type ResizeOptions } from 'sharp';
import { PassThrough, Writable } from 'node:stream';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../../env.js';
import {
  comparePasswords,
  excludeObjectKeys,
  hashPassword,
  signJwt,
} from '../utils/index.js';
import { ModelBase } from '../core/classes/index.js';
import { errorFactory } from '../core/helpers/index.js';

const PASSWORD_MIN = 4;
const PASSWORD_MAX = 20;
const NAME_MIN = 1;
const NAME_MAX = 50;
const BIO_MAX = 200;
const AVATAR_EXPIRES_IN = 5 * 3600; // 5 hours

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
  region: env.AWS_S3_REGION,
});

const avatarUploaderConfig = {
  inputExt: ['jpeg', 'png', 'webp'],
  outputExt: 'webp' as const,
  maxFiles: 1,
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  bucketKeyPrefix: 'avatars/',
};

const customFormidableErrors = {
  invalidType: ['invalidType', -100],
} as const;

const SignUpInput = z.object({
  firstName: z.string().trim().min(NAME_MIN).max(NAME_MAX),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(PASSWORD_MIN).max(PASSWORD_MAX),
}) satisfies z.Schema<Prisma.UserCreateInput>;

const SignInInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(1, 'Is required'),
});

const UpdateInput = z.object({
  id: z.number().gte(1),
  firstName: SignUpInput.shape.firstName.optional(),
  lastName: z.string().trim().max(NAME_MAX).nullable().optional(),
  email: SignUpInput.shape.email.optional(),
  bio: z.string().trim().max(BIO_MAX).nullable().optional(),
}) satisfies z.Schema<
  Pick<Prisma.UserUpdateInput, 'firstName' | 'lastName' | 'bio' | 'email'>
>;

export default class UserModel extends ModelBase {
  async signUp(data: z.infer<typeof SignUpInput>) {
    SignUpInput.parse(data);

    const user = await this.client.user.findUnique({
      where: { email: data.email },
    });

    if (user) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid data',
        formFields: {
          email: ['User with provided email is already exist'],
        },
      });
    }

    const hashedPassword = await hashPassword(data.password);
    const newUser = await this.client.user.create({
      data: { ...data, password: hashedPassword },
    });
    const token = signJwt({ userId: newUser.id });

    return { user: excludeObjectKeys(newUser, ['password']), token };
  }

  async signIn(data: z.infer<typeof SignInInput>) {
    SignInInput.parse(data);

    const user = await this.client.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid credentials',
        formFields: {
          email: ["User with provided email doesn't exist"],
        },
      });
    }

    const match = await comparePasswords(data.password, user.password);

    if (!match) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid credentials',
        formFields: {
          password: ["Password doesn't match"],
        },
      });
    }

    const token = signJwt({ userId: user.id });

    return { user: { ...excludeObjectKeys(user, ['password']) }, token };
  }

  async getById(userId: number) {
    const user = await this.client.user.findUnique({
      where: { id: userId },
    });

    // TODO: use findUniqueOrThrow?
    if (!user) {
      throw errorFactory.create('not_found', { message: 'User not found' });
    }

    const withAvatarUrls = await this.setAvatarUrls(user);

    return { user: withAvatarUrls };
  }

  async updateById(data: z.infer<typeof UpdateInput>) {
    const parsedData = UpdateInput.parse(data);

    const user = await this.client.user.update({
      where: { id: parsedData.id },
      data: excludeObjectKeys(parsedData, ['id']),
    });

    return excludeObjectKeys(user, ['password']);
  }

  async deleteById(userId: number) {
    const user = await this.client.user.delete({
      where: { id: userId },
    });

    if (user.avatar && user.avatarThumbnail) {
      await this.removeAvatarFromAWS(user.avatar, user.avatarThumbnail);
    }

    return { user };
  }

  async uploadAvatar(req: Request, userId: number) {
    const outputExt = avatarUploaderConfig.outputExt;
    const resizeOptions: ResizeOptions = {
      fit: 'cover',
      position: 'centre',
    };
    const originTr = sharp({ failOn: 'error' })
      .resize(350, 350, resizeOptions)
      .toFormat(outputExt, { quality: 90 });
    const thumbTr = sharp({ failOn: 'error' })
      .resize(50, 50, resizeOptions)
      .toFormat(outputExt, { quality: 50 });
    const pass = new PassThrough();
    let cancelUploads = false;
    let filesCount = 0;
    let originS3UploadPromise: ReturnType<Upload['done']> | undefined;
    let thumbS3UploadPromise: ReturnType<Upload['done']> | undefined;

    const form = formidable({
      keepExtensions: false,
      allowEmptyFiles: false,
      // maxFiles: avatarUploaderConfig.maxFiles // Use filter instead to
      // prevent error throwing,
      maxFileSize: avatarUploaderConfig.maxFileSize,
      filter: ({ mimetype }) => {
        if (filesCount === avatarUploaderConfig.maxFiles) return false;

        filesCount += 1;

        // keep only images
        const valid = mimetype
          ? avatarUploaderConfig.inputExt.some((ext) =>
              mimetype.includes(`image/${ext}`),
            )
          : false;

        if (!valid) {
          form.emit(
            // @ts-expect-error due to incomplete @types/formidable
            'error',
            new formidableErrors.FormidableError(
              customFormidableErrors.invalidType[0],
              customFormidableErrors.invalidType[1],
              400,
            ),
          ); // optional make form.parse error
          cancelUploads = true; //variable to make filter return false after the first problem
        }

        return valid && !cancelUploads;
      },
      filename: () => `user_${userId}`,
      fileWriteStreamHandler: (file) => {
        if (!file) {
          form.emit(
            // @ts-expect-error due to incomplete @types/formidable
            'error',
            new formidableErrors.FormidableError(
              'noEmptyFiles',
              formidableErrors.noEmptyFiles,
              400,
            ),
          );

          return new Writable();
        }

        const fileMeta = file.toJSON();
        const originImgStream = pass.pipe(originTr);
        const thumbImgStream = pass.pipe(thumbTr);

        const originUpload = new Upload({
          client: s3,
          params: {
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: `${avatarUploaderConfig.bucketKeyPrefix}${fileMeta.newFilename}.${outputExt}`,
            Body: originImgStream,
            ContentType: `image/${outputExt}`,
          },
        });
        const thumbUpload = new Upload({
          client: s3,
          params: {
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: `${avatarUploaderConfig.bucketKeyPrefix}${fileMeta.newFilename}_thumbnail.${outputExt}`,
            Body: thumbImgStream,
            ContentType: `image/${outputExt}`,
          },
        });

        originS3UploadPromise = originUpload.done();
        thumbS3UploadPromise = thumbUpload.done();

        return pass;
      },
    });

    try {
      await form.parse(req);

      const [original, thumbnail] = await Promise.all([
        originS3UploadPromise,
        thumbS3UploadPromise,
      ]);

      if (original?.Key && thumbnail?.Key) {
        const user = await this.client.user.update({
          data: {
            avatar: original.Key,
            avatarThumbnail: thumbnail.Key,
          },
          where: { id: userId },
        });

        return { user };
      } else {
        throw new Error('Empty Key in uploaded objects');
      }
    } catch (err) {
      console.error(err);

      if (
        err instanceof
        // @ts-expect-error due to incomplete @types/formidable
        (formidableErrors.default as typeof formidableErrors.FormidableError)
      ) {
        // @ts-expect-error due to incomplete @types/formidable
        if (err.code === customFormidableErrors.invalidType[1]) {
          throw errorFactory.create('bad_request', {
            message: `Invalid image format. Valid formats are: ${avatarUploaderConfig.inputExt.join(', ')}`,
          });
        } else if (
          // @ts-expect-error due to incomplete @types/formidable
          err.code === formidableErrors.biggerThanMaxFileSize ||
          // @ts-expect-error due to incomplete @types/formidable
          err.code === formidableErrors.biggerThanTotalMaxFileSize
        ) {
          const mbFormatter = new Intl.NumberFormat(undefined, {
            style: 'unit',
            unit: 'megabyte',
            unitDisplay: 'short',
          });

          throw errorFactory.create('bad_request', {
            message: `Invalid file size. File must not exceed ${mbFormatter.format(avatarUploaderConfig.maxFileSize / Math.pow(1024, 2))}`,
          });
        }
      }

      throw errorFactory.create('server_error', {
        message: 'Some error happened during image upload. Please try again',
      });
    }
  }

  async deleteAvatar(userId: number) {
    const user = await this.client.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.avatar || !user.avatarThumbnail) {
      throw errorFactory.create('not_found', {
        message: 'No avatars were found',
      });
    }

    await this.removeAvatarFromAWS(user.avatar, user.avatarThumbnail);

    const updUser = await this.client.user.update({
      data: {
        avatar: null,
        avatarThumbnail: null,
      },
      where: { id: userId },
    });

    return { user: updUser };
  }

  async removeAvatarFromAWS(avatarKey: string, avatarThumbnailKey: string) {
    return s3.send(
      new DeleteObjectsCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Delete: {
          Objects: [{ Key: avatarKey }, { Key: avatarThumbnailKey }],
        },
      }),
    );
  }

  async setAvatarUrls(
    user: Pick<
      NonNullable<
        Prisma.Result<typeof this.client.user, undefined, 'findUnique'>
      >,
      'avatar' | 'avatarThumbnail' | 'avatarUrls'
    >,
  ) {
    if (user.avatar && user.avatarThumbnail) {
      const [avatarUrl, avatarThumbnailUrl] = await Promise.all([
        getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: user.avatar,
          }),
          {
            expiresIn: AVATAR_EXPIRES_IN,
          },
        ),
        getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: user.avatarThumbnail,
          }),
          {
            expiresIn: AVATAR_EXPIRES_IN,
          },
        ),
      ]);

      user.avatarUrls = {
        original: avatarUrl,
        thumbnail: avatarThumbnailUrl,
      };
    }

    return user;
  }
}
