const axios = require("axios");

async function checkVulnerabilities(packageName, version) {
  try {
    const response = await axios.post(
      "https://api.osv.dev/v1/query",
      {
        package: {
          name: packageName,
          ecosystem: "npm",
        },
        version: version,
      }
    );

    return response.data.vulns || [];
  } catch (error) {
    console.error("OSV API Error:", error.message);
    return [];
  }
}

module.exports = checkVulnerabilities;
