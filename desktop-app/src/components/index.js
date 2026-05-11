import React from 'react';

export function WindowControls() {
  const minimizeWindow = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const maximizeWindow = () => {
    window.electronAPI?.maximizeWindow?.();
  };

  const closeWindow = () => {
    window.electronAPI?.closeWindow?.();
  };

  return (
    <div className="window-controls">
      <button className="window-control-btn" onClick={minimizeWindow} title="Minimize">
        _
      </button>
      <button className="window-control-btn" onClick={maximizeWindow} title="Maximize">
        □
      </button>
      <button className="window-control-btn close" onClick={closeWindow} title="Close">
        ✕
      </button>
    </div>
  );
}

export function Sidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'Home', label: 'Dashboard', icon: '🛡️' },
    { id: 'Scan', label: 'Live Scan', icon: '🔍' },
    { id: 'Alerts', label: 'Alerts', icon: '⚠️' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="shield-logo">🛡️</div>
        <div className="app-name-sidebar">PolicyGuard AI</div>
        <div className="app-sub-sidebar">Privacy Protect</div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className={`menu-item-wrapper ${activeTab === item.id ? 'active' : ''}`}>
            <button
              className="menu-item"
              onClick={() => onTabChange(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScreenHeader() {
  return (
    <div className="screen-header">
      <div className="header-title-section">
        <div className="logo-row">
          <span style={{ fontSize: '32px' }}>🛡️</span>
          <div className="brand-title">PolicyGuard AI</div>
        </div>
      </div>
    </div>
  );
}

export function DashboardCard({ icon, label, value, subtitle, color }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="dashboard-card-content">
        <div className="dashboard-card-label">{label}</div>
        <div className="dashboard-card-value">{value}</div>
        {subtitle && <div className="dashboard-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export function OverviewCard({ overallSafety, safetyStatus, totalApps }) {
  const riskColor = (score) => {
    if (score >= 71) return '#ef4444';
    if (score >= 46) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="overall-card">
      <div className="overall-left">
        <div className="circle-outer">
          <div className="circle-inner" style={{ borderColor: riskColor(100 - overallSafety) }}>
            <div className="overall-score-large">{overallSafety}</div>
            <div className="overall-out-of">/100</div>
          </div>
        </div>
      </div>
      <div className="overall-right">
        <div className="overall-title">Device Privacy</div>
        <div className="overall-subtitle">{safetyStatus}</div>
        <div className="overall-hint">Based on permissions and policy signals</div>
        <div className="overall-count">{totalApps} installed apps analysed</div>
      </div>
    </div>
  );
}

function permissionLabel(permission) {
  const value = permission.toLowerCase();
  if (value.includes('camera')) return 'Camera';
  if (value.includes('contacts')) return 'Contacts';
  if (value.includes('location')) return value.includes('background') ? 'Background location' : 'Location';
  if (value.includes('microphone') || value.includes('record_audio')) return 'Microphone';
  if (value.includes('sms')) return 'Messages';
  if (value.includes('storage') || value.includes('media') || value.includes('files')) return 'Files';
  if (value.includes('phone') || value.includes('call')) return 'Phone';
  if (value.includes('activity')) return 'Activity';
  if (value.includes('network') || value.includes('internet')) return 'Network';
  const segment = permission.split('.').pop() || permission;
  return segment.replace(/_/g, ' ');
}

function riskColor(score) {
  if (score >= 71) return '#ef4444';
  if (score >= 46) return '#f59e0b';
  return '#10b981';
}

function safeLines(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

export function AppCard({ app, onPressDetails, onAlertPress }) {
  const reason = safeLines(app.reasons?.[0] || 'No obvious privacy concerns were detected.');

  return (
    <div className="app-card">
      <div className="app-row">
        <div className="icon-wrap">
          {app.icon && typeof app.icon === 'string' && app.icon.match(/^(data:|http)/) ? (
            <img src={app.icon} alt={app.name} className="app-icon" />
          ) : (
            <div className="icon-placeholder">
              {typeof app.icon === 'string' && app.icon.length <= 2 ? app.icon : <span>{(app.name || 'A').slice(0, 2).toUpperCase()}</span>}
            </div>
          )}
        </div>
        <div className="app-info">
          <div className="app-name">{app.name}</div>
          <div className="package-name">{app.packageName}</div>
          <div className="app-meta-row">
            <div className="score-badge" style={{ backgroundColor: riskColor(app.score) }}>
              {app.score}
            </div>
            <div className="risk-level">{app.risk}</div>
          </div>
        </div>
        <button className="view-button" onClick={onPressDetails}>
          View
        </button>
      </div>

      <div className="reason-block">
        <div className="section-label">Why it was flagged</div>
        <div className="why-unsafe-text">{reason}</div>
      </div>

      <div className="permission-header-row">
        <div className="section-label">Permissions</div>
        {app.score >= 71 && onAlertPress && (
          <button className="alert-link" onClick={onAlertPress}>
            View alert
          </button>
        )}
      </div>

      <div className="permissions-row">
        {app.permissions && app.permissions.length > 0 ? (
          app.permissions.slice(0, 4).map((perm, idx) => (
            <div key={`${app.id}-perm-${idx}`} className="permission-chip">
              {permissionLabel(perm)}
            </div>
          ))
        ) : (
          <div className="no-perms-text">No permissions detected</div>
        )}
      </div>
    </div>
  );
}

export function AlertSheet({ visible, app, onClose, onViewDetails }) {
  if (!visible || !app) return null;

  return (
    <div className={`modal-overlay ${visible ? '' : 'hidden'}`} onClick={onClose}>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        <div className="alert-title">Privacy alert</div>
        <div className="alert-app">{app.name}</div>
        <div className="alert-score">{app.score}/100 · {app.risk}</div>

        <div className="section-label">Why it matters</div>
        {app.reasons?.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="alert-reason">• {reason}</div>
        ))}

        <div className="sheet-button-row">
          <button className="sheet-primary-button" onClick={onViewDetails}>
            View Details
          </button>
          <button className="sheet-secondary-button" onClick={onClose}>
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailSheet({ app, onClose }) {
  if (!app) return null;

  const recommendationsFromReasons = (reasons = []) => {
    const joined = reasons.join(' ').toLowerCase();
    const recommendations = [];

    if (joined.includes('location')) {
      recommendations.push('Limit location access to while using the app.');
    }
    if (joined.includes('microphone')) {
      recommendations.push('Only allow microphone use when you need it.');
    }
    if (joined.includes('camera')) {
      recommendations.push('Review camera permission and remove it if not needed.');
    }
    if (joined.includes('contacts')) {
      recommendations.push('Check whether contact access is essential for the app.');
    }

    if (recommendations.length === 0) {
      recommendations.push('No immediate action needed, but keep an eye on app permissions.');
    }

    return recommendations.slice(0, 3);
  };

  return (
    <div className={`modal-overlay ${app ? '' : 'hidden'}`} onClick={onClose}>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="sheet-card detail-sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        <div className="detail-title">{app.name}</div>
        <div className="detail-score">{app.score}/100 · {app.risk}</div>

        <div className="section-label">AI privacy summary</div>
        <div className="detail-summary">{safeLines(app.reasons?.join(' '))}</div>

        <div className="section-label">Safety recommendations</div>
        {recommendationsFromReasons(app.reasons).map((item, idx) => (
          <div key={idx} className="detail-bullet">• {item}</div>
        ))}

        <div className="sheet-button-row">
          <button className="sheet-secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function Snackbar({ message, visible }) {
  if (!message) return null;

  return (
    <div className={`snackbar ${visible ? '' : 'hidden'}`}>
      {message}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading privacy scan...</div>
    </div>
  );
}
