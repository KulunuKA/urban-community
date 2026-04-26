const {
  createEventSchema,
  updateEventSchema,
} = require("../../modules/events/events.validation");

function futureDate(daysAhead = 7) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
}

describe("events.validation — createEventSchema", () => {
  const base = {
    title: "Community Cleanup",
    description: "Join neighbors for a morning cleanup along the riverbank.",
    date: futureDate(14),
    location: "Riverside Park main gate",
    organization: "Green City NGO",
  };

  it("accepts a valid future event", () => {
    const { error, value } = createEventSchema.validate(base);
    expect(error).toBeUndefined();
    expect(value.title).toBe("Community Cleanup");
  });

  it("rejects title shorter than 5 characters", () => {
    const { error } = createEventSchema.validate({
      ...base,
      title: "Hi",
    });
    expect(error).toBeDefined();
  });

  it("rejects description shorter than 10 characters", () => {
    const { error } = createEventSchema.validate({
      ...base,
      description: "Too short",
    });
    expect(error).toBeDefined();
  });

  it("rejects date in the past", () => {
    const { error } = createEventSchema.validate({
      ...base,
      date: new Date(Date.now() - 86400000),
    });
    expect(error).toBeDefined();
  });
});

describe("events.validation — updateEventSchema", () => {
  it("accepts a partial update with at least one field", () => {
    const { error } = updateEventSchema.validate({
      title: "Updated event title",
    });
    expect(error).toBeUndefined();
  });

  it("rejects empty update payload", () => {
    const { error } = updateEventSchema.validate({});
    expect(error).toBeDefined();
  });
});
