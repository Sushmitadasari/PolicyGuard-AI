import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const AnalyticsContext = createContext(null);

const normalizeHistoryItem = (item) => ({
  id: item?.id || item?._id || null,
  fileName: item?.fileName || item?.documentName || "",
  documentName: item?.documentName || item?.fileName || "",
  source: item?.source || "",
  analysisType: item?.analysisType || "",
  summary: item?.summary || "",
  riskScore: Number(item?.riskScore ?? 0),
  riskLevel: item?.riskLevel || "Unknown",
  confidence: Number(item?.confidence ?? 0),
  createdAt: item?.createdAt || null,
  metadata: item?.metadata || {},
  raw: item,
});

const normalizeDashboardStats = (payload = {}) => ({
  totalAnalyses: payload?.totalAnalyses ?? null,
  averageRiskScore: payload?.averageRiskScore ?? null,
  averageConfidence: payload?.averageConfidence ?? null,
  riskLevelBreakdown: payload?.riskLevelBreakdown ?? {},
  recentItems: Array.isArray(payload?.recentItems) ? payload.recentItems : [],
});

export const AnalyticsProvider = ({ children }) => {
  const { user, initializing } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalAnalyses: null,
    averageRiskScore: null,
    riskLevelBreakdown: {},
    recentItems: [],
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [latestAnalyses, setLatestAnalyses] = useState({
    pdf: null,
    website: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshAnalytics = useCallback(async () => {
    if (!user) {
      setDashboardStats({
        totalAnalyses: null,
        averageRiskScore: null,
        riskLevelBreakdown: {},
        recentItems: [],
      });
      setRecentAnalyses([]);
      setHistoryItems([]);
      setError("");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    setRefreshing(true);
    setError("");

    try {
      const [dashboardRes, historyRes] = await Promise.all([
        api.get("/history/dashboard-stats"),
        api.get("/history?limit=100"),
      ]);

      const dashboardPayload = dashboardRes.data?.stats ?? dashboardRes.data ?? {};
      const historyPayload = historyRes.data ?? {};
      const historyList = Array.isArray(historyPayload?.items)
        ? historyPayload.items
        : Array.isArray(historyPayload)
        ? historyPayload
        : [];

      const normalizedHistory = historyList.map(normalizeHistoryItem).filter((item) => item.id);
      const normalizedRecentItems = Array.isArray(dashboardPayload?.recentItems)
        ? dashboardPayload.recentItems.map(normalizeHistoryItem).filter((item) => item.id)
        : normalizedHistory.slice(0, 10);

      setDashboardStats(normalizeDashboardStats({
        ...dashboardPayload,
        recentItems: normalizedRecentItems,
      }));
      setRecentAnalyses(normalizedRecentItems);
      setHistoryItems(normalizedHistory);
    } catch (err) {
      console.error("Failed to refresh analytics", err);
      setError(err?.response?.data?.message || "Failed to refresh analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    if (!user) {
      setDashboardStats({
        totalAnalyses: null,
        averageRiskScore: null,
        riskLevelBreakdown: {},
        recentItems: [],
      });
      setRecentAnalyses([]);
      setHistoryItems([]);
      setLatestAnalyses({ pdf: null, website: null });
      setLoading(false);
      setRefreshing(false);
      setError("");
      return;
    }

    refreshAnalytics();
  }, [initializing, refreshAnalytics, user]);

  const setLatestAnalysis = useCallback((type, analysis) => {
    const normalizedType = typeof type === "string" ? type.trim().toLowerCase() : "";
    if (!normalizedType) {
      return;
    }

    setLatestAnalyses((current) => ({
      ...current,
      [normalizedType]: analysis || null,
    }));
  }, []);

  const value = useMemo(() => ({
    dashboardStats,
    recentAnalyses,
    historyItems,
    latestAnalyses,
    setLatestAnalysis,
    refreshAnalytics,
    loading,
    refreshing,
    error,
  }), [dashboardStats, error, historyItems, latestAnalyses, loading, recentAnalyses, refreshAnalytics, refreshing, setLatestAnalysis]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);