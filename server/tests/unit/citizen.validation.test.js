const {
  registerSchema,
  updateProfileSchema,
} = require("../../modules/citizen/citizen.validation");

describe("citizen.validation — registerSchema", () => {
  const valid = {
    name: "Jane Citizen",
    email: "jane@example.com",
    password: "secret1",
  };

  it("accepts a valid registration payload", () => {
    const { error, value } = registerSchema.validate(valid);
    expect(error).toBeUndefined();
    expect(value.email).toBe("jane@example.com");
  });

  it("rejects name shorter than 2 characters", () => {
    const { error } = registerSchema.validate({ ...valid, name: "J" });
    expect(error).toBeDefined();
  });

  it("rejects invalid email", () => {
    const { error } = registerSchema.validate({ ...valid, email: "not-an-email" });
    expect(error).toBeDefined();
  });

  it("rejects password shorter than 6 characters", () => {
    const { error } = registerSchema.validate({ ...valid, password: "12345" });
    expect(error).toBeDefined();
  });
});

describe("citizen.validation — updateProfileSchema", () => {
  it("accepts partial profile updates", () => {
    const { error, value } = updateProfileSchema.validate({
      name: "Updated Name",
      phone: "0771234567",
    });
    expect(error).toBeUndefined();
    expect(value.name).toBe("Updated Name");
  });

  it("rejects invalid profile image URL", () => {
    const { error } = updateProfileSchema.validate({
      profileImage: "not-a-url",
    });
    expect(error).toBeDefined();
  });
});
