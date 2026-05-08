// Mock data for applications
const mockApps = [
  {
    name: "Google Chrome",
    icon: "🌐",
    riskScore: 82,
    riskLevel: "high",
    permissions: ["Camera", "Microphone", "Location", "Storage"],
    whyUnsafe: "This application frequently accesses location and storage permissions which may affect user privacy.",
    recommendation: "Limit unnecessary permissions.",
    backgroundActivity: "Active"
  },
  {
    name: "WhatsApp",
    icon: "💬",
    riskScore: 75,
    riskLevel: "high",
    permissions: ["Contacts", "Storage", "Location", "Camera"],
    whyUnsafe: "Accesses contacts and location data continuously.",
    recommendation: "Review privacy settings regularly.",
    backgroundActivity: "Active"
  },
  {
    name: "Zoom",
    icon: "📹",
    riskScore: 68,
    riskLevel: "medium",
    permissions: ["Camera", "Microphone", "Storage"],
    whyUnsafe: "Requires camera and microphone access for calls.",
    recommendation: "Grant permissions only during meetings.",
    backgroundActivity: "Inactive"
  },
  {
    name: "Spotify",
    icon: "🎵",
    riskScore: 45,
    riskLevel: "low",
    permissions: ["Storage", "Location"],
    whyUnsafe: "Minimal privacy concerns with music streaming.",
    recommendation: "Safe to use with default permissions.",
    backgroundActivity: "Inactive"
  },
  {
    name: "Microsoft Word",
    icon: "📄",
    riskScore: 35,
    riskLevel: "low",
    permissions: ["Storage"],
    whyUnsafe: "Only accesses local files for document editing.",
    recommendation: "No action required.",
    backgroundActivity: "Inactive"
  },
  {
    name: "PhonePe",
    icon: "💰",
    riskScore: 71,
    riskLevel: "medium",
    permissions: ["SMS", "Contacts", "Storage", "Location"],
    whyUnsafe: "Financial app with access to sensitive data.",
    recommendation: "Monitor transaction permissions.",
    backgroundActivity: "Active"
  }
];

// DOM elements
const appsContainer = document.getElementById("apps-container");
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");
const alertPopup = document.getElementById("alert-popup");
const currentTimeElement = document.getElementById("current-time");

// Track displayed apps
let displayedApps = new Set();

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});

// Initialize app
function initializeApp() {
  populateApps();
  setupNavigation();
  setupAlertDemo();
  setupIPCListeners();
}

// Populate applications
function populateApps() {
  mockApps.forEach(app => {
    const appCard = createAppCard(app);
    appsContainer.appendChild(appCard);
    displayedApps.add(app.name.toLowerCase());
  });
}

// Create app card
function createAppCard(app) {
  const card = document.createElement("div");
  card.className = "app-card";

  card.innerHTML = `
    <div class="app-header">
      <div class="app-icon">${app.icon}</div>
      <div class="app-info">
        <h3>${app.name}</h3>
      </div>
    </div>
    <div class="risk-score">
      <span class="score">${app.riskScore}/100</span>
      <span class="risk-level ${app.riskLevel}">${app.riskLevel} Risk</span>
    </div>
    <div class="permissions">
      <h4>Permissions Used:</h4>
      <div class="permission-tags">
        ${app.permissions.map(perm => `<span class="permission-tag">${perm}</span>`).join("")}
      </div>
    </div>
    <div class="why-unsafe">
      <h4>Why Unsafe:</h4>
      <p>${app.whyUnsafe}</p>
    </div>
    <div class="recommendation">
      <h4>Recommendation:</h4>
      <p>${app.recommendation}</p>
    </div>
    <div class="quick-actions">
      <button class="btn btn-primary">View Details</button>
      <button class="btn btn-secondary">Scan Again</button>
      <button class="btn btn-warning">Restrict Permissions</button>
    </div>
  `;

  return card;
}

// Setup navigation
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = item.getAttribute("data-section");

      // Update active nav item
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      // Show corresponding section
      sections.forEach(section => section.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");
    });
  });
}

// Update current time
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  currentTimeElement.textContent = timeString;
}

// Setup alert demo
function setupAlertDemo() {
  // Show alert after 10 seconds for demo
  setTimeout(() => {
    const demoApp = {
      name: "PhonePe Desktop",
      riskScore: 71
    };
    showAlertForApp(demoApp);
  }, 10000);
}

