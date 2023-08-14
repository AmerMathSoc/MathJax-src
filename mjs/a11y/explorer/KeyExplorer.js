var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractExplorer } from './Explorer.js';
import { Sre } from '../sre.js';
export class AbstractKeyExplorer extends AbstractExplorer {
    constructor() {
        super(...arguments);
        this.attached = false;
        this.sound = false;
        this.eventsAttached = false;
        this.events = super.Events().concat([['keydown', this.KeyDown.bind(this)],
            ['focusin', this.FocusIn.bind(this)],
            ['focusout', this.FocusOut.bind(this)]]);
        this.oldIndex = null;
    }
    FocusIn(_event) {
    }
    FocusOut(_event) {
        this.Stop();
    }
    Update(force = false) {
        if (!this.active && !force)
            return;
        this.pool.unhighlight();
        let nodes = this.walker.getFocus(true).getNodes();
        if (!nodes.length) {
            this.walker.refocus();
            nodes = this.walker.getFocus().getNodes();
        }
        this.pool.highlight(nodes);
    }
    Attach() {
        super.Attach();
        this.attached = true;
        this.oldIndex = this.node.tabIndex;
        this.node.tabIndex = 1;
        this.node.setAttribute('role', 'tree');
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
    Stop() {
        if (this.active) {
            this.walker.deactivate();
            this.pool.unhighlight();
        }
        super.Stop();
    }
    Move(key) {
        let result = this.walker.move(key);
        if (result) {
            this.Update();
            return;
        }
        if (this.sound) {
            this.NoMove();
        }
    }
    NoMove() {
        let ac = new AudioContext();
        let os = ac.createOscillator();
        os.frequency.value = 300;
        os.connect(ac.destination);
        os.start(ac.currentTime);
        os.stop(ac.currentTime + .05);
    }
}
export class SpeechExplorer extends AbstractKeyExplorer {
    constructor(document, pool, region, node, mml) {
        super(document, pool, region, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.mml = mml;
        this.showRegion = 'subtitles';
        this.init = false;
        this.restarted = false;
        this.initWalker();
    }
    Start() {
        if (!this.attached)
            return;
        let options = this.getOptions();
        if (!this.init) {
            this.init = true;
            SpeechExplorer.updatePromise = SpeechExplorer.updatePromise.then(() => __awaiter(this, void 0, void 0, function* () {
                return Sre.sreReady()
                    .then(() => Sre.setupEngine({ locale: options.locale }))
                    .then(() => {
                    this.Speech(this.walker);
                    this.Start();
                });
            }))
                .catch((error) => console.log(error.message));
            return;
        }
        super.Start();
        this.speechGenerator = Sre.getSpeechGenerator('Direct');
        this.speechGenerator.setOptions(options);
        this.walker = Sre.getWalker('table', this.node, this.speechGenerator, this.highlighter, this.mml);
        this.walker.activate();
        this.Update();
        if (this.document.options.a11y[this.showRegion]) {
            SpeechExplorer.updatePromise.then(() => this.region.Show(this.node, this.highlighter));
        }
        this.restarted = true;
    }
    Update(force = false) {
        let noUpdate = force;
        force = false;
        super.Update(force);
        let options = this.speechGenerator.getOptions();
        if (options.modality === 'speech') {
            this.document.options.sre.domain = options.domain;
            this.document.options.sre.style = options.style;
            this.document.options.a11y.speechRules =
                options.domain + '-' + options.style;
        }
        SpeechExplorer.updatePromise = SpeechExplorer.updatePromise.then(() => __awaiter(this, void 0, void 0, function* () {
            return Sre.sreReady()
                .then(() => Sre.setupEngine({ markup: options.markup,
                modality: options.modality,
                locale: options.locale }))
                .then(() => {
                if (!noUpdate) {
                    let speech = this.walker.speech();
                    this.region.Update(speech);
                }
            });
        }));
    }
    Speech(walker) {
        SpeechExplorer.updatePromise.then(() => {
            walker.speech();
            this.node.setAttribute('hasspeech', 'true');
            this.Update(true);
            if (this.restarted && this.document.options.a11y[this.showRegion]) {
                this.region.Show(this.node, this.highlighter);
            }
        });
    }
    KeyDown(event) {
        const code = event.keyCode;
        this.walker.modifier = event.shiftKey;
        if (code === 17) {
            speechSynthesis.cancel();
            return;
        }
        if (code === 27) {
            this.Stop();
            this.stopEvent(event);
            return;
        }
        if (this.active) {
            this.Move(code);
            if (this.triggerLink(code))
                return;
            this.stopEvent(event);
            return;
        }
        if (code === 32 && event.shiftKey || code === 13) {
            this.Start();
            this.stopEvent(event);
        }
    }
    triggerLink(code) {
        var _a, _b;
        if (code !== 13) {
            return false;
        }
        let node = (_a = this.walker.getFocus().getNodes()) === null || _a === void 0 ? void 0 : _a[0];
        let focus = (_b = node === null || node === void 0 ? void 0 : node.getAttribute('data-semantic-postfix')) === null || _b === void 0 ? void 0 : _b.match(/(^| )link($| )/);
        if (focus) {
            node.parentNode.dispatchEvent(new MouseEvent('click'));
            return true;
        }
        return false;
    }
    initWalker() {
        this.speechGenerator = Sre.getSpeechGenerator('Tree');
        let dummy = Sre.getWalker('dummy', this.node, this.speechGenerator, this.highlighter, this.mml);
        this.walker = dummy;
    }
    getOptions() {
        let options = this.speechGenerator.getOptions();
        let sreOptions = this.document.options.sre;
        if (options.modality === 'speech' &&
            (options.locale !== sreOptions.locale ||
                options.domain !== sreOptions.domain ||
                options.style !== sreOptions.style)) {
            options.domain = sreOptions.domain;
            options.style = sreOptions.style;
            options.locale = sreOptions.locale;
            this.walker.update(options);
        }
        return options;
    }
}
SpeechExplorer.updatePromise = Promise.resolve();
export class Magnifier extends AbstractKeyExplorer {
    constructor(document, pool, region, node, mml) {
        super(document, pool, region, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.mml = mml;
        this.walker = Sre.getWalker('table', this.node, Sre.getSpeechGenerator('Dummy'), this.highlighter, this.mml);
    }
    Update(force = false) {
        super.Update(force);
        this.showFocus();
    }
    Start() {
        super.Start();
        if (!this.attached)
            return;
        this.region.Show(this.node, this.highlighter);
        this.walker.activate();
        this.Update();
    }
    showFocus() {
        let node = this.walker.getFocus().getNodes()[0];
        this.region.Show(node, this.highlighter);
    }
    KeyDown(event) {
        const code = event.keyCode;
        this.walker.modifier = event.shiftKey;
        if (code === 27) {
            this.Stop();
            this.stopEvent(event);
            return;
        }
        if (this.active && code !== 13) {
            this.Move(code);
            this.stopEvent(event);
            return;
        }
        if (code === 32 && event.shiftKey || code === 13) {
            this.Start();
            this.stopEvent(event);
        }
    }
}
//# sourceMappingURL=KeyExplorer.js.map