import type { PrismaModelNames } from '../types.js';
import type { client } from '../../../db/index.js';

type Client = typeof client;

export default abstract class Model<TModel extends PrismaModelNames> {
  constructor(public readonly clientModel: Client[TModel]) {}
}
