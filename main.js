/* eslint-disable default-case */
const { app, BrowserWindow, ipcMain } = require('electron')
const url = require('url')
const fs = require('fs')
var fins = require('omron-fins');
var i18next = require('i18next');
var client = fins.FinsClient(9600, '85.95.177.153', { SA1: 4, DA1: 0, timeout: 20000 });
//var client = fins.FinsClient(9600, '192.168.250.1', { SA1: 4, DA1: 0, timeout: 20000 });
let win

var tags = [
    { name: "angleGV", descr: "", eng: "", addr: "D0", type: "int", min: 0, max: 359, dec: 0, cupd: false, val: null },
    { name: "weftDensity", descr: "", eng: "", addr: "D4", type: "real", min: 10, max: 30, dec: 1, cupd: false, val: null },
    { name: "mode", descr: "", addr: "W12", type: "mode", min: 0, max: 10, dec: 0, cupd: true, val: null },
    { name: "modeInt", descr: "", addr: "W12", type: "int", min: 0, max: 10, dec: 0, cupd: true, val: null },
];
let dl;
function setLanguage(lang) {
    i18next.changeLanguage(lang, () => { })
    tags.forEach(function (e, i) {
        this[i].descr = i18next.t(`tags.${e.name}.descr`);
        if (e.eng !== null) {
            this[i].eng = i18next.t(`tags.${e.name}.eng`);
        }
    }, tags);
    const conf = {
        lng: i18next.language,
    }
    const jsonString = JSON.stringify(conf)
    fs.writeFile('./src/conf.json', jsonString, () => { });
    win.webContents.send('langChanged', lang);
}

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
    fs.readFile('./src/conf.json', 'utf8', (err, jsonString) => {
        const lngconf = JSON.parse(jsonString);
        i18next.init({
            lng: lngconf.lng,
            resources: require(`./src/lang.json`)
        });
        setLanguage(lngconf.lng);
    });
    ipcMain.on("appLoaded", (event) => {
        win.webContents.send('langChanged', i18next.language);
    });
    ipcMain.on("langChange", (event, lang) => {
        setLanguage(lang);
    });
    ipcMain.on("tagsUpdSelect", (event, arr) => {
        arr.forEach(function (name) {
            tags.forEach(function (e, i) {
                if (e.name === name || e.name === "mode") {
                    this[i].cupd = true;
                }
                else {
                    this[i].cupd = false;
                }
            }, tags);
        });
    });
    ipcMain.on("plcRead", (event, arr) => {
        arr.forEach(function (name) {
            let item = tags.find(e => e.name === name);
            switch (item.type) {
                case "real":
                case "dword":
                    dl = 2;
                    break;
                case "int":
                case "mode":
                case "bool":
                    dl = 1;
                    break;
            }
            client.read(item.addr, dl, cb, item);
        });
    })
    ipcMain.on("plcWrite", (event, name, value) => {
        let item = tags.find(e => e.name === name);
        switch (item.type) {
            case "int":
                client.write(item.addr, value, function (err, msg) {
                    if (err) { }
                });
                break;

            case "real":
                var farr = new Float32Array(1);
                var bytes = new Uint8Array(farr.buffer);
                var words = new Uint16Array(2);
                farr[0] = value;
                words[0] = (bytes[1] << 8) | bytes[0];
                words[1] = (bytes[3] << 8) | bytes[2];
                //console.log(value, '\t', item.name, '\t', item.addr, '\t', bytes, '\t', words);
                client.write(item.addr, [words[0], words[1]], function (err, msg) {
                    if (err) { }
                });
                break;

        }
    })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: `${__dirname}/build/index.html`,
        protocol: 'file:',
        slashes: true
    });

    win.loadURL(startUrl);
    win.webContents.openDevTools();

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
        tags.forEach(function (e) {
            if (e.cupd) {
                switch (e.type) {
                    case "real":
                    case "dword":
                        dl = 2;
                        break;
                    case "int":
                    case "bool":
                    case "mode":
                        dl = 1;
                        break;
                }
                client.read(e.addr, dl, cb, e);;
            }
        });
    }
}, 100)

var cb = function (err, msg) {
    if (err) {
        //console.error(err);
    }
    else
        switch (msg.tag.type) {
            case "mode":
                var modetext;
                switch (msg.response.values[0]) {
                    case 1:
                        modetext = i18next.t('tags.mode.init');
                        break;
                    case 2:
                        modetext = i18next.t('tags.mode.stop');
                        break;
                    case 3:
                        modetext = i18next.t('tags.mode.ready');
                        break;
                    case 4:
                        modetext = i18next.t('tags.mode.run');
                        break;
                    case 10:
                        modetext = i18next.t('tags.mode.alarm');
                        break;
                    default:
                        modetext = i18next.t('tags.mode.unknown');
                        break;

                }
                win.webContents.send('plcReply', modetext, msg.tag);
                //console.log(new Date().toISOString(), '\t', modetext, '\x1b[0m\t', msg.tag.name, '\t');
                break;

            case "bool":
                //console.log(new Date().toISOString(), '\t', msg.response.values[0] === 0 ? "\x1b[31mПОДНЯТА" : "\x1b[32mОПУЩЕНА", '\x1b[0m\t', msg.tag.name, '\t');
                break;

            case "int":
                win.webContents.send('plcReply', msg.response.values[0], msg.tag);
                //console.log(new Date().toISOString(), '\t', msg.response.values[0], '\t', msg.tag.name, '\t');
                break;

            case "real":
                var buf = new ArrayBuffer(4);
                var bytes = new Uint8Array(buf);
                bytes[3] = (msg.response.values[0] & 0x00ff);
                bytes[2] = (msg.response.values[0] & 0xff00) >> 8;
                bytes[1] = (msg.response.values[1] & 0x00ff);
                bytes[0] = (msg.response.values[1] & 0xff00) >> 8;
                var view = new DataView(buf);
                win.webContents.send('plcReply', Number(view.getFloat32(0, false).toFixed(msg.tag.dec)), msg.tag);
                //console.log(new Date().toISOString(), '\t', Number(view.getFloat32(0, false).toFixed(1)), '\t', msg.tag.name, '\t');
                break;

        }
};