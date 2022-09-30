const STORE = {
  playedVideos: [] as string[],
  CURRENT_STATE: {
    videoEl: null as HTMLVideoElement,
    parentVideoNode: null as HTMLElement,
  },
};
const URL_PATTERN = /https?:\/\/\w+\.facebook\.com\/watch.+?/;

function nodeListToArray<T extends Node>(nodeList: NodeListOf<T>) {
  const result: T[] = [];

  nodeList.forEach((nod) => {
    result.push(nod);
  });

  return result;
}

function cssContent() {
  return `
    {{ CSS_CONTENT }}
  `;
}

function onEndedVideo(videos: HTMLVideoElement[], v: HTMLVideoElement) {
  console.log("video ended: ", v);
  v.remove();
  document.querySelector(".n2-video-container")?.remove();

  if (location.href.match(URL_PATTERN)) {
    startNewVideo(videos);
  } else {
    console.warn("url is not match to video pattern: ", location.href);
  }
}

function onExitLargerVideoMode(
  oldParentVideo: HTMLElement,
  v: HTMLVideoElement
) {
  if (!oldParentVideo) {
    oldParentVideo = STORE.CURRENT_STATE.parentVideoNode;
  }

  if (!v) {
    v = STORE.CURRENT_STATE.videoEl;
  }

  console.log("on click exit full size of video: ", v);

  if (v && oldParentVideo) {
    v.style.position = "static";
    v.style.height = "inherit";

    oldParentVideo?.appendChild(v);
    // console.log("v.parentElement: ", v.parentElement);
  }
  document.querySelector(".n2-video-container")?.remove();
}

function main() {
  const videos = nodeListToArray(document.querySelectorAll("video"));
  console.log({ videos });

  if (STORE.CURRENT_STATE.videoEl) {
    if (isAlmostEndVideo(STORE.CURRENT_STATE.videoEl)) {
      onExitLargerVideoMode(null, null);
    }
  }

  videos.forEach((v) => {
    v.onended = (e) => {
      onEndedVideo(videos, v);
    };

    v.onplaying = async (e) => {
      console.log("on playing video: ", v);
      STORE.CURRENT_STATE.videoEl = v;
      STORE.CURRENT_STATE.parentVideoNode = v.parentElement;

      if (!STORE.playedVideos.find((sv) => sv === v.src)) {
        STORE.playedVideos.push(v.src);
      }
      await startLargerVideoMode(videos, v);
    };
  });

  if (!document.querySelector("style#n2-style")) {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = cssContent();
    styleEl.id = "n2-style";

    document.head.appendChild(styleEl);
  }
}

function startNewVideo(videos: HTMLVideoElement[]) {
  for (const v of videos) {
    if (!STORE.playedVideos.includes(v.src)) {
      console.log("prepare to start for video: ", v);
      v.scrollIntoView({
        inline: "start",
        behavior: "smooth",
        block: "start",
      });
      v.focus();

      const looper = setTimeout(() => {
        console.log("starting video: ", v);
        v.play();

        clearInterval(looper);
      }, 5_000);

      break;
    }
  }
}

async function startLargerVideoMode(
  videos: HTMLVideoElement[],
  v: HTMLVideoElement
) {
  if (ableToStartLargerVideoMode(v)) {
    console.log("start pictureInPicture for video: ", v);

    videos.forEach((vL) => {
      vL.style.position = "static";
      vL.style.height = "inherit";
    });

    const oldParentVideo = v.parentElement;

    const playerContainer = document.createElement("div");
    playerContainer.classList.add("n2-video-container");
    playerContainer.appendChild(v);

    {
      const btnExit = document.createElement("button");
      btnExit.textContent = "Exit";
      btnExit.id = "btnExit";
      playerContainer.appendChild(btnExit);

      btnExit.onclick = (e) => {
        onExitLargerVideoMode(oldParentVideo, v);
      };
    }
    document.body.appendChild(playerContainer);
  }
}

function ableToStartLargerVideoMode(v: HTMLVideoElement) {
  console.log("remain time: ", v.duration - v.currentTime);

  return 10 <= v.duration - v.currentTime;
}

function isAlmostEndVideo(v: HTMLVideoElement) {
  if (v) {
    return 10 > v.duration - v.currentTime;
  } else {
    return true;
  }
}

(() => {
  STORE.playedVideos = [];

  setInterval(() => {
    main();
  }, 3000);
})();
