export function sreRoot() {
    return new URL(import.meta.url).pathname.replace(/components\/[cm]js\/sre-root.js$/, (_) => 'a11y/sre');
}
//# sourceMappingURL=sre-root.js.map