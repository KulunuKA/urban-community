const express = require("express");
const auth = require("../../middlewares/userAuth");
const notificationController = require("./notificationController");

const router = express.Router();

router.get("/", auth, notificationController.getNotifications);
router.patch("/:id/read", auth, notificationController.markAsRead);

module.exports = router;
