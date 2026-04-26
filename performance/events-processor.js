function setAuthVars(context, events, done) {
  const raw = process.env.PERF_EVENTS_JWT || "";
  context.vars.token = raw.trim();
  return done();
}

module.exports = { setAuthVars };