// Setup IPC listeners for real-time app detection
function setupIPCListeners() {
  if (window.electronAPI && window.electronAPI.onNewApp) {
    window.electronAPI.onNewApp((appData) => {
      handleNewApp(appData);
    });
  }
}

// Handle new app detected
function handleNewApp(appData) {
  const appName = appData.name.toLowerCase();

  // Skip if already displayed (check displayedApps set)
  if (displayedApps.has(appName)) {
    return;
  }

  displayedApps.add(appName);

  // Convert backend data to UI format
  const app = {
    name: appData.name,
    icon: getAppIcon(appData.name),
    riskScore: Math.min(appData.score * 10, 100), // Convert to 0-100 scale
    riskLevel: appData.risk.toLowerCase(),
    permissions: appData.permissions.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    whyUnsafe: generateWhyUnsafe(appData.risk, appData.permissions),
    recommendation: appData.recommendation,
    backgroundActivity: Math.random() > 0.5 ? "Active" : "Inactive"
  };

  // Add to applications section
  const appCard = createAppCard(app);
  appsContainer.appendChild(appCard);

  // Show alert for high-risk apps
  if (app.riskLevel === "high") {
    showAlertForApp(app);
  }

  // Update dashboard stats
  updateDashboardStats();
}

// Get appropriate icon for app
function getAppIcon(appName) {
  const iconMap = {
    "google chrome": "🌐",
    "chrome": "🌐",
    "whatsapp": "💬",
    "zoom": "📹",
    "spotify": "🎵",
    "microsoft word": "📄",
    "word": "📄",
    "phonepe": "💰",
    "discord": "🎮",
    "firefox": "🦊",
    "edge": "🌊",
    "vscode": "💻",
    "code": "💻"
  };

  const key = appName.toLowerCase();
  return iconMap[key] || "📱";
}

// Generate why unsafe text
function generateWhyUnsafe(risk, permissions) {
  if (risk === "High") {
    return `This application has ${permissions.length} permission(s) that may compromise privacy, including sensitive access to ${permissions.slice(0, 2).join(" and ")}.`;
  } else if (risk === "Medium") {
    return "This application requests several permissions that should be monitored for privacy concerns.";
  } else {
    return "This application has minimal privacy impact with limited permissions.";
  }
}

// Show alert popup
function showAlert() {
  alertPopup.style.display = "flex";

  // Auto hide after 10 seconds
  setTimeout(() => {
    hideAlert();
  }, 10000);
}

// Hide alert popup
function hideAlert() {
  alertPopup.style.display = "none";
}

// Show alert for specific app
function showAlertForApp(app) {
  const alertAppElement = alertPopup.querySelector(".alert-app");
  const alertRiskElement = alertPopup.querySelector(".alert-risk");

  if (alertAppElement) {
    alertAppElement.innerHTML = `<strong>Application:</strong> ${app.name}`;
  }
  if (alertRiskElement) {
    alertRiskElement.innerHTML = `<strong>Risk Score:</strong> ${app.riskScore}/100`;
  }

  alertPopup.style.display = "flex";

  // Auto hide after 15 seconds
  setTimeout(() => {
    hideAlert();
  }, 15000);
}

// Update dashboard stats
function updateDashboardStats() {
  // Update total apps count
  const totalAppsElement = document.querySelector(".widget-card h3");
  if (totalAppsElement && totalAppsElement.textContent === "Total Applications") {
    const valueElement = totalAppsElement.nextElementSibling;
    if (valueElement) {
      const currentCount = parseInt(valueElement.textContent) || 24;
      valueElement.textContent = currentCount + 1;
    }
  }
}

// Add event listeners for alert buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-secondary") && e.target.textContent === "Ignore") {
    hideAlert();
  }
  if (e.target.classList.contains("btn-warning") && e.target.textContent === "Restrict Access") {
    hideAlert();
    // In a real app, this would restrict permissions
    alert("Permissions restricted for PhonePe Desktop");
  }
});

// Simulate real-time updates (for demo)
setInterval(() => {
  // Randomly update activity status
  const activityItems = document.querySelectorAll(".activity-status");
  activityItems.forEach(item => {
    if (Math.random() > 0.8) {
      item.classList.toggle("active");
      item.textContent = item.classList.contains("active") ? "Active" : "Inactive";
    }
  });
}, 30000);

// Handle window resize for responsive design
window.addEventListener("resize", () => {
  // Add any responsive adjustments here if needed
});