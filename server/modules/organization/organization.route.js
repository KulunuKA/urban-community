const express = require("express");
const organizationController = require("./organizationController");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/userAuth");
const { registerSchema, updateProfileSchema } = require("./organization.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), organizationController.register);
router.get("/me", auth, organizationController.getProfile);
router.put(
	"/me",
	auth,
	validate(updateProfileSchema),
	organizationController.updateProfile,
);

module.exports = router;
