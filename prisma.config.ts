import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    // eslint-disable-next-line prettier/prettier
    path: "prisma/migrations",
  },
  engine: 'classic',
  datasource: {
    url: env('DIRECT_URL'),
  },
});
