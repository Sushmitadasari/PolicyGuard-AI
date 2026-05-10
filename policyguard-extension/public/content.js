const keywords = [
  "privacy",
  "terms",
  "policy",
  "cookies",
  "legal",
];

const links = [...document.querySelectorAll("a")];

const matchedLinks = links.filter((link) => {
  const text = (link.innerText || "").toLowerCase();
  const href = (link.href || "").toLowerCase();

  return keywords.some(
    (keyword) =>
      text.includes(keyword) ||
      href.includes(keyword)
  );
});

console.log(
  "POLICYGUARD AI Detected Links:",
  matchedLinks
);

if (matchedLinks.length > 0) {
  const existingBanner = document.getElementById(
    "policyguard-banner"
  );

  if (!existingBanner) {

    // CREATE MAIN BANNER
    const banner = document.createElement("div");

    banner.id = "policyguard-banner";

    banner.innerHTML = `
      <div id="policyguard-main-banner">

        <div id="policyguard-left">

          <div id="policyguard-icon">
            ⚠
          </div>

          <div>

            <h2 id="policyguard-title">
              POLICYGUARD AI — HIGH PRIVACY RISK DETECTED
            </h2>

            <p id="policyguard-text">
              This website contains privacy/legal policies
              that may collect behavioral and tracking data.
            </p>

          </div>

        </div>

        <button id="policyguard-button">
          Open Dashboard
        </button>

      </div>
    `;

    // CREATE STYLES
    const style = document.createElement("style");

    style.innerHTML = `
      #policyguard-main-banner {

        position: fixed;
        top: 0;
        left: 0;

        width: 100%;

        background: linear-gradient(
          90deg,
          #7f1d1d,
          #991b1b,
          #dc2626
        );

        color: white;

        z-index: 999999999;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 16px 30px;

        font-family: Inter, sans-serif;

        box-shadow: 0 4px 20px rgba(0,0,0,0.35);

        animation: policyguardSlideDown 0.4s ease;
      }

      #policyguard-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      #policyguard-icon {
        font-size: 30px;
      }

      #policyguard-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      #policyguard-text {
        margin: 5px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      #policyguard-button {

        background: white;

        color: #dc2626;

        border: none;

        padding: 12px 22px;

        border-radius: 12px;

        font-weight: 700;

        cursor: pointer;

        transition: 0.3s ease;
      }

      #policyguard-button:hover {
        transform: scale(1.05);
      }

      @keyframes policyguardSlideDown {

        from {
          transform: translateY(-100%);
        }

        to {
          transform: translateY(0);
        }
      }
    `;

    // ADD STYLE
    document.head.appendChild(style);

    // ADD BANNER
    document.body.appendChild(banner);

    // BUTTON CLICK
    const button = document.getElementById(
      "policyguard-button"
    );

    if (button) {

      button.addEventListener("click", () => {

        // OPEN YOUR DASHBOARD
        window.open(
          "http://localhost:5173",
          "_blank"
        );

      });

    }

  }
}