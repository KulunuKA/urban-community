const {
  createCenterSchema,
  updateCenterSchema,
  createPickupRequestSchema,
  updatePickupStatusSchema,
} = require("../../modules/recycling/recycling.validation");

function futurePickupDate(daysAhead = 7) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
}

describe("recycling.validation — createCenterSchema", () => {
  const base = {
    name: "City Eco Hub",
    address: "123 Green Street, central ward",
    city: "Colombo",
    wasteTypes: ["plastic", "paper"],
    latitude: 6.9271,
    longitude: 79.8612,
  };

  it("accepts a valid center payload", () => {
    const { error, value } = createCenterSchema.validate(base);
    expect(error).toBeUndefined();
    expect(value.name).toBe("City Eco Hub");
  });

  it("rejects name shorter than 2 characters", () => {
    const { error } = createCenterSchema.validate({ ...base, name: "A" });
    expect(error).toBeDefined();
  });

  it("rejects empty wasteTypes array", () => {
    const { error } = createCenterSchema.validate({ ...base, wasteTypes: [] });
    expect(error).toBeDefined();
  });

  it("rejects an invalid waste type entry", () => {
    const { error } = createCenterSchema.validate({
      ...base,
      wasteTypes: ["plastic", "invalid-type"],
    });
    expect(error).toBeDefined();
  });
});

describe("recycling.validation — updateCenterSchema", () => {
  it("accepts a partial update", () => {
    const { error } = updateCenterSchema.validate({
      name: "Updated center name",
    });
    expect(error).toBeUndefined();
  });

  it("rejects latitude out of range when provided", () => {
    const { error } = updateCenterSchema.validate({ latitude: 200 });
    expect(error).toBeDefined();
  });
});

describe("recycling.validation — createPickupRequestSchema", () => {
  const base = {
    wasteType: "plastic",
    quantityKg: 5,
    pickupDate: futurePickupDate(10),
    address: "42 River Road",
    city: "Kandy",
  };

  it("accepts a valid pickup request", () => {
    const { error, value } = createPickupRequestSchema.validate(base);
    expect(error).toBeUndefined();
    expect(value.quantityKg).toBe(5);
  });

  it("rejects pickupDate in the past", () => {
    const { error } = createPickupRequestSchema.validate({
      ...base,
      pickupDate: new Date(Date.now() - 86400000),
    });
    expect(error).toBeDefined();
  });

  it("rejects quantityKg that is not greater than 0", () => {
    const { error } = createPickupRequestSchema.validate({
      ...base,
      quantityKg: 0,
    });
    expect(error).toBeDefined();
  });

  it("rejects invalid wasteType", () => {
    const { error } = createPickupRequestSchema.validate({
      ...base,
      wasteType: "batteries",
    });
    expect(error).toBeDefined();
  });
});

describe("recycling.validation — updatePickupStatusSchema", () => {
  it("accepts Collected", () => {
    const { error } = updatePickupStatusSchema.validate({ status: "Collected" });
    expect(error).toBeUndefined();
  });

  it("rejects an invalid status string", () => {
    const { error } = updatePickupStatusSchema.validate({ status: "Done" });
    expect(error).toBeDefined();
  });
});
