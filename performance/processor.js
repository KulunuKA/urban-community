/* Artillery processor: injects bearer token from PERF_ISSUES_JWT for civilian issue list. */

function setAuthVars(context, events, done) {
  const raw = process.env.PERF_ISSUES_JWT || "";
  context.vars.token = raw.trim();
  return done();
}

module.exports = { setAuthVars };
