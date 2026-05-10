chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    if (message.type === "OPEN_POPUP") {

      chrome.tabs.create({
        url: chrome.runtime.getURL("index.html"),
      });

    }

  }
);