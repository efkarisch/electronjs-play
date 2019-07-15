// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const IS_MAC = process.platform == 'darwin'
const IS_DEV = process.env.NODE_ENV !== "production"


// Tell app not to reduce performance when in background to save CPU cycles
// app.commandLine.appendSwitch("disable-renderer-backgrounding")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, addWindow



const createWindow  = () => {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#fff',//best practice for Electron.JS font blur issues relating to transparency rgba, set a bg-color
    icon:path.join(__dirname,'assets/icon/png/basket.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file', //https
    slashes: true
  }))

  //auto start dev tools on openDevTools
  // if(IS_DEV){
  //   mainWindow.webContents.openDevTools()
  // }

  //shut down all open windows for app when main window close button is clicked
  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  // mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
  //   mainWindow = null
  // })
}//END createWindow()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () =>{

  createWindow()
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  Menu.setApplicationMenu(mainMenu)

})

//Handle adding create window
const createAddWindow = () => {

  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add shopping list item",
    preload: path.join(__dirname, 'preload.js'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addListItemWindow.html'),
    protocol: 'file', //https
    slashes: true
  }))

  //garbage collection, memory
  addWindow.on('closed', () => {
    addWindow = null
  })

}

ipcMain.on('item:add', ( e, item ) => {
  //send recieved item from additemwindow to main app window
  mainWindow.webContents.send('item:add', item)

  //if you want to auto close window after every single action
  //addWindow.close()
})

const clearAllItems = () => {
  mainWindow.webContents.send('item:clearAll')
}

const mainMenuTemplate = [
  {
    label:"File",
    submenu:[
      {
        label:"Add Item",
        click(){
            createAddWindow()
        }
      },
      {
        label:"Clear Items",
        click(){
          clearAllItems()
        }

      },
      {
        type: 'separator'
      },
      {
        label:"Quit Program",
        accelerator: IS_MAC ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit()
        },
      },
    ]
  }
]

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!IS_MAC) app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

//If mac, add preceeding menu Item
if(IS_MAC){
  mainMenuTemplate.unshift({
      label:app.getName(),
      submenu: [
        {
          role:"About",
        }
      ]
  })
}

//add dev tool if not in prod
if(IS_DEV){
  mainMenuTemplate.push({
    label:"Dev Tools",
    submenu:[
      {
        label:"Toggle Tools",
        accelerator: IS_MAC ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
