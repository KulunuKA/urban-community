const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (!process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not set. Add JWT_SECRET to server/.env, or unset a blank JWT_SECRET in your system/shell environment (dotenv will not override an existing variable)."
  );
  process.exit(1);
}

require("./utils/Database");

const express = require("express");
const recyclingCenterRoutes = require("./modules/recycling/recling.Routes");
const eventRoute = require("./modules/events/eventRoute");
const issueRoute = require("./modules/issues/issueRoute");
const citizenRoute = require("./modules/citizen/citizenRoute");
const organizationRoute = require("./modules/organization/organization.route");
const errorHandler = require("./middlewares/errorHandler");
const userRoute = require("./modules/user/user.route");
const memberRoute = require("./modules/member/member.route");
const adminRoute = require("./modules/Admin/admin.route");
const notificationRoute = require("./modules/Notifications/notifcation.route");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/civilian", citizenRoute);
app.use("/api/organization", organizationRoute);
app.use("/api/member", memberRoute);
app.use("/api/admin", adminRoute);
app.use("/api/users", userRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/recycling", recyclingCenterRoutes);
app.use("/api/events", eventRoute);
app.use("/api/issues", issueRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
