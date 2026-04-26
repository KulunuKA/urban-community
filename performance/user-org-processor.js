const crypto = require("crypto");

function assignUuid(context, events, done) {
  context.vars.uuid = crypto.randomUUID();
  return done();
}

module.exports = { assignUuid };
