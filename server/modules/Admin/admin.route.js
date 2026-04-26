const express = require("express");
const adminController = require("./adminController");
const validate = require("../../middlewares/validate");
const adminAuth = require("../../middlewares/AdminAuth");
const { loginSchema, registerSchema } = require("./admin.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), adminController.register);
router.post("/login", validate(loginSchema), adminController.login);

router.get("/users/civilians", adminAuth, adminController.listCivilians);
router.get(
  "/users/organizations",
  adminAuth,
  adminController.listOrganizations,
);

router.get("/events", adminAuth, adminController.listEvents);
router.get("/events/:id", adminAuth, adminController.getEventByIdAdmin);

module.exports = router;
