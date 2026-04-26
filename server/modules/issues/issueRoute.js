const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const {
  createIssueSchema,
  updateIssueStatusSchema,
  adminResponseSchema,
} = require("./issue.validation");
const issueController = require("./issueController");
const upload = require("../../middlewares/upload.middleware");
const userAuth = require("../../middlewares/userAuth");
const adminAuth = require("../../middlewares/AdminAuth");

router.post(
  "/create",
  userAuth,
  upload.single("image"),
  validate(createIssueSchema),
  issueController.createIssue,
);

router.get("/", adminAuth, issueController.getAllIssues);

router.get("/analytics/summary", adminAuth, issueController.getIssueAnalytics);

router.get("/me", userAuth, issueController.getIssuesForCurrentUser);

router.get("/admin/:id", adminAuth, issueController.getIssueByIdForAdmin);

router.get("/:id", userAuth, issueController.getIssueById);

router.get("/user/:userId", userAuth, issueController.getIssuesByUser);

router.patch(
  "/:id/status",
  adminAuth,
  validate(updateIssueStatusSchema),
  issueController.updateIssueStatus,
);

router.patch(
  "/:id/admin-response",
  adminAuth,
  validate(adminResponseSchema),
  issueController.addAdminResponse,
);

router.delete("/:id", userAuth, issueController.deleteIssue);

module.exports = router;
