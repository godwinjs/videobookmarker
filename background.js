chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // console.log({"tab": tab})
  // console.log({tabId})

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      let tabUrl = tabs[0].url;
      // console.log("Current tab URL:", tabUrl);
      // Further actions can be taken here with the URL
        if (tabUrl && tabUrl.includes("youtube.com/watch")) {
          const queryParameters = tabUrl.split("?")[1];
          const urlParameters = new URLSearchParams(queryParameters);

          chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v"),
          });

          console.log({tabId: {
            type: "NEW",
            videoId: urlParameters.get("v"),
          }})

        } else{
          console.log("the current tab is not a youtube video link")
        }
    }
  });
});