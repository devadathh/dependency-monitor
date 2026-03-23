const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");
const multer = require("multer");

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get("/dashboard", projectController.getDashboard);
router.get("/", projectController.getAllProjects);
router.get("/:id/details", projectController.getProjectDetails);
router.post("/", upload.single("dependencyFile"), projectController.createProject);
router.post("/:id/repo-scan", projectController.repoScan);
router.delete("/:id", projectController.deleteProject);

module.exports = router;