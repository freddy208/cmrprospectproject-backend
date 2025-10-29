import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  expiresIn: (process.env.JWT_EXPIRES_IN as StringValue) || '24h',
}));
