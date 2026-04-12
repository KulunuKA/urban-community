const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../../config/constant");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: [
      NOTIFICATION_TYPES.EVENT_REQUEST,
      NOTIFICATION_TYPES.EVENT_UPDATE,
      NOTIFICATION_TYPES.SYSTEM_ALERT,
    ],
    default: NOTIFICATION_TYPES.SYSTEM_ALERT,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
