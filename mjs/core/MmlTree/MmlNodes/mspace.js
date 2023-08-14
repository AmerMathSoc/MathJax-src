import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMspace extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.NONE;
    }
    setTeXclass(prev) {
        return prev;
    }
    get kind() {
        return 'mspace';
    }
    get arity() {
        return 0;
    }
    get isSpacelike() {
        return true;
    }
    get hasNewline() {
        const linebreak = this.attributes.get('linebreak');
        return (this.canBreak && (linebreak === 'newline' || linebreak === 'indentingnewline'));
    }
    get canBreak() {
        const attributes = this.attributes;
        return (attributes.getExplicit('height') === undefined &&
            attributes.getExplicit('depth') === undefined &&
            attributes.getExplicit('style') === undefined &&
            attributes.getExplicit('mathbackground') === undefined &&
            attributes.getExplicit('background') === undefined);
    }
}
MmlMspace.defaults = Object.assign(Object.assign({}, AbstractMmlTokenNode.defaults), { width: '0em', height: '0ex', depth: '0ex', linebreak: 'auto', indentshift: 'auto', indentalign: 'auto', indenttarget: '', indentalignfirst: 'indentalign', indentshiftfirst: 'indentshift', indentalignlast: 'indentalign', indentshiftlast: 'indentshift' });
//# sourceMappingURL=mspace.js.map