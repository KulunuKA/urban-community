const Notification = require("./notification.model");

// Create a new notification
const createNotification = async (
  recipient,
  type,
  title,
  body,
  activityId = null,
) => {
  const notification = new Notification({
    recipient,
    type,
    title,
    body,
    activityId,
  });
  await notification.save();
  return notification;
};

// Get notifications for a user
const getNotifications = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notifications = await Notification.find({
      recipient: userId,
    }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// Mark a notification as read
const markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req?.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

exports = {
  createNotification,
  getNotifications,
  markAsRead,
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};

