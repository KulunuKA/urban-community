const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const Citizen = require("../../modules/citizen/citizenModel");
const Organization = require("../../modules/organization/organizationModel");

let mongoServer;

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function bearer(token) {
  return `Bearer ${token}`;
}

describe("User & organization management — API integration (MongoDB in-memory)", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([Citizen.deleteMany({}), Organization.deleteMany({})]);
  });

  describe("POST /api/civilian/register", () => {
    it("returns 201 and a token for valid registration", async () => {
      const email = uniqueEmail("civ");
      const res = await request(app).post("/api/civilian/register").send({
        name: "Test Citizen",
        email,
        password: "Password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.role).toBe("citizen");
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("returns 409 when email is already registered", async () => {
      const email = uniqueEmail("dup");
      await request(app).post("/api/civilian/register").send({
        name: "First",
        email,
        password: "Password123",
      });

      const res = await request(app).post("/api/civilian/register").send({
        name: "Second",
        email,
        password: "Password456",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it("returns 400 when validation fails", async () => {
      const res = await request(app).post("/api/civilian/register").send({
        name: "AB",
        email: "short-pass@example.com",
        password: "12345",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    it("returns 200 and token for a registered civilian", async () => {
      const email = uniqueEmail("login-civ");
      const password = "Password123";
      await request(app).post("/api/civilian/register").send({
        name: "Login User",
        email,
        password,
      });

      const res = await request(app).post("/api/users/login").send({
        email,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("citizen");
    });

    it("returns 401 for wrong password", async () => {
      const email = uniqueEmail("bad-pass");
      await request(app).post("/api/civilian/register").send({
        name: "X",
        email,
        password: "Password123",
      });

      const res = await request(app).post("/api/users/login").send({
        email,
        password: "WrongPassword999",
      });

      expect(res.status).toBe(401);
    });

    it("returns 401 for unknown email", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "nobody-404@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(401);
    });

    it("returns 200 for a registered organization", async () => {
      const email = uniqueEmail("login-org");
      const password = "Password123";
      await request(app).post("/api/organization/register").send({
        name: "Eco Org",
        description: "We run recycling programs in the metro area.",
        address: "1 Green Lane",
        phone: "0771234999",
        email,
        password,
      });

      const res = await request(app).post("/api/users/login").send({
        email,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe("organization");
    });
  });

  describe("GET/PUT /api/civilian/me", () => {
    it("returns 401 without Authorization", async () => {
      const res = await request(app).get("/api/civilian/me");
      expect(res.status).toBe(401);
    });

    it("returns 200 profile for authenticated civilian", async () => {
      const email = uniqueEmail("me-civ");
      const reg = await request(app).post("/api/civilian/register").send({
        name: "Profile Owner",
        email,
        password: "Password123",
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .get("/api/civilian/me")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(email);
    });

    it("returns 200 when updating profile", async () => {
      const email = uniqueEmail("put-civ");
      const reg = await request(app).post("/api/civilian/register").send({
        name: "Before Name",
        email,
        password: "Password123",
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .put("/api/civilian/me")
        .set("Authorization", bearer(token))
        .send({ name: "After Name", phone: "0770001111" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("After Name");
      expect(res.body.data.phone).toBe("0770001111");
    });
  });

  describe("POST /api/organization/register", () => {
    it("returns 201 for valid organization registration", async () => {
      const email = uniqueEmail("org");
      const res = await request(app).post("/api/organization/register").send({
        name: "Test Org",
        description: "Community recycling and education programs.",
        address: "99 Lake View Road",
        phone: "0771234888",
        email,
        password: "Password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("organization");
    });

    it("returns 409 when organization email already exists", async () => {
      const email = uniqueEmail("org-dup");
      const body = {
        name: "Org A",
        description: "First org description with enough text.",
        address: "Street A",
        phone: "0771111222",
        email,
        password: "Password123",
      };
      await request(app).post("/api/organization/register").send(body);

      const res = await request(app)
        .post("/api/organization/register")
        .send({
          ...body,
          name: "Org B",
          description: "Second org description with enough text.",
        });

      expect(res.status).toBe(409);
    });
  });

  describe("GET/PUT /api/organization/me", () => {
    it("returns 200 profile for authenticated organization", async () => {
      const email = uniqueEmail("org-me");
      const reg = await request(app).post("/api/organization/register").send({
        name: "Me Org",
        description: "Org profile test description here.",
        address: "HQ Street",
        phone: "0773333444",
        email,
        password: "Password123",
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .get("/api/organization/me")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(email);
    });

    it("returns 200 when updating organization profile", async () => {
      const email = uniqueEmail("org-put");
      const reg = await request(app).post("/api/organization/register").send({
        name: "Old Org Name",
        description: "Original description for the organization entity.",
        address: "Old Road",
        phone: "0775555666",
        email,
        password: "Password123",
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .put("/api/organization/me")
        .set("Authorization", bearer(token))
        .send({ name: "New Org Name" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("New Org Name");
    });
  });
});
