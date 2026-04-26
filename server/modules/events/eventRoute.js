const express = require("express");
const eventController = require("./eventController");
const validate = require("../../middlewares/validate");
const { createEventSchema, updateEventSchema } = require("./events.validation");

const auth = require("../../middlewares/userAuth");

const router = express.Router();
router.get("/my-events", auth, eventController.getMyEvents);

//read
router.get("/", auth, eventController.getAllEvents);
router.get("/:id", eventController.getEventById);


//added authentication
router.post("/", auth, validate(createEventSchema), eventController.createEvent);
router.put("/:id", auth, validate(updateEventSchema), eventController.updateEvent);
router.delete("/:id", auth, eventController.deleteEvent);

module.exports = router;