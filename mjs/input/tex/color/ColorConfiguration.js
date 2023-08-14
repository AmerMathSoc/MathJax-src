import { CommandMap } from '../SymbolMap.js';
import { Configuration } from '../Configuration.js';
import { ColorMethods } from './ColorMethods.js';
import { ColorModel } from './ColorUtil.js';
new CommandMap('color', {
    color: 'Color',
    textcolor: 'TextColor',
    definecolor: 'DefineColor',
    colorbox: 'ColorBox',
    fcolorbox: 'FColorBox'
}, ColorMethods);
const config = function (_config, jax) {
    jax.parseOptions.packageData.set('color', { model: new ColorModel() });
};
export const ColorConfiguration = Configuration.create('color', {
    handler: {
        macro: ['color'],
    },
    options: {
        color: {
            padding: '5px',
            borderWidth: '2px'
        }
    },
    config: config
});
//# sourceMappingURL=ColorConfiguration.js.map