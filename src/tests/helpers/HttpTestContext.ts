import { randomBytes } from 'node:crypto';
import util from 'node:util';
import { exec } from 'node:child_process';
import type { Application } from 'express';
import pg from 'pg';
import pgFormat from 'pg-format';
import request from 'supertest';
import type { User } from '@prisma/client';

import createServer from '../../server/createServer.js';
import { env } from '../../../env.js';
import { initializeClient, type Client } from '../../../db/client.js';
import { ConnectionUrlBuilder } from '../../../db/utils/ConnectionUrlBuilder.js';
import userFactory from './userFactory.js';

const execAsync = util.promisify(exec);
const LOGIN_ROUTE = '/api/signin';

export default class HttpTestContext {
  app!: Application;
  randName!: string;
  client!: Client | null;
  pool!: pg.Pool | null;

  static assertClient(client: Client | null): asserts client is Client {
    if (!client)
      throw new Error('HttpTestContext error: client is not defined');
  }

  get agent() {
    return request(this.app);
  }

  async getAuthAgent(user?: User) {
    if (!this.client || !this.app || !this.pool)
      throw new Error(
        'Cannot create auth agent. Call prepareEach() to prepare db connection',
      );

    const dummyUser = user || userFactory.build();

    const createdUser = await userFactory.create(
      {
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      },
      { transient: { client: this.client } },
    );

    if (!createdUser)
      throw new Error('Cannot create auth agent. Unable to create user');

    const { body } = await this.agent.post(LOGIN_ROUTE).send({
      email: dummyUser.email,
      password: dummyUser.password,
    });

    if (!body.data.token)
      throw new Error('Cannot create auth agent. Missed token');

    const authAgent = request
      .agent(this.app)
      .auth(body.data.token, { type: 'bearer' });

    return {
      createdUser,
      dummyUser,
      agent: authAgent,
    };
  }

  async prepareEach() {
    try {
      // Create new name for temporary role and schema that will be used instead
      // of default public schema
      // Must not start from number
      this.randName = 'a' + randomBytes(5).toString('hex');
      this.pool = new pg.Pool({ connectionString: env.DATABASE_URL });

      await this.pool.query(
        pgFormat(
          'CREATE ROLE %I WITH CREATEDB LOGIN PASSWORD %L',
          this.randName,
          this.randName,
        ),
      );
      await this.pool.query(
        pgFormat(
          'CREATE SCHEMA %I AUTHORIZATION %I',
          this.randName,
          this.randName,
        ),
      );
      await this.pool.end();

      const databaseUrl = new ConnectionUrlBuilder({
        user: this.randName,
        password: this.randName,
        schema: this.randName, // required
      }).url();

      // Create new pool and Prisma client under new schema and role
      this.pool = new pg.Pool({ connectionString: databaseUrl });
      this.client = initializeClient({
        pool: this.pool,
        adapterOptions: { schema: this.randName }, // required
      });

      // Fill new database schema with tables
      const { stdout, stderr } = await execAsync(
        'npx prisma db push --skip-generate',
        {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
          },
        },
      );

      console.log(`db push stdout:`, stdout);

      if (stderr) throw new Error(stderr);

      // create Express app
      this.app = createServer();
    } catch (error) {
      console.log(`HttpTestContext error: ${error}`);

      if (this.client) {
        await this.client.$disconnect();
        this.client = null;
      }
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
    }
  }

  async finishEach() {
    try {
      if (this.client) await this.client.$disconnect();
      if (this.pool) await this.pool.end();

      this.pool = new pg.Pool({ connectionString: env.DATABASE_URL });
      await this.pool.query(
        pgFormat('DROP SCHEMA IF EXISTS %I CASCADE', this.randName),
      );
      await this.pool.query(pgFormat('DROP ROLE IF EXISTS %I', this.randName));
      await this.pool.end();
    } catch (error) {
      console.log(`HttpTestContext error: ${error}`);
    }
  }
}
