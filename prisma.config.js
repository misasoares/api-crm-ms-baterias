// prisma.config.js
module.exports = {
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
};