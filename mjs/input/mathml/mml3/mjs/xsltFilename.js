export function xsltFilename(path) {
    const dirname = path.dirname(path.dirname(new URL(import.meta.url).pathname));
    return path.resolve(dirname, 'mml3.sef.json');
}
//# sourceMappingURL=xsltFilename.js.map