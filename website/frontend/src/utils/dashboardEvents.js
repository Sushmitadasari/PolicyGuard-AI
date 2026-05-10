// Lightweight dashboard refresh event helpers
export function triggerDashboardRefresh() {
  try {
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
  } catch (e) {
    // ignore in non-browser env
  }
}

export function subscribeDashboardRefresh(callback) {
  if (typeof callback !== 'function') return () => { };
  const handler = () => callback();
  window.addEventListener('dashboard-refresh', handler);
  return () => window.removeEventListener('dashboard-refresh', handler);
}
