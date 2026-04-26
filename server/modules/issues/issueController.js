const mongoose = require("mongoose");
const Issue = require("./issueModel");

/** Stable user id from JWT payload (id / _id / ObjectId) for queries */
function resolveAuthUserId(req) {
  const u = req.user;
  if (!u) return null;
  const raw = u.id !== undefined && u.id !== null ? u.id : u._id;
  if (raw === undefined || raw === null) return null;
  let s;
  if (typeof raw === "string") {
    s = raw.trim();
  } else if (
    typeof raw === "object" &&
    raw != null &&
    typeof raw.toString === "function"
  ) {
    s = raw.toString().trim();
  } else {
    s = String(raw).trim();
  }
  if (!mongoose.Types.ObjectId.isValid(s)) return null;
  return s;
}

exports.createIssue = async (req, res) => {
  try {
    const authId = resolveAuthUserId(req);
    if (!authId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const issue = await Issue.create({
      ...req.validatedBody,
      citizen: authId,
      image: req.file ? req.file.path : null,
    });

    return res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getIssueAnalytics = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();

    const analytics = await Issue.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const statusData = analytics[0].byStatus;
    const categoryData = analytics[0].byCategory;

    const formatData = (arr) =>
      arr.reduce((acc, item) => {
        acc[item._id || "unknown"] = item.count;
        return acc;
      }, {});

    const statusSummary = formatData(statusData);
    const categorySummary = formatData(categoryData);

    const resolvedCount =
      statusSummary.Resolved ?? statusSummary.resolved ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        totalIssues,
        byStatus: statusSummary,
        byCategory: categorySummary,
        resolvedPercentage:
          totalIssues > 0
            ? ((resolvedCount / totalIssues) * 100).toFixed(2) + "%"
            : "0%",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/** Escape user input for safe use inside RegExp */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.getAllIssues = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const searchTrim = search != null && String(search).trim();
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), "i");
      filter.$or = [
        { title: rx },
        { description: rx },
        { location: rx },
      ];
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const issues = await Issue.find(filter)
      .populate("citizen", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Issue.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: issues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const authId = resolveAuthUserId(req);
    if (!authId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Match ownership the same way Mongo stores `citizen` (avoids string/compare bugs)
    const ownsIssue = await Issue.exists({ _id: id, citizen: authId });
    if (!ownsIssue) {
      const exists = await Issue.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Issue not found",
        });
      }
      return res.status(403).json({
        success: false,
        message: "You can only view issues you reported",
      });
    }

    const issue = await Issue.findById(id).populate("citizen", "name email");

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error("getIssueById:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/** Single issue for admin dashboard (no citizen ownership check) */
exports.getIssueByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id).populate("citizen", "name email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error("getIssueByIdForAdmin:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.getIssuesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const issues = await Issue.find({ citizen: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: issues.length,
      data: issues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/** Issues for the authenticated citizen (JWT) — paginated; supports status, category, search */
exports.getIssuesForCurrentUser = async (req, res) => {
  try {
    const authId = resolveAuthUserId(req);
    if (!authId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { page = 1, status, category, search } = req.query;

    const filter = { citizen: authId };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const searchTrim = search != null && String(search).trim();
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), "i");
      filter.$or = [
        { title: rx },
        { description: rx },
        { location: rx },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    /** Fixed page size for civilian “my issues” list (not configurable). */
    const limitNumber = 5;
    const skip = (pageNumber - 1) * limitNumber;

    const [issues, total] = await Promise.all([
      Issue.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Issue.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNumber) || 1);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages,
      data: issues,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.validatedBody;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.status = status;
    await issue.save();

    const updatedIssue = await Issue.findById(id).populate(
      "citizen",
      "name email",
    );

    return res.status(200).json({
      success: true,
      data: updatedIssue,
      message: `Issue status updated to ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.validatedBody;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.adminResponse = adminResponse;
    await issue.save();

    const updatedIssue = await Issue.findById(id).populate(
      "citizen",
      "name email",
    );

    return res.status(200).json({
      success: true,
      data: updatedIssue,
      message: "Admin response added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const authId = resolveAuthUserId(req);
    if (!authId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const issueDoc = await Issue.findOne({ _id: id, citizen: authId });

    if (!issueDoc) {
      const exists = await Issue.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Issue not found",
        });
      }
      return res.status(403).json({
        success: false,
        message: "You can only delete issues you reported",
      });
    }

    if (issueDoc.status !== "Pending") {
      return res.status(403).json({
        success: false,
        message: "Only pending issues can be deleted.",
      });
    }

    await Issue.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
