import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import {
  ScreenHeader,
  DashboardCard,
  OverviewCard,
  AppCard,
  AlertSheet,
  DetailSheet,
  Snackbar,
  LoadingScreen,
  WindowControls,
  Sidebar,
} from './components';

const RISK_RULES = [
  { keywords: ['vpn', 'proxy', 'tunnel'], points: 35, reason: 'This app can route your internet traffic through another service.' },
  { keywords: ['cleaner', 'booster', 'optimizer', 'speed'], points: 30, reason: 'This app promises device cleanup, which often needs broad access.' },
  { keywords: ['flashlight', 'torch'], points: 25, reason: 'This app is simple, but it may still request more access than needed.' },
  { keywords: ['scanner', 'qr', 'barcode'], points: 15, reason: 'This app may need camera or file access to scan content.' },
  { keywords: ['wallet', 'pay', 'bank', 'upi'], points: 20, reason: 'This app handles payments, so it may access sensitive account data.' },
  { keywords: ['mod', 'crack', 'hack'], points: 40, reason: 'This app looks unofficial or modified, so its behavior is harder to trust.' },
];

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

function humanReasonFromPermissions(permissions = []) {
  const list = permissions.map((p) => p.toLowerCase());
  const sensitive = [];

  const hasCamera = list.some((p) => p.includes('camera'));
  const hasMic = list.some((p) => p.includes('microphone') || p.includes('record_audio'));
  const hasNetwork = list.some((p) => p.includes('internet') || p.includes('network'));
  const hasLocation = list.some((p) => p.includes('location'));
  const hasContacts = list.some((p) => p.includes('contacts'));
  const hasStorage = list.some((p) => p.includes('storage') || p.includes('media') || p.includes('files'));
  const hasBackground = list.some((p) => p.includes('background'));
  const hasBrowserTracking = list.some((p) => p.includes('browser_tracking'));

  if ((hasCamera || hasMic) && hasNetwork) {
    sensitive.push('This app can record audio/video and communicate online.');
  } else if (hasCamera && hasMic) {
    sensitive.push('This app can access your camera and microphone locally.');
  }

  if (hasBrowserTracking && hasLocation) {
    sensitive.push('This browser may track browsing behavior and device location.');
  } else if (hasBrowserTracking) {
    sensitive.push('This app may track online behavior across websites.');
  }

  if (hasBackground && hasNetwork) {
    sensitive.push('This app may continue monitoring activity in background.');
  } else if (hasBackground) {
    sensitive.push('This app runs in the background without user interaction.');
  }

  if (hasNetwork && !hasCamera && !hasMic && !hasBrowserTracking && !hasBackground) {
    sensitive.push('This app communicates over internet services.');
  }

  if (hasStorage && !hasNetwork && !hasCamera && !hasMic && !hasBrowserTracking && !hasBackground) {
    sensitive.push('This app mainly accesses local storage files.');
  }

  if (sensitive.length === 0) {
    sensitive.push('This app requests basic capabilities.');
  }

  return sensitive;
}

function getRiskAssessment(packageName, appName, permissions = []) {
  const identity = `${packageName} ${appName}`.toLowerCase();
  const reasons = [];
  let score = 0;

  const list = permissions.map((p) => p.toLowerCase());
  if (list.some((p) => p.includes('camera'))) score += 35;
  if (list.some((p) => p.includes('microphone') || p.includes('record_audio'))) score += 35;
  if (list.some((p) => p.includes('contacts'))) score += 25;
  if (list.some((p) => p.includes('screen_recording'))) score += 20;
  if (list.some((p) => p.includes('background_monitoring') || p.includes('background'))) score += 15;
  if (list.some((p) => p.includes('browser_tracking'))) score += 15;
  if (list.some((p) => p.includes('location'))) score += 10;
  if (list.some((p) => p.includes('network') || p.includes('internet'))) score += 10;
  if (list.some((p) => p.includes('storage') || p.includes('media') || p.includes('files'))) score += 5;

  const permissionReasons = humanReasonFromPermissions(permissions);
  reasons.push(...permissionReasons);

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    risk: getRiskLabel(score),
    reasons,
  };
}

function getRiskLabel(score) {
  if (score >= 80) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  if (score >= 15) return 'Low Risk';
  return 'Safe';
}

function getSafetyStatus(score) {
  if (score >= 80) return 'At Risk';
  if (score >= 40) return 'Moderate';
  if (score >= 15) return 'Good';
  return 'Excellent';
}

