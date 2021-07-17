/* eslint-disable default-case */
const { app, BrowserWindow, ipcMain } = require('electron')
const url = require('url')
var fins = require('omron-fins');

//var client = fins.FinsClient(9600, '85.95.177.153', { SA1: 4, DA1: 0, timeout: 2000 });
var client = fins.FinsClient(9600, '192.168.250.1', { SA1: 4, DA1: 0, timeout: 2000 });
let win

function createWindow() {
    win = new BrowserWindow({
        width: 1024,
        height: 600,
        icon: `${__dirname}/icon.ico`,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            worldSafeExecuteJavaScript: true,
            preload: `${__dirname}/preload.js`
        },
        frame: false,
        closeable: false,
        resizable: false,
        transparent: false,
        center: true,
    })

    ipcMain.on("plcRead", (event, address, n) => {
        client.read(address, n, function (err, bytes) {
            win.webContents.send('plcReaded', bytes)
        })
    })
    ipcMain.on("plcWrite", (event, address, value) => {
        client.write(address, value, function (err, bytes) {
            win.webContents.send('plcWrited', bytes)
        })
    })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: `${__dirname}/build/index.html`,
        protocol: 'file:',
        slashes: true
      });
    
        win.loadURL(startUrl);
    
    //win.webContents.openDevTools();

    win.on('closed', () => {
        console.log("win.closed")
        clearInterval(intervalTimer)
        client = null
        win = null
    })
}
app.on('ready', createWindow)

app.on('window-all-closed', () => {
    console.log("app.window-all-closed")
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

let intervalTimer = setInterval(() => {
    if (client) {
        client.read('D0', 1, cb, { "tagdata": "angleGV", "tagtype": "int" });
    }
}, 500)

var cb = function (err, msg) {
    if (err)
        console.error(err);
    else
        switch (msg.tag.tagtype) {
            case "mode":
                var modetext;
                switch (msg.response.values[0]) {
                    case 1:
                        modetext = "\x1b[34mИНИЦИАЛИЗАЦИЯ";
                        break;
                    case 2:
                        modetext = "\x1b[33mСТОП";
                        break;
                    case 3:
                        modetext = "\x1b[35mПОДГОТОВКА";
                        break;
                    case 4:
                        modetext = "\x1b[32mРАБОТА";
                        break;
                    case 10:
                        modetext = "\x1b[31mАВАРИЯ";
                        break;
                }
                console.log(new Date().toISOString(), '\t', modetext, '\x1b[0m\t', msg.tag.tagdata, '\t');
                break;

            case "bool":
                console.log(new Date().toISOString(), '\t', msg.response.values[0] == 0 ? "\x1b[31mПОДНЯТА" : "\x1b[32mОПУЩЕНА", '\x1b[0m\t', msg.tag.tagdata, '\t');
                break;

            case "int":
                win.webContents.send('plcReply', msg.response.values[0], msg.tag.tagdata);
                //console.log(new Date().toISOString(), '\t', msg.response.values[0], '\t', msg.tag.tagdata, '\t');
                break;

            case "real":
                var buf = new ArrayBuffer(4);
                var bytes = new Uint8Array(buf);
                bytes[3] = (msg.response.values[0] & 0x00ff);
                bytes[2] = (msg.response.values[0] & 0xff00) >> 8;
                bytes[1] = (msg.response.values[1] & 0x00ff);
                bytes[0] = (msg.response.values[1] & 0xff00) >> 8;
                var view = new DataView(buf);
                console.log(new Date().toISOString(), '\t', Number(view.getFloat32(0, false).toFixed(1)), '\t', msg.tag.tagdata, '\t');
                break;

        }
};