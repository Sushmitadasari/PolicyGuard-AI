console.log(
  "POLICYGUARD AI CONTENT SCRIPT ACTIVE"
);

const keywords = [
  "privacy",
  "privacy-policy",
  "privacy policy",
  "terms",
  "terms-of-service",
  "terms-and-conditions",
  "cookies",
  "cookie-policy",
  "legal",
  "gdpr",
  "security",
  "data-policy",
];

const detectPrivacyPage = () => {

  const currentUrl =
    window.location.href.toLowerCase();

  // DETECT CURRENT PAGE URL
  const urlMatched =
    keywords.some((keyword) =>
      currentUrl.includes(keyword)
    );

  // DETECT PAGE TITLE
  const titleMatched =
    keywords.some((keyword) =>
      document.title
        .toLowerCase()
        .includes(keyword)
    );

  // DETECT ALL LINKS
  const links = [
    ...document.querySelectorAll("a"),
  ];

  const matchedLinks =
    links.filter((link) => {

      const text =
        (link.innerText || "")
          .toLowerCase();

      const href =
        (link.href || "")
          .toLowerCase();

      return keywords.some(
        (keyword) =>
          text.includes(keyword) ||
          href.includes(keyword)
      );

    });

  console.log(
    "POLICYGUARD DETECTED LINKS:",
    matchedLinks
  );

  return (
    urlMatched ||
    titleMatched ||
    matchedLinks.length > 0
  );
};

// EXTRACT WEBSITE TEXT
const pageText =
  document.body.innerText;

// MAIN DETECTION
if (detectPrivacyPage()) {

  const existingBanner =
    document.getElementById(
      "policyguard-banner"
    );

  if (!existingBanner) {

    // CREATE BANNER
    const banner =
      document.createElement("div");

    banner.id =
      "policyguard-banner";

    banner.innerHTML = `
      <div id="policyguard-main-banner">

        <div id="policyguard-left">

          <div id="policyguard-icon">
            ⚠
          </div>

          <div>

            <h2 id="policyguard-title">
              POLICYGUARD AI DETECTED A PRIVACY POLICY
            </h2>

            <p id="policyguard-text">
              This website contains legal/privacy terms that may affect your data privacy.
            </p>

          </div>

        </div>

        <button id="policyguard-button">
          Analyze Now
        </button>

      </div>
    `;

    // STYLES
    const style =
      document.createElement("style");

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

        box-shadow:
          0 4px 20px rgba(0,0,0,0.35);

        animation:
          policyguardSlideDown 0.4s ease;
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

    document.head.appendChild(style);

    document.body.appendChild(banner);

    // BUTTON
    const button =
      document.getElementById(
        "policyguard-button"
      );

    if (button) {

      button.addEventListener(
        "click",
        async () => {

          try {

            button.innerText =
              "Analyzing...";

            const response =
              await fetch(
                "http://localhost:5000/api/analyze",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    url:
                      window.location.href,

                    content: pageText,
                  }),
                }
              );

            const data =
              await response.json();

            console.log(
              "POLICYGUARD RESULT:",
              data
            );

            // UPDATE TITLE
            document.getElementById(
              "policyguard-title"
            ).innerText =
              `RISK SCORE: ${data.riskScore} (${data.riskLevel})`;

            // UPDATE SUMMARY
            document.getElementById(
              "policyguard-text"
            ).innerText =
              data.summary;

            // UPDATE BANNER COLORS
            const mainBanner =
              document.getElementById(
                "policyguard-main-banner"
              );

            if (
              data.riskLevel === "HIGH"
            ) {

              mainBanner.style.background =
                "linear-gradient(90deg,#7f1d1d,#dc2626)";

            } else if (
              data.riskLevel ===
              "MEDIUM"
            ) {

              mainBanner.style.background =
                "linear-gradient(90deg,#92400e,#f59e0b)";

            } else {

              mainBanner.style.background =
                "linear-gradient(90deg,#065f46,#10b981)";
            }

            // SHOW RISKS
            const risksHtml =
              data.risks
                .map(
                  (risk) => `
                <div style="
                  margin-top:8px;
                  font-size:13px;
                ">
                  ⚠ ${risk.title}
                </div>
              `
                )
                .join("");

            const risksContainer =
              document.createElement(
                "div"
              );

            risksContainer.innerHTML =
              risksHtml;

            risksContainer.style.marginTop =
              "10px";

            document
              .getElementById(
                "policyguard-left"
              )
              .appendChild(
                risksContainer
              );

            button.innerText =
              "Analysis Complete";

          } catch (error) {

            console.error(
              "POLICYGUARD ERROR:",
              error
            );

            button.innerText =
              "Analysis Failed";
          }

        }
      );

    }

  }

}

// AUTO RECHECK FOR DYNAMIC SITES
setTimeout(() => {

  if (detectPrivacyPage()) {

    console.log(
      "POLICYGUARD AI detected policy page after delay"
    );

  }

}, 3000);