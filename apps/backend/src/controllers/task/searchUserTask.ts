import type { Request } from 'express';

import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

type ReqWithQuery = Request<
  object,
  object,
  object,
  {
    name: string;
    filter_by?: 'completed';
  }
>;

class SearchUserTask extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { name, filter_by } = (this.req as ReqWithQuery).query;
    const { suggestions } = await new TaskModel(client).searchByName(
      this.req.user.id,
      {
        name,
        filterBy: filter_by,
      },
    );

    this.ok({ suggestions });
  }
}

export default new SearchUserTask();
