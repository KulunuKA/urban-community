const express = require("express");
const memberController = require("./memberController");
const router = express.Router();
const auth = require("../../middlewares/userAuth");
const validate = require("../../middlewares/validate");
const { responseRequestSchema, deleteMemberSchema } = require("./member.validation");

router.post("/send-request", auth, memberController.sendRequest);
router.get("/requests", auth, memberController.getMyRequests);
router.get("/get-requests/:eventId", auth, memberController.getRequests);
router.put("/response-request/:requestId", auth, validate(responseRequestSchema), memberController.responseRequest);
router.get("/get-members/:eventId", auth, memberController.getMembers);
router.delete("/delete-member", auth, validate(deleteMemberSchema), memberController.deleteMember);

module.exports = router;
