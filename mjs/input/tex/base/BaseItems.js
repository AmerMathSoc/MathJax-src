import { MapHandler } from '../MapHandler.js';
import { entities } from '../../../util/Entities.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import TexError from '../TexError.js';
import ParseUtil from '../ParseUtil.js';
import NodeUtil from '../NodeUtil.js';
import { BaseItem } from '../StackItem.js';
import { TRBL } from '../../../util/Styles.js';
export class StartItem extends BaseItem {
    constructor(factory, global) {
        super(factory);
        this.global = global;
    }
    get kind() {
        return 'start';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('stop')) {
            let node = this.toMml();
            if (!this.global.isInner) {
                node = this.factory.configuration.tags.finalize(node, this.env);
            }
            return [[this.factory.create('mml', node)], true];
        }
        return super.checkItem(item);
    }
}
export class StopItem extends BaseItem {
    get kind() {
        return 'stop';
    }
    get isClose() {
        return true;
    }
}
export class OpenItem extends BaseItem {
    get kind() {
        return 'open';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('close')) {
            let mml = this.toMml();
            const node = this.create('node', 'TeXAtom', [mml]);
            return [[this.factory.create('mml', node)], true];
        }
        return super.checkItem(item);
    }
}
OpenItem.errors = Object.assign(Object.create(BaseItem.errors), {
    'stop': ['ExtraOpenMissingClose',
        'Extra open brace or missing close brace']
});
export class CloseItem extends BaseItem {
    get kind() {
        return 'close';
    }
    get isClose() {
        return true;
    }
}
export class PrimeItem extends BaseItem {
    get kind() {
        return 'prime';
    }
    checkItem(item) {
        let [top0, top1] = this.Peek(2);
        if (!NodeUtil.isType(top0, 'msubsup') || NodeUtil.isType(top0, 'msup')) {
            const node = this.create('node', 'msup', [top0, top1]);
            return [[node, item], true];
        }
        NodeUtil.setChild(top0, top0.sup, top1);
        return [[top0, item], true];
    }
}
export class SubsupItem extends BaseItem {
    get kind() {
        return 'subsup';
    }
    checkItem(item) {
        if (item.isKind('open') || item.isKind('left')) {
            return BaseItem.success;
        }
        const top = this.First;
        const position = this.getProperty('position');
        if (item.isKind('mml')) {
            if (this.getProperty('primes')) {
                if (position !== 2) {
                    NodeUtil.setChild(top, 2, this.getProperty('primes'));
                }
                else {
                    NodeUtil.setProperty(this.getProperty('primes'), 'variantForm', true);
                    const node = this.create('node', 'mrow', [this.getProperty('primes'), item.First]);
                    item.First = node;
                }
            }
            NodeUtil.setChild(top, position, item.First);
            if (this.getProperty('movesupsub') != null) {
                NodeUtil.setProperty(top, 'movesupsub', this.getProperty('movesupsub'));
            }
            const result = this.factory.create('mml', top);
            return [[result], true];
        }
        if (super.checkItem(item)[1]) {
            const error = this.getErrors(['', 'sub', 'sup'][position]);
            throw new TexError(error[0], error[1], ...error.splice(2));
        }
        return null;
    }
}
SubsupItem.errors = Object.assign(Object.create(BaseItem.errors), {
    'stop': ['MissingScript',
        'Missing superscript or subscript argument'],
    'sup': ['MissingOpenForSup',
        'Missing open brace for superscript'],
    'sub': ['MissingOpenForSub',
        'Missing open brace for subscript']
});
export class OverItem extends BaseItem {
    constructor(factory) {
        super(factory);
        this.setProperty('name', '\\over');
    }
    get kind() {
        return 'over';
    }
    get isClose() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('over')) {
            throw new TexError('AmbiguousUseOf', 'Ambiguous use of %1', item.getName());
        }
        if (item.isClose) {
            let mml = this.create('node', 'mfrac', [this.getProperty('num'), this.toMml(false)]);
            if (this.getProperty('thickness') != null) {
                NodeUtil.setAttribute(mml, 'linethickness', this.getProperty('thickness'));
            }
            if (this.getProperty('ldelim') || this.getProperty('rdelim')) {
                NodeUtil.setProperty(mml, 'withDelims', true);
                mml = ParseUtil.fixedFence(this.factory.configuration, this.getProperty('ldelim'), mml, this.getProperty('rdelim'));
            }
            return [[this.factory.create('mml', mml), item], true];
        }
        return super.checkItem(item);
    }
    toString() {
        return 'over[' + this.getProperty('num') +
            ' / ' + this.nodes.join('; ') + ']';
    }
}
export class LeftItem extends BaseItem {
    constructor(factory, delim) {
        super(factory);
        this.setProperty('delim', delim);
    }
    get kind() {
        return 'left';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('right')) {
            return [[this.factory.create('mml', ParseUtil.fenced(this.factory.configuration, this.getProperty('delim'), this.toMml(), item.getProperty('delim'), '', item.getProperty('color')))], true];
        }
        if (item.isKind('middle')) {
            const def = { stretchy: true };
            if (item.getProperty('color')) {
                def.mathcolor = item.getProperty('color');
            }
            this.Push(this.create('node', 'TeXAtom', [], { texClass: TEXCLASS.CLOSE }), this.create('token', 'mo', def, item.getProperty('delim')), this.create('node', 'TeXAtom', [], { texClass: TEXCLASS.OPEN }));
            this.env = {};
            return [[this], true];
        }
        return super.checkItem(item);
    }
}
LeftItem.errors = Object.assign(Object.create(BaseItem.errors), {
    'stop': ['ExtraLeftMissingRight',
        'Extra \\left or missing \\right']
});
export class Middle extends BaseItem {
    constructor(factory, delim, color) {
        super(factory);
        this.setProperty('delim', delim);
        color && this.setProperty('color', color);
    }
    get kind() {
        return 'middle';
    }
    get isClose() {
        return true;
    }
}
export class RightItem extends BaseItem {
    constructor(factory, delim, color) {
        super(factory);
        this.setProperty('delim', delim);
        color && this.setProperty('color', color);
    }
    get kind() {
        return 'right';
    }
    get isClose() {
        return true;
    }
}
export class BreakItem extends BaseItem {
    get kind() {
        return 'break';
    }
    constructor(factory, linebreak, insert) {
        super(factory);
        this.setProperty('linebreak', linebreak);
        this.setProperty('insert', insert);
    }
    checkItem(item) {
        var _a, _b;
        const linebreak = this.getProperty('linebreak');
        if (item.isKind('mml')) {
            const mml = item.First;
            if (mml.isKind('mo')) {
                const style = ((_b = (_a = NodeUtil.getOp(mml)) === null || _a === void 0 ? void 0 : _a[3]) === null || _b === void 0 ? void 0 : _b.linebreakstyle) ||
                    NodeUtil.getAttribute(mml, 'linebreakstyle');
                if (style !== 'after') {
                    NodeUtil.setAttribute(mml, 'linebreak', linebreak);
                    return [[item], true];
                }
                if (!this.getProperty('insert')) {
                    return [[item], true];
                }
            }
        }
        const mml = this.create('token', 'mspace', { linebreak });
        return [[this.factory.create('mml', mml), item], true];
    }
}
export class BeginItem extends BaseItem {
    get kind() {
        return 'begin';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('end')) {
            if (item.getName() !== this.getName()) {
                throw new TexError('EnvBadEnd', '\\begin{%1} ended with \\end{%2}', this.getName(), item.getName());
            }
            if (!this.getProperty('end')) {
                return [[this.factory.create('mml', this.toMml())], true];
            }
            return BaseItem.fail;
        }
        if (item.isKind('stop')) {
            throw new TexError('EnvMissingEnd', 'Missing \\end{%1}', this.getName());
        }
        return super.checkItem(item);
    }
}
export class EndItem extends BaseItem {
    get kind() {
        return 'end';
    }
    get isClose() {
        return true;
    }
}
export class StyleItem extends BaseItem {
    get kind() {
        return 'style';
    }
    checkItem(item) {
        if (!item.isClose) {
            return super.checkItem(item);
        }
        const mml = this.create('node', 'mstyle', this.nodes, this.getProperty('styles'));
        return [[this.factory.create('mml', mml), item], true];
    }
}
export class PositionItem extends BaseItem {
    get kind() {
        return 'position';
    }
    checkItem(item) {
        if (item.isClose) {
            throw new TexError('MissingBoxFor', 'Missing box for %1', this.getName());
        }
        if (item.isFinal) {
            let mml = item.toMml();
            switch (this.getProperty('move')) {
                case 'vertical':
                    mml = this.create('node', 'mpadded', [mml], { height: this.getProperty('dh'),
                        depth: this.getProperty('dd'),
                        voffset: this.getProperty('dh') });
                    return [[this.factory.create('mml', mml)], true];
                case 'horizontal':
                    return [[this.factory.create('mml', this.getProperty('left')), item,
                            this.factory.create('mml', this.getProperty('right'))], true];
            }
        }
        return super.checkItem(item);
    }
}
export class CellItem extends BaseItem {
    get kind() {
        return 'cell';
    }
    get isClose() {
        return true;
    }
}
export class MmlItem extends BaseItem {
    get isFinal() {
        return true;
    }
    get kind() {
        return 'mml';
    }
}
export class FnItem extends BaseItem {
    get kind() {
        return 'fn';
    }
    checkItem(item) {
        const top = this.First;
        if (top) {
            if (item.isOpen) {
                return BaseItem.success;
            }
            if (!item.isKind('fn')) {
                let mml = item.First;
                if (!item.isKind('mml') || !mml) {
                    return [[top, item], true];
                }
                if ((NodeUtil.isType(mml, 'mstyle') && mml.childNodes.length &&
                    NodeUtil.isType(mml.childNodes[0].childNodes[0], 'mspace')) ||
                    NodeUtil.isType(mml, 'mspace')) {
                    return [[top, item], true];
                }
                if (NodeUtil.isEmbellished(mml)) {
                    mml = NodeUtil.getCoreMO(mml);
                }
                const form = NodeUtil.getForm(mml);
                if (form != null && [0, 0, 1, 1, 0, 1, 1, 0, 0, 0][form[2]]) {
                    return [[top, item], true];
                }
            }
            const node = this.create('token', 'mo', { texClass: TEXCLASS.NONE }, entities.ApplyFunction);
            return [[top, node, item], true];
        }
        return super.checkItem.apply(this, arguments);
    }
}
export class NotItem extends BaseItem {
    constructor() {
        super(...arguments);
        this.remap = MapHandler.getMap('not_remap');
    }
    get kind() {
        return 'not';
    }
    checkItem(item) {
        let mml;
        let c;
        let textNode;
        if (item.isKind('open') || item.isKind('left')) {
            return BaseItem.success;
        }
        if (item.isKind('mml') &&
            (NodeUtil.isType(item.First, 'mo') || NodeUtil.isType(item.First, 'mi') ||
                NodeUtil.isType(item.First, 'mtext'))) {
            mml = item.First;
            c = NodeUtil.getText(mml);
            if (c.length === 1 && !NodeUtil.getProperty(mml, 'movesupsub') &&
                NodeUtil.getChildren(mml).length === 1) {
                if (this.remap.contains(c)) {
                    textNode = this.create('text', this.remap.lookup(c).char);
                    NodeUtil.setChild(mml, 0, textNode);
                }
                else {
                    textNode = this.create('text', '\u0338');
                    NodeUtil.appendChildren(mml, [textNode]);
                }
                return [[item], true];
            }
        }
        textNode = this.create('text', '\u29F8');
        const mtextNode = this.create('node', 'mtext', [], {}, textNode);
        const paddedNode = this.create('node', 'mpadded', [mtextNode], { width: 0 });
        mml = this.create('node', 'TeXAtom', [paddedNode], { texClass: TEXCLASS.REL });
        return [[mml, item], true];
    }
}
export class NonscriptItem extends BaseItem {
    get kind() {
        return 'nonscript';
    }
    checkItem(item) {
        if (item.isKind('mml') && item.Size() === 1) {
            let mml = item.First;
            if (mml.isKind('mstyle') && mml.notParent) {
                mml = NodeUtil.getChildren(NodeUtil.getChildren(mml)[0])[0];
            }
            if (mml.isKind('mspace')) {
                if (mml !== item.First) {
                    const mrow = this.create('node', 'mrow', [item.Pop()]);
                    item.Push(mrow);
                }
                this.factory.configuration.addNode('nonscript', item.First);
            }
        }
        return [[item], true];
    }
}
export class DotsItem extends BaseItem {
    get kind() {
        return 'dots';
    }
    checkItem(item) {
        if (item.isKind('open') || item.isKind('left')) {
            return BaseItem.success;
        }
        let dots = this.getProperty('ldots');
        let top = item.First;
        if (item.isKind('mml') && NodeUtil.isEmbellished(top)) {
            const tclass = NodeUtil.getTexClass(NodeUtil.getCoreMO(top));
            if (tclass === TEXCLASS.BIN || tclass === TEXCLASS.REL) {
                dots = this.getProperty('cdots');
            }
        }
        return [[dots, item], true];
    }
}
export class ArrayItem extends BaseItem {
    constructor() {
        super(...arguments);
        this.table = [];
        this.row = [];
        this.frame = [];
        this.hfill = [];
        this.arraydef = {};
        this.cstart = [];
        this.cend = [];
        this.cextra = [];
        this.atEnd = false;
        this.ralign = [];
        this.breakAlign = {
            cell: '',
            row: '',
            table: ''
        };
    }
    get kind() {
        return 'array';
    }
    get isOpen() {
        return true;
    }
    get copyEnv() {
        return false;
    }
    checkItem(item) {
        if (item.isClose && !item.isKind('over')) {
            if (item.getProperty('isEntry')) {
                this.EndEntry();
                this.clearEnv();
                this.StartEntry();
                return BaseItem.fail;
            }
            if (item.getProperty('isCR')) {
                this.EndEntry();
                this.EndRow();
                this.clearEnv();
                this.StartEntry();
                return BaseItem.fail;
            }
            this.EndTable();
            this.clearEnv();
            let newItem = this.factory.create('mml', this.createMml());
            if (this.getProperty('requireClose')) {
                if (item.isKind('close')) {
                    return [[newItem], true];
                }
                throw new TexError('MissingCloseBrace', 'Missing close brace');
            }
            return [[newItem, item], true];
        }
        return super.checkItem(item);
    }
    createMml() {
        const scriptlevel = this.arraydef['scriptlevel'];
        delete this.arraydef['scriptlevel'];
        let mml = this.create('node', 'mtable', this.table, this.arraydef);
        if (scriptlevel) {
            mml.setProperty('scriptlevel', scriptlevel);
        }
        if (this.breakAlign.table) {
            NodeUtil.setAttribute(mml, 'data-break-align', this.breakAlign.table);
        }
        if (this.getProperty('arrayPadding')) {
            NodeUtil.setAttribute(mml, 'data-frame-styles', '');
            NodeUtil.setAttribute(mml, 'framespacing', this.getProperty('arrayPadding'));
        }
        mml = this.handleFrame(mml);
        if (this.getProperty('open') || this.getProperty('close')) {
            mml = ParseUtil.fenced(this.factory.configuration, this.getProperty('open'), mml, this.getProperty('close'));
        }
        return mml;
    }
    handleFrame(mml) {
        if (!this.frame.length)
            return mml;
        const sides = new Map(this.frame);
        const fstyle = this.frame.reduce((fstyle, [, style]) => style === fstyle ? style : '', this.frame[0][1]);
        if (fstyle) {
            if (this.frame.length === 4) {
                NodeUtil.setAttribute(mml, 'frame', fstyle);
                NodeUtil.removeAttribute(mml, 'data-frame-styles');
                return mml;
            }
            if (fstyle === 'solid') {
                NodeUtil.setAttribute(mml, 'data-frame-styles', '');
                mml = this.create('node', 'menclose', [mml], {
                    notation: Array.from(sides.keys()).join(' '),
                    'data-padding': 0
                });
                return mml;
            }
        }
        const styles = TRBL.map(side => sides.get(side) || 'none').join(' ');
        NodeUtil.setAttribute(mml, 'data-frame-styles', styles);
        return mml;
    }
    StartEntry() {
        const n = this.row.length;
        let start = this.cstart[n];
        let end = this.cend[n];
        const ralign = this.ralign[n];
        const cextra = this.cextra;
        if (!start && !end && !ralign && !cextra[n] && !cextra[n + 1])
            return;
        let [prefix, entry, term, found] = this.getEntry();
        if (cextra[n] && (!this.atEnd || cextra[n + 1])) {
            start += '&';
        }
        if (term !== '&') {
            found = !!entry.trim() || !!(n || term.substr(0, 4) !== '\\end');
            if (cextra[n + 1] && !cextra[n]) {
                end = (end || '') + '&';
                this.atEnd = true;
            }
        }
        if (!found && !prefix)
            return;
        const parser = this.parser;
        if (found) {
            if (start) {
                entry = ParseUtil.addArgs(parser, start, entry);
            }
            if (end) {
                entry = ParseUtil.addArgs(parser, entry, end);
            }
            if (ralign) {
                entry = '\\text{' + entry.trim() + '}';
            }
        }
        if (prefix) {
            entry = ParseUtil.addArgs(parser, prefix, entry);
        }
        parser.string = ParseUtil.addArgs(parser, entry, parser.string);
        parser.i = 0;
    }
    getEntry() {
        const parser = this.parser;
        const pattern = /^([^]*?)([&{}]|\\\\|\\(?:begin|end)\s*\{array\}|\\cr|\\)/;
        let braces = 0, envs = 0;
        let i = parser.i;
        let match;
        const fail = ['', '', '', false];
        while ((match = parser.string.slice(i).match(pattern)) !== null) {
            i += match[0].length;
            switch (match[2]) {
                case '\\':
                    i++;
                    break;
                case '{':
                    braces++;
                    break;
                case '}':
                    if (!braces)
                        return fail;
                    braces--;
                    break;
                case '\\begin{array}':
                    !braces && envs++;
                    break;
                case '\\end{array}':
                    if (!braces && envs) {
                        envs--;
                        break;
                    }
                default:
                    if (braces || envs)
                        continue;
                    i -= match[2].length;
                    let entry = parser.string.slice(parser.i, i).trim();
                    const prefix = entry.match(/^(?:\s*\\(?:h(?:dash)?line|hfil{1,3}|rowcolor\s*\{.*?\}))+/);
                    if (prefix) {
                        entry = entry.slice(prefix[0].length);
                    }
                    parser.string = parser.string.slice(i);
                    parser.i = 0;
                    return [(prefix === null || prefix === void 0 ? void 0 : prefix[0]) || '', entry, match[2], true];
            }
        }
        return fail;
    }
    EndEntry() {
        const mtd = this.create('node', 'mtd', this.nodes);
        if (this.hfill.length) {
            if (this.hfill[0] === 0) {
                NodeUtil.setAttribute(mtd, 'columnalign', 'right');
            }
            if (this.hfill[this.hfill.length - 1] === this.Size()) {
                NodeUtil.setAttribute(mtd, 'columnalign', NodeUtil.getAttribute(mtd, 'columnalign') ? 'center' : 'left');
            }
        }
        const ralign = this.ralign[this.row.length];
        if (ralign) {
            let [valign, cwidth, calign] = ralign;
            if (this.breakAlign.cell) {
                valign = this.breakAlign.cell;
            }
            const box = this.create('node', 'mpadded', mtd.childNodes[0].childNodes, {
                width: cwidth,
                'data-overflow': 'auto',
                'data-align': calign,
                'data-vertical-align': valign
            });
            box.setProperty('vbox', valign);
            mtd.childNodes[0].childNodes = [];
            mtd.appendChild(box);
        }
        else if (this.breakAlign.cell) {
            NodeUtil.setAttribute(mtd, 'data-vertical-align', this.breakAlign.cell);
        }
        this.breakAlign.cell = '';
        this.row.push(mtd);
        this.Clear();
        this.hfill = [];
    }
    EndRow() {
        let type = 'mtr';
        if (this.getProperty('isNumbered') && this.row.length === 3) {
            this.row.unshift(this.row.pop());
            type = 'mlabeledtr';
        }
        else if (this.getProperty('isLabeled')) {
            type = 'mlabeledtr';
            this.setProperty('isLabeled', false);
        }
        const node = this.create('node', type, this.row);
        if (this.breakAlign.row) {
            NodeUtil.setAttribute(node, 'data-break-align', this.breakAlign.row);
            this.breakAlign.row = '';
        }
        this.table.push(node);
        this.row = [];
        this.atEnd = false;
    }
    EndTable() {
        if (this.Size() || this.row.length) {
            this.EndEntry();
            this.EndRow();
        }
        this.checkLines();
    }
    checkLines() {
        if (this.arraydef.rowlines) {
            const lines = this.arraydef.rowlines.split(/ /);
            if (lines.length === this.table.length) {
                this.frame.push(['bottom', lines.pop()]);
                if (lines.length) {
                    this.arraydef.rowlines = lines.join(' ');
                }
                else {
                    delete this.arraydef.rowlines;
                }
            }
            else if (lines.length < this.table.length - 1) {
                this.arraydef.rowlines += ' none';
            }
        }
        if (this.getProperty('rowspacing')) {
            const rows = this.arraydef.rowspacing.split(/ /);
            while (rows.length < this.table.length) {
                rows.push(this.getProperty('rowspacing') + 'em');
            }
            this.arraydef.rowspacing = rows.join(' ');
        }
    }
    addRowSpacing(spacing) {
        if (this.arraydef['rowspacing']) {
            const rows = this.arraydef['rowspacing'].split(/ /);
            if (!this.getProperty('rowspacing')) {
                let dimem = ParseUtil.dimen2em(rows[0]);
                this.setProperty('rowspacing', dimem);
            }
            const rowspacing = this.getProperty('rowspacing');
            while (rows.length < this.table.length) {
                rows.push(ParseUtil.Em(rowspacing));
            }
            rows[this.table.length - 1] = ParseUtil.Em(Math.max(0, rowspacing + ParseUtil.dimen2em(spacing)));
            this.arraydef['rowspacing'] = rows.join(' ');
        }
    }
}
export class EqnArrayItem extends ArrayItem {
    constructor(factory, ...args) {
        super(factory);
        this.maxrow = 0;
        this.factory.configuration.tags.start(args[0], args[2], args[1]);
    }
    get kind() {
        return 'eqnarray';
    }
    EndEntry() {
        if (this.row.length) {
            ParseUtil.fixInitialMO(this.factory.configuration, this.nodes);
        }
        super.EndEntry();
    }
    EndRow() {
        if (this.row.length > this.maxrow) {
            this.maxrow = this.row.length;
        }
        const tag = this.factory.configuration.tags.getTag();
        if (tag) {
            this.row = [tag].concat(this.row);
            this.setProperty('isLabeled', true);
        }
        this.factory.configuration.tags.clearTag();
        super.EndRow();
    }
    EndTable() {
        super.EndTable();
        this.factory.configuration.tags.end();
        this.extendArray('columnalign', this.maxrow);
        this.extendArray('columnwidth', this.maxrow);
        this.extendArray('columnspacing', this.maxrow - 1);
        this.extendArray('data-break-align', this.maxrow);
        this.addIndentshift();
    }
    extendArray(name, max) {
        if (!this.arraydef[name])
            return;
        const repeat = this.arraydef[name].split(/ /);
        const columns = [...repeat];
        if (columns.length > 1) {
            while (columns.length < max) {
                columns.push(...repeat);
            }
            this.arraydef[name] = columns.slice(0, max).join(' ');
        }
    }
    addIndentshift() {
        if (!this.arraydef.columnalign)
            return;
        const align = this.arraydef.columnalign.split(/ /);
        let prev = '';
        for (const i of align.keys()) {
            if (align[i] === 'left' && i > 0) {
                const indentshift = (prev === 'center' ? '.7em' : '2em');
                for (const row of this.table) {
                    const cell = row.childNodes[row.isKind('mlabeledtr') ? i + 1 : i];
                    if (cell) {
                        const mstyle = this.create('node', 'mstyle', cell.childNodes[0].childNodes, { indentshift });
                        cell.childNodes[0].childNodes = [];
                        cell.appendChild(mstyle);
                    }
                }
            }
            prev = align[i];
        }
    }
}
export class MstyleItem extends BeginItem {
    get kind() {
        return 'mstyle';
    }
    constructor(factory, attr, name) {
        super(factory);
        this.attrList = attr;
        this.setProperty('name', name);
    }
    checkItem(item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            const mml = this.create('node', 'mstyle', [this.toMml()], this.attrList);
            return [[mml], true];
        }
        return super.checkItem(item);
    }
}
export class EquationItem extends BaseItem {
    constructor(factory, ...args) {
        super(factory);
        this.factory.configuration.tags.start('equation', true, args[0]);
    }
    get kind() {
        return 'equation';
    }
    get isOpen() {
        return true;
    }
    checkItem(item) {
        if (item.isKind('end')) {
            let mml = this.toMml();
            let tag = this.factory.configuration.tags.getTag();
            this.factory.configuration.tags.end();
            return [[tag ? this.factory.configuration.tags.enTag(mml, tag) : mml, item], true];
        }
        if (item.isKind('stop')) {
            throw new TexError('EnvMissingEnd', 'Missing \\end{%1}', this.getName());
        }
        return super.checkItem(item);
    }
}
//# sourceMappingURL=BaseItems.js.map