import { LiveRegion, SpeechRegion, ToolTip, HoverRegion } from './Region.js';
import { SpeechExplorer } from './KeyExplorer.js';
import * as me from './MouseExplorer.js';
import { TreeColorer, FlameColorer } from './TreeExplorer.js';
import * as Sre from '../sre.js';
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
const allExplorers = {
    speech: (doc, pool, node, ...rest) => {
        const explorer = SpeechExplorer.create(doc, pool, doc.explorerRegions.speechRegion, node, doc.explorerRegions.brailleRegion, doc.explorerRegions.magnifier, rest[0], rest[1]);
        explorer.sound = true;
        return explorer;
    },
    mouseMagnifier: (doc, pool, node, ..._rest) => me.ContentHoverer.create(doc, pool, doc.explorerRegions.magnifier, node, (x) => x.hasAttribute('data-semantic-type'), (x) => x),
    hover: (doc, pool, node, ..._rest) => me.FlameHoverer.create(doc, pool, null, node),
    infoType: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip1, node, (x) => x.hasAttribute('data-semantic-type'), (x) => x.getAttribute('data-semantic-type')),
    infoRole: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip2, node, (x) => x.hasAttribute('data-semantic-role'), (x) => x.getAttribute('data-semantic-role')),
    infoPrefix: (doc, pool, node, ..._rest) => me.ValueHoverer.create(doc, pool, doc.explorerRegions.tooltip3, node, (x) => x.hasAttribute('data-semantic-prefix'), (x) => x.getAttribute('data-semantic-prefix')),
    flame: (doc, pool, node, ..._rest) => FlameColorer.create(doc, pool, null, node),
    treeColoring: (doc, pool, node, ...rest) => TreeColorer.create(doc, pool, null, node, ...rest),
};
export class ExplorerPool {
    constructor() {
        this.explorers = {};
        this.attached = [];
        this._restart = [];
        this.speechExplorerKeys = ['speech', 'braille', 'keyMagnifier'];
    }
    get highlighter() {
        if (this._renderer !== this.document.outputJax.name) {
            this._renderer = this.document.outputJax.name;
            this.setPrimaryHighlighter();
            return this._highlighter;
        }
        const [foreground, background] = this.colorOptions();
        Sre.updateHighlighter(background, foreground, this._highlighter);
        return this._highlighter;
    }
    init(document, node, mml, item) {
        this.document = document;
        this.mml = mml;
        this.node = node;
        this.setPrimaryHighlighter();
        for (const key of Object.keys(allExplorers)) {
            this.explorers[key] = allExplorers[key](this.document, this, this.node, this.mml, item);
        }
        this.setSecondaryHighlighter();
        this.attach();
    }
    attach() {
        this.attached = [];
        const keyExplorers = [];
        const a11y = this.document.options.a11y;
        for (const [key, explorer] of Object.entries(this.explorers)) {
            if (explorer instanceof SpeechExplorer) {
                explorer.AddEvents();
                explorer.stoppable = false;
                keyExplorers.unshift(explorer);
                if (this.speechExplorerKeys.some((exKey) => this.document.options.a11y[exKey])) {
                    explorer.Attach();
                    this.attached.push(key);
                }
                else {
                    explorer.Detach();
                }
                continue;
            }
            if (a11y[key] ||
                (key === 'speech' && (a11y.braille || a11y.keyMagnifier))) {
                explorer.Attach();
                this.attached.push(key);
            }
            else {
                explorer.Detach();
            }
        }
        for (const explorer of keyExplorers) {
            if (explorer.attached) {
                explorer.stoppable = true;
                break;
            }
        }
    }
    reattach() {
        for (const key of this.attached) {
            const explorer = this.explorers[key];
            if (explorer.active) {
                this._restart.push(key);
                explorer.Stop();
            }
        }
    }
    restart() {
        this._restart.forEach((x) => {
            this.explorers[x].Start();
        });
        this._restart = [];
    }
    setPrimaryHighlighter() {
        const [foreground, background] = this.colorOptions();
        this._highlighter = Sre.getHighlighter(background, foreground, {
            renderer: this.document.outputJax.name,
            browser: 'v3',
        });
    }
    setSecondaryHighlighter() {
        this.secondaryHighlighter = Sre.getHighlighter({ color: 'red' }, { color: 'black' }, { renderer: this.document.outputJax.name, browser: 'v3' });
        this.speech.region.highlighter =
            this.secondaryHighlighter;
    }
    highlight(nodes) {
        this.highlighter.highlight(nodes);
    }
    unhighlight() {
        this.secondaryHighlighter.unhighlight();
        this.highlighter.unhighlight();
    }
    get speech() {
        return this.explorers['speech'];
    }
    colorOptions() {
        const opts = this.document.options.a11y;
        const foreground = {
            color: opts.foregroundColor.toLowerCase(),
            alpha: opts.foregroundOpacity / 100,
        };
        const background = {
            color: opts.backgroundColor.toLowerCase(),
            alpha: opts.backgroundOpacity / 100,
        };
        return [foreground, background];
    }
}
//# sourceMappingURL=ExplorerPool.js.map