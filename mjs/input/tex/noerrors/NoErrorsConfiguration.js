import { Configuration } from '../Configuration.js';
function noErrors(factory, message, _id, expr) {
    let mtext = factory.create('token', 'mtext', {}, expr.replace(/\n/g, ' '));
    let error = factory.create('node', 'merror', [mtext], { 'data-mjx-error': message, title: message });
    return error;
}
export const NoErrorsConfiguration = Configuration.create('noerrors', { nodes: { 'error': noErrors } });
//# sourceMappingURL=NoErrorsConfiguration.js.map