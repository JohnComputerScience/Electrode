const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain, BrowserView } = electron;

var mainWindow;
var addWindow;
var docWindow;


//handle  docWindow
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
    mainWindow.webContents.send('item:add', item);
    addWindow.close();

});

//catch addWindow send
ipcMain.on('addItem', function () {
    createAddWindow();

});

//catch newDocWindow send
ipcMain.on('createDocWindow', function () {
    createDocWindow();

});



//{ webPreferences: { nodeIntegration: true, contextIsolation: false } }
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
    mainWindow.on('closed', function () {
        app.quit();
    });
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});