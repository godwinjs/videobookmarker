(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        console.log({"sender": sender})
        const { type, value, videoId, id } = obj;
    
        if (type === "NEW") {
          currentVideo = videoId;
          newVideoLoaded();
        }

      });

      const newVideoLoaded = async () => {
    
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists)

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("button");
      
            // bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.style = "margin-top: 5px;";
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to add current timestamp to bookmark";
            bookmarkBtn.innerHTML = `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 36 36"
                    fill="none"
                    stroke="white"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <title>Click to bookmark current timestamp</title>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            `;
      
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];

            youtubeLeftControls.insertBefore(bookmarkBtn, youtubeLeftControls.firstChild);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
          }
      }
})()