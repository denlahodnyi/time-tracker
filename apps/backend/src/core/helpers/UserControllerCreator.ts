import ControllerCreator from './ControllerCreator.js';

export default abstract class UserControllerCreator extends ControllerCreator {
  protected getUserId() {
    return this.req.isCurrentUserReq
      ? this.req.user.id
      : Number(this.req.params.user_id);
  }
}
