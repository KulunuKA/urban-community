const { loginSchema } = require("../../modules/user/user.validation");

describe("user.validation — loginSchema", () => {
  it("accepts valid credentials", () => {
    const { error, value } = loginSchema.validate({
      email: "user@example.com",
      password: "secret1",
    });
    expect(error).toBeUndefined();
    expect(value.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    const { error } = loginSchema.validate({
      email: "bad",
      password: "secret1",
    });
    expect(error).toBeDefined();
  });

  it("rejects short password", () => {
    const { error } = loginSchema.validate({
      email: "user@example.com",
      password: "12345",
    });
    expect(error).toBeDefined();
  });
});
