const { remote, ipcRenderer } = require("electron");

const switchTop = () => {
  ipcRenderer.send("switch-top");
};
const toggle = () => {
  ipcRenderer.send("toggle");
};

const quit = () => {
  ipcRenderer.send("quit");
};

ipcRenderer.on("notify", (e, message) => {
  new Notification("Top Video", {
    body: message
  });
});
