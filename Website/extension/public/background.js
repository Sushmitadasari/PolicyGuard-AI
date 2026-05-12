const BACKEND_ANALYZE_URL = "http://localhost:3000/api/v1/analyze";
const ANALYSIS_TIMEOUT_MS = 15000;

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") {
    return true;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
};

const getStoredToken = async () => {
  const result = await chrome.storage.local.get(["policyguardJwt"]);
  const token = typeof result.policyguardJwt === "string" ? result.policyguardJwt : "";

  if (token && isTokenExpired(token)) {
    await chrome.storage.local.remove(["policyguardJwt"]);
    return "";
  }

  return token;
};

const storeLatestAnalysis = async (payload) => {
  await chrome.storage.local.set({
    policyguardLatestAnalysis: payload,
    policyguardLatestAnalysisUpdatedAt: new Date().toISOString(),
  });
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = ANALYSIS_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "OPEN_EXTENSION") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html"),
    });

    sendResponse({ success: true });
    return false;
  }

  if (message?.type === "POLICYGUARD_ANALYZE_PAGE") {
    (async () => {
      try {
        const token = await getStoredToken();
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetchWithTimeout(BACKEND_ANALYZE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({
            source: "extension",
            type: "website",
            mode: "quick",
            payload: {
              url: message.payload?.url || "",
              text: message.payload?.text || "",
              title: message.payload?.title || "",
            },
            options: {
              persist: false,
              consent: false,
            },
            metadata: {
              pageTitle: message.payload?.title || "",
              currentUrl: message.payload?.url || "",
              source: "extension",
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          if (response.status === 401 || response.status === 403) {
            await chrome.storage.local.remove(["policyguardJwt"]);
          }
          throw new Error(data?.error?.message || "Analysis request failed");
        }

        const analysis = data.data || {};
        const result = {
          ...analysis,
          success: true,
          meta: data.meta || {},
        };

        await storeLatestAnalysis(result);

        sendResponse({ success: true, data: result });
      } catch (error) {
        const fallback = {
          success: false,
          error: error?.name === "AbortError"
            ? "Analysis timed out"
            : error?.message || "Unable to analyze page",
        };

        await chrome.storage.local.set({
          policyguardLatestAnalysisError: fallback.error,
          policyguardLatestAnalysisUpdatedAt: new Date().toISOString(),
        });

        sendResponse(fallback);
      }
    })();

    return true;
  }

  return false;
});