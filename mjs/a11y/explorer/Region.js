import { CssStyles } from '../../util/StyleList.js';
import { Sre } from '../sre.js';
export class AbstractRegion {
    constructor(document) {
        this.document = document;
        this.CLASS = this.constructor;
        this.AddStyles();
        this.AddElement();
    }
    AddStyles() {
        if (this.CLASS.styleAdded) {
            return;
        }
        let node = this.document.adaptor.node('style');
        node.innerHTML = this.CLASS.style.cssText;
        this.document.adaptor.head(this.document.adaptor.document).
            appendChild(node);
        this.CLASS.styleAdded = true;
    }
    AddElement() {
        let element = this.document.adaptor.node('div');
        element.classList.add(this.CLASS.className);
        element.style.backgroundColor = 'white';
        this.div = element;
        this.inner = this.document.adaptor.node('div');
        this.div.appendChild(this.inner);
        this.document.adaptor.
            body(this.document.adaptor.document).
            appendChild(this.div);
    }
    Show(node, highlighter) {
        this.position(node);
        this.highlight(highlighter);
        this.div.classList.add(this.CLASS.className + '_Show');
    }
    Hide() {
        this.div.classList.remove(this.CLASS.className + '_Show');
    }
    stackRegions(node) {
        const rect = node.getBoundingClientRect();
        let baseBottom = 0;
        let baseLeft = Number.POSITIVE_INFINITY;
        let regions = this.document.adaptor.document.getElementsByClassName(this.CLASS.className + '_Show');
        for (let i = 0, region; region = regions[i]; i++) {
            if (region !== this.div) {
                baseBottom = Math.max(region.getBoundingClientRect().bottom, baseBottom);
                baseLeft = Math.min(region.getBoundingClientRect().left, baseLeft);
            }
        }
        const bot = (baseBottom ? baseBottom : rect.bottom + 10) + window.pageYOffset;
        const left = (baseLeft < Number.POSITIVE_INFINITY ? baseLeft : rect.left) + window.pageXOffset;
        this.div.style.top = bot + 'px';
        this.div.style.left = left + 'px';
    }
}
AbstractRegion.styleAdded = false;
export class DummyRegion extends AbstractRegion {
    Clear() { }
    Update() { }
    Hide() { }
    Show() { }
    AddElement() { }
    AddStyles() { }
    position() { }
    highlight(_highlighter) { }
}
export class StringRegion extends AbstractRegion {
    Clear() {
        this.Update('');
        this.inner.style.top = '';
        this.inner.style.backgroundColor = '';
    }
    Update(speech) {
        this.inner.textContent = '';
        this.inner.textContent = speech;
    }
    position(node) {
        this.stackRegions(node);
    }
    highlight(highlighter) {
        const color = highlighter.colorString();
        this.inner.style.backgroundColor = color.background;
        this.inner.style.color = color.foreground;
    }
}
export class ToolTip extends StringRegion {
}
ToolTip.className = 'MJX_ToolTip';
ToolTip.style = new CssStyles({
    ['.' + ToolTip.className]: {
        position: 'absolute', display: 'inline-block',
        height: '1px', width: '1px'
    },
    ['.' + ToolTip.className + '_Show']: {
        width: 'auto', height: 'auto', opacity: 1, 'text-align': 'center',
        'border-radius': '6px', padding: '0px 0px',
        'border-bottom': '1px dotted black', position: 'absolute',
        'z-index': 202
    }
});
export class LiveRegion extends StringRegion {
    constructor(document) {
        super(document);
        this.document = document;
        this.div.setAttribute('aria-live', 'assertive');
    }
}
LiveRegion.className = 'MJX_LiveRegion';
LiveRegion.style = new CssStyles({
    ['.' + LiveRegion.className]: {
        position: 'absolute', top: '0', height: '1px', width: '1px',
        padding: '1px', overflow: 'hidden'
    },
    ['.' + LiveRegion.className + '_Show']: {
        top: '0', position: 'absolute', width: 'auto', height: 'auto',
        padding: '0px 0px', opacity: 1, 'z-index': '202',
        left: 0, right: 0, 'margin': '0 auto',
        'background-color': 'rgba(0, 0, 255, 0.2)', 'box-shadow': '0px 5px 20px #888',
        border: '2px solid #CCCCCC'
    }
});
const ProsodyKeys = ['pitch', 'rate', 'volume'];
export class SpeechRegion extends LiveRegion {
    constructor() {
        super(...arguments);
        this.active = false;
        this.node = null;
        this.clear = false;
        this.highlighter = Sre.getHighlighter({ color: 'red' }, { color: 'black' }, { renderer: this.document.outputJax.name, browser: 'v3' });
    }
    Show(node, highlighter) {
        this.node = node;
        super.Show(node, highlighter);
    }
    Update(speech) {
        this.active = this.document.options.a11y.voicing &&
            !!speechSynthesis.getVoices().length;
        speechSynthesis.cancel();
        this.clear = true;
        let [text, ssml] = this.ssmlParsing(speech);
        super.Update(text);
        if (this.active && text) {
            this.makeUtterances(ssml, this.document.options.sre.locale);
        }
    }
    makeUtterances(ssml, locale) {
        let utterance = null;
        for (let utter of ssml) {
            if (utter.mark) {
                if (!utterance) {
                    this.highlightNode(utter.mark, true);
                    continue;
                }
                utterance.addEventListener('end', (_event) => {
                    this.highlightNode(utter.mark);
                });
                continue;
            }
            if (utter.pause) {
                let time = parseInt(utter.pause.match(/^[0-9]+/)[0]);
                if (isNaN(time) || !utterance) {
                    continue;
                }
                utterance.addEventListener('end', (_event) => {
                    speechSynthesis.pause();
                    setTimeout(() => {
                        speechSynthesis.resume();
                    }, time);
                });
                continue;
            }
            utterance = new SpeechSynthesisUtterance(utter.text);
            if (utter.rate) {
                utterance.rate = utter.rate;
            }
            if (utter.pitch) {
                utterance.pitch = utter.pitch;
            }
            utterance.lang = locale;
            speechSynthesis.speak(utterance);
        }
        if (utterance) {
            utterance.addEventListener('end', (_event) => {
                this.highlighter.unhighlight();
            });
        }
    }
    highlightNode(id, init = false) {
        this.highlighter.unhighlight();
        let nodes = Array.from(this.node.querySelectorAll(`[data-semantic-id="${id}"]`));
        if (!this.clear || init) {
            this.highlighter.highlight(nodes);
        }
        this.clear = false;
    }
    ssmlParsing(speech) {
        let dp = new DOMParser();
        let xml = dp.parseFromString(speech, 'text/xml');
        let instr = [];
        let text = [];
        this.recurseSsml(Array.from(xml.documentElement.childNodes), instr, text);
        return [text.join(' '), instr];
    }
    recurseSsml(nodes, instr, text, prosody = {}) {
        for (let node of nodes) {
            if (node.nodeType === 3) {
                let content = node.textContent.trim();
                if (content) {
                    text.push(content);
                    instr.push(Object.assign({ text: content }, prosody));
                }
                continue;
            }
            if (node.nodeType === 1) {
                let element = node;
                let tag = element.tagName;
                if (tag === 'speak') {
                    continue;
                }
                if (tag === 'prosody') {
                    this.recurseSsml(Array.from(node.childNodes), instr, text, this.getProsody(element, prosody));
                    continue;
                }
                switch (tag) {
                    case 'break':
                        instr.push({ pause: element.getAttribute('time') });
                        break;
                    case 'mark':
                        instr.push({ mark: element.getAttribute('name') });
                        break;
                    case 'say-as':
                        let txt = element.textContent;
                        instr.push(Object.assign({ text: txt, character: true }, prosody));
                        text.push(txt);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    getProsody(element, prosody) {
        let combine = {};
        for (let pros of ProsodyKeys) {
            if (element.hasAttribute(pros)) {
                let [sign, value] = SpeechRegion.extractProsody(element.getAttribute(pros));
                if (!sign) {
                    combine[pros] = (pros === 'volume') ? .5 : 1;
                    continue;
                }
                let orig = prosody[pros];
                orig = orig ? orig : ((pros === 'volume') ? .5 : 1);
                let relative = SpeechRegion.combinePros[pros](parseInt(value, 10), sign);
                combine[pros] = (sign === '-') ? orig - relative : orig + relative;
            }
        }
        return combine;
    }
    static extractProsody(attr) {
        let match = attr.match(SpeechRegion.prosodyRegexp);
        if (!match) {
            console.warn('Something went wrong with the prosody matching.');
            return ['', '100'];
        }
        return [match[1], match[2]];
    }
}
SpeechRegion.combinePros = {
    pitch: (x, _sign) => 1 * (x / 100),
    volume: (x, _sign) => .5 * (x / 100),
    rate: (x, _sign) => 1 * (x / 100)
};
SpeechRegion.prosodyRegexp = /([\+|-]*)([0-9]+)%/;
export class HoverRegion extends AbstractRegion {
    constructor(document) {
        super(document);
        this.document = document;
        this.inner.style.lineHeight = '0';
    }
    position(node) {
        const nodeRect = node.getBoundingClientRect();
        const divRect = this.div.getBoundingClientRect();
        const xCenter = nodeRect.left + (nodeRect.width / 2);
        let left = xCenter - (divRect.width / 2);
        left = (left < 0) ? 0 : left;
        left = left + window.pageXOffset;
        let top;
        switch (this.document.options.a11y.align) {
            case 'top':
                top = nodeRect.top - divRect.height - 10;
                break;
            case 'bottom':
                top = nodeRect.bottom + 10;
                break;
            case 'center':
            default:
                const yCenter = nodeRect.top + (nodeRect.height / 2);
                top = yCenter - (divRect.height / 2);
        }
        top = top + window.pageYOffset;
        top = (top < 0) ? 0 : top;
        this.div.style.top = top + 'px';
        this.div.style.left = left + 'px';
    }
    highlight(highlighter) {
        if (this.inner.firstChild &&
            !this.inner.firstChild.hasAttribute('sre-highlight')) {
            return;
        }
        const color = highlighter.colorString();
        this.inner.style.backgroundColor = color.background;
        this.inner.style.color = color.foreground;
    }
    Show(node, highlighter) {
        this.div.style.fontSize = this.document.options.a11y.magnify;
        this.Update(node);
        super.Show(node, highlighter);
    }
    Clear() {
        this.inner.textContent = '';
        this.inner.style.top = '';
        this.inner.style.backgroundColor = '';
    }
    Update(node) {
        this.Clear();
        let mjx = this.cloneNode(node);
        this.inner.appendChild(mjx);
    }
    cloneNode(node) {
        let mjx = node.cloneNode(true);
        if (mjx.nodeName !== 'MJX-CONTAINER') {
            if (mjx.nodeName !== 'g') {
                mjx.style.marginLeft = mjx.style.marginRight = '0';
            }
            let container = node;
            while (container && container.nodeName !== 'MJX-CONTAINER') {
                container = container.parentNode;
            }
            if (mjx.nodeName !== 'MJX-MATH' && mjx.nodeName !== 'svg') {
                const child = container.firstChild;
                mjx = child.cloneNode(false).appendChild(mjx).parentNode;
                if (mjx.nodeName === 'svg') {
                    mjx.firstChild.setAttribute('transform', 'matrix(1 0 0 -1 0 0)');
                    const W = parseFloat(mjx.getAttribute('viewBox').split(/ /)[2]);
                    const w = parseFloat(mjx.getAttribute('width'));
                    const { x, y, width, height } = node.getBBox();
                    mjx.setAttribute('viewBox', [x, -(y + height), width, height].join(' '));
                    mjx.removeAttribute('style');
                    mjx.setAttribute('width', (w / W * width) + 'ex');
                    mjx.setAttribute('height', (w / W * height) + 'ex');
                    container.setAttribute('sre-highlight', 'false');
                }
            }
            mjx = container.cloneNode(false).appendChild(mjx).parentNode;
            mjx.style.margin = '0';
        }
        return mjx;
    }
}
HoverRegion.className = 'MJX_HoverRegion';
HoverRegion.style = new CssStyles({
    ['.' + HoverRegion.className]: {
        position: 'absolute', height: '1px', width: '1px',
        padding: '1px', overflow: 'hidden'
    },
    ['.' + HoverRegion.className + '_Show']: {
        position: 'absolute', width: 'max-content', height: 'auto',
        padding: '0px 0px', opacity: 1, 'z-index': '202', 'margin': '0 auto',
        'background-color': 'rgba(0, 0, 255, 0.2)',
        'box-shadow': '0px 10px 20px #888', border: '2px solid #CCCCCC'
    }
});
//# sourceMappingURL=Region.js.map