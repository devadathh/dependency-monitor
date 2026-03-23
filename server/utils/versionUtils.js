const semver = require("semver");

/*
  Version Drift:
  checks if installed version is older than safe (fixed) version
*/
function checkVersionDrift(installedVersion, safeVersion) {
  if (!safeVersion || safeVersion === "Up-to-date") {
    return "No Drift";
  }

  if (semver.valid(installedVersion) && semver.valid(safeVersion)) {
    if (semver.lt(installedVersion, safeVersion)) {
      return "Update Available";
    }
  }

  return "No Drift";
}

module.exports = {
  checkVersionDrift
};

