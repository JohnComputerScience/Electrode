const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const { app, BrowserWindow, Menu, ipcMain, BrowserView } = electron;

var mainWindow;
var addWindow;
var docWindow;

//create main window
function createMainWindow() {
    mainWindow = new BrowserWindow(
        {
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: true
            }
        })

    mainWindow.on('close', function () {
        mainWindow = null;
    });

    mainWindow.loadFile('mainWindow.html');

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
};

//create  docWindow
function createDocWindow() {
    docWindow = new BrowserWindow(
        {
            height: 600,
            width: 600,
            title: 'Documentation',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
    //load HTML into window
    docWindow.loadFile("docWindow.html");
    //garbage collection
    docWindow.on('close', function () {
        //console.log("docWindow = null");
        docWindow = null;
    });
}

//create add window
function createAddWindow() {
    addWindow = new BrowserWindow(
        {
            height: 200,
            width: 300,
            title: 'Add Task',
            webPreferences: {
                nodeIntegration: true
            }
        });
    //load HTML into window
    addWindow.loadFile("addWindow.html");
    //garbage collection
    addWindow.on('close', function () {
        addWindow = null;
    });
}

//catch item:add
ipcMain.on('item:add', function (e, item) {
    mainWindow.webContents.send('item:add', item);

    fs.appendFile('eData.txt', item + ',', err => {
        if (err) {
            console.error(err)
            return
        }
    });
    
    addWindow.close();

});

//catch addItem send from mainWindow
ipcMain.on('addItem', function () {
    createAddWindow();
});

//catch newDocWindow send
ipcMain.on('createDocWindow', function () {
    createDocWindow();
});

//catches the different documentations sent from docWindow
ipcMain.on('htmlWindow', function (e, target) {
    //console.log("Hello!");
    const view = new BrowserView();
    docWindow.setBrowserView(view);
    
    view.setBounds({ x: 10, y: 50, width: 575, height: 485 });
    view.webContents.loadURL('https://www.w3schools.com/html/default.asp');
    
});
ipcMain.on('jsWindow', function (e, target) {
    const view = new BrowserView();
    docWindow.setBrowserView(view);

    view.setBounds({ x: 10, y: 50, width: 575, height: 485 });
    view.webContents.loadURL('https://www.w3schools.com/js/default.asp');
});
ipcMain.on('electronWindow', function (e, target) {
    const view = new BrowserView();
    docWindow.setBrowserView(view);

    view.setBounds({ x: 10, y: 50, width: 575, height: 485 });
    view.webContents.loadURL('https://www.electronjs.org/docs');
});

//imports the eData file and pareses each item which is sent to addWindow to be added
ipcMain.on('importItems', function (e, target) {
    //console.log('it worked');
    fs.readFile('eData.txt', 'utf8', function (err, data) {
        if (err) { console.log('error', err); }
        //var item;
        var splitItems = data.split(',');
        for (let i = 0; i < (splitItems.length - 1); i++) {
            var item = splitItems[i];
            mainWindow.webContents.send('item:add', item);
        }
    });
});


//create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            },
        ]
    }
];

//if mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}


//add developer tools if in prduction
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }

            },
            {
                role: 'reload'
            }
        ]
    });
}

//Listen for app to be ready
app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
