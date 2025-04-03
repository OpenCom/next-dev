import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; //più alto meglio ma più lento


export async function verifyPassword(password: string, hashedPassword: string) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

export async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}