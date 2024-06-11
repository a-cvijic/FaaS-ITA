import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Function to get JWT token from local storage
const getToken = () => localStorage.getItem("token");

// Function to create an authenticated Axios instance
const createAuthenticatedInstance = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// API functions
export const loginUser = (username, password) => {
  return axios.post(`${API_BASE_URL}/login`, { username, password });
};

export const getTasks = () => {
  const instance = createAuthenticatedInstance();
  return instance.get("/tasks");
};

export const createTask = (taskData) => {
  const instance = createAuthenticatedInstance();
  return instance.post("/tasks", taskData);
};

export const updateTask = (id, taskData) => {
  const instance = createAuthenticatedInstance();
  return instance.put(`/tasks/${id}`, taskData);
};

export const deleteTask = (id) => {
  const instance = createAuthenticatedInstance();
  return instance.delete(`/tasks/${id}`);
};
