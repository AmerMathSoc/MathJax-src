const CDN = new Map([
    ['cdnjs.cloudflare.com', {
            api: 'https://api.cdnjs.com/libraries/mathjax?fields=version',
            key: 'version',
            base: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/'
        }],
    ['rawcdn.githack.com', {
            api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
            key: 'tag_name',
            base: 'https://rawcdn.githack.com/mathjax/MathJax/'
        }],
    ['gitcdn.xyz', {
            api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
            key: 'tag_name',
            base: 'https://gitcdn.xyz/mathjax/MathJax/'
        }],
    ['cdn.statically.io', {
            api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
            key: 'tag_name',
            base: 'https://cdn.statically.io/gh/mathjax/MathJax/'
        }],
    ['unpkg.com', {
            api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
            key: 'tag_name',
            base: 'https://unpkg.com/mathjax@'
        }],
    ['cdn.jsdelivr.net', {
            api: 'https://api.github.com/repos/mathjax/mathjax/releases/latest',
            key: 'tag_name',
            base: 'https://cdn.jsdelivr.net/npm/mathjax@'
        }]
]);
const GITHUB = {
    api: 'https://api.github.com/repos/mathjax/mathjax/releases',
    key: 'tag_name'
};
const MJX_VERSION = 3;
const MJX_LATEST = 'mjx-latest-version';
const SAVE_TIME = 1000 * 60 * 60 * 24 * 7;
let script = null;
function Error(message) {
    if (console && console.error) {
        console.error('MathJax(latest.js): ' + message);
    }
}
function scriptData(script, cdn = null) {
    script.parentNode.removeChild(script);
    let src = script.src;
    let file = src.replace(/.*?\/latest\.js(\?|$)/, '');
    if (file === '') {
        file = 'startup.js';
        src = src.replace(/\?$/, '') + '?' + file;
    }
    const version = (src.match(/(\d+\.\d+\.\d+)(\/es\d+)?\/latest.js\?/) || ['', ''])[1];
    const dir = (src.match(/(\/es\d+)\/latest.js\?/) || ['', ''])[1] || '';
    return {
        tag: script,
        src: src,
        id: script.id,
        version: version,
        dir: dir,
        file: file,
        cdn: cdn
    };
}
function checkScript(script) {
    for (const server of CDN.keys()) {
        const cdn = CDN.get(server);
        const url = cdn.base;
        const src = script.src;
        if (src && src.substr(0, url.length) === url && src.match(/\/latest\.js(\?|$)/)) {
            return scriptData(script, cdn);
        }
    }
    return null;
}
function getScript() {
    if (document.currentScript) {
        return scriptData(document.currentScript);
    }
    const script = document.getElementById('MathJax-script');
    if (script && script.nodeName.toLowerCase() === 'script') {
        return checkScript(script);
    }
    const scripts = document.getElementsByTagName('script');
    for (const script of Array.from(scripts)) {
        const data = checkScript(script);
        if (data) {
            return data;
        }
    }
    return null;
}
function saveVersion(version) {
    try {
        const data = version + ' ' + Date.now();
        localStorage.setItem(MJX_LATEST, data);
    }
    catch (err) { }
}
function getSavedVersion() {
    try {
        const [version, date] = localStorage.getItem(MJX_LATEST).split(/ /);
        if (date && Date.now() - parseInt(date) < SAVE_TIME) {
            return version;
        }
    }
    catch (err) { }
    return null;
}
function loadMathJax(url, id) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    if (id) {
        script.id = id;
    }
    const head = document.head || document.getElementsByTagName('head')[0] || document.body;
    if (head) {
        head.appendChild(script);
    }
    else {
        Error('Can\'t find the document <head> element');
    }
}
function loadDefaultMathJax() {
    if (script) {
        loadMathJax(script.src.replace(/\/latest\.js\?/, '/'), script.id);
    }
    else {
        Error('Can\'t determine the URL for loading MathJax');
    }
}
function loadVersion(version) {
    if (script.version && script.version !== version) {
        script.file = 'latest.js?' + script.file;
    }
    loadMathJax(script.cdn.base + version + script.dir + '/' + script.file, script.id);
}
function checkVersion(version) {
    const major = parseInt(version.split(/\./)[0]);
    if (major === MJX_VERSION && !version.match(/-(beta|rc)/)) {
        saveVersion(version);
        loadVersion(version);
        return true;
    }
    return false;
}
function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    if (window.ActiveXObject) {
        try {
            return new window.ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (err) { }
        try {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        }
        catch (err) { }
    }
    return null;
}
function requestXML(cdn, action, failure) {
    const request = getXMLHttpRequest();
    if (request) {
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    !action(JSON.parse(request.responseText)) && failure();
                }
                else {
                    Error('Problem acquiring MathJax version: status = ' + request.status);
                    failure();
                }
            }
        };
        request.open('GET', cdn.api, true);
        request.send(null);
    }
    else {
        Error('Can\'t create XMLHttpRequest object');
        failure();
    }
}
function loadLatestGitVersion() {
    requestXML(GITHUB, (json) => {
        if (!(json instanceof Array))
            return false;
        for (const data of json) {
            if (checkVersion(data[GITHUB.key])) {
                return true;
            }
        }
        return false;
    }, loadDefaultMathJax);
}
function loadLatestCdnVersion() {
    requestXML(script.cdn, function (json) {
        if (json instanceof Array) {
            json = json[0];
        }
        if (!checkVersion(json[script.cdn.key])) {
            loadLatestGitVersion();
        }
        return true;
    }, loadDefaultMathJax);
}
export function loadLatest() {
    script = getScript();
    if (script && script.cdn) {
        const version = getSavedVersion();
        version ?
            loadVersion(version) :
            loadLatestCdnVersion();
    }
    else {
        loadDefaultMathJax();
    }
}
//# sourceMappingURL=latest.js.map