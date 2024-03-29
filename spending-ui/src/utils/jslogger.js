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

// Logger.debug(“Cache set to”, {value}, Framework.Cache)

class Framework {

    // FRAMEWORK_COMPONENT_COLORS = {
    //     [Framework.PT]: 'MediumTurquoise',
    //     [Framwork.Debug]: 'White',
    //     [Framework.Error]: 'Red',
    // };

    getStyles = () => {
        return(
        "border-radius: 25px;" +
        "background: MediumTurquoise;" +
        "padding: 5px;" +
        "color: DarkBlue"
        )
    }

    getErrorStyles = () => {
        return(
            "border-radius: 25px;" +
            "background: Red;" +
            "padding: 5px;" +
            "color: Yellow"
        )
    }

    getPTStyles = () => {
        return(
            "border-radius: 25px;" +
            "background: #73AD21;" +
            "padding: 5px;"
        )
    }

    debug = (msg) => {
        console.log("%c%s", "color: DodgerBlue", msg);
    }

    info = (msg) => {
        // console.clear();
        // const stackTrace = Error().stack.split('\n    at ').slice(1);
        // console.log(msg, `triggered by ${stackTrace}`);
        // console.log(Error().stack);
        // console.log(msg, `\n\ntriggered by ${stackTrace}`);
        // {stackTrace.forEach((item) => {
        //     console.log("Item: ", item);
        // })}
        // const stackInfo = stackTrace.at(1);
        // const ndxStart = stackInfo.indexOf('.');
        // const ndxEnd = stackInfo.indexOf(')');
        // const stackData = stackInfo.slice(ndxStart, ndxEnd);
        console.log("%c%s", this.getStyles(), msg);
    }

    pt = (msg) => {
        console.log("%c%s", this.getPTStyles(), msg);
    }

    error = (msg) => {
        console.log("%c%s", this.getErrorStyles(), msg);
    }
}

// const Logger = new Framework();
// Logger.info('Logger start');
// Logger.info('Startup for new logging system.');
// Logger.pt("Processed Transactions")
// Logger.debug("Debug Message");
// Logger.error("Error Message")

function debug(msg) {
    const stackTrace = Error().stack.split('\n    at ').slice(1);
    console.log(msg, `\n\ntriggered by ${stackTrace.at(-1)}`);
}


/*

import jslogger from '../../utils/jslogger.js';
jslogger.setLevelToVerbose(false);
jslogger.setUseTimestamp(false);


try {
    jslogger.info(process, message);
    jslogger.warning(process, message);
    jslogger.error(process, message);
    jslogger.success(process, message);
    jslogger.internal(process, message);
    jslogger.debug(process, message);
} catch (err) {
  console.error(err);
}

jslogger.setLevelToVerbose(true);

jslogger.internal('Authentication', 'User with email su****************.com just logged in.');

jslogger.downloadLogs()

    const log = (...args) => {
        jsLogger.info('category-component', args);
    }


 */


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

const ColorDefinitions = [
    {"name": "BlueViolet",  "value": "#812be2"},
    {"name": "CadetBlue",  "value": "#5f9ea0"},
    {"name": "DarkCyan",  "value": "#008B8B"},
    {"name": "DaryGray",  "value": "#A9a9a9"},
    {"name": "DarkKhaki",  "value": "#Bdb76b"},
    {"name": "DarkOrange",  "value": "#FF8c00"},
    {"name": "DarkOrchid",  "value": "#9932cc"},
    {"name": "DarkSeaGreen",  "value": "#8fbc8f"},
    {"name": "DarkSlateGray",  "value": "#2f4f4f"},
    {"name": "DodgerBlue",  "value": "#1e90ff"},
    {"name": "FireBrick",  "value": "#b22222"},
    {"name": "GreenYellow",  "value": "#Adff2f"},
    {"name": "MediumPurple",  "value": "#9370db"},
    {"name": "MidnightBlue",  "value": "#191970"},
    {"name": "BurlyWood",  "value": "#DEB887"},
]

const jsLogger = {
    VERBOSE: false,
    appName: 'JSLOGGER',
    objLogs: '',
    useTimestamp: true,

    _log(process, level, message) {
        const colorLevel = {
            "info": "BurlyWood",
            "debug": "DarkSeaGreen",
            "success": "DarkSeaGreen",
            "warning": "DarkOrange",
            "error": "FireBrick"
        };

        const printLogOrig = `${utc(new Date())} | ${this.appName} | [${process}] :: ${message}`;
        var printLog = `${utc(new Date())} | ${process} :: ${message}`;
        if (!this.useTimestamp) {
            printLog = `${process} :: ${message}`;
        }
        this.objLogs += printLog + "\n";

        var useColor = '';
        if(typeof level === "string") {
            useColor = colorLevel[level];
        } else {
            useColor = ColorDefinitions[level]["value"];
        }

        if (typeof console.log === "function") {
            if (typeof console.log.apply === "function") {
                console.log.apply(console, [`%c ${printLog}`, `color:${useColor}`]);
            } else {
                console.log(message);
                console.log(`%c ${message}`, `color:${useColor}`);
            }
        }
    },

    custom(process, color_index, ...message) {
        // this._log(process, parseInt(color_index), message);
        console.log(Array.prototype.slice.call(arguments[2]));
    },

    info(process, message) {
        // console.log("Info")
        this._log(process, "info", message);
    },

    error(process, message) {
        this._log(process, "error", message);
    },

    success(process, message) {
        this._log(process, "success", message);
    },

    warning(process, message) {
        this._log(process, "warning", message);
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
        jsLogger.useIE11 = true;
        jsLogger.warning("Initialize ", "Internet Explorer 11 detected. You need to load ES6-shim in order to work (IE11-compat)");
    }
} catch (err) {
    console.log("Please ignore it...", err);
}

export default jsLogger;
