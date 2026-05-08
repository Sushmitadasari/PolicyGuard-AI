const loader = document.getElementById("loader");
const resultDiv = document.getElementById("result");

function displayData(data) {
    loader.classList.add("hidden");
    resultDiv.classList.remove("hidden");

    document.getElementById("score").innerText = data.riskScore;
    document.getElementById("summary").innerText = data.summary;

    const level = document.getElementById("level");
    level.innerText = data.riskLevel;

    if (data.riskLevel === "High") level.className = "high";
    else if (data.riskLevel === "Medium") level.className = "medium";
    else level.className = "low";

    const risksDiv = document.getElementById("risks");
    risksDiv.innerHTML = "";

    data.risks.forEach(r => {
        const span = document.createElement("span");
        span.innerText = r;
        risksDiv.appendChild(span);
    });
}

// Load cached result
chrome.storage.local.get("analysis", (res) => {
    if (res.analysis) {
        displayData(res.analysis);
    }
});

document.getElementById("analyzeBtn").addEventListener("click", () => {
    loader.classList.remove("hidden");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type: "MANUAL_ANALYZE" }
        );
    });
});