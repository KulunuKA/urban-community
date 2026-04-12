const mongoose = require("mongoose");
const Event = require("../events/eventModel");
const Member = require("./memberModel");
const Citizen = require("../citizen/citizenModel");
const { MEMBER_STATUS, NOTIFICATION_TYPES } = require("../../config/constant");
const Organization = require("../organization/organizationModel");
const { createNotification } = require("../Notifications/notificationController");

const sendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const eventId = req.body.eventId;

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    //step 1: is valid user
    const user = await Citizen.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    //step 2: is valid event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    //step 3: is user already a member of the event
    const member = await Member.aggregate([
      {
        $match: {
          userId: userObjectId,
          eventId: eventObjectId,
          status: MEMBER_STATUS.ACCEPTED,
        },
      },
    ]);

    if (member.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the event",
      });
    }

    //step 4: check if the already has a pending request
    const pendingRequest = await Member.aggregate([
      {
        $match: {
          userId: userObjectId,
          eventId: eventObjectId,
          status: MEMBER_STATUS.PENDING,
        },
      },
    ]);

    if (pendingRequest.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has a pending request",
      });
    }

    //step 5: create a new member
    const newMember = await Member.create({
      userId: userId,
      eventId: eventId,
      status: MEMBER_STATUS.PENDING,
    });

    await createNotification(
      event.orgId,
      NOTIFICATION_TYPES.EVENT_REQUEST,
      "New Event Request",
      `New request for ${event.title} from ${user.name}`,
      event._id,
    );

    return res.status(201).json({
      success: true,
      message: "Request sent successfully",
      data: {
        ...newMember.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    //step 1: is valid event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    //step 2: get all requests
    const requests = await Member.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          status: MEMBER_STATUS.PENDING,
        },
      },
      {
        $lookup: {
          from: "citizens",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          createdAt: 1,
          userDetails: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            email: "$userDetails.email",
          },
        },
      },
    ]);

    if (requests.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No pending requests found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const responseRequest = async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const { status } = req.validatedBody ?? req.body;
    const organizationId = req.user.id;

    if (!requestId || !mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    //step 1: is valid request
    const request = await Member.findOne({
      _id: requestId,
      status: MEMBER_STATUS.PENDING,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found",
      });
    }

    const event = await Event.findById(request.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.orgId.toString() !== organizationId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to respond to this request",
      });
    }

    //step 2: update the request status
    await Member.findByIdAndUpdate(requestId, { status: status });

    if (status === MEMBER_STATUS.ACCEPTED) {
      await createNotification(
        request.userId,
        NOTIFICATION_TYPES.EVENT_UPDATE,
        "Request Accepted",
        `Your request to join ${event.title} has been accepted`,
        event._id,
      );
    }

    return res.status(200).json({
      success: true,
      message: `${status === MEMBER_STATUS.ACCEPTED ? "Accepted" : "Rejected"} request responded successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const organizationId = req.user.id;

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    //step 1: is valid event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    //step 2: user is organizer of the event
    const user = await Event.aggregate([
      {
        $match: {
          _id: eventId,
          organization: organizationId,
        },
      },
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not authorized to access this event",
      });
    }

    //step 3: get all members
    const members = await Member.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          status: MEMBER_STATUS.ACCEPTED,
        },
      },
      {
        $lookup: {
          from: "citizens",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          createdAt: 1,
          status: 1,
          userDetails: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            email: "$userDetails.email",
          },
        },
      },
    ]);

    if (members.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No members found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Members fetched successfully",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const { eventId, memberId } = req.validatedBody;

    //step 1: is valid event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    //step 2: is valid member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }
    //step 3: delete the member
    await Member.findByIdAndDelete(memberId);
    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const organizationId = req.user.id;

    // step 1: validate organization account
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // step 2: collect events created by this organization
    const events = await Event.find({
      orgId: new mongoose.Types.ObjectId(organizationId),
    })
      .select("_id")
      .lean();

    const eventIds = events.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No requests found for your events",
        data: [],
      });
    }

    // step 3: retrieve requests sent to those events
    const requests = await Member.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
        },
      },
      {
        $lookup: {
          from: "citizens",
          localField: "userId",
          foreignField: "_id",
          as: "citizenDetails",
        },
      },
      {
        $unwind: {
          path: "$citizenDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $unwind: {
          path: "$eventDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          eventId: 1,
          status: 1,
          createdAt: 1,
          citizenDetails: {
            _id: "$citizenDetails._id",
            name: "$citizenDetails.name",
            email: "$citizenDetails.email",
          },
          eventDetails: {
            _id: "$eventDetails._id",
            title: "$eventDetails.title",
            date: "$eventDetails.date",
            location: "$eventDetails.location",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  getRequests,
  responseRequest,
  getMembers,
  deleteMember,
  getMyRequests,
};
