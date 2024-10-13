# Backend

## Prerequisites

Prepare Prisma Client for usage

```sh
pnpm prisma:generate
```

```sh
pnpm prisma:build
```

Mark scripts as an executable:

```sh
chmod +x ./scripts/*
```

## Required environment variables

- `DB_USER`
- `DB_NAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `AWS_S3_ACCESS_KEY_ID`
- `AWS_S3_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_S3_REGION`

## AWS setup

1. Create S3 bucket
2. Create IAM user
3. Create permission policy for created bucket and apply it to IAM user. Avatars
   are uploaded to `/avatars` subfolder

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<bucket-name>/avatars/*"
    }
  ]
}
```

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

Database can be created and started using Docker

To start run:

```sh
pnpm db:start-dev
```

To stop run:

```sh
pnpm db:stop-dev
```

## Tests

1. Set required variables in `.env.test`
2. Create test db with the same name as in `DB_NAME`

For unit tests run

```sh
pnpm test:unit
```

For integration tests run **(Docker must be installed)**

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
