const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const Citizen = require("../../modules/citizen/citizenModel");
const RecyclingCenter = require("../../modules/recycling/recycling.Model");
const PickupRequest = require("../../modules/recycling/pickupRequest.Model");
const { generateToken } = require("../../utils/tokenManager");
const { USER_ROLE } = require("../../config/constant");

let mongoServer;

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function bearer(token) {
  return `Bearer ${token}`;
}

function futurePickupIso(daysAhead = 14) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

function adminToken() {
  return generateToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: USER_ROLE.ADMIN,
  });
}

function citizenToken(citizen) {
  return generateToken({ id: citizen._id.toString() });
}

async function createCitizen() {
  return Citizen.create({
    name: "Recycling Test Citizen",
    email: uniqueEmail("rec-civ"),
    password: "Password123",
  });
}

const validCenterBody = {
  name: "Metro Drop-off",
  address: "88 Station Road, near the park",
  city: "Colombo",
  wasteTypes: ["plastic", "glass"],
  latitude: 6.9271,
  longitude: 79.8612,
  contactNumber: "0771234500",
  openHours: "Mon–Sat 9–17",
};

describe("Recycling — API integration (MongoDB in-memory)", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      PickupRequest.deleteMany({}),
      RecyclingCenter.deleteMany({}),
      Citizen.deleteMany({}),
    ]);
  });

  describe("GET /api/recycling/centers", () => {
    it("returns 200 and an array (empty when none)", async () => {
      const res = await request(app).get("/api/recycling/centers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it("filters by query params when centers exist", async () => {
      await RecyclingCenter.create({
        ...validCenterBody,
        name: "Kandy Green Point",
        city: "Kandy",
        wasteTypes: ["paper"],
      });
      await RecyclingCenter.create({
        ...validCenterBody,
        name: "Colombo Hub",
        city: "Colombo",
        wasteTypes: ["plastic"],
      });

      const byCity = await request(app)
        .get("/api/recycling/centers")
        .query({ city: "kandy" });
      expect(byCity.status).toBe(200);
      expect(byCity.body).toHaveLength(1);
      expect(byCity.body[0].city).toBe("Kandy");

      const byWaste = await request(app)
        .get("/api/recycling/centers")
        .query({ wasteType: "plastic" });
      expect(byWaste.status).toBe(200);
      expect(byWaste.body.length).toBeGreaterThanOrEqual(1);
      expect(byWaste.body.every((c) => c.wasteTypes.includes("plastic"))).toBe(
        true,
      );
    });
  });

  describe("GET /api/recycling/centers/:id", () => {
    it("returns 404 when center is missing", async () => {
      const missingId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/recycling/centers/${missingId}`);
      expect(res.status).toBe(404);
    });

    it("returns 200 with center document", async () => {
      const center = await RecyclingCenter.create(validCenterBody);
      const res = await request(app).get(`/api/recycling/centers/${center._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(validCenterBody.name);
    });
  });

  describe("POST /api/recycling/centers", () => {
    it("returns 401 without Authorization", async () => {
      const res = await request(app)
        .post("/api/recycling/centers")
        .send(validCenterBody);
      expect(res.status).toBe(401);
    });

    it("returns 403 when token is not admin", async () => {
      const citizen = await createCitizen();
      const res = await request(app)
        .post("/api/recycling/centers")
        .set("Authorization", bearer(citizenToken(citizen)))
        .send(validCenterBody);
      expect(res.status).toBe(403);
    });

    it("returns 400 when Joi validation fails", async () => {
      const res = await request(app)
        .post("/api/recycling/centers")
        .set("Authorization", bearer(adminToken()))
        .send({ ...validCenterBody, name: "x" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 201 and persists a center for admin", async () => {
      const res = await request(app)
        .post("/api/recycling/centers")
        .set("Authorization", bearer(adminToken()))
        .send(validCenterBody);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(validCenterBody.name);
      const count = await RecyclingCenter.countDocuments();
      expect(count).toBe(1);
    });
  });

  describe("PUT /api/recycling/centers/:id", () => {
    it("returns 404 when updating unknown id", async () => {
      const missingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recycling/centers/${missingId}`)
        .set("Authorization", bearer(adminToken()))
        .send({ name: "Only name change ok" });
      expect(res.status).toBe(404);
    });

    it("returns 200 for partial update", async () => {
      const center = await RecyclingCenter.create(validCenterBody);
      const res = await request(app)
        .put(`/api/recycling/centers/${center._id}`)
        .set("Authorization", bearer(adminToken()))
        .send({ openHours: "24/7 drop box" });

      expect(res.status).toBe(200);
      expect(res.body.openHours).toBe("24/7 drop box");
      expect(res.body.name).toBe(validCenterBody.name);
    });
  });

  describe("DELETE /api/recycling/centers/:id", () => {
    it("returns 404 when deleting unknown id", async () => {
      const missingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/recycling/centers/${missingId}`)
        .set("Authorization", bearer(adminToken()));
      expect(res.status).toBe(404);
    });

    it("returns 200 and removes the center", async () => {
      const center = await RecyclingCenter.create(validCenterBody);
      const res = await request(app)
        .delete(`/api/recycling/centers/${center._id}`)
        .set("Authorization", bearer(adminToken()));

      expect(res.status).toBe(200);
      expect(
        await RecyclingCenter.countDocuments({ _id: center._id }),
      ).toBe(0);
    });
  });

  describe("POST /api/recycling/request-pickup", () => {
    it("returns 401 without token", async () => {
      const res = await request(app)
        .post("/api/recycling/request-pickup")
        .send({
          wasteType: "plastic",
          quantityKg: 3,
          pickupDate: futurePickupIso(10),
          address: "10 Lane",
          city: "Colombo",
        });
      expect(res.status).toBe(401);
    });

    it("returns 400 when validation fails", async () => {
      const citizen = await createCitizen();
      const res = await request(app)
        .post("/api/recycling/request-pickup")
        .set("Authorization", bearer(citizenToken(citizen)))
        .send({
          wasteType: "plastic",
          quantityKg: 0,
          pickupDate: futurePickupIso(10),
          address: "10 Lane",
          city: "Colombo",
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 201 and stores pickup for authenticated citizen", async () => {
      const citizen = await createCitizen();
      const payload = {
        wasteType: "paper",
        quantityKg: 4,
        pickupDate: futurePickupIso(12),
        address: "22 Hill Street",
        city: "Kandy",
        notes: "Ring the bell twice",
      };

      const res = await request(app)
        .post("/api/recycling/request-pickup")
        .set("Authorization", bearer(citizenToken(citizen)))
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/success/i);
      expect(res.body.pickupRequest.wasteType).toBe("paper");

      const count = await PickupRequest.countDocuments({ userId: citizen._id });
      expect(count).toBe(1);
    });
  });

  describe("GET /api/recycling/pickups/my", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/recycling/pickups/my");
      expect(res.status).toBe(401);
    });

    it("returns 200 with user-scoped pickups", async () => {
      const citizen = await createCitizen();
      await PickupRequest.create({
        userId: citizen._id,
        wasteType: "metal",
        quantityKg: 2,
        pickupDate: new Date(futurePickupIso(5)),
        address: "1 Main",
        city: "Galle",
      });

      const res = await request(app)
        .get("/api/recycling/pickups/my")
        .set("Authorization", bearer(citizenToken(citizen)));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].city).toBe("Galle");
    });
  });

  describe("GET /api/recycling/pickups", () => {
    it("returns 401 without admin token", async () => {
      const res = await request(app).get("/api/recycling/pickups");
      expect(res.status).toBe(401);
    });

    it("returns 200 with all pickups for admin", async () => {
      const citizen = await createCitizen();
      await PickupRequest.create({
        userId: citizen._id,
        wasteType: "organic",
        quantityKg: 6,
        pickupDate: new Date(futurePickupIso(3)),
        address: "5 Farm Road",
        city: "Matara",
      });

      const res = await request(app)
        .get("/api/recycling/pickups")
        .set("Authorization", bearer(adminToken()));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("PUT /api/recycling/pickups/:id/status", () => {
    it("returns 404 for unknown pickup id", async () => {
      const missingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recycling/pickups/${missingId}/status`)
        .set("Authorization", bearer(adminToken()))
        .send({ status: "Accepted" });
      expect(res.status).toBe(404);
    });

    it("returns 400 when status is invalid", async () => {
      const citizen = await createCitizen();
      const pickup = await PickupRequest.create({
        userId: citizen._id,
        wasteType: "glass",
        quantityKg: 3,
        pickupDate: new Date(futurePickupIso(8)),
        address: "9 Lake View",
        city: "Colombo",
      });

      const res = await request(app)
        .put(`/api/recycling/pickups/${pickup._id}/status`)
        .set("Authorization", bearer(adminToken()))
        .send({ status: "Unknown" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 200 and updates status", async () => {
      const citizen = await createCitizen();
      const pickup = await PickupRequest.create({
        userId: citizen._id,
        wasteType: "ewaste",
        quantityKg: 1,
        pickupDate: new Date(futurePickupIso(9)),
        address: "3 Tech Park",
        city: "Colombo",
      });

      const res = await request(app)
        .put(`/api/recycling/pickups/${pickup._id}/status`)
        .set("Authorization", bearer(adminToken()))
        .send({ status: "Collected" });

      expect(res.status).toBe(200);
      expect(res.body.request.status).toBe("Collected");
    });
  });
});
