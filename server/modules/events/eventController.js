const mongoose = require("mongoose");
const Event = require("./eventModel");
const Member = require("../member/memberModel");
const { MEMBER_STATUS } = require("../../config/constant");

// Create event
const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.validatedBody,
      orgId: req.user.id,
    };

    const newEvent = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: "Eco event created successfully",
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

//update event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedBody;

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (existingEvent.orgId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

//delete event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingEvent = await Event.findById(id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (existingEvent.orgId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

//get all events
const getAllEvents = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    const events = await Event.aggregate([
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "members",
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$eventId", "$$eventId"] },
                status: MEMBER_STATUS.ACCEPTED,
              },
            },
          ],
          as: "acceptedMembers",
        },
      },
      {
        $addFields: { memberCount: { $size: "$acceptedMembers" } },
      },
      {
        $project: { acceptedMembers: 0 },
      },
    ]);

    // Attach membership status per event for the logged-in user
    let membershipByEventId = {};
    if (userId && events.length > 0) {
      const eventIds = events.map((e) => e._id);
      const memberships = await Member.find({
        userId,
        eventId: { $in: eventIds },
      }).lean();

      membershipByEventId = memberships.reduce((acc, m) => {
        const key = m.eventId.toString();
        if (!acc[key]) acc[key] = m.status;
        return acc;
      }, {});
    }

    const eventsWithMembership = events.map((event) => ({
      ...event,
      membershipStatus: membershipByEventId[event._id.toString()] || null,
    }));

    return res.status(200).json({
      success: true,
      count: events.length,
      data: eventsWithMembership,
    });
  } catch (err) {
    next(err);
  }
};

//get one event
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

// Get events specifically for the logged-in organization
const getMyEvents = async (req, res, next) => {
  try {
    const orgId = req.user.id;

    const events = await Event.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId) } },
      {
        $lookup: {
          from: "members",
          let: { eventId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$eventId", "$$eventId"] },
                status: MEMBER_STATUS.ACCEPTED,
              },
            },
          ],
          as: "acceptedMembers",
        },
      },
      {
        $addFields: { memberCount: { $size: "$acceptedMembers" } },
      },
      {
        $project: { acceptedMembers: 0 },
      },
    ]);

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, updateEvent, deleteEvent, getAllEvents, getEventById, getMyEvents };