const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["organization"],
    default: "organization",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

organizationSchema.index({ createdAt: -1 });
organizationSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
