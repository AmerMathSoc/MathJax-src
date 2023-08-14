import { Configuration } from '../Configuration.js';
import './AmsCdMappings.js';
export const AmsCdConfiguration = Configuration.create('amscd', {
    handler: {
        character: ['amscd_special'],
        macro: ['amscd_macros'],
        environment: ['amscd_environment']
    },
    options: {
        amscd: {
            colspace: '5pt',
            rowspace: '5pt',
            harrowsize: '2.75em',
            varrowsize: '1.75em',
            hideHorizontalLabels: false
        }
    }
});
//# sourceMappingURL=AmsCdConfiguration.js.map