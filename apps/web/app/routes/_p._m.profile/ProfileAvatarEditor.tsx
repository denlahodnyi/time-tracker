import {
  useFetcher,
  type FormEncType,
  type FormMethod,
} from '@remix-run/react';
import {
  ImageUpIcon,
  PencilIcon,
  PencilOffIcon,
  SaveIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import AvatarEditor from 'react-avatar-editor';

import {
  DELETE_AVATAR_ACTION,
  UPLOAD_AVATAR_ACTION,
} from '~/features/user/upload-avatar';
import { cn, isSSR, useEnhancedFetcher } from '~/shared/lib';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  showSuccessToast,
} from '~/shared/ui';
import type action from './action.server';

const sizeClassName = 'sm:w-[300px] w-[200px] sm:h-[300px] h-[200px]';

interface ProfileAvatarEditorProps {
  fallbackContent: ReactNode;
  avatarUrl: string;
}

function ProfileAvatarEditor(props: ProfileAvatarEditorProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const editorRef = useRef<AvatarEditor>(null);
  const uploadFetcher = useEnhancedFetcher<typeof action>({
    onSuccess() {
      setIsEdit(false);
      setFiles(null);
      showSuccessToast('Your avatar was successfully updated');
    },
    checkSuccess(fetcherData) {
      return Boolean(fetcherData.data?.user);
    },
    getSuccessDataCount(fetcherData) {
      return (
        (fetcherData.data &&
          fetcherData._action === UPLOAD_AVATAR_ACTION &&
          fetcherData._count) ||
        null
      );
    },
  });
  const deleteFetcher = useFetcher<typeof action>();
  const isUploading = uploadFetcher.state !== 'idle';
  const isDeleting = deleteFetcher.state !== 'idle';

  const observerRef = useRef(
    isSSR ? null : new ResizeObserver(resizeObserverCb),
  );

  const imageRef = useCallback((node: HTMLElement | null) => {
    const observer = observerRef.current;

    if (node && observer) {
      observer.observe(node);
    } else if (observer) {
      observer.disconnect();
    }
  }, []);

  if (!isEdit) {
    return (
      <div className="relative z-0 inline-block border-[2.5rem] border-b-0 border-transparent">
        <Avatar
          ref={imageRef}
          id="image-root"
          className={cn(sizeClassName, {
            'animate-pulse': isDeleting,
          })}
        >
          <AvatarImage src={props.avatarUrl} />
          <AvatarFallback className="text-4xl">
            {props.fallbackContent}
          </AvatarFallback>
        </Avatar>
        <Button
          data-toolbaritem
          aria-label="Edit avatar"
          className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full p-0"
          style={getTransformationWithVars()}
          title="Edit"
          variant="outline"
          onClick={() => setIsEdit(true)}
        >
          <PencilIcon />
        </Button>
        <deleteFetcher.Form
          action="/profile"
          method="post"
          onSubmit={(e) => {
            if (isDeleting) {
              e.preventDefault();
            }
          }}
        >
          <Button
            data-toolbaritem
            aria-label="Delete avatar"
            className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full p-0"
            disabled={!props.avatarUrl}
            name="_action"
            style={getTransformationWithVars()}
            title="Delete"
            type="submit"
            value={DELETE_AVATAR_ACTION}
            variant="outline"
          >
            <TrashIcon />
          </Button>
        </deleteFetcher.Form>
      </div>
    );
  }

  return (
    <div className="inline-block space-y-3">
      <div className="relative border-[2.5rem] border-b-0 border-transparent">
        <div ref={imageRef} className={sizeClassName} id="image-root">
          <AvatarEditor
            ref={editorRef}
            backgroundColor="#CECECE"
            border={0}
            image={files?.[0] || ''}
            scale={1}
            style={{ width: 'inherit', height: 'inherit' }}
            className={cn('rounded-full bg-muted', {
              'animate-pulse': isUploading,
            })}
          />
        </div>
        <Button
          asChild
          data-toolbaritem
          className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full p-0 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          style={getTransformationWithVars()}
          variant="outline"
        >
          <uploadFetcher.Form
            action="/profile"
            encType="multipart/form-data"
            id="upload-form"
            method="post"
            onSubmit={(e) => {
              e.preventDefault();

              if (editorRef.current && files) {
                const canvas = editorRef.current.getImageScaledToCanvas();
                const { method, enctype } = e.currentTarget;

                canvas.toBlob((blob) => {
                  if (blob) {
                    const fd = new FormData();

                    fd.append('avatar', blob, files[0].name);
                    fd.append('_action', UPLOAD_AVATAR_ACTION);
                    uploadFetcher.submit(fd, {
                      method: method as FormMethod,
                      encType: enctype as FormEncType,
                    });
                  }
                }, files[0].type);
              }
            }}
          >
            <label htmlFor="avatar">
              <ImageUpIcon />
              <span className="sr-only">Choose image</span>
              <input
                accept="image/png, image/jpeg, image/webp"
                className="sr-only"
                id="avatar"
                name="avatar"
                type="file"
                onChange={(e) => setFiles(e.currentTarget.files)}
              />
            </label>
          </uploadFetcher.Form>
        </Button>
        <Button
          data-toolbaritem
          aria-label="Upload image"
          className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full p-0"
          disabled={!files?.length}
          form="upload-form"
          style={getTransformationWithVars()}
          title="Upload"
          type="submit"
          variant="outline"
        >
          <SaveIcon />
        </Button>
        <Button
          data-toolbaritem
          aria-label="Cancel"
          className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full p-0"
          style={getTransformationWithVars()}
          title="Cancel"
          variant="outline"
          onClick={() => setIsEdit(false)}
        >
          <PencilOffIcon />
        </Button>
      </div>
      {uploadFetcher.data?.error && (
        <p className="text-center text-destructive">
          {uploadFetcher.data.error}
        </p>
      )}
    </div>
  );
}

