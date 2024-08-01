import type { PrismaClient } from '@libs/prisma';
import type { ZodFormattedError } from 'zod';

type PrismaModels = {
  [Property in keyof PrismaClient as Property extends `$${string}` | symbol
    ? never
    : Property]: PrismaClient[Property];
};

export type PrismaModelNames = keyof PrismaModels;

export interface CustomFormErrors {
  _errors?: string[];
  [key: string]: string[] | CustomFormErrors | undefined;
}

export interface RecZodLikeFormErrors {
  [key: string]: undefined | RecZodLikeFormErrors | { _errors?: string[] };
}

export type ZodLikeFormErrors =
  | {
      _errors?: string[];
    }
  | RecZodLikeFormErrors;

export type ResponseFormErrors =
  | ZodFormattedError<unknown>
  | ZodLikeFormErrors
  | null;
