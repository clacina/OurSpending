/*
 * JS Logger
 * Lightweight JavaScript Logger for the browser and node.
 * It is a perfect logger that supports all browsers.
 * It allows to print color logs with pre-defined 5 levels of logging
 * It has a debug mode in which you can print logs during dev and then set it to false to avoid printing confidential logs during production
 * Website: https://github.com/suhaibjanjua/colorjslogger
 * Copyright: (c) 2019 Suhaib Janjua
 * License: MIT
 */
const utc = (now) =>
    now.toDateString() +
    " " +
    ("0" + now.getHours()).slice(-2) +
    ":" +
    ("0" + now.getMinutes()).slice(-2) +
    ":" +
    ("0" + now.getSeconds()).slice(-2);


/*
    Colors: https://www.w3schools.com/tags/ref_colornames.asp

    BlueViolet #812be2
    CadetBlue #5f9ea0
    DarkCyan #008B8B
    DaryGray #A9a9a9
    DarkKhaki #Bdb76b
    DarkOrange #FF8c00
    DarkOrchid #9932cc
    DarkSeaGreen #8fbc8f
    DarkSlateGray #2f4f4f
    DogerBlue #1e90ff
    FireBrick #b22222
    GreenYellow #Adff2f
    MediumPurple #9370db
    MidnightBlue #191970
    BurlyWood #DEB887
 */


const jslogger = {
    VERBOSE: false,
    appName: 'JSLOGGER',
    objLogs: '',
    useTimestamp: true,

    _log(process, message, level) {
        const colorLevel = {
            "info": "BurlyWood",
            "debug": "DarkSeaGreen",
            "success": "DarkSeaGreen",
            "warning": "DarkOrange",
            "error": "FireBrick"
        };

        const printLogOrig = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
        var printLog = `${utc(new Date())} | ${process} :: ${message}`;
        if(!this.useTimestamp) {
            printLog = `${process} :: ${message}`;
        }
        this.objLogs += printLog + "\n";

        if (typeof console.log === "function") {
            if (typeof console.log.apply === "function") {
                console.log.apply(console, [`%c ${printLog}`, `color:${colorLevel[level]}`]);
            } else {
                console.log(`%c ${printLog}`, `color:${colorLevel[level]}`);
            }
        }
    },

    info(process, message) {
        this._log(process, message, "info");
    },

    error(process, message) {
        this._log(process, message, "error");
    },

    success(process, message) {
        this._log(process, message, "success");
    },

    warning(process, message) {
        this._log(process, message, "warning");
    },

    internal(process, message) {
        const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
        this.objLogs += printLog + "\n";
    },

    debug(process, message) {
        if (this.VERBOSE) {
            this._log(process, message, "debug");
        } else {
            const printLog = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
            this.objLogs += printLog + "\n";
        }
    },

    downloadLogs() {
        const a = document.createElement('a');
        const file = new Blob([this.objLogs], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = `${this.appName}-${utc(new Date())}.log`;
        a.click();
    },

    setLevelToVerbose(isVerbose) {
        this.VERBOSE = isVerbose;
    },

    setUseTimestamp(use) {
        this.useTimestamp = use;
    },

    setAppName(name) {
        this.appName = name;
    },

    version() {
        return "1.4.0";
    },

    about() {
        return "Website: https://github.com/suhaibjanjua/colorjslogger \n Copyright: (c) 2019 Suhaib Janjua";
    },
};

try {
    if (navigator.appName === "Microsoft Internet Explorer" || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv 11/))) {
        jslogger.useIE11 = true;
        jslogger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)");
    }
} catch (err) {
    console.log("Please ignore it...", err);
}

export default jslogger;