function riskColor(score) {
  if (score >= 80) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  if (score >= 15) return '#eab308';
  return '#10b981';
}

function recommendationsFromReasons(reasons = []) {
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
  if (joined.includes('messages')) {
    recommendations.push('Review message access carefully before allowing it.');
  }
  if (joined.includes('privacy policy')) {
    recommendations.push('Open the privacy policy and check how data is shared.');
  }

  if (recommendations.length === 0) {
    recommendations.push('No immediate action needed, but keep an eye on app permissions.');
  }

  return recommendations.slice(0, 3);
}



// Screen Components
function DashboardScreen({ apps, overallSafety, safetyStatus, isScanning, onScan, onSelectApp, onViewAll }) {
  const [searchQuery, setSearchQuery] = useState('');

  const highRiskCount = apps.filter((a) => a.score >= 71).length;
  const safeCount = apps.filter((a) => a.score < 26).length;

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps.slice(0, 5);
    const q = searchQuery.toLowerCase().replace(/\s+/g, '');
    return apps.filter(app => (app.name || '').toLowerCase().replace(/\s+/g, '').includes(q)).slice(0, 5);
  }, [apps, searchQuery]);

  return (
    <div className="screen-wrapper">
      <div className="scroll-content">
        <ScreenHeader />

        <div className="search-filter-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-grid-section">
          <DashboardCard icon="⚠️" label="High Risk Apps" value={highRiskCount} color="#ef4444" />
          <DashboardCard icon="✅" label="Safe Applications" value={safeCount} color="#10b981" />
          <DashboardCard icon="📊" label="Total Applications" value={apps.length} color="#3b82f6" />
          <DashboardCard icon="📱" label="Active Alerts" value={highRiskCount} color="#2563EB" />
        </div>

        <OverviewCard overallSafety={overallSafety} safetyStatus={safetyStatus} totalApps={apps.length} />

        <div className="section-heading">{searchQuery ? `${filteredApps.length} Apps Found` : 'Installed apps'}</div>
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onSelectApp(app)} />
        ))}
        {filteredApps.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-state-title">No apps found</div>
            <div className="empty-state-text">Try adjusting your search.</div>
          </div>
        )}
        {apps.length > 5 && !searchQuery && (
          <button className="view-all-button" onClick={onViewAll}>View All {apps.length} Apps →</button>
        )}
      </div>
    </div>
  );
}

function ApplicationsScreen({ apps, onSelectApp }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'High Risk', 'Medium Risk', 'Low Risk', 'Safe'];

  const filteredApps = useMemo(() => {
    let result = apps;
    if (activeFilter !== 'All') {
      result = result.filter(app => app.risk === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/\s+/g, '');
      result = result.filter(app => (app.name || '').toLowerCase().replace(/\s+/g, '').includes(q));
    }
    return result;
  }, [apps, activeFilter, searchQuery]);

  return (
    <div className="screen-wrapper">
      <div className="scroll-content">
        <ScreenHeader />

        <div className="search-filter-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-scroll">
            {filters.map(f => (
              <button
                key={f}
                className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="section-heading">{filteredApps.length} Apps Found</div>
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onSelectApp(app)} />
        ))}
        {filteredApps.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-state-title">No apps found</div>
            <div className="empty-state-text">Try adjusting your search or risk filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveScanScreen({ apps, overallSafety, safetyStatus, isScanning, onScan, onSelectApp }) {
  return (
    <div className="screen-wrapper">
      <div className="scroll-content">
        <ScreenHeader />

        <div className="hero-scan-card">
          <div className="hero-scan-score">{overallSafety}/100 · {safetyStatus}</div>
          <div className="hero-scan-text">Tap the refresh button to update privacy scores and permissions.</div>
          <button
            className={`hero-scan-button ${isScanning ? 'scanning' : ''}`}
            onClick={onScan}
            disabled={isScanning}
          >
            {isScanning ? '⏳' : '🔄'} {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>

        <div className="section-heading">Results</div>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onSelectApp(app)} />
        ))}
      </div>
    </div>
  );
}

