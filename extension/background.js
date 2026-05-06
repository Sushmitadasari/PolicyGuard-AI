chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "ANALYZE") {

        fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: request.text })
        })
        .then(res => res.json())
        .then(data => {
            chrome.storage.local.set({ analysis: data });
            sendResponse(data);
        })
        .catch(err => {
            console.error(err);
            sendResponse({ error: "API failed" });
        });

        return true; // async response
    }
});