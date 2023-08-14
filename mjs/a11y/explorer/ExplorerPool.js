import { LiveRegion, SpeechRegion, ToolTip, HoverRegion } from './Region.js';
import * as ke from './KeyExplorer.js';
import * as me from './MouseExplorer.js';
import { TreeColorer, FlameColorer } from './TreeExplorer.js';
import { Sre } from '../sre.js';
export class RegionPool {
    constructor(document) {
        this.document = document;
        this.speechRegion = new SpeechRegion(this.document);
        this.brailleRegion = new LiveRegion(this.document);
        this.magnifier = new HoverRegion(this.document);
        this.tooltip1 = new ToolTip(this.document);
        this.tooltip2 = new ToolTip(this.document);
        this.tooltip3 = new ToolTip(this.document);
    }
}
let allExplorers = {
    speech: (doc, pool, node, ...rest) => {
        let explorer = ke.SpeechExplorer.create(doc, pool, doc.explorerRegions.speechRegion, node, ...rest);
        explorer.speechGenerator.setOptions({
            automark: true, markup: 'ssml',
            locale: doc.options.sre.locale, domain: doc.options.sre.domain,
            style: doc.options.sre.style, modality: 'speech'
        });
        let locale = explorer.speechGenerator.getOptions().locale;
        if (locale !== Sre.engineSetup().locale) {
            doc.options.sre.locale = Sre.engineSetup().locale;
            explorer.speechGenerator.setOptions({ locale: doc.options.sre.locale });
        }
        explorer.sound = true;
        explorer.showRegion = 'subtitles';
        return explorer;
    },
    braille: (doc, pool, node, ...rest) => {
        let explorer = ke.SpeechExplorer.create(doc, pool, doc.explorerRegions.brailleRegion, node, ...rest);
        explorer.speechGenerator.setOptions({ automark: false, markup: 'none',
            locale: 'nemeth', domain: 'default',
            style: 'default', modality: 'braille' });
        explorer.showRegion = 'viewBraille';
        return explorer;
    },
    keyMagnifier: (doc, pool, node, ...rest) => ke.Magnifier.create(doc, pool, doc.explorerRegions.magnifier, node, ...rest),
    mouseMagnifier: (doc, pool, node, ..._rest) => me.ContentHoverer.create(doc, pool, doc.explorerRegions.magnifier, node, (x) => x.hasAttribute('data-semantic-type'), (x) => x),
    hover: (doc, pool, node, ..._rest) => me.FlameHoverer.create(doc, pool, null, node),
    infoType: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip1, node, (x) => x.hasAttribute('data-semantic-type'), (x) => x.getAttribute('data-semantic-type')),
    infoRole: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip2, node, (x) => x.hasAttribute('data-semantic-role'), (x) => x.getAttribute('data-semantic-role')),
    infoPrefix: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip3, node, (x) => x.hasAttribute('data-semantic-prefix'), (x) => x.getAttribute('data-semantic-prefix')),
    flame: (doc, pool, node, ..._rest) => FlameColorer.create(doc, pool, null, node),
    treeColoring: (doc, pool, node, ...rest) => TreeColorer.create(doc, pool, null, node, ...rest)
};
export class ExplorerPool {
    constructor() {
        this.explorers = {};
        this.attached = [];
        this._restart = [];
    }
    get highlighter() {
        if (this._renderer !== this.document.outputJax.name) {
            this._renderer = this.document.outputJax.name;
            this.setPrimaryHighlighter();
            return this._highlighter;
        }
        let [foreground, background] = this.colorOptions();
        Sre.updateHighlighter(background, foreground, this._highlighter);
        return this._highlighter;
    }
    init(document, node, mml) {
        this.document = document;
        this.mml = mml;
        this.node = node;
        this.setPrimaryHighlighter();
        for (let key of Object.keys(allExplorers)) {
            this.explorers[key] = allExplorers[key](this.document, this, this.node, this.mml);
        }
        this.setSecondaryHighlighter();
        this.attach();
    }
    attach() {
        this.attached = [];
        let keyExplorers = [];
        for (let key of Object.keys(this.explorers)) {
            let explorer = this.explorers[key];
            if (explorer instanceof ke.AbstractKeyExplorer) {
                explorer.AddEvents();
                explorer.stoppable = false;
                keyExplorers.unshift(explorer);
            }
            if (this.document.options.a11y[key]) {
                explorer.Attach();
                this.attached.push(key);
            }
            else {
                explorer.Detach();
            }
        }
        for (let explorer of keyExplorers) {
            if (explorer.attached) {
                explorer.stoppable = true;
                break;
            }
        }
    }
    reattach() {
        for (let key of this.attached) {
            let explorer = this.explorers[key];
            if (explorer.active) {
                this._restart.push(key);
                explorer.Stop();
            }
        }
    }
    restart() {
        this._restart.forEach(x => this.explorers[x].Start());
        this._restart = [];
    }
    setPrimaryHighlighter() {
        let [foreground, background] = this.colorOptions();
        this._highlighter = Sre.getHighlighter(background, foreground, { renderer: this.document.outputJax.name, browser: 'v3' });
    }
    setSecondaryHighlighter() {
        this.secondaryHighlighter = Sre.getHighlighter({ color: 'red' }, { color: 'black' }, { renderer: this.document.outputJax.name, browser: 'v3' });
        this.explorers['speech'].region.highlighter =
            this.secondaryHighlighter;
    }
    highlight(nodes) {
        this.highlighter.highlight(nodes);
    }
    unhighlight() {
        this.secondaryHighlighter.unhighlight();
        this.highlighter.unhighlight();
    }
    colorOptions() {
        let opts = this.document.options.a11y;
        let foreground = { color: opts.foregroundColor.toLowerCase(),
            alpha: opts.foregroundOpacity / 100 };
        let background = { color: opts.backgroundColor.toLowerCase(),
            alpha: opts.backgroundOpacity / 100 };
        return [foreground, background];
    }
}
//# sourceMappingURL=ExplorerPool.js.map