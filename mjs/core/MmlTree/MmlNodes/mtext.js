import { AbstractMmlTokenNode, TEXCLASS } from '../MmlNode.js';
export class MmlMtext extends AbstractMmlTokenNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.ORD;
    }
    get kind() {
        return 'mtext';
    }
    get isSpacelike() {
        return true;
    }
}
MmlMtext.defaults = Object.assign({}, AbstractMmlTokenNode.defaults);
//# sourceMappingURL=mtext.js.map