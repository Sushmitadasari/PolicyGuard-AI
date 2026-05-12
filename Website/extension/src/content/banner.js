export const showWarningBanner = () => {
  const existing = document.getElementById(
    "policyguard-banner"
  );

  if (existing) return;

  const banner = document.createElement("div");

  banner.id = "policyguard-banner";

  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: #ef4444;
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      font-family: sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      width: 300px;
    ">
      <h2 style="
        margin: 0;
        font-size: 18px;
        font-weight: bold;
      ">
        ⚠ Privacy Policy Detected
      </h2>

      <p style="
        margin-top: 8px;
        font-size: 14px;
      ">
        POLICYGUARD AI found privacy/legal pages on this website.
      </p>
    </div>
  `;

  document.body.appendChild(banner);
};