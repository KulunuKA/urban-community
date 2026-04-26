const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const citizenSchema = new mongoose.Schema({
 // Auth
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile
  phone: String,
  profileImage: String,
  bio: String,

  // Location
  location: {
    city: String,
    district: String,
    province: String,
  },

  // Engagement
  points: { type: Number, default: 0 },
  badges: [String],

  // System
  role: {
    type: String,
    enum: ["citizen"],
    default: "citizen",
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Preferences
  preferredLanguage: { type: String, default: "en" },

  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

citizenSchema.index({ createdAt: -1 });

citizenSchema.pre("save", async function () {
  if (!this.isModified("password")) {
      return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const Citizen = mongoose.model("Citizen", citizenSchema);
module.exports = Citizen;
