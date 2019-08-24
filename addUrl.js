const { ipcRenderer } = require("electron");
const addpage = () => {
  const name = document.getElementById("name").value;
  const url = document.getElementById("url").value;
  const color = document.getElementById("color").value;

  const data = {
    name,
    color,
    url
  };
  ipcRenderer.send("populate", data);
};
