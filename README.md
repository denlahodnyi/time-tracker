# time-tracker api

## Development

1. Set **DB_USER**, **DB_PASSWORD** and **JWT_SECRET** in _.env.development_
2. Create dev db and set its name in **DB_NAME**
3. Run `yarn dev`

## Tests

1. Fill **DB_USER**, **DB_PASSWORD** and **JWT_SECRET** in _.env.test_
2. Create test db and set its name in **DB_NAME**

For unit tests run `yarn test:unit`

For integration tests run `yarn test:int`

## Production

Fill **DB_USER**, **DB_PASSWORD** and **JWT_SECRET** in _.env.production_

1. Run `yarn build`
1. Run `yarn start`
