const {
  app,
  BrowserWindow,
  powerSaveBlocker,
  remote,
  Menu,
  Tray,
  nativeImage,
  ipcMain,
  systemPreferences,
  autoUpdater,
  dialog
} = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const url = require("url");
let win;
let id;
let tray;
let modal;
let addUrl;
let icon = path.join(__dirname, "topl.png");

if (!isDev) {
  const server = "https://hazel.jojitoon.now.sh";
  const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

  autoUpdater.setFeedURL(feed);
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 60000);

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail:
        "A new version has been downloaded. Restart the application to apply the updates."
    };

    dialog.showMessageBox(dialogOpts, response => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("error", message => {
    console.error("There was a problem updating the application");
    console.error(message);
  });
}

const iconUrl = url.format({
  pathname: path.join(__dirname, "icon.png"),
  protocol: "file:",
  slashes: true
});

const htmlUrl = url.format({
  pathname: path.join(__dirname, "index.html"),
  protocol: "file:",
  slashes: true
});

const modalUrl = url.format({
  pathname: path.join(__dirname, "mod.html"),
  protocol: "file:",
  slashes: true
});
const addSiteUrl = url.format({
  pathname: path.join(__dirname, "addUrl.html"),
  protocol: "file:",
  slashes: true
});

function createModal() {
  modal = new BrowserWindow({
    width: 300,
    height: 150,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  modal.loadURL(modalUrl);
}

const toggleWindow = () => {
  if (modal.isVisible()) {
    modal.hide();
  } else {
    showWindow();
  }
};

const toggleAddSite = () => {
  if (addUrl.isVisible()) {
    addUrl.hide();
  } else {
    showAddUrl();
  }
};

const showAddUrl = () => {
  addUrl.show();
  addUrl.focus();
};
const showWindow = () => {
  const trayPos = tray.getBounds();
  const windowPos = modal.getBounds();
  let x,
    y = 0;
  if (process.platform == "darwin") {
    x = Math.round(trayPos.x + trayPos.width / 2 - windowPos.width / 2);
    y = Math.round(trayPos.y + trayPos.height);
  } else {
    x = Math.round(trayPos.x + trayPos.width / 2 - windowPos.width / 2);
    y = Math.round(trayPos.y + trayPos.height * 10);
  }

  // modal.openDevTools({ mode: "detach" });
  modal.setPosition(x, y, false);
  modal.show();
  modal.focus();
  if (!win.isFullScreenable()) {
    app.dock.hide();
    modal.setAlwaysOnTop(true, "floating");
    modal.setVisibleOnAllWorkspaces(true);
    modal.setFullScreenable(false);
    app.dock.show();
  }
};

function createWindow() {
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: 500,
    height: 300,
    title: "Top Video",
    icon: iconUrl,
    webPreferences: {
      nodeIntegration: true
    }
  });
  addUrl = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    parent: win,
    webPreferences: {
      nodeIntegration: true
    }
  });
  addUrl.loadURL(addSiteUrl);

  app.dock.hide();
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true);
  win.setFullScreenable(false);
  app.dock.show();
  const mainMenu = Menu.buildFromTemplate(mainMenuTemp);
  Menu.setApplicationMenu(mainMenu);
  win.openDevTools({ mode: "detach" });
  addUrl.openDevTools({ mode: "detach" });
  win.loadURL(htmlUrl);
  win.webContents.on("new-window", function(e, url) {
    e.preventDefault();
  });
  win.on("closed", () => {
    win = null;
    powerSaveBlocker.stop(id);
    app.quit();
  });
}

const goFull = () => {
  if (!win.isFullScreenable()) {
    app.dock.hide();
    win.setAlwaysOnTop(false);
    win.setVisibleOnAllWorkspaces(false);
    win.setFullScreenable(true);
    app.dock.show();
    toggleWindow();
    return "Top video is no longer on all your screens.";
  } else {
    app.dock.hide();
    win.setAlwaysOnTop(true, "floating");
    win.setVisibleOnAllWorkspaces(true);
    win.setFullScreen(false);
    win.setFullScreenable(false);
    win.setSize(500, 300, true);
    app.dock.show();
    toggleWindow();
    return "Top video is now on all your screens.";
  }
};

app.on("ready", () => {
  id = powerSaveBlocker.start("prevent-display-sleep");

  if (process.platform == "darwin") {
    setLogoTheme();
    tray = new Tray(icon);
    tray.setToolTip("Top Video");
    tray.on("click", () => toggleWindow());
    systemPreferences.subscribeNotification(
      "AppleInterfaceThemeChangedNotification",
      setLogoTheme
    );
  }
  createWindow();
  createModal();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    powerSaveBlocker.stop(id);
    app.quit();
  }
});
const populateIt = data => {
  addUrl.webContents.send("populate", data);
};

ipcMain.on("switch-top", e => {
  e.reply("notify", goFull());
});
ipcMain.on("toggle", e => {
  toggleWindow();
});
ipcMain.on("add-url", e => {
  toggleAddSite();
});
// ipcMain.on("addedUrl", (e, data) => {
//   populateIt(data);
//   toggleAddSite();
// });
ipcMain.on("quit", e => {
  powerSaveBlocker.stop(id);
  app.quit();
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

const mainMenuTemp = [
  {
    label: "Top Video",
    submenu: [
      {
        label: "Home",
        accelerator: process.platform === "darwin" ? "Command+H" : "Ctrl+H",
        click() {
          win.loadURL(htmlUrl);
          win.setTitle("Top Video");
        }
      },
      {
        label: "Add Url",
        accelerator: process.platform === "darwin" ? "Command+N" : "Ctrl+N",
        click() {
          toggleAddSite();
        }
      },
      {
        label: "Quit app",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          powerSaveBlocker.stop(id);
          app.quit();
        }
      }
    ]
  }
];

const setLogoTheme = () => {
  if (process.platform == "darwin") {
    icon = systemPreferences.isDarkMode()
      ? path.join(__dirname, "top.png")
      : path.join(__dirname, "topl.png");
  }
};
