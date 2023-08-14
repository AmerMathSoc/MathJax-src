import { PrioritizedList } from '../../util/PrioritizedList.js';
import { FunctionList } from '../../util/FunctionList.js';
export var MapHandler;
(function (MapHandler) {
    let maps = new Map();
    MapHandler.register = function (map) {
        maps.set(map.name, map);
    };
    MapHandler.getMap = function (name) {
        return maps.get(name);
    };
})(MapHandler || (MapHandler = {}));
export class SubHandler {
    constructor() {
        this._configuration = new PrioritizedList();
        this._fallback = new FunctionList();
    }
    add(maps, fallback, priority = PrioritizedList.DEFAULTPRIORITY) {
        for (const name of maps.slice().reverse()) {
            let map = MapHandler.getMap(name);
            if (!map) {
                this.warn('Configuration ' + name + ' not found! Omitted.');
                return;
            }
            this._configuration.add(map, priority);
        }
        if (fallback) {
            this._fallback.add(fallback, priority);
        }
    }
    parse(input) {
        for (let { item: map } of this._configuration) {
            const result = map.parse(input);
            if (result) {
                return result;
            }
        }
        let [env, symbol] = input;
        Array.from(this._fallback)[0].item(env, symbol);
    }
    lookup(symbol) {
        let map = this.applicable(symbol);
        return map ? map.lookup(symbol) : null;
    }
    contains(symbol) {
        return this.applicable(symbol) ? true : false;
    }
    toString() {
        let names = [];
        for (let { item: map } of this._configuration) {
            names.push(map.name);
        }
        return names.join(', ');
    }
    applicable(symbol) {
        for (let { item: map } of this._configuration) {
            if (map.contains(symbol)) {
                return map;
            }
        }
        return null;
    }
    retrieve(name) {
        for (let { item: map } of this._configuration) {
            if (map.name === name) {
                return map;
            }
        }
        return null;
    }
    warn(message) {
        console.log('TexParser Warning: ' + message);
    }
}
export class SubHandlers {
    constructor() {
        this.map = new Map();
    }
    add(handlers, fallbacks, priority = PrioritizedList.DEFAULTPRIORITY) {
        for (const key of Object.keys(handlers)) {
            let name = key;
            let subHandler = this.get(name);
            if (!subHandler) {
                subHandler = new SubHandler();
                this.set(name, subHandler);
            }
            subHandler.add(handlers[name], fallbacks[name], priority);
        }
    }
    set(name, subHandler) {
        this.map.set(name, subHandler);
    }
    get(name) {
        return this.map.get(name);
    }
    retrieve(name) {
        for (const handler of this.map.values()) {
            let map = handler.retrieve(name);
            if (map) {
                return map;
            }
        }
        return null;
    }
    keys() {
        return this.map.keys();
    }
}
//# sourceMappingURL=MapHandler.js.map