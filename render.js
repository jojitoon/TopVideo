const { ipcRenderer } = require("electron");
// const storage = require("electron-json-storage");

const populate = sites => {
  let data = "";

  sites.map(site => {
    data += `<button
	class="btn btn-${site.class}"
	name="${site.url}"
  >
	${site.name}
  </button>`;
  });
  const box = document.getElementById("box");
  box.innerHTML = data;
  const buttons = document.getElementsByClassName("btn");
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.onclick = () => openPage(button);
  }
};

const openPage = link => {
  ipcRenderer.send("openPage", link.name);
};

const alertOnlineStatus = () => {
  const bar = document.getElementById("status");
  if (navigator.onLine) {
    bar.innerHTML = null;
  } else {
    const text = "<p>You are currently offline</p>";
    bar.innerHTML = text;
  }
};

window.addEventListener("online", alertOnlineStatus);
window.addEventListener("offline", alertOnlineStatus);

alertOnlineStatus();

const addUrl = () => {
  ipcRenderer.send("add-url");
};

ipcRenderer.on("populate", (e, data) => {
  console.log(data);

  populate(data);
});
