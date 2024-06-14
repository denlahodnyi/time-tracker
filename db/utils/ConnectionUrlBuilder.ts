import { env } from '../../env.js';

interface UrlParts {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  schema: string;
}

export class ConnectionUrlBuilder {
  _user: UrlParts['user'];
  _password: UrlParts['password'];
  _host: UrlParts['host'];
  _port: UrlParts['port'];
  _database: UrlParts['database'];
  _schema: UrlParts['schema'];

  constructor(parts: Partial<UrlParts>) {
    this._user = parts.user || env.DB_USER;
    this._password = parts.password || env.DB_PASSWORD;
    this._host = parts.host || env.DB_HOST;
    this._port = parts.port || env.DB_PORT;
    this._database = parts.database || env.DB_NAME;
    this._schema = parts.schema || env.DB_SCHEMA;
  }

  public url() {
    return `postgresql://${this.user}:${this.password}@${this.host}:${this.port}/${this.database}?schema=${this.schema}`;
  }

  public get user() {
    return this._user;
  }
  public set user(user: string) {
    this._user = user;
  }

  public get password() {
    return this._password;
  }
  public set password(password: string) {
    this._password = password;
  }

  public get host() {
    return this._host;
  }
  public set host(host: string) {
    this._host = host;
  }

  public get port() {
    return this._port;
  }
  public set port(port: number) {
    this._port = port;
  }

  public get database() {
    return this._database;
  }
  public set database(database: string) {
    this._database = database;
  }

  public get schema() {
    return this._schema;
  }
  public set schema(schema: string) {
    this._schema = schema;
  }
}
