import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z
    .string()
    .optional()
    .default('8080')
    // empty key in .env is not undefined but ""
    .transform((str) => (!str ? '8080' : str))
    .pipe(z.coerce.number().positive()),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().optional().default('30m'),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().positive(),
  DB_NAME: z.string().min(1),
  DB_SCHEMA: z.string().min(1).default('public'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url().optional(),
  AWS_S3_ACCESS_KEY_ID: z.string().min(1),
  AWS_S3_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_S3_REGION: z.string().min(1),
});

const env: z.infer<typeof EnvSchema> = initializeEnvs();

function initializeEnvs() {
  const { data, error, success } = EnvSchema.safeParse(process.env);

  if (!success) {
    const formatted = error.flatten();

    throw new Error(JSON.stringify(formatted, null, 2));
  }
  if (data.NODE_ENV !== 'production') {
    console.log(`🚀 env:`, data);
  }

  return data;
}

export { env, initializeEnvs };
