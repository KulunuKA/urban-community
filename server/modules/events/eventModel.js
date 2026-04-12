const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organization: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  orgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Organization", 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);