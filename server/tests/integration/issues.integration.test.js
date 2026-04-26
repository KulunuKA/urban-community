jest.mock("../../middlewares/upload.middleware");

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const Citizen = require("../../modules/citizen/citizenModel");
const Issue = require("../../modules/issues/issueModel");
const { generateToken } = require("../../utils/tokenManager");
const { USER_ROLE } = require("../../config/constant");

let mongoServer;

async function createCitizen(overrides = {}) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return Citizen.create({
    name: "Test Citizen",
    email: `citizen-${suffix}@test.local`,
    password: "Password123!",
    ...overrides,
  });
}

function citizenToken(citizen) {
  return generateToken({ id: citizen._id.toString() });
}

function adminToken() {
  return generateToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: USER_ROLE.ADMIN,
  });
}

describe("Issue Reporting — API integration (MongoDB in-memory)", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      Issue.deleteMany({}),
      Citizen.deleteMany({ email: /test\.local$/ }),
    ]);
  });

  describe("POST /api/issues/create", () => {
    it("returns 401 without Authorization header", async () => {
      const res = await request(app)
        .post("/api/issues/create")
        .field("title", "Valid title here")
        .field(
          "description",
          "Long enough description for validation to pass.",
        )
        .field("category", "water")
        .field("location", "Colombo Fort");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 when Joi validation fails", async () => {
      const citizen = await createCitizen();
      const token = citizenToken(citizen);

      const res = await request(app)
        .post("/api/issues/create")
        .set("Authorization", `Bearer ${token}`)
        .field("title", "no")
        .field("description", "Still long enough text here.")
        .field("category", "water")
        .field("location", "Colombo");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 201 and persists an issue for a valid multipart request", async () => {
      const citizen = await createCitizen();
      const token = citizenToken(citizen);

      const res = await request(app)
        .post("/api/issues/create")
        .set("Authorization", `Bearer ${token}`)
        .field("title", "Overflowing drain")
        .field(
          "description",
          "Storm drain blocked after heavy rain; pooling on pavement.",
        )
        .field("category", "water")
        .field("location", "Main Street crossing");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe("Overflowing drain");
      expect(res.body.data.status).toBe("Pending");

      const count = await Issue.countDocuments({ citizen: citizen._id });
      expect(count).toBe(1);
    });
  });

  describe("GET /api/issues/me", () => {
    it("returns paginated issues for the authenticated citizen", async () => {
      const citizen = await createCitizen();
      const token = citizenToken(citizen);

      await Issue.create({
        title: "First report title",
        description: "First report body with enough characters.",
        category: "waste",
        location: "Ward 2 market",
        citizen: citizen._id,
      });

      const res = await request(app)
        .get("/api/issues/me?page=1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(1);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].title).toBe("First report title");
    });
  });

  describe("GET /api/issues/:id (citizen)", () => {
    it("returns 403 when another citizen requests the issue", async () => {
      const owner = await createCitizen();
      const other = await createCitizen();
      const issue = await Issue.create({
        title: "Owner issue title",
        description: "Owner issue description text long enough.",
        category: "other",
        location: "Somewhere",
        citizen: owner._id,
      });

      const res = await request(app)
        .get(`/api/issues/${issue._id}`)
        .set("Authorization", `Bearer ${citizenToken(other)}`);

      expect(res.status).toBe(403);
    });

    it("returns 200 when the owner requests the issue", async () => {
      const owner = await createCitizen();
      const issue = await Issue.create({
        title: "Owned issue",
        description: "Owned issue description long enough.",
        category: "other",
        location: "Somewhere",
        citizen: owner._id,
      });

      const res = await request(app)
        .get(`/api/issues/${issue._id}`)
        .set("Authorization", `Bearer ${citizenToken(owner)}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(issue.id);
    });
  });

  describe("DELETE /api/issues/:id", () => {
    it("returns 403 when issue is not Pending", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Resolved issue title",
        description: "Resolved issue description long enough.",
        category: "other",
        location: "Somewhere",
        citizen: citizen._id,
        status: "Resolved",
      });

      const res = await request(app)
        .delete(`/api/issues/${issue._id}`)
        .set("Authorization", `Bearer ${citizenToken(citizen)}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/pending/i);
    });

    it("returns 200 when deleting a pending issue owned by the citizen", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Pending delete title",
        description: "Pending delete description long enough.",
        category: "other",
        location: "Somewhere",
        citizen: citizen._id,
        status: "Pending",
      });

      const res = await request(app)
        .delete(`/api/issues/${issue._id}`)
        .set("Authorization", `Bearer ${citizenToken(citizen)}`);

      expect(res.status).toBe(200);
      expect(await Issue.countDocuments({ _id: issue._id })).toBe(0);
    });
  });

  describe("Admin issue routes", () => {
    it("PATCH /api/issues/:id/status updates status", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Admin status title",
        description: "Admin status description long enough.",
        category: "safety",
        location: "HQ",
        citizen: citizen._id,
      });

      const res = await request(app)
        .patch(`/api/issues/${issue._id}/status`)
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ status: "InProgress" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("InProgress");
    });

    it("GET /api/issues/analytics/summary returns aggregate shape", async () => {
      const citizen = await createCitizen();
      await Issue.create({
        title: "Analytics issue",
        description: "Analytics issue description long enough.",
        category: "environment",
        location: "Park",
        citizen: citizen._id,
        status: "Pending",
      });

      const res = await request(app)
        .get("/api/issues/analytics/summary")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalIssues).toBeGreaterThanOrEqual(1);
      expect(res.body.data.byStatus).toBeDefined();
      expect(res.body.data.byCategory).toBeDefined();
    });
  });

  describe("PATCH /api/issues/:id/admin-response", () => {
    it("returns 200 and saves adminResponse on the issue", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Needs admin reply title",
        description: "Needs admin reply description long enough.",
        category: "safety",
        location: "School zone",
        citizen: citizen._id,
      });

      const res = await request(app)
        .patch(`/api/issues/${issue._id}/admin-response`)
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({
          adminResponse: "   Crew scheduled for Friday morning.   ",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.adminResponse).toContain("Crew scheduled");

      const updated = await Issue.findById(issue._id).lean();
      expect(updated.adminResponse).toContain("Crew scheduled");
    });

    it("returns 400 for invalid issue id", async () => {
      const res = await request(app)
        .patch("/api/issues/not-an-id/admin-response")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ adminResponse: "Thanks for the report." });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 when issue does not exist", async () => {
      const missingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/issues/${missingId}/admin-response`)
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ adminResponse: "We will follow up shortly." });

      expect(res.status).toBe(404);
    });

    it("returns 400 when adminResponse is empty", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Empty response target",
        description: "Empty response target description long enough.",
        category: "other",
        location: "Somewhere",
        citizen: citizen._id,
      });

      const res = await request(app)
        .patch(`/api/issues/${issue._id}/admin-response`)
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ adminResponse: "" });

      expect(res.status).toBe(400);
    });

    it("returns 403 when a civilian JWT calls the admin route", async () => {
      const citizen = await createCitizen();
      const issue = await Issue.create({
        title: "Citizen cannot patch response",
        description: "Citizen cannot patch response description long.",
        category: "other",
        location: "Somewhere",
        citizen: citizen._id,
      });

      const res = await request(app)
        .patch(`/api/issues/${issue._id}/admin-response`)
        .set("Authorization", `Bearer ${citizenToken(citizen)}`)
        .send({ adminResponse: "Unauthorized text." });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/issues/ (admin list filters)", () => {
    it("filters by status and category", async () => {
      const citizen = await createCitizen();
      await Issue.create({
        title: "Waste bin overflow",
        description: "Bins not collected for a week in ward 9.",
        category: "waste",
        location: "Ward 9 market",
        citizen: citizen._id,
        status: "Pending",
      });
      await Issue.create({
        title: "Water main leak",
        description: "Street flooding at night near bridge.",
        category: "water",
        location: "Riverside bridge",
        citizen: citizen._id,
        status: "Resolved",
      });

      const res = await request(app)
        .get("/api/issues/")
        .query({ status: "Pending", category: "waste" })
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].title).toBe("Waste bin overflow");
    });

    it("filters by search across title", async () => {
      const citizen = await createCitizen();
      await Issue.create({
        title: "UniqueZebraKeyword marker",
        description: "Generic description text long enough for validation.",
        category: "other",
        location: "Somewhere far",
        citizen: citizen._id,
      });
      await Issue.create({
        title: "Other issue title here",
        description: "Another description with enough characters total.",
        category: "other",
        location: "Elsewhere",
        citizen: citizen._id,
      });

      const res = await request(app)
        .get("/api/issues/")
        .query({ search: "UniqueZebraKeyword" })
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].title).toContain("UniqueZebra");
    });

    it("paginates with page and limit", async () => {
      const citizen = await createCitizen();
      await Issue.create({
        title: "P-First",
        description: "First paginated row with enough characters.",
        category: "infrastructure",
        location: "Location row one in test data set.",
        citizen: citizen._id,
      });
      await Issue.create({
        title: "P-Second",
        description: "Second paginated row with enough characters.",
        category: "infrastructure",
        location: "Location row two in test data set.",
        citizen: citizen._id,
      });
      await Issue.create({
        title: "P-Third",
        description: "Third paginated row with enough characters.",
        category: "infrastructure",
        location: "Location row three in test data set.",
        citizen: citizen._id,
      });

      const page1 = await request(app)
        .get("/api/issues/")
        .query({ limit: 1, page: 1 })
        .set("Authorization", `Bearer ${adminToken()}`);

      const page2 = await request(app)
        .get("/api/issues/")
        .query({ limit: 1, page: 2 })
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      expect(page1.body.data).toHaveLength(1);
      expect(page2.body.data).toHaveLength(1);
      expect(page1.body.total).toBe(3);
      expect(page1.body.totalPages).toBe(3);
      expect(page1.body.data[0].title).toBe("P-Third");
      expect(page2.body.data[0].title).toBe("P-Second");
    });
  });
});
