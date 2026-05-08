function isPolicyPage() {
    const url = window.location.href.toLowerCase();

    return (
        url.includes("privacy") ||
        url.includes("terms") ||
        url.includes("policy")
    );
}

function extractText() {
    return document.body.innerText;
}

function showBanner(riskLevel) {
    const banner = document.createElement("div");
    banner.innerText = `⚠ This site has ${riskLevel.toUpperCase()} privacy risk`;

    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.padding = "10px";
    banner.style.textAlign = "center";
    banner.style.zIndex = "9999";
    banner.style.fontWeight = "bold";

    if (riskLevel === "High") banner.style.background = "red";
    else if (riskLevel === "Medium") banner.style.background = "orange";
    else banner.style.background = "green";

    banner.style.color = "white";

    document.body.appendChild(banner);
}

if (isPolicyPage()) {
    const text = extractText();

    chrome.runtime.sendMessage(
        { type: "ANALYZE", text },
        (response) => {
            if (response && response.riskLevel) {
                showBanner(response.riskLevel);
            }
        }
    );
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "MANUAL_ANALYZE") {
        const text = extractText();

        chrome.runtime.sendMessage(
            { type: "ANALYZE", text },
            (response) => {
                if (response && response.riskLevel) {
                    showBanner(response.riskLevel);
                }
            }
        );
    }
});