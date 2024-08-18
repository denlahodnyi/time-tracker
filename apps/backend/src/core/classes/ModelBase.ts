import type { client } from '../../../db/index.js';

type Client = typeof client;

export default abstract class Model {
  constructor(protected readonly client: Client) {}
}
