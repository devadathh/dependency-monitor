const pool = require("../db");
const fetch = require("node-fetch");

exports.chat = async (req, res) => {
  const { message, history = [] } = req.body;
  const userId = req.userData.userId;

  let totalProjects = 0;
  let totalDependencies = 0;
  let totalVulnerabilities = 0;
  let criticalVulns = 0;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log("API KEY:", apiKey);

  try {
    // ── Fetch DB context ──
    const [projRes, depRes, vulRes, critRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM projects WHERE user_id = $1", [userId]),
      pool.query(
        `SELECT COUNT(*) FROM dependencies d
         JOIN projects p ON d.project_id = p.project_id
         WHERE p.user_id = $1`, [userId]
      ),
      pool.query(
        `SELECT COUNT(*) FROM dependency_vul dv
         JOIN projects p ON dv.project_id = p.project_id
         WHERE p.user_id = $1`, [userId]
      ),
      pool.query(
        `SELECT COUNT(*) FROM dependency_vul dv
         JOIN projects p ON dv.project_id = p.project_id
         WHERE p.user_id = $1 AND LOWER(dv.severity) = 'critical'`, [userId]
      ),
    ]);

    totalProjects = parseInt(projRes.rows[0].count);
    totalDependencies = parseInt(depRes.rows[0].count);
    totalVulnerabilities = parseInt(vulRes.rows[0].count);
    criticalVulns = parseInt(critRes.rows[0].count);

    // ── Try AI ONLY if API key exists ──
    if (apiKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "DepMonitor",
          },
          body: JSON.stringify({
            model: "google/gemma-7b-it:free",
            messages: [
              {
                role: "system",
                content: `You are DepBot. Answer based on:
Projects: ${totalProjects}
Dependencies: ${totalDependencies}
Vulnerabilities: ${totalVulnerabilities}
Critical: ${criticalVulns}`,
              },
              { role: "user", content: message },
            ],
          }),
        });

        console.log("AI HTTP:", response.status);

        if (response.ok) {
          const data = await response.json();
          const reply = data?.choices?.[0]?.message?.content?.trim();

          if (reply) {
            return res.json({ reply });
          }
        }

      } catch (err) {
        console.log("AI failed, using fallback...");
      }
    }

    // ── 🔥 SMART FALLBACK (ALWAYS WORKS) ──
    const msg = message.toLowerCase();
    let reply = "";

    if (msg.includes("hello") || msg.includes("hi")) {
      reply = "👋 Hi! I'm DepBot. I can help you with vulnerabilities, dependencies, and security insights.";
    }
    else if (msg.includes("vulnerabilities")) {
      reply = `⚠️ You have ${totalVulnerabilities} vulnerabilities (${criticalVulns} critical).\n\n${
        criticalVulns > 0
          ? "🚨 Fix critical vulnerabilities immediately."
          : "✅ No critical issues. Keep dependencies updated."
      }`;
    }
    else if (msg.includes("projects")) {
      reply = `📦 You currently have ${totalProjects} projects being monitored.`;
    }
    else if (msg.includes("dependencies")) {
      reply = `📚 You have ${totalDependencies} dependencies across your projects.`;
    }
    else if (msg.includes("drift")) {
      reply = "📈 Dependency drift means your package versions are outdated compared to latest versions.";
    }
    else {
      reply = `🤖 Based on your data:

📊 ${totalProjects} projects · ${totalDependencies} dependencies  
⚠️ ${totalVulnerabilities} vulnerabilities (${criticalVulns} critical)

💡 Keep your dependencies updated regularly.`;
    }

    return res.json({ reply });

  } catch (err) {
    console.error("Final error:", err.message);

    return res.status(500).json({
      reply: "⚠️ Something went wrong. Please try again.",
    });
  }
};