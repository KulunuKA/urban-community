const express = require("express");
const cors = require("cors");
const recyclingCenterRoutes = require("./modules/recycling/recling.Routes");
const eventRoute = require("./modules/events/eventRoute");
const issueRoute = require("./modules/issues/issueRoute");
const citizenRoute = require("./modules/citizen/citizenRoute");
const organizationRoute = require("./modules/organization/organization.route");
const errorHandler = require("./middlewares/errorHandler");
const userRoute = require("./modules/user/user.route");
const memberRoute = require("./modules/member/member.route");
const adminRoute = require("./modules/Admin/admin.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/civilian", citizenRoute);
app.use("/api/organization", organizationRoute);
app.use("/api/member", memberRoute);
app.use("/api/admin", adminRoute);
app.use("/api/users", userRoute);
app.use("/api/recycling", recyclingCenterRoutes);
app.use("/api/events", eventRoute);
app.use("/api/issues", issueRoute);

app.use(errorHandler);

module.exports = app;
