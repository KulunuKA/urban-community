const mongoose = require("mongoose");
const Admin = require("./adminModel");
const Citizen = require("../citizen/citizenModel");
const Organization = require("../organization/organizationModel");
const Event = require("../events/eventModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/tokenManager");
const { USER_ROLE } = require("../../config/constant");

/** Escape user input for safe use inside RegExp */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePageLimit(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

const listCivilians = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = parsePageLimit(req.query);

    const filter = {};
    const searchTrim = search != null && String(search).trim();
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { phone: rx },
        { bio: rx },
        { "location.city": rx },
        { "location.district": rx },
        { "location.province": rx },
      ];
    }

    const [rows, total] = await Promise.all([
      Citizen.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Citizen.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

const listOrganizations = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = parsePageLimit(req.query);

    const filter = {};
    const searchTrim = search != null && String(search).trim();
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { phone: rx },
        { address: rx },
        { description: rx },
      ];
    }

    const [rows, total] = await Promise.all([
      Organization.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Organization.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

const listEvents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = parsePageLimit(req.query);

    const filter = {};
    const searchTrim = search != null && String(search).trim();
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), "i");
      filter.$or = [
        { title: rx },
        { description: rx },
        { location: rx },
        { organization: rx },
      ];
    }

    const [rows, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

const getEventByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id)
      .populate("orgId", "name email phone address description profileImage")
      .lean();

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

const register = async (req, res, next) => {
  try {
    const value = req.validatedBody;

    const existing = await Admin.findOne({ email: value.email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const admin = await Admin.create(value);
    const token = generateToken({
      id: admin._id.toString(),
      role: USER_ROLE.ADMIN,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;
    adminResponse.token = token;
    adminResponse.role = USER_ROLE.ADMIN;

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: adminResponse,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: admin._id.toString(),
      role: USER_ROLE.ADMIN,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;
    adminResponse.token = token;
    adminResponse.role = USER_ROLE.ADMIN;

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: adminResponse,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  listCivilians,
  listOrganizations,
  listEvents,
  getEventByIdAdmin,
};
