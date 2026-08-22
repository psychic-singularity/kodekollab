/* eslint-disable @typescript-eslint/no-require-imports */
const { betterAuth } = require("better-auth");
const { prismaAdapter } = require("better-auth/adapters/prisma");
const { prisma } = require("./db");

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.CLIENT_ORIGIN || "http://localhost:3000"],
});

module.exports = { auth };
