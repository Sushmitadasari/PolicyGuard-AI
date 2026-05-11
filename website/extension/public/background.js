chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "OPEN_EXTENSION") {

    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html"),
    });

  }

});