export const hasWindow = typeof window !== 'undefined';
export const context = {
    window: hasWindow ? window : null,
    document: hasWindow ? window.document : null,
};
//# sourceMappingURL=context.js.map