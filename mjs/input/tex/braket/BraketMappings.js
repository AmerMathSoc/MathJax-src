import { CommandMap, MacroMap } from '../SymbolMap.js';
import BraketMethods from './BraketMethods.js';
new CommandMap('Braket-macros', {
    bra: ['Macro', '{\\langle {#1} \\vert}', 1],
    ket: ['Macro', '{\\vert {#1} \\rangle}', 1],
    braket: ['Braket', '\u27E8', '\u27E9', false, Infinity],
    'set': ['Braket', '{', '}', false, 1],
    Bra: ['Macro', '{\\left\\langle {#1} \\right\\vert}', 1],
    Ket: ['Macro', '{\\left\\vert {#1} \\right\\rangle}', 1],
    Braket: ['Braket', '\u27E8', '\u27E9', true, Infinity],
    Set: ['Braket', '{', '}', true, 1, true],
    ketbra: ['Macro', '{\\vert {#1} \\rangle\\langle {#2} \\vert}', 2],
    Ketbra: ['Macro', '{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}', 2],
    '|': 'Bar'
}, BraketMethods);
new MacroMap('Braket-characters', {
    '|': 'Bar'
}, BraketMethods);
//# sourceMappingURL=BraketMappings.js.map