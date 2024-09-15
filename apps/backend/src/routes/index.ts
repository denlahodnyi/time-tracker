import express from 'express';

import * as userController from '../controllers/user/index.js';
import * as taskController from '../controllers/task/index.js';
import { requireAuth } from '../middlewares/index.js';

const router = express.Router();

router.route('/signup').post(userController.registerUser.mount);
router.route('/signin').post(userController.signInUser.mount);
router.route('/users').get(userController.getUsers.mount);

router.param('userId', requireAuth({ verifyAccessByParam: 'userId' }));
router
  .route('/users/me')
  .all(
    requireAuth(),
    (req, res, next) => ((req.isCurrentUserReq = true), next()),
  )
  .get(userController.getUserById.mount)
  .patch(userController.updateUser.mount)
  .delete(userController.deleteUser.mount);
router
  .route('/users/:userId')
  .get(userController.getUserById.mount)
  .patch(userController.updateUser.mount)
  .delete(userController.deleteUser.mount);

router
  .route('/tasks')
  .all(requireAuth())
  .get(taskController.getUserTasks.mount)
  .post(taskController.createUserTask.mount);
router
  .route('/tasks/search')
  .all(requireAuth())
  .get(taskController.searchUserTask.mount);
router
  .route('/tasks/:taskId')
  .all(requireAuth())
  .get(taskController.getUserTaskById.mount)
  .patch(taskController.updateUserTask.mount)
  .delete(taskController.deleteUserTask.mount);
router
  .route('/tasks/:taskId/event')
  .all(requireAuth())
  .patch(taskController.userTaskEvent.mount);
router
  .route('/tasks/:taskId/entries')
  .all(requireAuth())
  .get(taskController.getUserTaskTimeEntries.mount);

router
  .route('/analytics')
  .all(requireAuth())
  .get(taskController.getUserTasksAnalytics.mount);

// /teams
// /teams/:team_id
// /teams/:team_id/tasks
// /teams/:team_id/tasks/:task_id
// /projects
// /projects/:project_id
// /tasks
// /tasks/:task_id

export default router;
