import React, { useEffect, useMemo, useRef, useState } from 'react';

import DocumentPicker from 'react-native-document-picker';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  LayoutAnimation,
  Modal,
  NativeModules,
  NativeEventEmitter,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const { InstalledApps } = NativeModules;
const eventEmitter = new NativeEventEmitter(InstalledApps);
const Tab = createBottomTabNavigator();

const RISK_RULES = [
  { keywords: ['vpn', 'proxy', 'tunnel'], points: 35, reason: 'This app can route your internet traffic through another service.' },
  { keywords: ['cleaner', 'booster', 'optimizer', 'speed'], points: 30, reason: 'This app promises device cleanup, which often needs broad access.' },
  { keywords: ['flashlight', 'torch'], points: 25, reason: 'This app is simple, but it may still request more access than needed.' },
  { keywords: ['scanner', 'qr', 'barcode'], points: 15, reason: 'This app may need camera or file access to scan content.' },
  { keywords: ['wallet', 'pay', 'bank', 'upi'], points: 20, reason: 'This app handles payments, so it may access sensitive account data.' },
  { keywords: ['mod', 'crack', 'hack'], points: 40, reason: 'This app looks unofficial or modified, so its behavior is harder to trust.' },
];

const KNOWN_PRIVACY_URLS = {
  'com.whatsapp': 'https://www.whatsapp.com/legal/privacy-policy',
  'com.instagram.android': 'https://privacycenter.instagram.com/policy',
  'com.facebook.katana': 'https://www.facebook.com/privacy/policy',
  'org.telegram.messenger': 'https://telegram.org/privacy',
  'com.spotify.music': 'https://www.spotify.com/legal/privacy-policy',
  'com.snapchat.android': 'https://values.snap.com/privacy/privacy-policy',
};

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🛡️' },
  { id: 'applications', label: 'Applications', icon: '📱' },
  { id: 'live-scan', label: 'Live Scan', icon: '🔍' },
  { id: 'alerts', label: 'Alerts', icon: '⚠️' },
  { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function safeLines(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
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

function humanReasonFromPermissions(permissions = []) {
  const list = permissions.map((p) => p.toLowerCase());
  const sensitive = [];
  
  const hasCamera = list.some((p) => p.includes('camera'));
  const hasMic = list.some((p) => p.includes('microphone') || p.includes('record_audio'));
  const hasInternet = list.some((p) => p.includes('internet') || p.includes('network'));
  const hasLocation = list.some((p) => p.includes('location'));
  const hasContacts = list.some((p) => p.includes('contacts'));
  const hasStorage = list.some((p) => p.includes('storage') || p.includes('media'));
  const hasSMS = list.some((p) => p.includes('sms'));
  const hasBackground = list.some((p) => p.includes('background'));

  if (hasCamera && hasMic && hasInternet) {
    sensitive.push('This app can capture media and communicate data through network access.');
  } else if (hasCamera && hasMic) {
    sensitive.push('This app can access camera and microphone which may affect personal privacy.');
  } else {
    if (hasCamera) sensitive.push('This app can access the camera to capture images or video.');
    if (hasMic) sensitive.push('This app can access the microphone to record audio.');
  }

  if (hasLocation && hasContacts) {
    sensitive.push('This app can access both location and personal contact information.');
  } else {
    if (hasLocation) sensitive.push('This app tracks device location and may monitor movement activity.');
    if (hasContacts) sensitive.push('This app can access contacts and communication-related information.');
  }

  if (hasStorage) sensitive.push('This app can read and modify stored files on the device.');
  if (hasInternet && !hasCamera) sensitive.push('This app communicates through internet/network connections.');
  if (hasSMS) sensitive.push('This app can access messages and verification-related data.');
  if (hasBackground) sensitive.push('This app may continue running in the background.');

  if (sensitive.length === 0) {
    sensitive.push('This app requires standard permissions with no obvious privacy concerns.');
  }
  
  return sensitive;
}

function getRiskAssessment(packageName, appName, permissions = []) {
  const identity = `${packageName} ${appName}`.toLowerCase();
  const reasons = [];
  let score = 0;

  const list = permissions.map((p) => p.toLowerCase());
  if (list.some((p) => p.includes('camera'))) score += 15;
  if (list.some((p) => p.includes('microphone') || p.includes('record_audio'))) score += 15;
  if (list.some((p) => p.includes('sms'))) score += 20;
  if (list.some((p) => p.includes('contacts'))) score += 15;
  if (list.some((p) => p.includes('location'))) score += 10;
  if (list.some((p) => p.includes('storage') || p.includes('media'))) score += 10;

  RISK_RULES.forEach((rule) => {
    if (rule.keywords.some((keyword) => identity.includes(keyword))) {
      score += rule.points;
      reasons.push(rule.reason);
    }
  });

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
  if (score >= 71) return 'High Risk';
  if (score >= 46) return 'Medium Risk';
  if (score >= 26) return 'Low Risk';
  return 'Safe';
}

function getSafetyStatus(score) {
  if (score >= 71) return 'At Risk';
  if (score >= 46) return 'Moderate';
  return 'Good';
}

function riskColor(score) {
  if (score >= 71) return '#ef4444';
  if (score >= 46) return '#f59e0b';
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

function formatApps(installedApps, scanSeed = 0) {
  return installedApps.map((app, index) => {
    const permissions = app.permissions || [];
    const assessment = getRiskAssessment(app.packageName, app.appName, permissions, scanSeed);

    return {
      id: `${app.packageName}-${index}`,
      name: app.appName,
      packageName: app.packageName,
      icon: app.icon,
      permissions,
      score: assessment.score,
      risk: getRiskLabel(assessment.score),
      reasons: assessment.reasons,
      privacyPolicyUrl: assessment.policyInfo.privacyPolicyUrl,
      privacySearchUrl: assessment.policyInfo.privacySearchUrl,
    };
  });
}

function PremiumSidebar({ navigation, state, apps, isScanning, onScan }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    const currentRoute = state.routes[state.index]?.name;
    setActiveMenu(currentRoute?.toLowerCase() || 'dashboard');
  }, [state]);

  const handleMenuPress = (menuId, screenName) => {
    setActiveMenu(menuId);
    navigation.navigate(screenName);
  };

  const screenMapping = {
    'dashboard': 'Dashboard',
    'applications': 'Applications',
    'live-scan': 'LiveScan',
    'alerts': 'Alerts',
    'ai-analysis': 'AIAnalysis',
    'reports': 'Reports',
    'settings': 'Settings',
  };

  return (
    <DrawerContentScrollView scrollEnabled={true} style={styles.sidebarContainer} contentContainerStyle={styles.sidebarContent}>
      <View style={styles.sidebarHeader}>
        <View style={styles.shieldLogo}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
        <Text style={styles.appNameSidebar}>Policy Guard AI</Text>
        <Text style={styles.appSubSidebar}>Privacy Protection</Text>
      </View>

      <View style={styles.sidebarDivider} />

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeMenu === item.id;

          return (
            <View key={item.id} style={[styles.menuItemWrapper, isActive && styles.menuItemActiveWrapper]}>
              <TouchableOpacity
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleMenuPress(item.id, screenMapping[item.id])}
                activeOpacity={0.8}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>



function ScreenHeader({ title, onScan, isScanning }) {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.screenHeader, { paddingTop: Math.max(10, insets.top + 8) }]}>
      <View style={styles.headerTitleSection}>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.liveIndicatorText}>Live Monitoring Active</Text>
        </View>
      </View>
      <View style={styles.headerTimeSection}>
        <Text style={styles.headerTime}>{timeStr}</Text>
        {title.includes('Scan') ? (
          <TouchableOpacity
            style={[styles.headerScanBtn, isScanning && styles.headerScanBtnActive]}
            onPress={onScan}
            disabled={isScanning}
            activeOpacity={0.85}
          >
            {isScanning ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.headerScanBtnText}>↻</Text>}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function DashboardCard({ icon, label, value, subtitle, color }) {
  return (
    <View style={styles.dashboardCard}>
      <View style={[styles.dashboardCardIcon, { backgroundColor: color }]}>
        <Text style={styles.dashboardCardIconText}>{icon}</Text>
      </View>
      <View style={styles.dashboardCardContent}>
        <Text style={styles.dashboardCardLabel}>{label}</Text>
        <Text style={styles.dashboardCardValue}>{value}</Text>
        {subtitle ? <Text style={styles.dashboardCardSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function OverviewCard({ overallSafety, safetyStatus, totalApps }) {
  return (
    <View style={styles.overallCard}>
      <View style={styles.overallLeft}>
        <View style={styles.circleOuter}>
          <View style={[styles.circleInner, { borderColor: riskColor(100 - overallSafety) }]}>
            <Text style={styles.overallScoreLarge}>{overallSafety}</Text>
            <Text style={styles.overallOutOf}>/100</Text>
          </View>
        </View>
      </View>

      <View style={styles.overallRight}>
        <Text style={styles.overallTitle}>Device Privacy</Text>
        <Text style={styles.overallSubtitle}>{safetyStatus}</Text>
        <Text style={styles.overallHint}>Based on permissions and policy signals</Text>
        <Text style={styles.overallCount}>{totalApps} installed apps analysed</Text>
      </View>
    </View>
  );
}

function AppCard({ app, onPressDetails, onAlertPress }) {
  const reason = safeLines(app.reasons?.[0] || 'No obvious privacy concerns were detected.');

  return (
    <View style={styles.appCard}>
      <View style={styles.appRow}>
        <View style={styles.iconWrap}>
          {app.icon ? (
            <Image source={{ uri: app.icon }} style={styles.appIcon} />
          ) : (
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconInitials}>{(app.name || 'A').slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
          <Text style={styles.packageName} numberOfLines={1}>{app.packageName}</Text>
          <View style={styles.appMetaRow}>
            <View style={[styles.scoreBadge, { backgroundColor: riskColor(app.score) }]}>
              <Text style={styles.scoreBadgeText}>{app.score}</Text>
            </View>
            <Text style={styles.riskLevel}>{app.risk}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={onPressDetails} activeOpacity={0.8}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reasonBlock}>
        <Text style={styles.sectionLabel}>Why it was flagged</Text>
        <Text style={styles.whyUnsafeText} numberOfLines={2}>{reason}</Text>
      </View>

      <View style={styles.permissionHeaderRow}>
        <Text style={styles.sectionLabel}>Permissions</Text>
        {app.score >= 71 ? (
          <TouchableOpacity onPress={onAlertPress} activeOpacity={0.8}>
            <Text style={styles.alertLink}>View alert</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.permissionsRow}>
        {app.permissions && app.permissions.length > 0 ? (
          app.permissions.slice(0, 4).map((perm, idx) => (
            <View key={`${app.id}-perm-${idx}`} style={styles.permissionChip}>
              <Text style={styles.permissionChipText}>{permissionLabel(perm)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noPermsText}>No permissions detected</Text>
        )}
      </View>
    </View>
  );
}

function ScreenWrapper({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={[styles.screen, { paddingBottom: insets.bottom + 12 }]}>{children}</View>
    </SafeAreaView>
  );
}

function DashboardScreen({ apps, overallSafety, safetyStatus, isScanning, onScan, onOpenDetails, onOpenAlert, navigation }) {
  const highRiskCount = apps.filter((a) => a.score >= 71).length;
  const safeCount = apps.filter((a) => a.score < 26).length;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Dashboard" onScan={onScan} isScanning={isScanning} />

        <View style={styles.dashboardGridSection}>
          <DashboardCard icon="⚠️" label="High Risk Apps" value={highRiskCount} color="#ef4444" />
          <DashboardCard icon="✅" label="Safe Applications" value={safeCount} color="#10b981" />
          <DashboardCard icon="📊" label="Total Applications" value={apps.length} color="#3b82f6" />
          <DashboardCard icon="📱" label="Active Alerts" value={highRiskCount} color="#FF6B1A" />
        </View>

        <OverviewCard overallSafety={overallSafety} safetyStatus={safetyStatus} totalApps={apps.length} highRiskCount={highRiskCount} safeCount={safeCount} />

        <Text style={styles.sectionHeading}>Installed apps</Text>
        {apps.slice(0, 5).map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onOpenDetails(app)} onAlertPress={() => onOpenAlert(app)} />
        ))}
        {apps.length > 5 ? (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Applications')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewAllButtonText}>View All {apps.length} Apps →</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
}

function ApplicationsScreen({ apps, onOpenDetails, onOpenAlert, isScanning, onScan }) {
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Applications" onScan={onScan} isScanning={isScanning} />
        <Text style={styles.sectionHeading}>All installed apps</Text>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onOpenDetails(app)} onAlertPress={() => onOpenAlert(app)} />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

function LiveScanScreen({ apps, overallSafety, safetyStatus, isScanning, onScan, onOpenDetails, onOpenAlert }) {
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Live Scan" onScan={onScan} isScanning={isScanning} />

        <View style={styles.scanHeroCard}>
          <Text style={styles.scanHeroScore}>{overallSafety}/100 · {safetyStatus}</Text>
          <Text style={styles.scanHeroText}>Tap the refresh button to update privacy scores and permissions.</Text>
          <TouchableOpacity
            style={[styles.heroScanButton, isScanning && styles.heroScanButtonScanning]}
            onPress={onScan}
            disabled={isScanning}
            activeOpacity={0.85}
          >
            {isScanning ? <ActivityIndicator size="small" color="#fff" /> : null}
            <Text style={styles.heroScanButtonText}>{isScanning ? 'Scanning...' : 'Scan Now'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>Results</Text>
        {apps.map((app) => (
          <AppCard key={app.id} app={app} onPressDetails={() => onOpenDetails(app)} onAlertPress={() => onOpenAlert(app)} />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

function AlertsScreen({ apps, onScan, onOpenDetails, onOpenAlert, isScanning }) {
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Alerts" onScan={onScan} isScanning={isScanning} />
        <Text style={styles.sectionHeading}>Privacy alerts</Text>
        {apps.length > 0 ? (
          apps.map((app) => (
            <AppCard key={app.id} app={app} onPressDetails={() => onOpenDetails(app)} onAlertPress={() => onOpenAlert(app)} />
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No high-risk apps right now</Text>
            <Text style={styles.emptyStateText}>Run a privacy scan to refresh the latest signals.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function AIAnalysisScreen({ onScan, isScanning }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      setFile(res[0]);
      setAnalyzing(true);
      setTimeout(() => setAnalyzing(false), 3000);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.log(err);
      }
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="AI Analysis" onScan={onScan} isScanning={isScanning} />
        
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>📄 AI Document Text Extractor</Text>
          <Text style={styles.comingSoonText}>
            Upload a Privacy Policy or Terms of Service document (PDF/DOCX). Our AI engine will extract the text, identify risky keywords, and generate a privacy score.
          </Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument} activeOpacity={0.8}>
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>

          {file && (
            <View style={styles.fileCard}>
              <Text style={styles.fileName}>Selected: {file.name}</Text>
              {analyzing ? (
                <View style={styles.analyzingRow}>
                  <ActivityIndicator size="small" color="#FF6B1A" />
                  <Text style={styles.analyzingText}>Extracting and analyzing...</Text>
                </View>
              ) : (
                <View style={styles.analysisResult}>
                  <Text style={styles.resultTitle}>Ready for Backend Analysis</Text>
                  <Text style={styles.resultText}>Connect this feature to your Node.js backend to get the final Risk Score and Summary!</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function ReportsScreen({ apps, onScan, isScanning }) {
  const highRiskCount = apps.filter((a) => a.score >= 71).length;
  const mediumRiskCount = apps.filter((a) => a.score >= 46 && a.score < 71).length;
  const lowRiskCount = apps.filter((a) => a.score < 46).length;
  const avgRisk = apps.length > 0 ? Number((apps.reduce((sum, a) => sum + a.score, 0) / apps.length).toFixed(0)) : 0;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Reports" onScan={onScan} isScanning={isScanning} />

        <View style={styles.reportsGrid}>
          <DashboardCard icon="🔴" label="High Risk" value={highRiskCount} subtitle="Requires attention" color="#ef4444" />
          <DashboardCard icon="🟡" label="Medium Risk" value={mediumRiskCount} subtitle="Monitor closely" color="#f59e0b" />
          <DashboardCard icon="🟢" label="Low Risk" value={lowRiskCount} subtitle="Generally safe" color="#10b981" />
          <DashboardCard icon="📈" label="Average Score" value={avgRisk} subtitle="Device privacy" color="#3b82f6" />
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Privacy Summary</Text>
          <Text style={styles.reportText}>
            Your device contains {highRiskCount} high-risk app{highRiskCount !== 1 ? 's' : ''} that require attention. Review each app's permissions and consider adjusting access settings.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function SettingsScreen({ onScan, isScanning }) {
  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Settings" onScan={onScan} isScanning={isScanning} />
        <Text style={styles.sectionHeading}>App Settings</Text>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Scan behavior</Text>
          <Text style={styles.settingsText}>Manual scan refresh is enabled. Open any screen to run a new privacy scan.</Text>
        </View>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Privacy note</Text>
          <Text style={styles.settingsText}>
            Policy Guard AI uses installed app metadata and permission signals to highlight privacy concerns. Your data stays on your device.
          </Text>
        </View>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>About</Text>
          <Text style={styles.settingsText}>Policy Guard AI v1.0 - AI Powered Privacy Protection</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function AlertSheet({ visible, app, onClose, onViewDetails }) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnim, visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [180, 0],
  });

  if (!visible || !app) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <Animated.View style={[styles.sheetCard, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.alertTitle}>Privacy alert</Text>
          <Text style={styles.alertApp}>{app.name}</Text>
          <Text style={styles.alertScore}>{app.score}/100 · {app.risk}</Text>

          <Text style={styles.sectionLabel}>Why it matters</Text>
          {app.reasons.slice(0, 3).map((reason) => (
            <Text key={reason} style={styles.alertReason}>• {reason}</Text>
          ))}

          <View style={styles.sheetButtonRow}>
            <TouchableOpacity style={styles.sheetPrimaryButton} onPress={onViewDetails} activeOpacity={0.85}>
              <Text style={styles.sheetPrimaryButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetSecondaryButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.sheetSecondaryButtonText}>Ignore</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DetailSheet({ app, onClose }) {
  if (!app) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={[styles.sheetCard, styles.detailSheetCard]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.detailTitle}>{app.name}</Text>
          <Text style={styles.detailScore}>{app.score}/100 · {app.risk}</Text>

          <Text style={styles.sectionLabel}>AI privacy summary</Text>
          <Text style={styles.detailSummary}>{safeLines(app.reasons.join(' '))}</Text>

          <Text style={styles.sectionLabel}>Safety recommendations</Text>
          {recommendationsFromReasons(app.reasons).map((item) => (
            <Text key={item} style={styles.detailBullet}>• {item}</Text>
          ))}

          <View style={styles.sheetFooterRow}>
            <TouchableOpacity style={styles.sheetSecondaryButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.sheetSecondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Snackbar({ message, visible }) {
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: visible ? 1 : 0,
      duration: 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateAnim, visible]);

  const translateY = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  if (!message) return null;

  return (
    <Animated.View style={[styles.snackbar, { opacity: translateAnim, transform: [{ translateY }] }]}>
      <Text style={styles.snackbarText}>{message}</Text>
    </Animated.View>
  );
}

export default function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSeed, setScanSeed] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
  const [alertApp, setAlertApp] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const snackbarTimer = useRef(null);
  const scanTimer = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  async function refreshApps() {
    try {
      const installedApps = InstalledApps?.getInstalledApps ? await InstalledApps.getInstalledApps() : [];
      setApps(installedApps.map(app => ({
        id: `${app.packageName}-${Math.random()}`,
        name: app.appName,
        packageName: app.packageName,
        icon: app.icon,
        permissions: app.permissions || [],
        ...getRiskAssessment(app.packageName, app.appName, app.permissions || [])
      })));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    refreshApps().finally(() => setLoading(false));

    const installListener = eventEmitter.addListener('onAppInstalled', async (packageName) => {
      showSnackbar(`Analyzing newly installed app: ${packageName}`);
      await refreshApps();
      const installedApps = InstalledApps?.getInstalledApps ? await InstalledApps.getInstalledApps() : [];
      const newlyInstalled = installedApps.find(a => a.packageName === packageName);
      if (newlyInstalled) {
        const assessment = getRiskAssessment(newlyInstalled.packageName, newlyInstalled.appName, newlyInstalled.permissions || []);
        if (assessment.score >= 46) {
          setAlertApp({
            ...newlyInstalled,
            ...assessment
          });
        }
      }
    });

    return () => {
      installListener.remove();
      if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, []);

  const orderedApps = useMemo(() => [...apps].sort((a, b) => b.score - a.score), [apps]);
  const averageRisk = useMemo(() => {
    if (orderedApps.length === 0) return 0;
    return orderedApps.reduce((total, app) => total + app.score, 0) / orderedApps.length;
  }, [orderedApps]);

  const overallSafety = Math.round(100 - averageRisk);
  const safetyStatus = getSafetyStatus(100 - overallSafety); // The risk is inverted for safety status
  const highRiskApps = useMemo(() => orderedApps.filter((app) => app.score >= 70), [orderedApps]);

  function showSnackbar(message) {
    setSnackbarMessage(message);
    setSnackbarVisible(true);

    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }

    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    snackbarTimer.current = setTimeout(() => {
      setSnackbarVisible(false);
      snackbarTimer.current = setTimeout(() => setSnackbarMessage(''), 180);
    }, 2400);
  }



  async function handleScan() {
    if (isScanning) return;

    setIsScanning(true);
    setSelectedApp(null);
    setAlertApp(null);

    if (scanTimer.current) clearTimeout(scanTimer.current);

    scanTimer.current = setTimeout(async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await refreshApps();
      setIsScanning(false);
      showSnackbar('Privacy scan completed');
    }, 1600);
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#07122A" />
      {loading ? (
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#FF6B1A" />
          <Text style={styles.loadingText}>Loading privacy scan...</Text>
        </View>
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#071029',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.05)',
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#FF6B1A',
            tabBarInactiveTintColor: '#94a3b8',
            sceneStyle: { backgroundColor: '#07122A' },
          }}
        >
          <Tab.Screen 
            name="Home" 
            options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛡️</Text> }}
          >
            {({ navigation }) => (
              <DashboardScreen
                apps={orderedApps}
                overallSafety={overallSafety}
                safetyStatus={safetyStatus}
                isScanning={isScanning}
                onScan={handleScan}
                onOpenDetails={setSelectedApp}
                onOpenAlert={setAlertApp}
                navigation={navigation}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Scan" 
            options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔍</Text> }}
          >
            {() => (
              <LiveScanScreen
                apps={orderedApps}
                overallSafety={overallSafety}
                safetyStatus={safetyStatus}
                isScanning={isScanning}
                onScan={handleScan}
                onOpenDetails={setSelectedApp}
                onOpenAlert={setAlertApp}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Alerts" 
            options={{
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚠️</Text>,
              tabBarBadge: highRiskApps.length > 0 ? highRiskApps.length : undefined,
              tabBarBadgeStyle: { backgroundColor: '#ef4444' }
            }}
          >
            {() => (
              <AlertsScreen
                apps={highRiskApps}
                onScan={handleScan}
                onOpenDetails={setSelectedApp}
                onOpenAlert={(app) => setAlertApp(app || highRiskApps[0] || null)}
                isScanning={isScanning}
              />
            )}
          </Tab.Screen>

          <Tab.Screen 
            name="Settings" 
            options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text> }}
          >
            {() => <SettingsScreen onScan={handleScan} isScanning={isScanning} />}
          </Tab.Screen>

        </Tab.Navigator>
      )}

      <AlertSheet
        visible={!!alertApp}
        app={alertApp}
        onClose={() => setAlertApp(null)}
        onViewDetails={() => {
          setSelectedApp(alertApp);
          setAlertApp(null);
        }}
      />

      <DetailSheet app={selectedApp} onClose={() => setSelectedApp(null)} />
      <Snackbar message={snackbarMessage} visible={snackbarVisible} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: { flex: 1, backgroundColor: '#07122A' },
  sidebarContent: { paddingVertical: 20, paddingHorizontal: 16 },
  sidebarHeader: { alignItems: 'center', marginBottom: 20 },
  shieldLogo: { width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(255, 107, 26, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 107, 26, 0.2)' },
  shieldIcon: { fontSize: 32 },
  appNameSidebar: { color: '#FF6B1A', fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  appSubSidebar: { color: '#94a3b8', fontSize: 11, fontWeight: '600', marginTop: 4 },
  sidebarDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 20 },
  menuList: { marginBottom: 40 },
  menuItemWrapper: { marginBottom: 8, borderRadius: 12 },
  menuItemActiveWrapper: { backgroundColor: 'rgba(255, 107, 26, 0.08)', paddingHorizontal: 8, marginHorizontal: -8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  menuItemActive: { backgroundColor: 'rgba(255, 107, 26, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 107, 26, 0.3)' },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
  menuLabelActive: { color: '#FF6B1A', fontWeight: '800' },
  sidebarFooter: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  footerCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  footerLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '600' },
  footerValue: { color: '#FF6B1A', fontSize: 14, fontWeight: '900', marginTop: 4 },
  sidebarMonitoring: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  monitoringDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D084', marginRight: 8, shadowColor: '#00D084', shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
  monitoringText: { color: '#00D084', fontSize: 11, fontWeight: '700' },

  screenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  headerTitleSection: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  liveIndicatorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D084', marginRight: 6, shadowColor: '#00D084', shadowOpacity: 0.6, shadowRadius: 3, shadowOffset: { width: 0, height: 0 }, elevation: 2 },
  liveIndicatorText: { color: '#00D084', fontSize: 11, fontWeight: '700' },
  headerTimeSection: { alignItems: 'flex-end', gap: 8 },
  headerTime: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  headerScanBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF6B1A', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF6B1A', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  headerScanBtnActive: { opacity: 0.8 },
  headerScanBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  dashboardGridSection: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  dashboardCard: { width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dashboardCardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dashboardCardIconText: { fontSize: 20 },
  dashboardCardContent: { flex: 1 },
  dashboardCardLabel: { color: '#cbd5e1', fontSize: 11, fontWeight: '600' },
  dashboardCardValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  dashboardCardSubtitle: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  reportsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 16, marginBottom: 16 },

  appShell: { flex: 1, backgroundColor: '#07122A' },
  safeArea: { flex: 1, backgroundColor: '#07122A' },
  screen: { flex: 1, backgroundColor: '#07122A' },
  scrollContent: { paddingHorizontal: 0, paddingBottom: 20 },
  loadingScreen: { flex: 1, backgroundColor: '#07122A', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  overallCard: { backgroundColor: 'rgba(29, 78, 216, 0.08)', borderRadius: 20, padding: 18, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(29, 78, 216, 0.15)', flexDirection: 'row', alignItems: 'center' },
  overallLeft: { width: 102, alignItems: 'center', justifyContent: 'center' },
  overallRight: { flex: 1, paddingLeft: 14, justifyContent: 'center' },
  circleOuter: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  circleInner: { width: 78, height: 78, borderRadius: 39, borderWidth: 6, alignItems: 'center', justifyContent: 'center', borderColor: '#10b981' },
  overallScoreLarge: { color: '#fff', fontSize: 22, fontWeight: '900' },
  overallOutOf: { color: '#94a3b8', fontSize: 12, marginTop: -2 },
  overallTitle: { color: '#e0e7ff', fontSize: 14, fontWeight: '800' },
  overallSubtitle: { color: '#10b981', fontWeight: '700', marginTop: 4, fontSize: 12 },
  overallHint: { color: '#94a3b8', marginTop: 6, fontSize: 11 },
  overallCount: { marginTop: 4, color: '#7dd3fc', fontSize: 11, fontWeight: '600' },
  sectionHeading: { color: '#e2e8f0', fontSize: 16, fontWeight: '800', marginBottom: 10, marginHorizontal: 16 },
  appCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 18, padding: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  appRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 58, height: 58, marginRight: 12 },
  appIcon: { width: 58, height: 58, borderRadius: 16 },
  iconPlaceholder: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center' },
  iconInitials: { color: '#fff', fontWeight: '900', fontSize: 18 },
  appInfo: { flex: 1, minWidth: 0 },
  appName: { color: 'white', fontSize: 14, fontWeight: '800' },
  packageName: { color: '#94a3b8', marginTop: 2, fontSize: 11 },
  appMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  scoreBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginRight: 8 },
  scoreBadgeText: { color: 'white', fontWeight: '900', fontSize: 11 },
  riskLevel: { color: '#94a3b8', fontWeight: '700', fontSize: 11 },
  viewButton: { paddingVertical: 7, paddingHorizontal: 12, backgroundColor: 'rgba(96, 165, 250, 0.1)', borderRadius: 10, marginLeft: 10 },
  viewButtonText: { color: '#60a5fa', fontWeight: '800', fontSize: 11 },
  reasonBlock: { marginTop: 10 },
  sectionLabel: { color: '#cbd5e1', fontWeight: '800', fontSize: 12, marginBottom: 6 },
  whyUnsafeText: { color: '#d1d5db', fontSize: 12, lineHeight: 16 },
  permissionHeaderRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertLink: { color: '#FF6B1A', fontSize: 11, fontWeight: '800' },
  permissionsRow: { flexDirection: 'row', marginTop: 2, flexWrap: 'wrap' },
  permissionChip: { backgroundColor: 'rgba(255, 107, 26, 0.1)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, marginRight: 6, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255, 107, 26, 0.18)' },
  permissionChipText: { color: '#FF6B1A', fontWeight: '700', fontSize: 10 },
  noPermsText: { color: '#94a3b8', fontSize: 11 },
  scanHeroCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 18, padding: 16, marginHorizontal: 16, marginBottom: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  scanHeroScore: { color: '#FF6B1A', fontWeight: '800', marginBottom: 8 },
  scanHeroText: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  heroScanButton: { marginTop: 14, backgroundColor: '#FF6B1A', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center' },
  heroScanButtonScanning: { opacity: 0.8 },
  heroScanButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  viewAllButton: { marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255, 107, 26, 0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 107, 26, 0.2)', alignItems: 'center', marginBottom: 12 },
  viewAllButtonText: { color: '#FF6B1A', fontWeight: '800', fontSize: 12 },
  emptyStateCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 18, padding: 16, marginHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  emptyStateTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  emptyStateText: { color: '#cbd5e1', fontSize: 12, marginTop: 6 },
  comingSoonCard: { backgroundColor: 'rgba(255, 107, 26, 0.1)', borderRadius: 18, padding: 20, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255, 107, 26, 0.2)' },
  comingSoonTitle: { color: '#FF6B1A', fontWeight: '900', fontSize: 16, marginBottom: 8 },
  comingSoonText: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  reportCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 18, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  reportTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 8 },
  reportText: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  settingsCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 18, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingsTitle: { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 6 },
  settingsText: { color: '#cbd5e1', fontSize: 12, lineHeight: 18 },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4, 6, 23, 0.45)' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  sheetCard: { backgroundColor: '#071029', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  detailSheetCard: { paddingBottom: 24 },
  sheetHandle: { alignSelf: 'center', width: 52, height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14 },
  alertTitle: { color: '#FF6B1A', fontWeight: '900', fontSize: 18 },
  alertApp: { color: 'white', fontWeight: '800', fontSize: 16, marginTop: 6 },
  alertScore: { color: '#ef4444', marginTop: 6, fontWeight: '700', marginBottom: 12 },
  alertReason: { color: '#d1d5db', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  sheetButtonRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sheetPrimaryButton: { flex: 1, backgroundColor: '#FF6B1A', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  sheetPrimaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  sheetSecondaryButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sheetSecondaryButtonText: { color: '#cbd5e1', fontWeight: '800', fontSize: 12 },
  detailTitle: { color: 'white', fontWeight: '900', fontSize: 18 },
  detailScore: { color: '#FF6B1A', marginTop: 6, fontWeight: '700', marginBottom: 12 },
  detailSummary: { color: '#d1d5db', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  detailBullet: { color: '#cbd5e1', fontSize: 12, lineHeight: 18, marginBottom: 5 },
  sheetFooterRow: { marginTop: 16, alignItems: 'flex-end' },
  snackbar: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: 'rgba(7, 16, 41, 0.96)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  snackbarText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 13 },
  uploadButton: { marginTop: 16, backgroundColor: '#FF6B1A', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  uploadButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  fileCard: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  fileName: { color: '#e2e8f0', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyzingText: { color: '#cbd5e1', fontSize: 12 },
  analysisResult: { marginTop: 8, padding: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  resultTitle: { color: '#10b981', fontWeight: '800', fontSize: 12, marginBottom: 4 },
  resultText: { color: '#cbd5e1', fontSize: 11, lineHeight: 16 },
});
