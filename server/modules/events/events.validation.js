const Joi = require("joi");

//create event
const createEventSchema = Joi.object({
  title: Joi.string().min(5).max(100).trim().required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().greater('now').required(),
  location: Joi.string().required(),
  organization: Joi.string().required(), 
});

//update event
const updateEventSchema = Joi.object({
  title: Joi.string().min(5).max(100).trim(),
  description: Joi.string().min(10),
  date: Joi.date(),
  location: Joi.string(),
  organization: Joi.string(),
}).min(1);

module.exports = { 
  createEventSchema, 
  updateEventSchema 
};