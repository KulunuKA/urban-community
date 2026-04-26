const {
  createIssueSchema,
  updateIssueStatusSchema,
  adminResponseSchema,
} = require("../../modules/issues/issue.validation");

describe("issue.validation — createIssueSchema", () => {
  const valid = {
    title: "Broken streetlight",
    description: "Light out at the north corner for several nights.",
    category: "safety",
    location: "Lake Road, Ward 3",
  };

  it("accepts a valid payload (trimmed / normalized)", () => {
    const { error, value } = createIssueSchema.validate({
      ...valid,
      title: `  ${valid.title}  `,
    });
    expect(error).toBeUndefined();
    expect(value.title).toBe(valid.title);
  });

  it("rejects title shorter than 3 characters", () => {
    const { error } = createIssueSchema.validate({
      ...valid,
      title: "ab",
    });
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.includes("title"))).toBe(true);
  });

  it("rejects description shorter than 10 characters", () => {
    const { error } = createIssueSchema.validate({
      ...valid,
      description: "short",
    });
    expect(error).toBeDefined();
  });

  it("rejects invalid category (must be lowercase enum)", () => {
    const { error } = createIssueSchema.validate({
      ...valid,
      category: "Safety",
    });
    expect(error).toBeDefined();
  });

  it("rejects empty location", () => {
    const { error } = createIssueSchema.validate({
      ...valid,
      location: "",
    });
    expect(error).toBeDefined();
  });
});

describe("issue.validation — updateIssueStatusSchema", () => {
  it("accepts Pending", () => {
    const { error } = updateIssueStatusSchema.validate({ status: "Pending" });
    expect(error).toBeUndefined();
  });

  it("rejects invalid status label", () => {
    const { error } = updateIssueStatusSchema.validate({
      status: "pending",
    });
    expect(error).toBeDefined();
  });
});

describe("issue.validation — adminResponseSchema", () => {
  it("accepts a non-empty admin response", () => {
    const { error, value } = adminResponseSchema.validate({
      adminResponse: "We dispatched a crew this morning.",
    });
    expect(error).toBeUndefined();
    expect(value.adminResponse).toContain("crew");
  });

  it("rejects empty admin response", () => {
    const { error } = adminResponseSchema.validate({ adminResponse: "" });
    expect(error).toBeDefined();
  });
});
