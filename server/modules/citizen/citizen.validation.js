const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().messages({
    "string.min": "Name must be at least 2 characters",
  }),
  phone: Joi.string().trim().allow("", null),
  profileImage: Joi.string().uri().allow("", null).messages({
    "string.uri": "Profile image must be a valid URL",
  }),
  bio: Joi.string().max(500).allow("", null),
  location: Joi.object({
    city: Joi.string().trim().allow("", null),
    district: Joi.string().trim().allow("", null),
    province: Joi.string().trim().allow("", null),
  })
    .default({})
    .optional(),
  preferredLanguage: Joi.string().trim().allow("", null),
});

module.exports = { registerSchema, updateProfileSchema };
