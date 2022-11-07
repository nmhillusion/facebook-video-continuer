const { doItOnce } = require("./func.util");

const STORE = {
  playedVideos: [] as string[],
  CURRENT_STATE: {
    videoEl: null as HTMLVideoElement,
    parentVideoNode: null as HTMLElement,
  },
  endVideoTimer: null as any,
};
const URL_PATTERN = /https?:\/\/\w+\.facebook\.com\/watch.+?/;

function nodeListToArray<T extends Node>(nodeList: NodeListOf<T>) {
  const result: T[] = [];

  nodeList.forEach((nod) => {
    result.push(nod);
  });

  return result;
}

function getCurrentVideos() {
  return nodeListToArray(document.querySelectorAll("video"));
}

function cssContent() {
  return `{{ CSS_CONTENT }}`;
}

function onEndedVideo(v: HTMLVideoElement) {
  console.log("video ended: ", v);
  STORE.CURRENT_STATE = {
    parentVideoNode: null,
    videoEl: null,
  };
  STORE.endVideoTimer = null;

  console.log("prepare for playing video of href: ", location.href);
  onExitLargerVideoMode(v, null);

  if (location.href.match(URL_PATTERN)) {
    startNewVideo();
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
  document
    .querySelectorAll(".n2-video-container")
    .forEach((el) => el?.remove());
}

function startNewVideo() {
  let startedVideoSrc: string = null;
  const videos = getCurrentVideos();

  for (const v of videos) {
    if (!STORE.playedVideos.includes(v.src)) {
      console.log("prepare to start for video: ", v);
      startedVideoSrc = v.src;
      v.scrollIntoView();
      v.focus();

      doItOnce(5_000, () => {
        console.log("starting video: ", v);
        v.play();
      });

      break;
    }
  }
  console.log({ startedVideoSrc });
}

function startEndedVideoTimer(v: HTMLVideoElement) {
  console.log("startEndedVideoTimer: ", v.duration, v);
  const timeoutInMillis = (v.duration + 10) * 1000;
  if (Number.isNaN(timeoutInMillis)) {
    throw new Error("timeoutInMillis is NaN of " + v.src);
  }

  clearTimeout(STORE.endVideoTimer);
  STORE.endVideoTimer = setTimeout(() => {
    clearTimeout(STORE.endVideoTimer);
    STORE.endVideoTimer = null;

    if (!v.paused) {
      console.log("manual trigger ended video event");

      onEndedVideo(v);
    }
  }, timeoutInMillis);
}

async function startLargerVideoMode(v: HTMLVideoElement) {
  if (ableToStartLargerVideoMode(v)) {
    console.log("start pictureInPicture for video: ", v);

    getCurrentVideos().forEach((vL) => {
      vL.style.position = "static";
      vL.style.height = "inherit";
    });

    const oldParentVideo = v.parentElement;

    const playerContainer = document.createElement("div");
    playerContainer.classList.add("n2-video-container");
    playerContainer.appendChild(v);

    v.setAttribute("controls", "controls");

    {
      const btnExit = document.createElement("button");
      btnExit.textContent = "Exit";
      btnExit.id = "btnExit";
      playerContainer.appendChild(btnExit);

      btnExit.onclick = async (e) => {
        onExitLargerVideoMode(oldParentVideo, v);
      };
    }
    document.body.appendChild(playerContainer);
  }
}

function ableToStartLargerVideoMode(v: HTMLVideoElement) {
  console.log("remain time: ", v.duration - v.currentTime);

  return (
    10 <= v.duration - v.currentTime &&
    !document.querySelector(".n2-video-container")
  );
}

function isAlmostEndVideo(v: HTMLVideoElement) {
  if (v) {
    return 10 > v.duration - v.currentTime;
  } else {
    return true;
  }
}

function main() {
  const videos = getCurrentVideos();
  console.log({ videos });

  // if (STORE.CURRENT_STATE.videoEl) {
  //   if (isAlmostEndVideo(STORE.CURRENT_STATE.videoEl)) {
  //     onExitLargerVideoMode(null, null);
  //   }
  // }

  videos.forEach((v) => {
    v.onended = (e) => {
      onEndedVideo(v);
    };

    v.onplaying = async (e) => {
      console.log("on playing video: ", v);
      STORE.CURRENT_STATE.videoEl = v;
      STORE.CURRENT_STATE.parentVideoNode = v.parentElement;

      if (!STORE.playedVideos.find((sv) => sv === v.src)) {
        STORE.playedVideos.push(v.src);
      }
      await startLargerVideoMode(v);

      if (!STORE.endVideoTimer) {
        startEndedVideoTimer(v);
      }
    };
  });

  if (!document.querySelector("style#n2-style")) {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = cssContent();
    styleEl.id = "n2-style";

    document.head.appendChild(styleEl);
  }
}

(() => {
  STORE.playedVideos = [];

  setInterval(() => {
    main();
  }, 3000);
})();
