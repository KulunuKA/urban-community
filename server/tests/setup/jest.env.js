// Ensures JWT and DB URI exist before any app code reads process.env (Jest loads this first).
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "jest-test-jwt-secret-do-not-use-in-production-32chars";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urban-community-jest-placeholder";
