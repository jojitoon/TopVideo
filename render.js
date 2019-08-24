const { remote, ipcRenderer } = require("electron");
// const storage = require("electron-json-storage");
const Store = require("electron-store");
const store = new Store();
const userSites = store.get("sites");
let sites = [
  {
    class: "youtube",
    url: "https://www.youtube.com/",
    name: "Youtube"
  },
  {
    class: "netflix",
    url: "https://www.netflix.com/",
    name: "Netflix"
  },
  {
    class: "fz",
    url: "https://www.123moviesgot.com/",
    name: "123moviesgot"
  },
  {
    class: "vimeo",
    url: "https://www.vimeo.com/",
    name: "Vimeo"
  },
  {
    class: "plural",
    url: "https://www.pluralsight.com/",
    name: "PluralSight"
  },
  {
    class: "tree",
    url: "https://www.teamtreehouse.com/",
    name: "Tree House"
  },
  {
    class: "xpause",
    url: "https://www.egghead.io/",
    name: "Egghead.io"
  },
  {
    class: "fz",
    url: "https://www.fzmovies.net/",
    name: "FZMovies"
  },
  {
    class: "vimeo",
    url: "https://www.khanacademy.com/",
    name: "Khan Academey"
  },
  {
    class: "facebook",
    url: "https://www.facebook.com/",
    name: "Facebook"
  },
  {
    class: "twitter",
    url: "https://www.twitter.com/",
    name: "Twitter"
  },
  {
    class: "xpause",
    url: "https://www.xpau.se/",
    name: "Xpau.se"
  }
];

if (userSites) {
  sites = userSites;
} else {
  store.set("sites", sites);
}
const populate = () => {
  let data = "";
  console.log("populate");

  sites.map(site => {
    data += `<button
	class="btn btn-${site.class}"
	name="${site.url}"
  >
	${site.name}
  </button>`;
  });
  const box = document.getElementById("box");
  if (box) {
    box.innerHTML = data;
    const buttons = document.getElementsByClassName("btn");
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.onclick = () => openPage(button);
    }
  }
};

const openPage = url => {
  remote.getCurrentWindow().loadURL(url.name);
};

const alertOnlineStatus = () => {
  const bar = document.getElementById("status");
  if (bar) {
    if (navigator.onLine) {
      bar.innerHTML = null;
    } else {
      const text = "<p>You are currently offline</p>";
      bar.innerHTML = text;
    }
  }
};

window.addEventListener("online", alertOnlineStatus);
window.addEventListener("offline", alertOnlineStatus);

alertOnlineStatus();
populate();

const addUrl = () => {
  ipcRenderer.send("add-url");
};

ipcRenderer.on("populate", (e, data) => {
  console.log("came here to populate", data);
  sites.push({
    name: data.name,
    class: data.color,
    url: data.url
  });
  store.delete("sites");
  store.set("sites", sites);
  populate();
  ipcRenderer.send("add-url");
});
