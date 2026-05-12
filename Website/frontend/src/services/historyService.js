import api from "./api";

export const getHistory = () => api.get("/history");

export const deleteHistoryItem = (id) =>
  api.delete(`/history/${id}`);

export default { getHistory, deleteHistoryItem };
