import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/NewProject.css";

function NewProject() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        project_name: "",
        description: "",
        repoUrl: "",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, repoUrl: "" }));
        }
    };
    //console.log("Submitting form", { file, repoUrl });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { project_name, description, repoUrl } = formData;

        // Validation: Must have exactly one
        if (!file && !repoUrl) {
            setError("Please either upload a dependency file OR provide a Git Repository URL.");
            setLoading(false);
            return;
        }

        if (file && repoUrl) {
            setError("Please provide either a file OR a Git URL, not both.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");

            // 1. Create Project (Base)
            const projectFormData = new FormData();
            projectFormData.append("project_name", project_name);
            projectFormData.append("description", description);
            if (file) {
                projectFormData.append("dependencyFile", file);
            }

            const createRes = await fetch("http://localhost:5000/api/projects", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: projectFormData,
            });

            if (!createRes.ok) {
                const errData = await createRes.json();
                throw new Error(errData.message || "Failed to create project");
            }

            const { projectId } = await createRes.json();

            // 2. If Git URL, trigger scan
            if (repoUrl) {
                const scanRes = await fetch(`http://localhost:5000/api/projects/${projectId}/repo-scan`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ repoUrl }),
                });

                if (!scanRes.ok) {
                    const errData = await scanRes.json();
                    throw new Error(errData.message || "Project created, but repository scan failed.");
                }
            }

            // Success - Redirect
            navigate(`/projects`);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-project-page">
            <div className="form-card">
                <div className="form-header">
                    <h1>Create New Project</h1>
                    <p>Provide a Git URL or upload a dependency file to start monitoring</p>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="new-project-form">
                    <div className="input-group">
                        <label htmlFor="project_name">Project Name</label>
                        <input
                            type="text"
                            id="project_name"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. My Awesome App"
                            className="modern-input"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of your project..."
                            className="modern-textarea"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="repoUrl">Git Repository URL</label>
                        <input
                            type="url"
                            id="repoUrl"
                            name="repoUrl"
                            value={formData.repoUrl}
                            onChange={(e) => {
                                handleChange(e);
                                if (e.target.value) setFile(null);
                            }}
                            placeholder="https://github.com/user/repo.git"
                            className="modern-input"
                        />
                    </div>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="input-group">
                        <label htmlFor="dependencyFile">Dependency File</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="dependencyFile"
                                name="dependencyFile"
                                accept=".json,.txt"
                                onChange={handleFileChange}
                                className="file-input-hidden"
                            />
                            <span className="upload-icon">📁</span>
                            {file ? (
                                <span className="upload-text" style={{ color: "#2563eb" }}>{file.name}</span>
                            ) : (
                                <>
                                    <span className="upload-text">Click to upload or drag and drop</span>
                                    <span className="upload-hint">Supported: package.json, requirements.txt</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Create Project"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: "15px" }}>
                        <Link to="/projects" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px" }}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProject;
