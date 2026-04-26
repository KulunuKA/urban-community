const multer = require("multer");

/** Test double: avoids Cloudinary; create-issue tests omit file so req.file stays unset. */
module.exports = multer({ storage: multer.memoryStorage() });
