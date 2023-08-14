import BaseMethods from '../base/BaseMethods.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import TexError from '../TexError.js';
let BraketMethods = {};
BraketMethods.Macro = BaseMethods.Macro;
BraketMethods.Braket = function (parser, _name, open, close, stretchy, barmax, space = false) {
    let next = parser.GetNext();
    if (next === '') {
        throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
    }
    let single = true;
    if (next === '{') {
        parser.i++;
        single = false;
    }
    parser.Push(parser.itemFactory.create('braket')
        .setProperties({ barcount: 0, barmax, open, close, stretchy, single, space }));
};
BraketMethods.Bar = function (parser, name) {
    let c = name === '|' ? '|' : '\u2016';
    let top = parser.stack.Top();
    if (top.isKind('over')) {
        top = parser.stack.Top(2);
    }
    if (!top.isKind('braket') || top.getProperty('barcount') >= top.getProperty('barmax')) {
        return false;
    }
    if (c === '|' && parser.GetNext() === '|') {
        parser.i++;
        c = '\u2016';
    }
    let stretchy = top.getProperty('stretchy');
    if (!stretchy) {
        let node = parser.create('token', 'mo', { stretchy: false, 'data-braketbar': true, texClass: TEXCLASS.ORD }, c);
        parser.Push(node);
        return;
    }
    let close = parser.itemFactory.create('close').setProperty('braketbar', true);
    parser.Push(close);
    top.barNodes.push(parser.create('node', 'TeXAtom', [], { texClass: TEXCLASS.CLOSE }), parser.create('token', 'mo', { stretchy: true, 'data-braketbar': true, texClass: TEXCLASS.BIN }, c), parser.create('node', 'TeXAtom', [], { texClass: TEXCLASS.OPEN }));
    top.setProperty('barcount', top.getProperty('barcount') + 1);
};
export default BraketMethods;
//# sourceMappingURL=BraketMethods.js.map