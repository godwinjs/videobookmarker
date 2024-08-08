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

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId, id } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.id !== id);
      chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
      console.log({"delete currentVideoBookmarks": currentVideoBookmarks})

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
