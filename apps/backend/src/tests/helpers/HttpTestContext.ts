import { randomBytes } from 'node:crypto';
import util from 'node:util';
import { exec } from 'node:child_process';
import type { Application } from 'express';
import pg from 'pg';
import pgFormat from 'pg-format';
import request from 'supertest';
import type { User } from '@libs/prisma';

import createServer from '../../server/createServer.js';
import { env } from '../../../env.js';
import { initializeClient, type Client } from '../../../db/client.js';
import { ConnectionUrlBuilder } from '../../../db/utils/ConnectionUrlBuilder.js';
import userFactory from './userFactory.js';

const execAsync = util.promisify(exec);
const LOGIN_ROUTE = '/api/signin';

export default class HttpTestContext {
  protected randName!: string;
  protected pool!: pg.Pool | null;
  protected app!: Application;
  public client!: Client | null;

  static assertClient(client: Client | null): asserts client is Client {
    if (!client)
      throw new Error('HttpTestContext error: client is not defined');
  }

  static parseAgentAuthCookie(cookies: string[]) {
    const authCookie = cookies.filter((str) => str.includes('auth='))[0];

    if (!authCookie) return null;

    const match = authCookie.match(/auth=(.+?)(?=;)/);

    return match?.[1] ? { token: match?.[1] } : null;
  }

  public get agent() {
    return request(this.app);
  }

  public async getAuthAgent(user?: User) {
    if (!this.client || !this.app || !this.pool)
      throw new Error(
        'Cannot create auth agent. Call prepareEach() to prepare db connection',
      );

    const agent = this.agent;
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

    const { headers } = await agent.post(LOGIN_ROUTE).send({
      email: dummyUser.email,
      password: dummyUser.password,
    });

    // COOKIE BASED AUTH
    const cookies = headers['set-cookie'] as unknown as string[];
    const authCookie = cookies.filter((str) => str.includes('auth='))[0];

    if (!authCookie) {
      throw new Error('Cannot create auth agent. Missed token');
    }

    const cookieSetterArgs = ['Cookie', authCookie] as const;
    // save original methods to rewrite them later
    const get = agent.get.bind(agent);
    const post = agent.post.bind(agent);
    const put = agent.put.bind(agent);
    const patch = agent.patch.bind(agent);
    const del = agent.delete.bind(agent);

    // rewrite original methods to ship them with auth cookie in headers
    agent.get = (...args) => get(...args).set(...cookieSetterArgs);
    agent.post = (...args) => post(...args).set(...cookieSetterArgs);
    agent.put = (...args) => put(...args).set(...cookieSetterArgs);
    agent.patch = (...args) => patch(...args).set(...cookieSetterArgs);
    agent.delete = (...args) => del(...args).set(...cookieSetterArgs);

    // TOKEN BASED AUTH
    // if (!body.data.token)
    //   throw new Error('Cannot create auth agent. Missed token');
    // const authAgent = request
    //   .agent(this.app)
    //   .auth(body.data.token, { type: 'bearer' });

    return {
      createdUser,
      dummyUser,
      agent,
    };
  }

  public async prepareEach() {
    try {
      // Create new name for temporary role and schema that will be used instead
      // of default public schema
      // Must not start with number
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
      const { /* stdout,  */ stderr } = await execAsync(
        // TODO: check whether it can be invoked from separate file
        'pnpm -F @libs/prisma push --skip-generate',
        {
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
          },
        },
      );

      if (stderr) {
        throw new Error(
          `Prisma push result: error\nTest: ${expect.getState().currentTestName}\n${stderr}`,
        );
      }

      console.log(
        'Prisma push result: success\n',
        `Test: ${expect.getState().currentTestName}`,
      );

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

  public async finishEach() {
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
