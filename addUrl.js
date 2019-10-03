const { ipcRenderer } = require("electron");
const addpage = () => {
  let name = document.getElementById("name");
  let url = document.getElementById("url");
  let color = document.getElementById("color");

  const data = {
    name: name.value,
    class: color.value,
    url: url.value
  };
  name.value = "";
  url.value = "";
  ipcRenderer.send("addUrl", data);
};
const cancel = () => {
  ipcRenderer.send("add-url");
};
