import axios from "axios";

const API_URL = "http://localhost:5000/api/vulnerability/alert";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchAlerts = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const resolveAlert = async (type, id) => {
  const response = await axios.patch(`${API_URL}/${type}/${encodeURIComponent(id)}/resolve`, {}, getAuthHeaders());
  return response.data;
};
