import { Configuration } from '../Configuration.js';
import { AutoOpen } from './PhysicsItems.js';
import './PhysicsMappings.js';
export const PhysicsConfiguration = Configuration.create('physics', {
    handler: {
        macro: [
            'Physics-automatic-bracing-macros',
            'Physics-vector-macros',
            'Physics-vector-mo',
            'Physics-vector-mi',
            'Physics-derivative-macros',
            'Physics-expressions-macros',
            'Physics-quick-quad-macros',
            'Physics-bra-ket-macros',
            'Physics-matrix-macros'
        ],
        character: ['Physics-characters'],
        environment: ['Physics-aux-envs']
    },
    items: {
        [AutoOpen.prototype.kind]: AutoOpen
    },
    options: {
        physics: {
            italicdiff: false,
            arrowdel: false
        }
    }
});
//# sourceMappingURL=PhysicsConfiguration.js.map