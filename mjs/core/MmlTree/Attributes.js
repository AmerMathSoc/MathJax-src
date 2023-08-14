export const INHERIT = '_inherit_';
export class Attributes {
    constructor(defaults, global) {
        this.global = global;
        this.defaults = Object.create(global);
        this.inherited = Object.create(this.defaults);
        this.attributes = Object.create(this.inherited);
        Object.assign(this.defaults, defaults);
    }
    set(name, value) {
        this.attributes[name] = value;
    }
    setList(list) {
        Object.assign(this.attributes, list);
    }
    get(name) {
        let value = this.attributes[name];
        if (value === INHERIT) {
            value = this.global[name];
        }
        return value;
    }
    getExplicit(name) {
        if (!this.attributes.hasOwnProperty(name)) {
            return undefined;
        }
        return this.attributes[name];
    }
    getList(...names) {
        let values = {};
        for (const name of names) {
            values[name] = this.get(name);
        }
        return values;
    }
    setInherited(name, value) {
        this.inherited[name] = value;
    }
    getInherited(name) {
        return this.inherited[name];
    }
    getDefault(name) {
        return this.defaults[name];
    }
    isSet(name) {
        return this.attributes.hasOwnProperty(name) || this.inherited.hasOwnProperty(name);
    }
    hasDefault(name) {
        return (name in this.defaults);
    }
    getExplicitNames() {
        return Object.keys(this.attributes);
    }
    getInheritedNames() {
        return Object.keys(this.inherited);
    }
    getDefaultNames() {
        return Object.keys(this.defaults);
    }
    getGlobalNames() {
        return Object.keys(this.global);
    }
    getAllAttributes() {
        return this.attributes;
    }
    getAllInherited() {
        return this.inherited;
    }
    getAllDefaults() {
        return this.defaults;
    }
    getAllGlobals() {
        return this.global;
    }
}
//# sourceMappingURL=Attributes.js.map