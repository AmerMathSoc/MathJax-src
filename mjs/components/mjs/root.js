export function mjxRoot() {
    return new URL(import.meta.url).pathname.replace(/[cm]js\/components\/[cm]js\/root.js$/, (_) => 'bundle');
}
//# sourceMappingURL=root.js.map