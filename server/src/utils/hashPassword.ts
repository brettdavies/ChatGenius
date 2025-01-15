import bcrypt from 'bcryptjs';

export interface PasswordHashOptions {
  rounds?: number;
}

export async function hashPassword(
  password: string, 
  options: PasswordHashOptions = {}
): Promise<string> {
  const rounds = options.rounds || 10;
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
} 