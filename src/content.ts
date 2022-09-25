const STORE = {
  playedVideos: [] as string[],
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

function main() {
  STORE.playedVideos = [];

  const videos = nodeListToArray(document.querySelectorAll("video"));
  console.log({ videos });

  videos.forEach((v) => {
    v.onended = (e) => {
      console.log("video ended: ", v);
      v.remove();
      document.querySelector(".n2-video-container")?.remove();

      if (location.href.match(URL_PATTERN)) {
        startNewVideo(videos);
      } else {
        console.warn("url is not match to video pattern: ", location.href);
      }
    };

    v.onplaying = async (e) => {
      console.log("on playing video: ", v);

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

      const looper = setTimeout(() => {
        console.log("starting video: ", v);

        v.focus();
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
  console.log("start pictureInPicture for video: ", v);

  videos.forEach((vL) => {
    vL.style.position = "static";
    vL.style.height = "inherit";
  });

  const parentNodeOfVideo = v.parentElement;
  parentNodeOfVideo.removeChild(v);

  const playerContainer = document.createElement("div");
  playerContainer.classList.add("n2-video-container");
  playerContainer.appendChild(v);

  {
    const btnExit = document.createElement("button");
    btnExit.textContent = "Exit";
    btnExit.id = "btnExit";
    playerContainer.appendChild(btnExit);

    btnExit.onclick = (e) => {
      console.log("on click exit full size of video: ", v);

      v.style.position = "static";
      v.style.height = "inherit";

      document.querySelector(".n2-video-container")?.remove();
      parentNodeOfVideo.appendChild(v);
    };
  }
  document.body.appendChild(playerContainer);
}

setInterval(() => {
  main();
}, 3000);
