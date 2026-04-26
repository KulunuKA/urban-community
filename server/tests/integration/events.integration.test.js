const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../app");
const Citizen = require("../../modules/citizen/citizenModel");
const Organization = require("../../modules/organization/organizationModel");
const Event = require("../../modules/events/eventModel");
const Member = require("../../modules/member/memberModel");
const { generateToken } = require("../../utils/tokenManager");
const { MEMBER_STATUS } = require("../../config/constant");

let mongoServer;

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function bearer(token) {
  return `Bearer ${token}`;
}

function futureIso(daysAhead = 14) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

async function createCitizenUser() {
  return Citizen.create({
    name: "Event Test Citizen",
    email: uniqueEmail("evt-civ"),
    password: "Password123",
  });
}

async function createOrgUser() {
  return Organization.create({
    name: "Event Host Org",
    description: "Organization that hosts sustainability events.",
    address: "10 Station Road",
    phone: "0771234500",
    email: uniqueEmail("evt-org"),
    password: "Password123",
  });
}

describe("Event management — API integration (MongoDB in-memory)", () => {
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
      Member.deleteMany({}),
      Event.deleteMany({}),
      Citizen.deleteMany({}),
      Organization.deleteMany({}),
    ]);
  });

  describe("POST /api/events", () => {
    it("returns 401 without Authorization", async () => {
      const res = await request(app)
        .post("/api/events")
        .send({
          title: "Valid Title Here",
          description: "Long enough description for validation rules.",
          date: futureIso(),
          location: "Park",
          organization: "Some Org",
        });
      expect(res.status).toBe(401);
    });

    it("returns 400 when Joi validation fails", async () => {
      const org = await createOrgUser();
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", bearer(generateToken({ id: org._id.toString() })))
        .send({
          title: "bad",
          description: "Still long enough description text.",
          date: futureIso(),
          location: "Park",
          organization: org.name,
        });
      expect(res.status).toBe(400);
    });

    it("returns 201 and persists an event for authenticated organizer", async () => {
      const org = await createOrgUser();
      const payload = {
        title: "Neighborhood Tree Planting",
        description: "Volunteers meet to plant native saplings along the trail.",
        date: futureIso(21),
        location: "Trailhead parking",
        organization: org.name,
      };

      const res = await request(app)
        .post("/api/events")
        .set("Authorization", bearer(generateToken({ id: org._id.toString() })))
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(payload.title);
      expect(String(res.body.data.orgId)).toBe(String(org._id));

      const count = await Event.countDocuments({ orgId: org._id });
      expect(count).toBe(1);
    });
  });

  describe("GET /api/events", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/events");
      expect(res.status).toBe(401);
    });

    it("returns 200 with events and membership for a civilian", async () => {
      const citizen = await createCitizenUser();
      const org = await createOrgUser();
      const event = await Event.create({
        title: "Open Workshop",
        description: "Hands-on repair workshop for small appliances.",
        date: new Date(futureIso(30)),
        location: "Community hall",
        organization: org.name,
        orgId: org._id,
      });

      await Member.create({
        userId: citizen._id,
        eventId: event._id,
        status: MEMBER_STATUS.PENDING,
      });

      const res = await request(app)
        .get("/api/events")
        .set("Authorization", bearer(generateToken({ id: citizen._id.toString() })));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const row = res.body.data.find((e) => String(e._id) === String(event._id));
      expect(row).toBeDefined();
      expect(row.membershipStatus).toBe(MEMBER_STATUS.PENDING);
    });
  });

  describe("GET /api/events/:id", () => {
    it("returns 200 without auth (public read)", async () => {
      const org = await createOrgUser();
      const event = await Event.create({
        title: "Public Lecture",
        description: "Evening talk on urban biodiversity and green corridors.",
        date: new Date(futureIso(10)),
        location: "Library auditorium",
        organization: org.name,
        orgId: org._id,
      });

      const res = await request(app).get(`/api/events/${event._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Public Lecture");
    });

    it("returns 404 when event does not exist", async () => {
      const missing = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/events/${missing}`);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/events/my-events", () => {
    it("returns only events owned by the organization", async () => {
      const orgA = await createOrgUser();
      const orgB = await createOrgUser();

      await Event.create({
        title: "Org A Event One",
        description: "First exclusive event for organization A members.",
        date: new Date(futureIso(11)),
        location: "Venue A",
        organization: orgA.name,
        orgId: orgA._id,
      });
      await Event.create({
        title: "Org B Event",
        description: "Event that belongs only to organization B schedule.",
        date: new Date(futureIso(12)),
        location: "Venue B",
        organization: orgB.name,
        orgId: orgB._id,
      });

      const res = await request(app)
        .get("/api/events/my-events")
        .set("Authorization", bearer(generateToken({ id: orgA._id.toString() })));

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe("Org A Event One");
    });
  });

  describe("PUT /api/events/:id", () => {
    it("returns 200 and updated fields", async () => {
      const org = await createOrgUser();
      const event = await Event.create({
        title: "Original Meetup Title",
        description: "Original description with enough characters here.",
        date: new Date(futureIso(15)),
        location: "Cafe row",
        organization: org.name,
        orgId: org._id,
      });

      const res = await request(app)
        .put(`/api/events/${event._id}`)
        .set("Authorization", bearer(generateToken({ id: org._id.toString() })))
        .send({ title: "Revised Meetup Title" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Revised Meetup Title");
    });
  });

  describe("DELETE /api/events/:id", () => {
    it("returns 200 and removes the event", async () => {
      const org = await createOrgUser();
      const event = await Event.create({
        title: "Event To Delete",
        description: "This event will be removed by the delete endpoint test.",
        date: new Date(futureIso(18)),
        location: "Temp venue",
        organization: org.name,
        orgId: org._id,
      });

      const res = await request(app)
        .delete(`/api/events/${event._id}`)
        .set("Authorization", bearer(generateToken({ id: org._id.toString() })));

      expect(res.status).toBe(200);
      expect(await Event.countDocuments({ _id: event._id })).toBe(0);
    });
  });
});
