import { Configuration } from '../Configuration.js';
import { MapHandler } from '../MapHandler.js';
import TexError from '../TexError.js';
import NodeUtil from '../NodeUtil.js';
import { CharacterMap } from '../SymbolMap.js';
import * as bitem from './BaseItems.js';
import { AbstractTags } from '../Tags.js';
import './BaseMappings.js';
import { getRange } from '../../../core/MmlTree/OperatorDictionary.js';
import ParseUtil from '../ParseUtil.js';
new CharacterMap('remap', null, {
    '-': '\u2212',
    '*': '\u2217',
    '`': '\u2018'
});
export function Other(parser, char) {
    const font = parser.stack.env['font'];
    let def = font ?
        { mathvariant: parser.stack.env['font'] } : {};
    const remap = MapHandler.getMap('remap').lookup(char);
    const range = getRange(char);
    const type = (range ? range[3] : 'mo');
    let mo = parser.create('token', type, def, (remap ? remap.char : char));
    const variant = ((range === null || range === void 0 ? void 0 : range[4]) ||
        (ParseUtil.isLatinOrGreekChar(char) ? parser.configuration.mathStyle(char, true) : ''));
    if (variant) {
        mo.attributes.set('mathvariant', variant);
    }
    if (type === 'mo') {
        NodeUtil.setProperty(mo, 'fixStretchy', true);
        parser.configuration.addNode('fixStretchy', mo);
    }
    parser.Push(mo);
}
function csUndefined(_parser, name) {
    throw new TexError('UndefinedControlSequence', 'Undefined control sequence %1', '\\' + name);
}
function envUndefined(_parser, env) {
    throw new TexError('UnknownEnv', 'Unknown environment \'%1\'', env);
}
function filterNonscript({ data }) {
    for (const mml of data.getList('nonscript')) {
        if (mml.attributes.get('scriptlevel') > 0) {
            const parent = mml.parent;
            parent.childNodes.splice(parent.childIndex(mml), 1);
            data.removeFromList(mml.kind, [mml]);
            if (mml.isKind('mrow')) {
                const mstyle = mml.childNodes[0];
                data.removeFromList('mstyle', [mstyle]);
                data.removeFromList('mspace', mstyle.childNodes[0].childNodes);
            }
        }
        else if (mml.isKind('mrow')) {
            mml.parent.replaceChild(mml.childNodes[0], mml);
            data.removeFromList('mrow', [mml]);
        }
    }
}
export class BaseTags extends AbstractTags {
}
export const BaseConfiguration = Configuration.create('base', {
    handler: {
        character: ['command', 'special', 'letter', 'digit'],
        delimiter: ['delimiter'],
        macro: ['delimiter', 'macros', 'lcGreek', 'ucGreek', 'mathchar0mi', 'mathchar0mo', 'mathchar7'],
        environment: ['environment']
    },
    fallback: {
        character: Other,
        macro: csUndefined,
        environment: envUndefined
    },
    items: {
        [bitem.StartItem.prototype.kind]: bitem.StartItem,
        [bitem.StopItem.prototype.kind]: bitem.StopItem,
        [bitem.OpenItem.prototype.kind]: bitem.OpenItem,
        [bitem.CloseItem.prototype.kind]: bitem.CloseItem,
        [bitem.PrimeItem.prototype.kind]: bitem.PrimeItem,
        [bitem.SubsupItem.prototype.kind]: bitem.SubsupItem,
        [bitem.OverItem.prototype.kind]: bitem.OverItem,
        [bitem.LeftItem.prototype.kind]: bitem.LeftItem,
        [bitem.Middle.prototype.kind]: bitem.Middle,
        [bitem.RightItem.prototype.kind]: bitem.RightItem,
        [bitem.BreakItem.prototype.kind]: bitem.BreakItem,
        [bitem.BeginItem.prototype.kind]: bitem.BeginItem,
        [bitem.EndItem.prototype.kind]: bitem.EndItem,
        [bitem.StyleItem.prototype.kind]: bitem.StyleItem,
        [bitem.PositionItem.prototype.kind]: bitem.PositionItem,
        [bitem.CellItem.prototype.kind]: bitem.CellItem,
        [bitem.MmlItem.prototype.kind]: bitem.MmlItem,
        [bitem.FnItem.prototype.kind]: bitem.FnItem,
        [bitem.NotItem.prototype.kind]: bitem.NotItem,
        [bitem.NonscriptItem.prototype.kind]: bitem.NonscriptItem,
        [bitem.DotsItem.prototype.kind]: bitem.DotsItem,
        [bitem.ArrayItem.prototype.kind]: bitem.ArrayItem,
        [bitem.EqnArrayItem.prototype.kind]: bitem.EqnArrayItem,
        [bitem.EquationItem.prototype.kind]: bitem.EquationItem,
        [bitem.MstyleItem.prototype.kind]: bitem.MstyleItem
    },
    options: {
        maxMacros: 1000,
        identifierPattern: /^[a-zA-Z]+/,
        baseURL: (typeof (document) === 'undefined' ||
            document.getElementsByTagName('base').length === 0) ?
            '' : String(document.location).replace(/#.*$/, '')
    },
    tags: {
        base: BaseTags
    },
    postprocessors: [[filterNonscript, -4]]
});
//# sourceMappingURL=BaseConfiguration.js.map