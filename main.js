/* eslint-disable default-case */
const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const fs = require('fs');
var moment = require('moment');

var sudo = require('sudo-prompt');
var options = {
    name: 'Electron',
};

var fins = require('omron-fins');
var i18next = require('i18next');
var pass = null;
var ip = null;
var client = {};
let win

var tags = [
    { name: "config", addr: "W52", type: "int", min: 0, max: 3, dec: 0, cupd: false, plc: '1', val: null },
    { name: "mode", addr: "W12", type: "mode", min: 0, max: 10, dec: 0, cupd: true, plc: '1', val: null },
    { name: "angleGV", addr: "D0", type: "int", min: 0, max: 359, dec: 0, cupd: false, plc: '1', val: null },
    { name: "speedGV", addr: "W22", type: "int", min: 0, max: 600, dec: 0, cupd: false, plc: '1', val: null },
    { name: "clothGeneral", addr: "D6", type: "real", min: 0, max: 9999999, dec: 1, cupd: false, plc: '1', val: null },
    { name: "clothShift", addr: "D10", type: "real", min: 0, max: 9999999, dec: 1, cupd: false, plc: '1', val: null },
    { name: "weftDensity", addr: "D4", type: "real", min: 0, max: 999, dec: 1, cupd: false, plc: '1', val: null },
    { name: "warpTension1", addr: "W56", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpTension2", addr: "W57", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpTensionSP1", addr: "D50", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpTensionSP2", addr: "D51", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpForward1", addr: "W100.10", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpReverse1", addr: "W100.11", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpForward2", addr: "W100.12", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpReverse2", addr: "W100.13", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpTension01", addr: "W20", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpTension02", addr: "W21", type: "bcd", min: 0, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpSetTension1", addr: "W100.14", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "warpSetTension2", addr: "W100.15", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "autoTension", addr: "D406.00", type: "bool", min: 0, max: 1, dec: 0, cupd: false, plc: '1', val: null },
    { name: "autoOffset1", addr: "D408", type: "real", min: -999, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "autoOffset2", addr: "D410", type: "real", min: -999, max: 999, dec: 0, cupd: false, plc: '1', val: null },
    { name: "modeInt", addr: "W52", type: "int", min: 0, max: 10, dec: 0, cupd: false, plc: '1', val: null },
];
let dl;

function updateIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const netResults = {};
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!netResults[name]) {
                    netResults[name] = [];
                }
                netResults[name].push(net.address);
            }
        }
    }
    switch (process.platform) {
        case 'linux':
            ip.opIP = netResults['eth0'][0]
            break;
        case 'win32':
            ip.opIP = netResults['Ethernet'][0]
            break;
    }
}
function syncTime() {
    let dtTicks;
    let dtISO;
    client.plc1.clockRead(function (err, msg) {
        if (err) { }
        else {
            let dtOmron = msg.response.result;
            dtTicks = moment({ years: 2000 + dtOmron.year, months: dtOmron.month - 1, date: dtOmron.day, hours: dtOmron.hour, minutes: dtOmron.minute, seconds: dtOmron.second, milliseconds: 0 }).unix();
            dtISO = moment({ years: 2000 + dtOmron.year, months: dtOmron.month - 1, date: dtOmron.day, hours: dtOmron.hour, minutes: dtOmron.minute, seconds: dtOmron.second, milliseconds: 0 }).toISOString();
            switch (process.platform) {
                case 'linux':
                    sudo.exec("sudo date -s @" + dtTicks + " && sudo hwclock -w", options, (error, data, getter) => {
                    });
                    break;
                case 'win32':
                    sudo.exec("powershell -command \"$T = [datetime]::Parse(\\\"" + dtISO + "\\\"); Set-Date -Date $T\"", options, (error, data, getter) => {
                    });
                    break;
            }
        }
    });
}

