import { BBox } from '../../../util/BBox.js';
import { DIRECTION } from '../FontData.js';
import { split, isPercent } from '../../../util/string.js';
import { sum, max } from '../../../util/numeric.js';
import { Styles, TRBL } from '../../../util/Styles.js';
export const BREAK_BELOW = 0.333;
export function CommonMtableMixin(Base) {
    return class CommonMtableMixin extends Base {
        get tableRows() {
            return this.childNodes;
        }
        findContainer() {
            let node = this;
            let parent = node.parent;
            while (parent && (parent.node.notParent || parent.node.isKind('mrow'))) {
                node = parent;
                parent = parent.parent;
            }
            this.container = parent;
            this.containerI = node.node.childPosition();
        }
        getPercentageWidth() {
            if (this.hasLabels) {
                this.bbox.pwidth = BBox.fullWidth;
            }
            else {
                const width = this.node.attributes.get('width');
                if (isPercent(width)) {
                    this.bbox.pwidth = width;
                }
            }
        }
        stretchRows() {
            const equal = this.node.attributes.get('equalrows');
            const HD = equal ? this.getEqualRowHeight() : 0;
            const { H, D } = equal ? this.getTableData() : { H: [0], D: [0] };
            const rows = this.tableRows;
            for (let i = 0; i < this.numRows; i++) {
                const hd = equal
                    ? [(HD + H[i] - D[i]) / 2, (HD - H[i] + D[i]) / 2]
                    : null;
                rows[i].stretchChildren(hd);
            }
        }
        stretchColumns() {
            const swidths = this.getColumnAttributes('columnwidth', 0);
            for (let i = 0; i < this.numCols; i++) {
                const width = typeof this.cWidths[i] === 'number'
                    ? this.cWidths[i]
                    : null;
                this.stretchColumn(i, width);
                if (width !== null) {
                    this.breakColumn(i, width, swidths[i]);
                }
            }
        }
        stretchColumn(i, W) {
            const stretchy = [];
            for (const row of this.tableRows) {
                const cell = row.getChild(i);
                if (cell) {
                    const child = cell.childNodes[0];
                    if (child.stretch.dir === DIRECTION.None &&
                        child.canStretch(DIRECTION.Horizontal)) {
                        stretchy.push(child);
                    }
                }
            }
            const count = stretchy.length;
            const nodeCount = this.childNodes.length;
            if (count && nodeCount > 1 && W === null) {
                W = 0;
                const all = count > 1 && count === nodeCount;
                for (const row of this.tableRows) {
                    const cell = row.getChild(i);
                    if (cell) {
                        const child = cell.childNodes[0];
                        const noStretch = child.stretch.dir === DIRECTION.None;
                        if (all || noStretch) {
                            const { w } = child.getBBox(noStretch);
                            if (w > W) {
                                W = w;
                            }
                        }
                    }
                }
            }
            if (W !== null) {
                for (const child of stretchy) {
                    child
                        .coreMO()
                        .getStretchedVariant([
                        Math.max(W, child.getBBox().w) / child.coreRScale(),
                    ]);
                }
            }
        }
        breakColumn(i, W, type) {
            if (this.jax.math.root.attributes.get('overflow') !== 'linebreak' ||
                !this.jax.math.display)
                return;
            const { D } = this.getTableData();
            let j = 0;
            let w = 0;
            for (const row of this.tableRows) {
                const cell = row.getChild(i);
                if (cell && cell.getBBox().w > W) {
                    cell.childNodes[0].breakToWidth(W);
                    const bbox = cell.getBBox();
                    D[j] = Math.max(D[j], bbox.d);
                    if (bbox.w > w) {
                        w = bbox.w;
                    }
                }
                j++;
            }
            if (type === 'fit' ||
                type === 'auto' ||
                isPercent(type) ||
                w > this.cWidths[i]) {
                this.cWidths[i] = w;
            }
        }
        getTableData() {
            if (this.data) {
                return this.data;
            }
            const H = new Array(this.numRows).fill(0);
            const D = new Array(this.numRows).fill(0);
            const W = new Array(this.numCols).fill(0);
            const NH = new Array(this.numRows);
            const ND = new Array(this.numRows);
            const LW = [0];
            const rows = this.tableRows;
            for (let j = 0; j < rows.length; j++) {
                let M = 0;
                const row = rows[j];
                const align = row.node.attributes.get('rowalign');
                for (let i = 0; i < row.numCells; i++) {
                    const cell = row.getChild(i);
                    M = this.updateHDW(cell, i, j, align, H, D, W, M);
                    this.recordPWidthCell(cell, i);
                }
                NH[j] = H[j];
                ND[j] = D[j];
                if (row.labeled) {
                    M = this.updateHDW(row.childNodes[0], 0, j, align, H, D, LW, M);
                }
                this.extendHD(j, H, D, M);
                this.extendHD(j, NH, ND, M);
            }
            const L = LW[0];
            this.data = { H, D, W, NH, ND, L };
            return this.data;
        }
        updateHDW(cell, i, j, align, H, D, W, M) {
            let { h, d, w } = cell.getBBox();
            const scale = cell.parent.bbox.rscale;
            if (cell.parent.bbox.rscale !== 1) {
                h *= scale;
                d *= scale;
                w *= scale;
            }
            if (this.node.getProperty('useHeight')) {
                if (h < 0.75)
                    h = 0.75;
                if (d < 0.25)
                    d = 0.25;
            }
            let m = 0;
            align = cell.node.attributes.get('rowalign') || align;
            if (align !== 'baseline' && align !== 'axis') {
                m = h + d;
                h = d = 0;
            }
            if (h > H[j])
                H[j] = h;
            if (d > D[j])
                D[j] = d;
            if (m > M)
                M = m;
            if (W && w > W[i])
                W[i] = w;
            return M;
        }
        extendHD(i, H, D, M) {
            const d = (M - (H[i] + D[i])) / 2;
            if (d < 0.00001)
                return;
            H[i] += d;
            D[i] += d;
        }
        recordPWidthCell(cell, i) {
            if (cell.childNodes[0] && cell.childNodes[0].getBBox().pwidth) {
                this.pwidthCells.push([cell, i]);
            }
        }
        setColumnPWidths() {
            const W = this.cWidths;
            for (const [cell, i] of this.pwidthCells) {
                if (cell.setChildPWidths(false, W[i])) {
                    cell.invalidateBBox();
                    cell.getBBox();
                }
            }
        }
        getBBoxHD(height) {
            const [align, row] = this.getAlignmentRow();
            if (row === null) {
                const a = this.font.params.axis_height;
                const h2 = height / 2;
                const HD = {
                    top: [0, height],
                    center: [h2, h2],
                    bottom: [height, 0],
                    baseline: [h2, h2],
                    axis: [h2 + a, h2 - a],
                };
                return HD[align] || [h2, h2];
            }
            else {
                const y = this.getVerticalPosition(row, align);
                return [y, height - y];
            }
        }
        getBBoxLR() {
            var _a;
            if (this.hasLabels) {
                const attributes = this.node.attributes;
                const side = attributes.get('side');
                let [pad, align] = this.getPadAlignShift(side);
                const labels = this.hasLabels && !!attributes.get('data-width-includes-label');
                if (labels && this.frame && this.fSpace[0]) {
                    pad -= this.fSpace[0];
                }
                return align === 'center' && !labels
                    ? [pad, pad]
                    : side === 'left'
                        ? [pad, 0]
                        : [0, pad];
            }
            return [((_a = this.bbox) === null || _a === void 0 ? void 0 : _a.L) || 0, 0];
        }
        getPadAlignShift(side) {
            const { L } = this.getTableData();
            const sep = this.length2em(this.node.attributes.get('minlabelspacing'));
            let pad = L + sep;
            const [lpad, rpad] = this.styles == null
                ? ['', '']
                : [this.styles.get('padding-left'), this.styles.get('padding-right')];
            if (lpad || rpad) {
                pad = Math.max(pad, this.length2em(lpad || '0'), this.length2em(rpad || '0'));
            }
            let [align, shift] = this.getAlignShift();
            if (align === side) {
                shift =
                    side === 'left'
                        ? Math.max(pad, shift) - pad
                        : Math.min(-pad, shift) + pad;
            }
            return [pad, align, shift];
        }
        getWidth() {
            return this.pWidth || this.getBBox().w;
        }
        adjustWideTable() {
            const attributes = this.node.attributes;
            if (attributes.get('width') !== 'auto')
                return;
            const [pad, align] = this.getPadAlignShift(attributes.get('side'));
            const W = Math.max(this.containerWidth / 10, this.containerWidth - pad - (align === 'center' ? pad : 0));
            if (this.naturalWidth() > W) {
                this.adjustColumnWidths(W);
            }
        }
        naturalWidth() {
            const CW = this.getComputedWidths();
            return (sum(CW.concat(this.cLines, this.cSpace)) +
                2 * this.fLine +
                this.fSpace[0] +
                this.fSpace[2]);
        }
        getEqualRowHeight() {
            const { H, D } = this.getTableData();
            const HD = Array.from(H.keys()).map((i) => H[i] + D[i]);
            return Math.max(...HD);
        }
        getComputedWidths() {
            const W = this.getTableData().W;
            let CW = Array.from(W.keys()).map((i) => {
                return typeof this.cWidths[i] === 'number'
                    ? this.cWidths[i]
                    : W[i];
            });
            if (this.node.attributes.get('equalcolumns')) {
                CW = Array(CW.length).fill(max(CW));
            }
            return CW;
        }
        getColumnWidths() {
            const width = this.node.attributes.get('width');
            if (this.node.attributes.get('equalcolumns')) {
                return this.getEqualColumns(width);
            }
            const swidths = this.getColumnAttributes('columnwidth', 0);
            if (width === 'auto') {
                return this.getColumnWidthsAuto(swidths);
            }
            if (isPercent(width)) {
                return this.getColumnWidthsPercent(swidths);
            }
            return this.getColumnWidthsFixed(swidths, this.length2em(width));
        }
        getEqualColumns(width) {
            const n = Math.max(1, this.numCols);
            let cwidth;
            if (width === 'auto') {
                const { W } = this.getTableData();
                cwidth = max(W);
            }
            else if (isPercent(width)) {
                cwidth = this.percent(1 / n);
            }
            else {
                const w = sum([].concat(this.cLines, this.cSpace)) +
                    this.fSpace[0] +
                    this.fSpace[2];
                cwidth = Math.max(0, this.length2em(width) - w) / n;
            }
            return Array(this.numCols).fill(cwidth);
        }
        getColumnWidthsAuto(swidths) {
            return swidths.map((x) => {
                if (x === 'auto' || x === 'fit')
                    return null;
                if (isPercent(x))
                    return x;
                return this.length2em(x);
            });
        }
        getColumnWidthsPercent(swidths) {
            const hasFit = swidths.includes('fit');
            const { W } = hasFit ? this.getTableData() : { W: null };
            return Array.from(swidths.keys()).map((i) => {
                const x = swidths[i];
                if (x === 'fit')
                    return null;
                if (x === 'auto')
                    return hasFit ? W[i] : null;
                if (isPercent(x))
                    return x;
                return this.length2em(x);
            });
        }
        getColumnWidthsFixed(swidths, width) {
            const indices = Array.from(swidths.keys());
            const fit = indices.filter((i) => swidths[i] === 'fit');
            const auto = indices.filter((i) => swidths[i] === 'auto');
            const n = fit.length || auto.length;
            const { W } = n ? this.getTableData() : { W: null };
            const cwidth = width -
                sum([].concat(this.cLines, this.cSpace)) -
                this.fSpace[0] -
                this.fSpace[2];
            let dw = cwidth;
            indices.forEach((i) => {
                const x = swidths[i];
                dw -= x === 'fit' || x === 'auto' ? W[i] : this.length2em(x, cwidth);
            });
            const fw = n && dw > 0 ? dw / n : 0;
            return indices.map((i) => {
                const x = swidths[i];
                if (x === 'fit')
                    return W[i] + fw;
                if (x === 'auto')
                    return W[i] + (fit.length === 0 ? fw : 0);
                return this.length2em(x, cwidth);
            });
        }
        adjustColumnWidths(width) {
            const { W } = this.getTableData();
            const swidths = this.getColumnAttributes('columnwidth', 0);
            const indices = Array.from(swidths.keys());
            const fit = indices
                .filter((i) => swidths[i] === 'fit')
                .sort((a, b) => W[b] - W[a]);
            const auto = indices
                .filter((i) => swidths[i] === 'auto')
                .sort((a, b) => W[b] - W[a]);
            const percent = indices
                .filter((i) => isPercent(swidths[i]))
                .sort((a, b) => W[b] - W[a]);
            const fixed = indices
                .filter((i) => swidths[i] !== 'fit' &&
                swidths[i] !== 'auto' &&
                !isPercent(swidths[i]))
                .sort((a, b) => W[b] - W[a]);
            const columns = [...fit, ...auto, ...percent, ...fixed];
            if (!columns.length)
                return;
            this.cWidths = indices.map((i) => typeof this.cWidths[i] === 'number' ? this.cWidths[i] : W[i]);
            const cwidth = width -
                sum([].concat(this.cLines, this.cSpace)) -
                this.fSpace[0] -
                this.fSpace[2];
            let dw = sum(this.cWidths) - cwidth;
            let w = 0;
            let n = 0;
            while (n < columns.length) {
                w += W[columns[n++]];
                if (w && dw / w < BREAK_BELOW)
                    break;
            }
            dw = 1 - dw / w;
            columns.slice(0, n).forEach((i) => (this.cWidths[i] *= dw));
        }
        getVerticalPosition(i, align) {
            const equal = this.node.attributes.get('equalrows');
            const { H, D } = this.getTableData();
            const HD = equal ? this.getEqualRowHeight() : 0;
            const space = this.getRowHalfSpacing();
            let y = this.fLine;
            for (let j = 0; j < i; j++) {
                y +=
                    space[j] + (equal ? HD : H[j] + D[j]) + space[j + 1] + this.rLines[j];
            }
            const [h, d] = equal
                ? [(HD + H[i] - D[i]) / 2, (HD - H[i] + D[i]) / 2]
                : [H[i], D[i]];
            const offset = {
                top: 0,
                center: space[i] + (h + d) / 2,
                bottom: space[i] + h + d + space[i + 1],
                baseline: space[i] + h,
                axis: space[i] + h - 0.25,
            };
            y += offset[align] || 0;
            return y;
        }
        getFrameSpacing() {
            const fspace = this.fframe
                ? this.convertLengths(this.getAttributeArray('framespacing'))
                : [0, 0];
            fspace[2] = fspace[0];
            const padding = this.node.attributes.get('data-array-padding');
            if (padding) {
                const [L, R] = this.convertLengths(split(padding));
                fspace[0] = L;
                fspace[2] = R;
            }
            return fspace;
        }
        getEmHalfSpacing(fspace, space, scale = 1) {
            const spaceEm = this.addEm(space, 2 / scale);
            spaceEm.unshift(this.em(fspace[0] * scale));
            spaceEm.push(this.em(fspace[1] * scale));
            return spaceEm;
        }
        getRowHalfSpacing() {
            const space = this.rSpace.map((x) => x / 2);
            space.unshift(this.fSpace[1]);
            space.push(this.fSpace[1]);
            return space;
        }
        getColumnHalfSpacing() {
            const space = this.cSpace.map((x) => x / 2);
            space.unshift(this.fSpace[0]);
            space.push(this.fSpace[2]);
            return space;
        }
        getAlignmentRow() {
            const [align, row] = split(this.node.attributes.get('align'));
            if (row == null)
                return [align, null];
            let i = parseInt(row);
            if (i < 0)
                i += this.numRows + 1;
            return [align, i < 1 || i > this.numRows ? null : i - 1];
        }
        getColumnAttributes(name, i = 1) {
            const n = this.numCols - i;
            const columns = this.getAttributeArray(name);
            if (columns.length === 0)
                return null;
            while (columns.length < n) {
                columns.push(columns[columns.length - 1]);
            }
            if (columns.length > n) {
                columns.splice(n);
            }
            return columns;
        }
        getRowAttributes(name, i = 1) {
            const n = this.numRows - i;
            const rows = this.getAttributeArray(name);
            if (rows.length === 0)
                return null;
            while (rows.length < n) {
                rows.push(rows[rows.length - 1]);
            }
            if (rows.length > n) {
                rows.splice(n);
            }
            return rows;
        }
        getAttributeArray(name) {
            const value = this.node.attributes.get(name);
            if (!value)
                return [this.node.attributes.getDefault(name)];
            return split(value);
        }
        addEm(list, n = 1) {
            if (!list)
                return null;
            return list.map((x) => this.em(x / n));
        }
        convertLengths(list) {
            if (!list)
                return null;
            return list.map((x) => this.length2em(x));
        }
        constructor(factory, node, parent = null) {
            super(factory, node, parent);
            this.numCols = 0;
            this.numRows = 0;
            this.data = null;
            this.pwidthCells = [];
            this.pWidth = 0;
            this.numCols = max(this.tableRows.map((row) => row.numCells));
            this.numRows = this.childNodes.length;
            this.hasLabels = this.childNodes.reduce((value, row) => value || row.node.isKind('mlabeledtr'), false);
            this.findContainer();
            this.isTop =
                !this.container ||
                    (this.container.node.isKind('math') && !this.container.parent);
            if (this.isTop) {
                this.jax.table = this;
            }
            this.getPercentageWidth();
            const attributes = this.node.attributes;
            const frame = attributes.get('frame');
            this.frame = frame !== 'none';
            this.fframe =
                this.frame || attributes.get('data-frame-styles') !== undefined;
            this.fLine = this.frame ? 0.07 : 0;
            this.fSpace = this.getFrameSpacing();
            this.cSpace = this.convertLengths(this.getColumnAttributes('columnspacing'));
            this.rSpace = this.convertLengths(this.getRowAttributes('rowspacing'));
            this.cLines = this.getColumnAttributes('columnlines').map((x) => x === 'none' ? 0 : 0.07);
            this.rLines = this.getRowAttributes('rowlines').map((x) => x === 'none' ? 0 : 0.07);
            this.cWidths = this.getColumnWidths();
            this.adjustWideTable();
            this.stretchColumns();
            this.stretchRows();
        }
        getStyles() {
            super.getStyles();
            const frame = this.node.attributes.get('data-frame-styles');
            if (!frame)
                return;
            if (!this.styles) {
                this.styles = new Styles('');
            }
            const fstyles = frame.split(/ /);
            for (const i of TRBL.keys()) {
                const style = fstyles[i];
                if (style === 'none')
                    continue;
                this.styles.set(`border-${TRBL[i]}`, `.07em ${style}`);
            }
        }
        computeBBox(bbox, _recompute = false) {
            const { H, D } = this.getTableData();
            let height, width;
            if (this.node.attributes.get('equalrows')) {
                const HD = this.getEqualRowHeight();
                height = sum([].concat(this.rLines, this.rSpace)) + HD * this.numRows;
            }
            else {
                height = sum(H.concat(D, this.rLines, this.rSpace));
            }
            height += 2 * (this.fLine + this.fSpace[1]);
            width = this.naturalWidth();
            const w = this.node.attributes.get('width');
            if (w !== 'auto') {
                width = Math.max(this.length2em(w, 0) + 2 * this.fLine, width);
            }
            const [h, d] = this.getBBoxHD(height);
            bbox.h = h;
            bbox.d = d;
            bbox.w = width;
            const [L, R] = this.getBBoxLR();
            bbox.L = L;
            bbox.R = R;
            if (!isPercent(w)) {
                this.setColumnPWidths();
            }
        }
        setChildPWidths(_recompute, cwidth, _clear) {
            const width = this.node.attributes.get('width');
            if (!isPercent(width))
                return false;
            if (!this.hasLabels) {
                this.bbox.pwidth = '';
                this.container.bbox.pwidth = '';
            }
            const { w, L, R } = this.bbox;
            const labelInWidth = this.node.attributes.get('data-width-includes-label');
            const W = Math.max(w, this.length2em(width, Math.max(cwidth, L + w + R))) -
                (labelInWidth ? L + R : 0);
            const cols = this.node.attributes.get('equalcolumns')
                ? Array(this.numCols).fill(this.percent(1 / Math.max(1, this.numCols)))
                : this.getColumnAttributes('columnwidth', 0);
            this.cWidths = this.getColumnWidthsFixed(cols, W);
            this.pWidth = this.naturalWidth();
            if (this.isTop) {
                this.bbox.w = this.pWidth;
            }
            this.setColumnPWidths();
            if (this.pWidth !== w) {
                this.parent.invalidateBBox();
            }
            return this.pWidth !== w;
        }
        getAlignShift() {
            return this.isTop
                ? super.getAlignShift()
                : [this.container.getChildAlign(this.containerI), 0];
        }
    };
}
//# sourceMappingURL=mtable.js.map