const express = require("express");
const userController = require("./citizenController");
const auth = require("../../middlewares/userAuth");
const validate = require("../../middlewares/validate");
const { registerSchema, updateProfileSchema } = require("./citizen.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), userController.register);
router.get("/me", auth, userController.getProfile);
router.put("/me", auth, validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
