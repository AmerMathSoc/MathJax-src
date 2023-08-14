import { xsltFilename } from '#mml3/xsltFilename.js';
export function createTransform() {
    const nodeRequire = eval('require');
    try {
        nodeRequire.resolve('saxon-js');
    }
    catch (err) {
        throw Error('Saxon-js not found.  Run the command:\n    npm install saxon-js\nand try again.');
    }
    const Saxon = nodeRequire('saxon-js');
    const path = nodeRequire('path');
    const xslt = nodeRequire(xsltFilename(path));
    return (node, doc) => {
        const adaptor = doc.adaptor;
        let mml = adaptor.outerHTML(node);
        if (!mml.match(/ xmlns[=:]/)) {
            mml = mml.replace(/<(?:(\w+)(:))?math/, '<$1$2math xmlns$2$1="http://www.w3.org/1998/Math/MathML"');
        }
        let result;
        try {
            result = adaptor.firstChild(adaptor.body(adaptor.parse(Saxon.transform({
                stylesheetInternal: xslt,
                sourceText: mml,
                destination: 'serialized'
            }).principalResult)));
        }
        catch (err) {
            result = node;
        }
        return result;
    };
}
//# sourceMappingURL=mml3-node.js.map