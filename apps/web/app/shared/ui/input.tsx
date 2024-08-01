import { cva } from 'class-variance-authority';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { cn } from '~/shared/lib';
import { Button } from './button';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export interface InputWithElementsProps extends InputProps {
  containerClassName?: string;
  leftElem?: React.ReactNode;
  rightElem?: React.ReactNode;
}

const InputWithElements = forwardRef<HTMLInputElement, InputWithElementsProps>(
  (props, ref) => {
    const {
      className,
      containerClassName,
      leftElem,
      rightElem,
      type,
      ...restProps
    } = props;

    return (
      <div
        className={cn(
          'flex h-10 w-full items-center rounded-md border border-input bg-background px-2 py-0 text-sm ring-offset-background has-[:disabled]:opacity-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
          containerClassName,
        )}
      >
        {leftElem}
        <input
          ref={ref}
          type={type}
          className={cn(
            'h-inherit flex-1 bg-inherit px-1 py-2 text-inherit placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed',
            className,
          )}
          {...restProps}
        />
        {rightElem}
      </div>
    );
  },
);

InputWithElements.displayName = 'InputWithElements';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PasswordInputProps extends InputWithElementsProps {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [isHidden, setIsHidden] = useState(true);

    return (
      <InputWithElements
        ref={ref}
        type={isHidden ? 'password' : 'text'}
        rightElem={
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0"
            aria-label={isHidden ? 'show password' : 'hide password'}
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { Input, InputWithElements, PasswordInput };
