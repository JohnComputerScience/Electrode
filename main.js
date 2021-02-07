const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain, BrowserView } = electron;

var mainWindow;
var addWindow;
var docWindow;

//Listen for app to be ready
app.on('ready', function () {
    //create new window
    mainWindow = new BrowserWindow(
        {
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: true
            }
        });
    //load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocal: 'file:',
        slashes: true
    }));
    //quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

//handle  docWindow
function createDocWindow() {
    docWindow = new BrowserWindow(
        {
            height: 600,
            width: 600,
            title: 'Documentation',
            webPreferences: {
                nodeIntegration: true
            }
        });
    //load HTML into window
    docWindow.loadFile("docWindow.html");
    //garbage collection
    docWindow.on('close', function () {
        console.log("docWindow = null");
        docWindow = null;
    });
}

//handle add window
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
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocal: 'file:',
        slashes: true
    }));
    //garbage collection
    addWindow.on('close', function () {
        addWindow = null;
    });
}

//catch item:add
ipcMain.on('item:add', function (e, item) {
    //console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();

});

//catch newDocWindow send
ipcMain.on('createDocWindow', function () {
    createDocWindow();

});

//catches the different documentations sent from docWindow
ipcMain.on('htmlWindow', function (e, target) {
    const view = new BrowserView({ webPreferences: { nodeIntegration: true } });
    //console.log("Hello!");
    view.setBounds({ x: 25, y: 100, width: 450, height: 450, });
    view.webContents.loadURL('https://www.w3schools.com/html/default.asp');
    docWindow.setBrowserView(view);
});

ipcMain.on('jsWindow', function (e, target) {
    const view = new BrowserView({ webPreferences: { nodeIntegration: true } });

    view.setBounds({ x: 25, y: 100, width: 450, height: 450 });
    view.webContents.loadURL('https://www.w3schools.com/js/default.asp');

    docWindow.setBrowserView(view);
});

ipcMain.on('electronWindow', function (e, target) {
    const view = new BrowserView({ webPreferences: { nodeIntegration: true } });

    view.setBounds({ x: 25, y: 100, width: 450, height: 450 });
    view.webContents.loadURL('https://www.electronjs.org/docs');

    docWindow.setBrowserView(view);
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