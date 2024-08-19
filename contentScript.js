(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  /**
   * Fetches bookmarks from Chrome storage for the current video.
   * Promise<Array> A promise that resolves with an array of bookmarks for the current video.
   */ 

  const fetchBookmarks = () => {
    return new Promise((resolve, reject) => {
      if (!chrome.storage || !chrome.storage.sync) {
        reject(new Error("Chrome storage API is not available."));
        return;
      }
      chrome.storage.sync.get([currentVideo], (obj) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError));
        } else {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        }
      });
      
    });
  };


  const addNewBookmarkEventHandler = async () => {
      youtubePlayer = document.getElementsByClassName('video-stream')[0];
      console.log(youtubePlayer.currentTime)

      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
        id: Date.now(), // Unique identifier
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };

      currentVideoBookmarks = await fetchBookmarks();

      if(currentVideoBookmarks.length < 1){
        chrome.storage.sync.set({
          [currentVideo]: JSON.stringify([newBookmark])
        });
        console.log({"currentVideoBookmarks": currentVideoBookmarks, "newBookmark": newBookmark})
        return;
      }
      console.log({"currentVideoBookmarks": currentVideoBookmarks})
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

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

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    console.log({"sender": sender}) //sender.origin: "chrome-extension://" + sender.id
    const { type, value, videoId, id } = obj;
    console.log({value, currentVideoBookmarks, obj})

    if (type === "NEW") {
      currentVideo = videoId;
      !bookmarkBtnExists && newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if (type === "DELETE") {
      console.log({value, currentVideoBookmarks, obj})
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      console.log({"delete currentVideoBookmarks": currentVideoBookmarks, currentVideo})

      response(currentVideoBookmarks);
    }
  });


  newVideoLoaded();
})();

const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
