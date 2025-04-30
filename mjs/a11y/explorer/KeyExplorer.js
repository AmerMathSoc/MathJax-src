var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { STATE } from '../../core/MathItem.js';
import { AbstractExplorer } from './Explorer.js';
import { honk, InPlace } from '../speech/SpeechUtil.js';
const roles = ['tree', 'group', 'treeitem'];
const nav = roles.map((x) => `[role="${x}"]`).join(',');
const prevNav = roles.map((x) => `[tabindex="0"][role="${x}"]`).join(',');
function isContainer(el) {
    return el.matches('mjx-container');
}
export class SpeechExplorer extends AbstractExplorer {
    get generators() {
        var _a;
        return (_a = this.item) === null || _a === void 0 ? void 0 : _a.generatorPool;
    }
    hasModifiers(event) {
        return event.shiftKey || event.metaKey || event.altKey || event.ctrlKey;
    }
    MouseDown(e) {
        var _a;
        this.FocusOut(null);
        this.mousedown = true;
        if (this.hasModifiers(e))
            return;
        (_a = document.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
    }
    Click(event) {
        const clicked = event.target.closest(nav);
        if (this.hasModifiers(event) || document.getSelection().type === 'Range') {
            this.FocusOut(null);
            return;
        }
        if (this.node.getAttribute('tabIndex') === '-1')
            return;
        if (!this.node.contains(clicked)) {
            this.mousedown = false;
        }
        if (this.node.contains(clicked)) {
            const prev = this.node.querySelector(prevNav);
            if (prev) {
                prev.removeAttribute('tabindex');
                this.FocusOut(null);
            }
            this.current = clicked;
            if (!this.triggerLinkMouse()) {
                this.Start();
            }
            event.preventDefault();
        }
    }
    FocusIn(event) {
        if (this.item.outputData.nofocus) {
            return;
        }
        if (this.mousedown) {
            this.mousedown = false;
            return;
        }
        if (this.focusin) {
            return;
        }
        this.focusin = !this.focusin;
        this.current = this.current || this.node.querySelector('[role="treeitem"]');
        this.Start();
        event.preventDefault();
    }
    FocusOut(_event) {
        var _a, _b;
        (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.blur();
        if (!this.active)
            return;
        this.generators.CleanUp(this.current);
        this.generators.lastMove = InPlace.NONE;
        if (!this.move) {
            this.Stop();
        }
        (_b = this.current) === null || _b === void 0 ? void 0 : _b.removeAttribute('tabindex');
        this.node.setAttribute('tabindex', '0');
    }
    Attach() {
        super.Attach();
        this.attached = true;
        this.oldIndex = this.node.tabIndex;
        this.node.tabIndex = 0;
    }
    AddEvents() {
        if (!this.eventsAttached) {
            super.AddEvents();
            this.eventsAttached = true;
        }
    }
    Detach() {
        if (this.active) {
            this.node.tabIndex = this.oldIndex;
            this.oldIndex = null;
            this.node.removeAttribute('role');
        }
        this.attached = false;
    }
    nextSibling(el) {
        if (!this.current.getAttribute('data-semantic-parent')) {
            return null;
        }
        const sib = el.nextElementSibling;
        if (sib) {
            if (sib.matches(nav)) {
                return sib;
            }
            const sibChild = sib.querySelector(nav);
            return sibChild !== null && sibChild !== void 0 ? sibChild : this.nextSibling(sib);
        }
        if (!isContainer(el) && !el.parentElement.matches(nav)) {
            return this.nextSibling(el.parentElement);
        }
        return null;
    }
    prevSibling(el) {
        if (!this.current.getAttribute('data-semantic-parent')) {
            return null;
        }
        const sib = el.previousElementSibling;
        if (sib) {
            if (sib.matches(nav)) {
                return sib;
            }
            const sibChild = sib.querySelector(nav);
            return sibChild !== null && sibChild !== void 0 ? sibChild : this.prevSibling(sib);
        }
        if (!isContainer(el) && !el.parentElement.matches(nav)) {
            return this.prevSibling(el.parentElement);
        }
        return null;
    }
    actionable(node) {
        const parent = node === null || node === void 0 ? void 0 : node.parentNode;
        return parent && this.highlighter.isMactionNode(parent) ? parent : null;
    }
    depth(node) {
        this.generators.depth(node, this.node, !!this.actionable(node));
        this.refocus();
        this.generators.lastMove = InPlace.DEPTH;
        return node;
    }
    expand(node) {
        const expandable = this.actionable(node);
        if (!expandable) {
            return null;
        }
        expandable.dispatchEvent(new Event('click'));
        return node;
    }
    summary(node) {
        this.generators.summary(node);
        this.refocus();
        this.generators.lastMove = InPlace.SUMMARY;
        return node;
    }
    nextRules(node) {
        this.node.removeAttribute('data-speech-attached');
        this.generators.nextRules(this.item);
        this.refocus();
        return node;
    }
    nextStyle(node) {
        this.node.removeAttribute('data-speech-attached');
        this.generators.nextStyle(node, this.item);
        this.refocus();
        return node;
    }
    refocus() {
        this.Stop();
        this.Restart((_err) => {
            this.node.setAttribute('data-speech-attached', 'true');
            this.Start();
        });
    }
    Move(e) {
        this.move = true;
        const target = e.target;
        const move = this.moves.get(e.key);
        let next = null;
        if (move) {
            e.preventDefault();
            next = move(target);
        }
        if (next) {
            target.removeAttribute('tabindex');
            next.setAttribute('tabindex', '0');
            next.focus();
            this.current = next;
            this.move = false;
            return true;
        }
        this.move = false;
        return false;
    }
    NoMove() {
        honk();
    }
    constructor(document, pool, region, node, brailleRegion, magnifyRegion, _mml, item) {
        super(document, pool, null, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.brailleRegion = brailleRegion;
        this.magnifyRegion = magnifyRegion;
        this.item = item;
        this.attached = false;
        this.sound = false;
        this.restarted = null;
        this.oldIndex = null;
        this.current = null;
        this.eventsAttached = false;
        this.move = false;
        this.mousedown = false;
        this.events = super.Events().concat([
            ['keydown', this.KeyDown.bind(this)],
            ['mousedown', this.MouseDown.bind(this)],
            ['click', this.Click.bind(this)],
            ['focusin', this.FocusIn.bind(this)],
            ['focusout', this.FocusOut.bind(this)],
        ]);
        this.focusin = false;
        this.moves = new Map([
            ['ArrowDown', (node) => node.querySelector(nav)],
            ['ArrowUp', (node) => node.parentElement.closest(nav)],
            ['ArrowLeft', this.prevSibling.bind(this)],
            ['ArrowRight', this.nextSibling.bind(this)],
            ['>', this.nextRules.bind(this)],
            ['<', this.nextStyle.bind(this)],
            ['x', this.summary.bind(this)],
            ['Enter', this.expand.bind(this)],
            ['d', this.depth.bind(this)],
        ]);
    }
    Restart() {
        return __awaiter(this, arguments, void 0, function* (handler = (_err) => { }) {
            this.generators.promise
                .then(() => this.Start())
                .catch((err) => {
                console.info(`Restart error for ${err}`);
                handler(err);
            });
        });
    }
    Start() {
        if (this.item.state() < STATE.ATTACHSPEECH) {
            this.item.attachSpeech(this.document);
        }
        if (!this.attached)
            return;
        if (!this.node.hasAttribute('data-speech-attached')) {
            this.Restart();
            return;
        }
        if (this.node.hasAttribute('tabindex')) {
            this.node.removeAttribute('tabindex');
        }
        if (this.active)
            return;
        if (this.restarted !== null) {
            this.current = this.node.querySelector(`[data-semantic-id="${this.restarted}"]`);
            if (!this.current) {
                const dummies = Array.from(this.node.querySelectorAll('[data-semantic-type="dummy"]')).map((x) => x.getAttribute('data-semantic-id'));
                let internal = this.generators.element.querySelector(`[data-semantic-id="${this.restarted}"]`);
                while (internal && internal !== this.generators.element) {
                    const sid = internal.getAttribute('data-semantic-id');
                    if (dummies.includes(sid)) {
                        this.current = this.node.querySelector(`[data-semantic-id="${sid}"]`);
                        break;
                    }
                    internal = internal.parentNode;
                }
            }
            this.restarted = null;
        }
        if (!this.current) {
            this.current = this.node.childNodes[0];
        }
        const options = this.document.options;
        this.current.setAttribute('tabindex', '0');
        this.current.focus();
        super.Start();
        if (options.a11y.subtitles && options.a11y.speech && options.enableSpeech) {
            this.region.Show(this.node, this.highlighter);
        }
        if (options.a11y.viewBraille &&
            options.a11y.braille &&
            options.enableBraille) {
            this.brailleRegion.Show(this.node, this.highlighter);
        }
        if (options.a11y.keyMagnifier) {
            this.magnifyRegion.Show(this.current, this.highlighter);
        }
        this.Update();
    }
    Update() {
        if (!this.active)
            return;
        this.pool.unhighlight();
        this.pool.highlight([this.current]);
        this.region.node = this.node;
        this.generators.updateRegions(this.current, this.region, this.brailleRegion);
        this.magnifyRegion.Update(this.current);
    }
    KeyDown(event) {
        const code = event.key;
        if (code === 'Tab') {
            return;
        }
        if (code === ' ') {
            return;
        }
        if (code === 'Control') {
            speechSynthesis.cancel();
            return;
        }
        if (code === 'Escape') {
            this.Stop();
            this.stopEvent(event);
            return;
        }
        if (code === 'Enter') {
            if (!this.active && event.target instanceof HTMLAnchorElement) {
                event.target.dispatchEvent(new MouseEvent('click'));
                this.stopEvent(event);
                return;
            }
            if (this.active && this.triggerLinkKeyboard(event)) {
                this.Stop();
                this.stopEvent(event);
                return;
            }
            if (!this.active) {
                if (!this.current) {
                    this.current = this.node.querySelector('[role="treeitem"]');
                }
                this.Start();
                this.stopEvent(event);
                return;
            }
        }
        if (this.active) {
            if (this.Move(event)) {
                this.stopEvent(event);
                this.Update();
                return;
            }
            if (event.getModifierState(code)) {
                return;
            }
            if (this.sound) {
                this.NoMove();
            }
        }
    }
    triggerLinkKeyboard(event) {
        if (event.code !== 'Enter') {
            return false;
        }
        if (!this.current) {
            if (event.target instanceof HTMLAnchorElement) {
                event.target.dispatchEvent(new MouseEvent('click'));
                return true;
            }
            return false;
        }
        return this.triggerLink(this.current);
    }
    triggerLink(node) {
        var _a;
        const focus = (_a = node === null || node === void 0 ? void 0 : node.getAttribute('data-semantic-postfix')) === null || _a === void 0 ? void 0 : _a.match(/(^| )link($| )/);
        if (focus) {
            node.parentNode.dispatchEvent(new MouseEvent('click'));
            return true;
        }
        return false;
    }
    triggerLinkMouse() {
        let node = this.current;
        while (node && node !== this.node) {
            if (this.triggerLink(node)) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
    Stop() {
        if (this.active) {
            this.focusin = false;
            this.pool.unhighlight();
            this.magnifyRegion.Hide();
            this.region.Hide();
            this.brailleRegion.Hide();
        }
        super.Stop();
    }
    semanticFocus() {
        const node = this.current || this.node;
        return node.getAttribute('data-semantic-id');
    }
}
//# sourceMappingURL=KeyExplorer.js.map