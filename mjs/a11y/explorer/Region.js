import { StyleJsonSheet } from '../../util/StyleJson.js';
import * as Sre from '../sre.js';
import { buildSpeech } from '../speech/SpeechUtil.js';
export class AbstractRegion {
    constructor(document) {
        this.document = document;
        this.CLASS = this.constructor;
        this.AddStyles();
    }
    AddStyles() {
        if (this.CLASS.styleAdded) {
            return;
        }
        const node = this.document.adaptor.node('style');
        node.innerHTML = this.CLASS.style.cssText;
        this.document.adaptor
            .head(this.document.adaptor.document)
            .appendChild(node);
        this.CLASS.styleAdded = true;
    }
    AddElement() {
        if (this.div)
            return;
        const element = this.document.adaptor.node('div');
        element.classList.add(this.CLASS.className);
        this.div = element;
        this.inner = this.document.adaptor.node('div');
        this.div.appendChild(this.inner);
        this.document.adaptor
            .body(this.document.adaptor.document)
            .appendChild(this.div);
    }
    Show(node, highlighter) {
        this.AddElement();
        this.position(node);
        this.highlight(highlighter);
        this.div.classList.add(this.CLASS.className + '_Show');
    }
    Hide() {
        if (!this.div)
            return;
        this.div.parentNode.removeChild(this.div);
        this.div = null;
        this.inner = null;
    }
    stackRegions(node) {
        const rect = node.getBoundingClientRect();
        let baseBottom = 0;
        let baseLeft = Number.POSITIVE_INFINITY;
        const regions = this.document.adaptor.document.getElementsByClassName(this.CLASS.className + '_Show');
        for (let i = 0, region; (region = regions[i]); i++) {
            if (region !== this.div) {
                baseBottom = Math.max(region.getBoundingClientRect().bottom, baseBottom);
                baseLeft = Math.min(region.getBoundingClientRect().left, baseLeft);
            }
        }
        const bot = (baseBottom ? baseBottom : rect.bottom + 10) + window.scrollY;
        const left = (baseLeft < Number.POSITIVE_INFINITY ? baseLeft : rect.left) +
            window.scrollX;
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
        if (!this.div)
            return;
        this.Update('');
        this.inner.style.top = '';
        this.inner.style.backgroundColor = '';
    }
    Update(speech) {
        if (speech) {
            this.AddElement();
        }
        if (this.inner) {
            this.inner.textContent = '';
            this.inner.textContent = speech;
        }
    }
    position(node) {
        this.stackRegions(node);
    }
    highlight(highlighter) {
        if (!this.div)
            return;
        const color = highlighter.colorString();
        this.inner.style.backgroundColor = color.background;
        this.inner.style.color = color.foreground;
    }
}
export class ToolTip extends StringRegion {
}
ToolTip.className = 'MJX_ToolTip';
ToolTip.style = new StyleJsonSheet({
    ['.' + ToolTip.className]: {
        width: 'auto',
        height: 'auto',
        opacity: 1,
        'text-align': 'center',
        'border-radius': '6px',
        padding: 0,
        'border-bottom': '1px dotted black',
        position: 'absolute',
        display: 'inline-block',
        'background-color': 'white',
        'z-index': 202,
    },
});
export class LiveRegion extends StringRegion {
}
LiveRegion.className = 'MJX_LiveRegion';
LiveRegion.style = new StyleJsonSheet({
    ['.' + LiveRegion.className]: {
        position: 'absolute',
        top: 0,
        display: 'none',
        width: 'auto',
        height: 'auto',
        padding: 0,
        opacity: 1,
        'z-index': '202',
        left: 0,
        right: 0,
        margin: '0 auto',
        'background-color': 'white',
        'box-shadow': '0px 5px 20px #888',
        border: '2px solid #CCCCCC',
    },
    ['.' + LiveRegion.className + '_Show']: {
        display: 'block',
    },
});
export class SpeechRegion extends LiveRegion {
    constructor() {
        super(...arguments);
        this.active = false;
        this.node = null;
        this.clear = false;
        this.highlighter = Sre.getHighlighter({ color: 'red' }, { color: 'black' }, { renderer: this.document.outputJax.name, browser: 'v3' });
        this.voiceRequest = false;
    }
    Show(node, highlighter) {
        super.Update('\u00a0');
        this.node = node;
        super.Show(node, highlighter);
    }
    Update(speech) {
        if (this.voiceRequest) {
            this.makeVoice(speech);
            return;
        }
        speechSynthesis.onvoiceschanged = (() => (this.voiceRequest = true)).bind(this);
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                if (this.voiceRequest) {
                    resolve(true);
                }
                else {
                    setTimeout(() => {
                        this.voiceRequest = true;
                        resolve(true);
                    }, 100);
                }
            }, 100);
        });
        promise.then(() => this.makeVoice(speech));
    }
    makeVoice(speech) {
        this.active =
            this.document.options.a11y.voicing &&
                !!speechSynthesis.getVoices().length;
        speechSynthesis.cancel();
        this.clear = true;
        const [text, ssml] = buildSpeech(speech, this.document.options.sre.locale, this.document.options.sre.rate);
        super.Update(text);
        if (this.active && text) {
            this.makeUtterances(ssml, this.document.options.sre.locale);
        }
    }
    makeUtterances(ssml, locale) {
        let utterance = null;
        for (const utter of ssml) {
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
                const time = parseInt(utter.pause.match(/^[0-9]+/)[0]);
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
        const nodes = Array.from(this.node.querySelectorAll(`[data-semantic-id="${id}"]`));
        if (!this.clear || init) {
            this.highlighter.highlight(nodes);
        }
        this.clear = false;
    }
}
export class HoverRegion extends AbstractRegion {
    position(node) {
        const nodeRect = node.getBoundingClientRect();
        const divRect = this.div.getBoundingClientRect();
        const xCenter = nodeRect.left + nodeRect.width / 2;
        let left = xCenter - divRect.width / 2;
        left = left < 0 ? 0 : left;
        left = left + window.scrollX;
        let top;
        switch (this.document.options.a11y.align) {
            case 'top':
                top = nodeRect.top - divRect.height - 10;
                break;
            case 'bottom':
                top = nodeRect.bottom + 10;
                break;
            case 'center':
            default: {
                const yCenter = nodeRect.top + nodeRect.height / 2;
                top = yCenter - divRect.height / 2;
            }
        }
        top = top + window.scrollY;
        top = top < 0 ? 0 : top;
        this.div.style.top = top + 'px';
        this.div.style.left = left + 'px';
    }
    highlight(highlighter) {
        if (!this.div)
            return;
        if (this.inner.firstChild &&
            !this.inner.firstChild.hasAttribute('sre-highlight')) {
            return;
        }
        const color = highlighter.colorString();
        this.inner.style.backgroundColor = color.background;
        this.inner.style.color = color.foreground;
    }
    Show(node, highlighter) {
        this.AddElement();
        this.div.style.fontSize = this.document.options.a11y.magnify;
        this.Update(node);
        super.Show(node, highlighter);
    }
    Clear() {
        if (!this.div)
            return;
        this.inner.textContent = '';
        this.inner.style.top = '';
        this.inner.style.backgroundColor = '';
    }
    Update(node) {
        if (!this.div)
            return;
        this.Clear();
        const mjx = this.cloneNode(node);
        this.inner.appendChild(mjx);
        this.position(node);
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
                    mjx.setAttribute('width', (w / W) * width + 'ex');
                    mjx.setAttribute('height', (w / W) * height + 'ex');
                    container.setAttribute('sre-highlight', 'false');
                }
            }
            mjx = container.cloneNode(false).appendChild(mjx)
                .parentNode;
            mjx.style.margin = '0';
        }
        return mjx;
    }
}
HoverRegion.className = 'MJX_HoverRegion';
HoverRegion.style = new StyleJsonSheet({
    ['.' + HoverRegion.className]: {
        display: 'block',
        position: 'absolute',
        width: 'max-content',
        height: 'auto',
        padding: 0,
        opacity: 1,
        'z-index': '202',
        margin: '0 auto',
        'background-color': 'white',
        'line-height': 0,
        'box-shadow': '0px 10px 20px #888',
        border: '2px solid #CCCCCC',
    },
    ['.' + HoverRegion.className + ' > div']: {
        overflow: 'hidden',
    },
});
//# sourceMappingURL=Region.js.map