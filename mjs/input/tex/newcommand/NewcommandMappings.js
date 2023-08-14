import NewcommandMethods from './NewcommandMethods.js';
import { CommandMap } from '../SymbolMap.js';
new CommandMap('Newcommand-macros', {
    newcommand: 'NewCommand',
    renewcommand: 'NewCommand',
    newenvironment: 'NewEnvironment',
    renewenvironment: 'NewEnvironment',
    def: 'MacroDef',
    'let': 'Let'
}, NewcommandMethods);
//# sourceMappingURL=NewcommandMappings.js.map