function setLanguage(lang) {
    i18next.changeLanguage(lang, () => { })
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

    fs.readFile('./src/secret.json', 'utf8', (err, jsonString) => {
        pass = JSON.parse(jsonString);
    });
    ipcMain.on("changeSecret", (event, user, oldPassword, newPassword) => {
        win.webContents.send('passChanged', user, pass[user] === oldPassword);
        if (pass[user] === oldPassword) {
            pass[user] = newPassword;
            const jsonString = JSON.stringify(pass)
            fs.writeFile('./src/secret.json', jsonString, () => { });
        }
    });
    ipcMain.on("checkSecret", (event, user, password, remember) => {
        win.webContents.send('userChecked', user, pass[user] === password);
        if (pass[user] === password) win.webContents.send('userChanged', user, remember);
    });
    ipcMain.on("logOut", (event) => {
        win.webContents.send('userChanged', 'anon', true);
    });
    ipcMain.on("appLoaded", (event) => {
        win.webContents.send('langChanged', i18next.language);
        updateIP()
        win.webContents.send('ipChanged', ip);
        syncTime();
    });

    fs.readFile('./src/conf.json', 'utf8', (err, jsonString) => {
        const lngconf = JSON.parse(jsonString);
        i18next.init({
            lng: lngconf.lng,
            resources: require(`./src/lang.json`)
        });
        setLanguage(lngconf.lng);
    });
    ipcMain.on("langChange", (event, lang) => {
        setLanguage(lang);
    });

    ipcMain.on("datetimeSet", (event, dtTicks, dtISO, dtOmron) => {
        client.plc1.clockWrite(dtOmron, function (err, msg) {
            if (err) { console.log(err); }
        });
        switch (process.platform) {
            case 'linux':
                sudo.exec("sudo date -s @" + dtTicks + " && sudo hwclock -w", options, (error, data, getter) => {
                    win.webContents.send('datetimeChanged', !error);
                });
                break;
            case 'win32':
                sudo.exec("powershell -command \"$T = [datetime]::Parse(\\\"" + dtISO + "\\\"); Set-Date -Date $T\"", options, (error, data, getter) => {
                    win.webContents.send('datetimeChanged', !error);
                });
                break;
        }
    });

    ipcMain.on("reboot", (event) => {

        switch (process.platform) {
            case 'linux':
                sudo.exec("sudo reboot", options, (error, data, getter) => {
                    win.webContents.send('rebootResponse', !error);
                });
                break;
            case 'win32':
                sudo.exec("powershell -command \"Restart-Computer\"", options, (error, data, getter) => {
                    win.webContents.send('rebootResponse', !error);
                });
                break;
        }
    });

    fs.readFile('./src/ip.json', 'utf8', (err, jsonString) => {
        ip = JSON.parse(jsonString);
        updateIP();
        client.plc1 = fins.FinsClient(9600, ip.plcIP1, { SA1: 4, DA1: 0, timeout: 2000 });
        client.plc2 = fins.FinsClient(9600, ip.plcIP2, { SA1: 4, DA1: 0, timeout: 2000 });
        //client['plc1'].on('timeout', function (host) {
        //    console.log("PLC1 Got timeout from: ", host);
        //});
        //client['plc2'].on('timeout', function (host) {
        //    console.log("PLC2 Got timeout from: ", host);
        //});
        //client['plc1'].on('error', function (error) {
        //    console.log("PLC1 Error: ", error)
        //});
        //client['plc2'].on('error', function (error) {
        //    console.log("PLC2 Error: ", error)
        //});
    });
    ipcMain.on("ipChange", (event, type, value) => {

        switch (process.platform) {
            case 'linux':
                switch (type) {
                    case 'opIP':
                        sudo.exec("sudo ifconfig eth0" + value, options, (error, data, getter) => {
                            if (!error) {
                                ip.opIP = value;
                                const jsonString0 = JSON.stringify(ip)
                                fs.writeFile('./src/ip.json', jsonString0, () => { });
                                win.webContents.send('ipChanged', ip);
                            }
                        });
                        break;
                    case 'plcIP1':
                        ip.plcIP1 = value;
                        const jsonString1 = JSON.stringify(ip)
                        fs.writeFile('./src/ip.json', jsonString1, () => { });
                        client.plc1 = fins.FinsClient(9600, ip.plcIP1, { SA1: 4, DA1: 0, timeout: 2000 });
                        win.webContents.send('ipChanged', ip);
                        break;
                    case 'plcIP2':
                        ip.plcIP2 = value;
                        const jsonString2 = JSON.stringify(ip)
                        fs.writeFile('./src/ip.json', jsonString2, () => { });
                        client.plc2 = fins.FinsClient(9600, ip.plcIP2, { SA1: 4, DA1: 0, timeout: 2000 });
                        win.webContents.send('ipChanged', ip);
                        break;
                }
                break;
            case 'win32':
                switch (type) {
                    case 'opIP':
                        sudo.exec("powershell -command \"Remove-NetIPAddress -InterfaceAlias Ethernet -Confirm:$false; Remove-NetRoute -InterfaceAlias Ethernet -Confirm:$false; New-NetIPAddress -InterfaceAlias Ethernet -AddressFamily IPv4 " + value + " -PrefixLength 24 -Type Unicast  -Confirm:$false\"", options, (error, data, getter) => {
                            if (!error) {
                                ip.opIP = value;
                                const jsonString0 = JSON.stringify(ip)
                                fs.writeFile('./src/ip.json', jsonString0, () => { });
                                win.webContents.send('ipChanged', ip);
                            }
                            if (error) console.log(error.message)
                        });
                        break;
                    case 'plcIP1':
                        ip.plcIP1 = value;
                        const jsonString1 = JSON.stringify(ip)
                        fs.writeFile('./src/ip.json', jsonString1, () => { });
                        client.plc1 = fins.FinsClient(9600, ip.plcIP1, { SA1: 4, DA1: 0, timeout: 2000 });
                        win.webContents.send('ipChanged', ip);
                        break;
                    case 'plcIP2':
                        ip.plcIP2 = value;
                        const jsonString2 = JSON.stringify(ip)
                        fs.writeFile('./src/ip.json', jsonString2, () => { });
                        client.plc2 = fins.FinsClient(9600, ip.plcIP2, { SA1: 4, DA1: 0, timeout: 2000 });
                        win.webContents.send('ipChanged', ip);
                        break;
                }
                break;
        }
    });

    ipcMain.on("tagsUpdSelect", (event, arr) => {
        tags.forEach(function (e, i) {
            if (e.name === "mode" || arr.includes(e.name)) {
                this[i].cupd = true;
            }
            else {
                this[i].cupd = false;
            }
        }, tags);
    });

    ipcMain.on("plcRead", (event, arr) => {
        arr.forEach(function (name) {
            let item = tags.find(e => e.name === name);
            switch (item.type) {
                case "lreal":
                    dl = 4;
                    break;
                case "real":
                case "dword":
                    dl = 2;
                    break;
                case "int":
                case "bcd":
                case "mode":
                case "bool":
                    dl = 1;
                    break;
            }
            client['plc' + item.plc].read(item.addr, dl, cb, item);
        });
    })
    ipcMain.on("plcWrite", (event, name, value) => {
        let item = tags.find(e => e.name === name);
        switch (item.type) {
            case "bool":
                client['plc' + item.plc].write(item.addr, value ? 1 : 0, function (err, msg) {
                    if (err) { }
                });
                break;
            case "int":
                client['plc' + item.plc].write(item.addr, value, function (err, msg) {
                    if (err) { }
                });
                break;

            case "bcd":

                client['plc' + item.plc].write(item.addr, parseInt(value.toString(10), 16), function (err, msg) {
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
                client['plc' + item.plc].write(item.addr, [words[0], words[1]], function (err, msg) {
                    if (err) { }
                });
                break;

            case "lreal":
                var lfarr = new Float64Array(1);
                var lbytes = new Uint8Array(lfarr.buffer);
                var lwords = new Uint16Array(4);
                lfarr[0] = value;
                lwords[0] = (lbytes[1] << 8) | lbytes[0];
                lwords[1] = (lbytes[3] << 8) | lbytes[2];
                lwords[2] = (lbytes[5] << 8) | lbytes[4];
                lwords[3] = (lbytes[7] << 8) | lbytes[6];
                //console.log(value, '\t', item.name, '\t', item.addr, '\t', bytes, '\t', words);
                client['plc' + item.plc].write(item.addr, [lwords[0], lwords[1], lwords[2], lwords[3]], function (err, msg) {
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
        clearInterval(syncTimer)
        client = {}
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

process.on('uncaughtException', function (error) {
    // Handle the error
});

let syncTimer = setInterval(() => {
    syncTime();
}, 5 * 60 * 1000)

let intervalTimer = setInterval(() => {
    if (typeof client !== 'undefined') {
        tags.forEach(function (e) {
            if (e.cupd) {
                switch (e.type) {
                    case "lreal":
                        dl = 4;
                        break;
                    case "real":
                    case "dword":
                        dl = 2;
                        break;
                    case "int":
                    case "bool":
                    case "bcd":
                    case "mode":
                        dl = 1;
                        break;

                }
                client['plc' + e.plc].read(e.addr, dl, cb, e);
            }
        });
    }
}, 100)

var cb = function (err, msg) {
    if (err) {
        //    console.error(err);
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
                win.webContents.send('plcReply', msg.response.values[0] === 0 ? false : true, msg.tag);
                //console.log(new Date().toISOString(), '\t', msg.response.values[0] === 0 ? "\x1b[31mПОДНЯТА" : "\x1b[32mОПУЩЕНА", '\x1b[0m\t', msg.tag.name, '\t');
                break;

            case "int":
                win.webContents.send('plcReply', msg.response.values[0], msg.tag);
                //console.log(new Date().toISOString(), '\t', msg.response.values[0], '\t', msg.tag.name, '\t');
                break;

            case "bcd":
                win.webContents.send('plcReply', parseInt(msg.response.values[0].toString(16), 10), msg.tag);
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

            case "lreal":
                var lbuf = new ArrayBuffer(8);
                var lbytes = new Uint8Array(lbuf);
                lbytes[7] = (msg.response.values[0] & 0x00ff);
                lbytes[6] = (msg.response.values[0] & 0xff00) >> 8;
                lbytes[5] = (msg.response.values[1] & 0x00ff);
                lbytes[4] = (msg.response.values[1] & 0xff00) >> 8;
                lbytes[3] = (msg.response.values[2] & 0x00ff);
                lbytes[2] = (msg.response.values[2] & 0xff00) >> 8;
                lbytes[1] = (msg.response.values[3] & 0x00ff);
                lbytes[0] = (msg.response.values[3] & 0xff00) >> 8;
                var lview = new DataView(buf);
                win.webContents.send('plcReply', Number(lview.getFloat64(0, false).toFixed(msg.tag.dec)), msg.tag);
                //console.log(new Date().toISOString(), '\t', Number(view.getFloat32(0, false).toFixed(1)), '\t', msg.tag.name, '\t');
                break;

        }
};