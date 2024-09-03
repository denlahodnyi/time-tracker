export default class ClientError extends Error {
  code = 500;

  constructor(message: string, { code }: { code: number }) {
    super(message);
    this.code = code;
  }
}
