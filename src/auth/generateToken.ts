import * as jwt from 'jsonwebtoken';

export function createToken(userId: string) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });
  return token; // return it directly
}
