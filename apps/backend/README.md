# Backend

## Prerequisites

Prepare Prisma Client for usage

```sh
pnpm prisma:generate
```

```sh
pnpm prisma:build
```

## Required environment variables

- `DB_USER`
- `DB_NAME`
- `DB_PASSWORD`
- `JWT_SECRET`

## Development

1. Set required variables in `.env.development`
2. Run migrations

   ```sh
   pnpm migrate:dev
   ```

3. Create dev db with the same name as in `DB_NAME`
4. Run

   ```sh
   pnpm dev
   ```

## Tests

1. Set required variables in `.env.test`
2. Create test db with the same name as in `DB_NAME`

For unit tests run

```sh
pnpm test:unit
```

For integration tests run

```sh
pnpm test:int
```

## Production

1. Set required variables in `.env.production`
2. Run

   ```sh
   pnpm build
   ```

3. Run

   ```sh
   pnpm start
   ```

## Seeding

Database seeding happens in two ways with Prisma ORM: manually with `prisma db
seed` and automatically in `prisma migrate reset` and (in some scenarios) `prisma
migrate dev`.

To seed development DB run:

```sh
pnpm seed:dev
```

Available users:

| email          | password |
| -------------- | -------- |
| <den@dev.dev>  | 12345    |
| <jack@dev.dev> | 12345    |