function AlertsScreen({ apps, onScan, isScanning, onSelectApp }) {
  return (
    <div className="screen-wrapper">
      <div className="scroll-content">
        <ScreenHeader />
        <div className="section-heading">Privacy alerts</div>
        {apps.length > 0 ? (
          apps.map((app) => (
            <AppCard key={app.id} app={app} onPressDetails={() => onSelectApp(app)} />
          ))
        ) : (
          <div className="empty-state-card">
            <div className="empty-state-title">No high-risk apps right now</div>
            <div className="empty-state-text">Run a privacy scan to refresh the latest signals.</div>
          </div>
        )}
      </div>
    </div>
  );
}



function SettingsScreen() {
  return (
    <div className="screen-wrapper">
      <div className="scroll-content">
        <ScreenHeader />
        <div className="section-heading">App Settings</div>
        <div className="settings-card">
          <div className="settings-title">Scan behavior</div>
          <div className="settings-text">Manual scan refresh is enabled. Open any screen to run a new privacy scan.</div>
        </div>
        <div className="settings-card">
          <div className="settings-title">Privacy note</div>
          <div className="settings-text">
            Policy Guard AI uses installed app metadata and permission signals to highlight privacy concerns. Your data stays on your device.
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-title">About</div>
          <div className="settings-text">Policy Guard AI v1.0 - AI Powered Privacy Protection</div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [apps, setApps] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [alertApp, setAlertApp] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getInstalledApps) {
          const realApps = await window.electronAPI.getInstalledApps();
          
          // Hydrate the apps with our privacy scoring system
          const formattedApps = realApps.map((app, index) => {
            const assessment = getRiskAssessment(app.packageName, app.appName, app.permissions);
            return {
              id: `${app.packageName}-${index}`,
              ...app,
              name: app.appName,
              risk: getRiskLabel(assessment.score),
              score: assessment.score,
              reasons: assessment.reasons,
            };
          });

          setApps(formattedApps);
        } else {
          setApps([]);
        }
      } catch (err) {
        console.error("Failed to fetch installed apps:", err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Slight delay to keep the splash animation smooth
    setTimeout(fetchApps, 1000);
  }, []);

  const orderedApps = useMemo(() => [...apps].sort((a, b) => b.score - a.score), [apps]);
  const averageRisk = useMemo(() => {
    if (orderedApps.length === 0) return 0;
    return orderedApps.reduce((total, app) => total + app.score, 0) / orderedApps.length;
  }, [orderedApps]);

  const overallSafety = Math.round(100 - averageRisk);
  const safetyStatus = getSafetyStatus(100 - overallSafety);
  const highRiskApps = useMemo(() => orderedApps.filter((app) => app.score >= 70), [orderedApps]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setTimeout(() => {
      setSnackbarVisible(false);
    }, 2400);
  };

  const handleScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setSelectedApp(null);
    setAlertApp(null);

    // Simulate scan
    setTimeout(() => {
      setIsScanning(false);
      showSnackbar('Privacy scan completed');
      window.electronAPI?.startScan?.();
    }, 1600);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardScreen apps={orderedApps} overallSafety={overallSafety} safetyStatus={safetyStatus} isScanning={isScanning} onScan={handleScan} onSelectApp={setSelectedApp} onViewAll={() => setActiveTab('Applications')} />;
      case 'Applications':
        return <ApplicationsScreen apps={orderedApps} onSelectApp={setSelectedApp} />;
      case 'Scan':
        return <LiveScanScreen apps={orderedApps} overallSafety={overallSafety} safetyStatus={safetyStatus} isScanning={isScanning} onScan={handleScan} onSelectApp={setSelectedApp} />;
      case 'Alerts':
        return <AlertsScreen apps={highRiskApps} onScan={handleScan} isScanning={isScanning} onSelectApp={setSelectedApp} />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen apps={orderedApps} overallSafety={overallSafety} safetyStatus={safetyStatus} isScanning={isScanning} onScan={handleScan} onSelectApp={setSelectedApp} onViewAll={() => setActiveTab('Applications')} />;
    }
  };

  return (
    <div className="app-container">
      <WindowControls />
      <div className="app-content">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="main-content">
          {renderScreen()}
        </div>
      </div>

      <AlertSheet visible={!!alertApp} app={alertApp} onClose={() => setAlertApp(null)} onViewDetails={() => { setSelectedApp(alertApp); setAlertApp(null); }} />
      <DetailSheet app={selectedApp} onClose={() => setSelectedApp(null)} />
      <Snackbar message={snackbarMessage} visible={snackbarVisible} />
    </div>
  );
}
