import type { PrismaClient } from '@libs/prisma';

type PrismaModels = {
  [Property in keyof PrismaClient as Property extends `$${string}` | symbol
    ? never
    : Property]: PrismaClient[Property];
};

type PrismaModelNames = keyof PrismaModels;

export { PrismaModelNames };
