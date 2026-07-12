// Load .env FIRST — before anything else is required
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

// Now require Prisma (db.js) and everything else
const { PrismaClient } = require("@prisma/client");

// Create Prisma client AFTER dotenv has populated process.env
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient({
    log: ["error", "warn"],
  });
}

prisma = global.__prisma;

module.exports = prisma;