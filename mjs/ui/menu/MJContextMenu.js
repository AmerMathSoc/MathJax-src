import { ContextMenu, Submenu } from './mj-context-menu.js';
export class MJContextMenu extends ContextMenu {
    constructor() {
        super(...arguments);
        this.mathItem = null;
        this.errorMsg = '';
    }
    post(x, y) {
        if (this.mathItem) {
            if (y !== undefined) {
                this.getOriginalMenu();
                this.getSemanticsMenu();
                this.getSpeechMenu();
                this.getSvgMenu();
                this.getErrorMessage();
                this.dynamicSubmenus();
            }
            super.post(x, y);
        }
    }
    unpost() {
        super.unpost();
        this.mathItem = null;
    }
    findID(...names) {
        let menu = this;
        let item = null;
        for (const name of names) {
            if (menu) {
                item = menu.find(name);
                menu = (item instanceof Submenu ? item.submenu : null);
            }
            else {
                item = null;
            }
        }
        return item;
    }
    setJax(jax) {
        this.jax = jax;
    }
    getOriginalMenu() {
        const input = this.mathItem.inputJax.name;
        const original = this.findID('Show', 'Original');
        original.content = (input === 'MathML' ? 'Original MathML' : input + ' Commands');
        const clipboard = this.findID('Copy', 'Original');
        clipboard.content = original.content;
    }
    getSemanticsMenu() {
        const semantics = this.findID('Settings', 'semantics');
        this.mathItem.inputJax.name === 'MathML' ? semantics.disable() : semantics.enable();
    }
    getSpeechMenu() {
        const speech = this.mathItem.outputData.speech;
        this.findID('Show', 'Speech')[speech ? 'enable' : 'disable']();
        this.findID('Copy', 'Speech')[speech ? 'enable' : 'disable']();
    }
    getSvgMenu() {
        const svg = this.jax.SVG;
        this.findID('Show', 'SVG')[svg ? 'enable' : 'disable']();
        this.findID('Copy', 'SVG')[svg ? 'enable' : 'disable']();
    }
    getErrorMessage() {
        const children = this.mathItem.root.childNodes[0].childNodes;
        let disable = true;
        this.errorMsg = '';
        if (children.length === 1 && children[0].isKind('merror')) {
            const attributes = children[0].attributes;
            this.errorMsg = (attributes.get('data-mjx-error') || attributes.get('data-mjx-message') || '');
            disable = !this.errorMsg;
        }
        this.findID('Show', 'Error')[disable ? 'disable' : 'enable']();
        this.findID('Copy', 'Error')[disable ? 'disable' : 'enable']();
    }
    dynamicSubmenus() {
        for (const [id, method] of MJContextMenu.DynamicSubmenus) {
            const menu = this.find(id);
            if (!menu)
                continue;
            const sub = method(this, menu);
            menu.submenu = sub;
            if (sub.items.length) {
                menu.enable();
            }
            else {
                menu.disable();
            }
        }
    }
}
MJContextMenu.DynamicSubmenus = new Map();
//# sourceMappingURL=MJContextMenu.js.map