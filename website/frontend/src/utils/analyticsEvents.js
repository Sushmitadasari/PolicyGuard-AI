export const ANALYTICS_REFRESH_EVENT = "policyguard:analytics-refresh";

export const notifyAnalyticsChanged = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ANALYTICS_REFRESH_EVENT));
};

export const subscribeToAnalyticsRefresh = (handler) => {
  if (typeof window === "undefined" || typeof handler !== "function") {
    return () => { };
  }

  window.addEventListener(ANALYTICS_REFRESH_EVENT, handler);

  return () => {
    window.removeEventListener(ANALYTICS_REFRESH_EVENT, handler);
  };
};
