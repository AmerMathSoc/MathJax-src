import { AbstractExplorer } from './Explorer.js';
import { Sre } from '../sre.js';
export class AbstractTreeExplorer extends AbstractExplorer {
    constructor(document, pool, region, node, mml) {
        super(document, pool, null, node);
        this.document = document;
        this.pool = pool;
        this.region = region;
        this.node = node;
        this.mml = mml;
        this.stoppable = false;
    }
    Attach() {
        super.Attach();
        this.Start();
    }
    Detach() {
        this.Stop();
        super.Detach();
    }
}
export class FlameColorer extends AbstractTreeExplorer {
    Start() {
        if (this.active)
            return;
        this.active = true;
        this.highlighter.highlightAll(this.node);
    }
    Stop() {
        if (this.active) {
            this.highlighter.unhighlightAll();
        }
        this.active = false;
    }
}
export class TreeColorer extends AbstractTreeExplorer {
    Start() {
        if (this.active)
            return;
        this.active = true;
        let generator = Sre.getSpeechGenerator('Color');
        if (!this.node.hasAttribute('hasforegroundcolor')) {
            generator.generateSpeech(this.node, this.mml);
            this.node.setAttribute('hasforegroundcolor', 'true');
        }
        this.highlighter.colorizeAll(this.node);
    }
    Stop() {
        if (this.active) {
            this.highlighter.uncolorizeAll(this.node);
        }
        this.active = false;
    }
}
//# sourceMappingURL=TreeExplorer.js.map