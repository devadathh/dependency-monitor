import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Helper to get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetch dashboard stats for the logged-in user.
 * Returns: { totalProjects, totalDependencies, vulnerableDependencies, dependencyDrift }
 */
export const fetchDashboardStats = () =>
  axios.get(`${API_BASE}/dashboard/stats`, getAuthHeaders());

/**
 * Fetch monthly chart trend data.
 * Returns: { vulnerabilityTrends, dependencyDriftTrends }
 */
export const fetchDashboardTrends = () =>
  axios.get(`${API_BASE}/dashboard/trends`, getAuthHeaders());
