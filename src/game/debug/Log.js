const OFFLEVEL = 0;
const DEBUGLEVEL = 1;
const ERRORLEVEL = 2;

let logLevel = DEBUGLEVEL;

if (logLevel === OFFLEVEL) {
    console.log = function () { };
    console.error = function () { };
}

function log(n) {
    (logLevel === DEBUGLEVEL) && console.log(n);
}

function error(n) {
    (logLevel === ERRORLEVEL) && console.error(n);
}

export { log, error };