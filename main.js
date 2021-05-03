const {app, BrowserWindow} = require('electron');

const server = require('./server');

function createWindow() { 
   win = new BrowserWindow({width: 800, height: 600, autoHideMenuBar: true, title: 'Ellio-T'})
   win.setMenu(null);
   win.loadURL("http://127.0.0.1:5000");
}  

app.on('ready', createWindow) 