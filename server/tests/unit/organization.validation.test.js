const {
  registerSchema,
  updateProfileSchema,
} = require("../../modules/organization/organization.validation");

describe("organization.validation — registerSchema", () => {
  const valid = {
    name: "Green Earth NGO",
    description: "We coordinate city clean-ups and recycling drives.",
    address: "42 Station Road, Colombo",
    phone: "0771234567",
    email: "contact@greenearth.io",
    password: "secret1",
  };

  it("accepts a valid organization registration payload", () => {
    const { error, value } = registerSchema.validate(valid);
    expect(error).toBeUndefined();
    expect(value.email).toBe("contact@greenearth.io");
  });

  it("rejects missing description", () => {
    const { error } = registerSchema.validate({
      ...valid,
      description: "",
    });
    expect(error).toBeDefined();
  });

  it("rejects phone shorter than 6 characters", () => {
    const { error } = registerSchema.validate({
      ...valid,
      phone: "12345",
    });
    expect(error).toBeDefined();
  });
});

describe("organization.validation — updateProfileSchema", () => {
  it("accepts at least one field", () => {
    const { error } = updateProfileSchema.validate({
      name: "Renamed Org",
    });
    expect(error).toBeUndefined();
  });

  it("rejects empty update object", () => {
    const { error } = updateProfileSchema.validate({});
    expect(error).toBeDefined();
  });
});
