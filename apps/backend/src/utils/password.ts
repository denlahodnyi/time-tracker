import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePasswords = async (passwordA: string, passwordB: string) => {
  return await bcrypt.compare(passwordA, passwordB);
};

export { hashPassword, comparePasswords };
