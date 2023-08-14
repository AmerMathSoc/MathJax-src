import * as sm from '../SymbolMap.js';
import ParseMethods from '../ParseMethods.js';
import AmsCdMethods from './AmsCdMethods.js';
new sm.EnvironmentMap('amscd_environment', ParseMethods.environment, { CD: 'CD' }, AmsCdMethods);
new sm.CommandMap('amscd_macros', {
    minCDarrowwidth: 'minCDarrowwidth',
    minCDarrowheight: 'minCDarrowheight',
}, AmsCdMethods);
new sm.MacroMap('amscd_special', { '@': 'arrow' }, AmsCdMethods);
//# sourceMappingURL=AmsCdMappings.js.map