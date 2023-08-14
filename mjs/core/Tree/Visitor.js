export class AbstractVisitor {
    static methodName(kind) {
        return 'visit' + (kind.charAt(0).toUpperCase() + kind.substr(1)).replace(/[^a-z0-9_]/ig, '_') + 'Node';
    }
    constructor(factory) {
        this.nodeHandlers = new Map();
        for (const kind of factory.getKinds()) {
            let method = this[AbstractVisitor.methodName(kind)];
            if (method) {
                this.nodeHandlers.set(kind, method);
            }
        }
    }
    visitTree(tree, ...args) {
        return this.visitNode(tree, ...args);
    }
    visitNode(node, ...args) {
        let handler = this.nodeHandlers.get(node.kind) || this.visitDefault;
        return handler.call(this, node, ...args);
    }
    visitDefault(node, ...args) {
        if ('childNodes' in node) {
            for (const child of node.childNodes) {
                this.visitNode(child, ...args);
            }
        }
    }
    setNodeHandler(kind, handler) {
        this.nodeHandlers.set(kind, handler);
    }
    removeNodeHandler(kind) {
        this.nodeHandlers.delete(kind);
    }
}
//# sourceMappingURL=Visitor.js.map