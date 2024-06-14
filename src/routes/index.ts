import express from 'express';

import * as userController from '../controllers/user/index.js';
import { requireAuth } from '../middlewares/index.js';

const router = express.Router();

router.route('/signup').post(userController.registerUser.mount);
router.route('/signin').post(userController.signInUser.mount);
router.route('/users').get(userController.getUsers.mount);

router.param('user_id', requireAuth({ verifyAccessByParam: 'user_id' }));
router
  .route('/users/:user_id')
  .get(userController.getUserById.mount)
  .patch(userController.updateUser.mount)
  .delete(userController.deleteUser.mount);

// /teams
// /teams/:team_id
// /teams/:team_id/tasks
// /teams/:team_id/tasks/:task_id
// /projects
// /projects/:project_id
// /tasks
// /tasks/:task_id

export default router;
