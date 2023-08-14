import { AbstractMmlLayoutNode } from '../MmlNode.js';
import { INHERIT } from '../Attributes.js';
export class MmlMstyle extends AbstractMmlLayoutNode {
    get kind() {
        return 'mstyle';
    }
    get notParent() {
        return this.childNodes[0] && this.childNodes[0].childNodes.length === 1;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        let scriptlevel = this.attributes.getExplicit('scriptlevel');
        if (scriptlevel != null) {
            scriptlevel = scriptlevel.toString();
            if (scriptlevel.match(/^\s*[-+]/)) {
                level += parseInt(scriptlevel);
            }
            else {
                level = parseInt(scriptlevel);
            }
            prime = false;
        }
        let displaystyle = this.attributes.getExplicit('displaystyle');
        if (displaystyle != null) {
            display = (displaystyle === true);
            prime = false;
        }
        const cramped = this.attributes.getExplicit('data-cramped');
        if (cramped != null) {
            prime = cramped;
        }
        attributes = this.addInheritedAttributes(attributes, this.attributes.getAllAttributes());
        this.childNodes[0].setInheritedAttributes(attributes, display, level, prime);
    }
}
MmlMstyle.defaults = Object.assign(Object.assign({}, AbstractMmlLayoutNode.defaults), { scriptlevel: INHERIT, displaystyle: INHERIT, scriptsizemultiplier: 1 / Math.sqrt(2), scriptminsize: '.4em', mathbackground: INHERIT, mathcolor: INHERIT, dir: INHERIT, infixlinebreakstyle: 'before' });
//# sourceMappingURL=mstyle.js.map