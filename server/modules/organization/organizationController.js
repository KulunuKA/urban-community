const Organization = require("./organizationModel");
const { generateToken } = require("../../utils/tokenManager");

const register = async (req, res, next) => {
  try {
    const value = req.validatedBody;

    const existingOrg = await Organization.findOne({ email: value.email });
    if (existingOrg) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const organization = await Organization.create(value);

    const token = generateToken({ id: organization._id });

    let orgResponse = organization.toObject();
    orgResponse.role = "organization";
    delete orgResponse.password;
    orgResponse.token = token;

    return res.status(201).json({
      success: true,
      message: "Organization registered successfully",
      data: {
        token,
        user: orgResponse,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const organization = await Organization.findById(userId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const orgResponse = organization.toObject();
    delete orgResponse.password;

    return res.status(200).json({
      success: true,
      data: orgResponse,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const organization = await Organization.findById(userId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const value = req.validatedBody || {};

    if (Object.prototype.hasOwnProperty.call(value, "name")) {
      organization.name = value.name;
    }
    if (Object.prototype.hasOwnProperty.call(value, "description")) {
      organization.description = value.description || "";
    }
    if (Object.prototype.hasOwnProperty.call(value, "address")) {
      organization.address = value.address || "";
    }
    if (Object.prototype.hasOwnProperty.call(value, "phone")) {
      organization.phone = value.phone || "";
    }
    if (Object.prototype.hasOwnProperty.call(value, "profileImage")) {
      organization.profileImage = value.profileImage || "";
    }

    await organization.save();

    const orgResponse = organization.toObject();
    delete orgResponse.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: orgResponse,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  getProfile,
  updateProfile,
};
