const Citizen = require("./citizenModel");
const { generateToken } = require("../../utils/tokenManager");

const register = async (req, res, next) => {
  try {
    const value = req.validatedBody;

    //step 1: check if the user is already registered
    const existingUser = await Citizen.findOne({ email: value.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await Citizen.create(value);

    //step 3: generate token
    const token = generateToken({ id: user._id });

    let userResponse = user.toObject();
    userResponse.role = "citizen";
    delete userResponse.password;
    delete user.password;

    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully",
      data: { token, user: userResponse },
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      console.log("userId",userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const user = await Citizen.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      data: userResponse,
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

    const user = await Citizen.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const value = req.validatedBody || {};

    if (Object.prototype.hasOwnProperty.call(value, "name")) {
      user.name = value.name;
    }
    if (Object.prototype.hasOwnProperty.call(value, "phone")) {
      user.phone = value.phone || undefined;
    }
    if (Object.prototype.hasOwnProperty.call(value, "profileImage")) {
      user.profileImage = value.profileImage || undefined;
    }
    if (Object.prototype.hasOwnProperty.call(value, "bio")) {
      user.bio = value.bio || undefined;
    }
    if (Object.prototype.hasOwnProperty.call(value, "preferredLanguage")) {
      user.preferredLanguage = value.preferredLanguage || "en";
    }

    if (value.location) {
      user.location = {
        city: value.location.city || "",
        district: value.location.district || "",
        province: value.location.province || "",
      };
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse,
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