function calcCoordsOnCircle(deg: number) {
  return {
    x: Math.cos((deg * Math.PI) / 180),
    y: Math.sin((deg * Math.PI) / 180),
  };
}

function getTransformationWithVars() {
  return {
    '--angle': '0',
    '--x': '0px',
    '--y': '0px',
    transform: 'translate(calc(-50% + var(--x)), calc(-50% + var(--y)))',
  };
}

function getAdjacentItemsAngleDiff(
  distanceBetween: number,
  circleRadius: number,
) {
  return (Math.asin(distanceBetween / (2 * circleRadius)) * 2 * 180) / Math.PI;
}

function resizeObserverCb(entries: ResizeObserverEntry[]) {
  for (const entry of entries) {
    const { inlineSize: w } = entry.contentBoxSize[0];
    const toolbarItems = document.querySelectorAll<HTMLElement>(
      '[data-toolbaritem=true]',
    );
    const r = w / 2;
    const itemsRects = Array.from(toolbarItems).map((el) =>
      el.getBoundingClientRect(),
    );

    toolbarItems.forEach((item, i) => {
      let angle = -45;

      if (i !== 0) {
        const distanceBetweenItemCenters =
          itemsRects[i - 1].width / 2 + itemsRects[i].width / 2;
        const anglesDiff = getAdjacentItemsAngleDiff(
          distanceBetweenItemCenters,
          r,
        );
        const prevAngle = Number(
          toolbarItems[i - 1].style.getPropertyValue('--angle'),
        );

        // 5deg - offset
        angle = prevAngle + anglesDiff;
      }

      const { x, y } = calcCoordsOnCircle(angle);

      item.style.setProperty('--angle', angle.toString());
      item.style.setProperty(
        '--x',
        x * (r + itemsRects[i].width / 2 + 5) + 'px',
      );
      item.style.setProperty(
        '--y',
        y * (r + itemsRects[i].width / 2 + 5) + 'px',
      );
    });
  }
}

export default ProfileAvatarEditor;
