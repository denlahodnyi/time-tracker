import React, { forwardRef, useId } from 'react';

import {
  InputWithElements,
  PasswordInput,
  type InputWithElementsProps,
} from './input';
import { Label } from './label';
import { Textarea, TextareaProps } from './textarea';
import { cn } from '../lib';

type TextareaVariant = {
  inputVariant: 'textarea';
} & TextareaProps;

type InputVariant = {
  inputVariant?: 'default' | 'password';
} & InputWithElementsProps;

type TextFieldProps = {
  error?: string | null;
  label?: React.ReactNode;
} & (TextareaVariant | InputVariant);

const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>((props, ref) => {
  const {
    disabled,
    error,
    id: customId,
    label,
    inputVariant,
    ...inputProps
  } = props;
  const genId = useId();
  const id = customId || genId;

  return (
    <>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            disabled && 'cursor-not-allowed opacity-70',
            error && 'text-destructive',
          )}
        >
          {label}
        </Label>
      )}
      {(() => {
        switch (inputVariant) {
          case 'password': {
            return (
              <PasswordInput
                ref={ref as React.ForwardedRef<HTMLInputElement>}
                id={id}
                aria-describedby={`${id}-error`}
                aria-invalid={!!error}
                {...(inputProps as InputWithElementsProps)}
              />
            );
          }
          case 'textarea': {
            return (
              <Textarea
                ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                id={id}
                aria-describedby={`${id}-error`}
                aria-invalid={!!error}
                {...(inputProps as TextareaProps)}
              />
            );
          }
          default:
            return (
              <InputWithElements
                ref={ref as React.ForwardedRef<HTMLInputElement>}
                id={id}
                aria-describedby={`${id}-error`}
                aria-invalid={!!error}
                {...(inputProps as InputWithElementsProps)}
              />
            );
        }
      })()}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </>
  );
});

TextField.displayName = 'TextField';

export { TextField };
