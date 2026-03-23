const simpleGit = require("simple-git");
const fs = require("fs-extra"); // Using fs-extra for easy cleanup or just fs
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Parses package.json content for dependencies
 */
const parsePackageJson = (content) => {
    try {
        const json = JSON.parse(content);
        const allDeps = {
            ...(json.dependencies || {}),
            ...(json.devDependencies || {}),
        };
        return Object.entries(allDeps).map(([name, version]) => ({
            name,
            version: version.replace(/[^0-9.]/g, ""),
            manager: "npm",
        }));
    } catch (e) {
        return [];
    }
};

/**
 * Parses requirements.txt content for dependencies
 */
const parseRequirementsTxt = (content) => {
    const lines = content.split("\n");
    const deps = [];
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
            // Simple regex: name==version or name>=version
            const match = trimmed.match(/^([^=<>]+)(?:[=<>]+(.*))?$/);
            if (match) {
                deps.push({
                    name: match[1].trim(),
                    version: (match[2] || "0.0.0").trim(),
                    manager: "pip",
                });
            }
        }
    });
    return deps;
};

/**
 * Parses pom.xml content for dependencies (Simple regex approach)
 */
const parsePomXml = (content) => {
    const deps = [];
    // Very simplistic regex to catch dependencies in pom.xml
    const depRegex = /<dependency>[\s\S]*?<groupId>([\s\S]*?)<\/groupId>[\s\S]*?<artifactId>([\s\S]*?)<\/artifactId>[\s\S]*?<version>([\s\S]*?)<\/version>[\s\S]*?<\/dependency>/g;
    let match;
    while ((match = depRegex.exec(content)) !== null) {
        deps.push({
            name: `${match[1].trim()}:${match[2].trim()}`,
            version: match[3].trim(),
            manager: "maven",
        });
    }
    return deps;
};

/**
 * Clones a repo and scans for dependency files
 */
const scanRepo = async (repoUrl) => {
    const tempId = uuidv4();
    const tempPath = path.join(__dirname, "../temp", tempId);
    const git = simpleGit();

    try {
        await fs.ensureDir(tempPath);
        await git.clone(repoUrl, tempPath);

        let dependencies = [];

        // Check for package.json
        const packageJsonPath = path.join(tempPath, "package.json");
        if (await fs.pathExists(packageJsonPath)) {
            const content = await fs.readFile(packageJsonPath, "utf-8");
            dependencies = [...dependencies, ...parsePackageJson(content)];
        }

        // Check for requirements.txt
        const reqsPath = path.join(tempPath, "requirements.txt");
        if (await fs.pathExists(reqsPath)) {
            const content = await fs.readFile(reqsPath, "utf-8");
            dependencies = [...dependencies, ...parseRequirementsTxt(content)];
        }

        // Check for pom.xml
        const pomPath = path.join(tempPath, "pom.xml");
        if (await fs.pathExists(pomPath)) {
            const content = await fs.readFile(pomPath, "utf-8");
            dependencies = [...dependencies, ...parsePomXml(content)];
        }

        return dependencies;
    } finally {
        // Cleanup
        if (await fs.pathExists(tempPath)) {
            await fs.remove(tempPath);
        }
    }
};

module.exports = { scanRepo };
