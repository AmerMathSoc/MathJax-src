import { CHTMLWrapper } from '../Wrapper.js';
import { CHTMLWrapperFactory } from '../WrapperFactory.js';
import { CHTMLmtr } from './mtr.js';
import { CHTMLmtd } from './mtd.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { StyleList } from '../../../util/StyleList.js';
declare const CHTMLmtable_base: import("../Wrapper.js").Constructor<import("../../common/Wrappers/mtable.js").CommonMtable<CHTMLmtd<any, any, any>, CHTMLmtr<any, any, any>>> & import("../Wrapper.js").Constructor<CHTMLWrapper<any, any, any>>;
export declare class CHTMLmtable<N, T, D> extends CHTMLmtable_base {
    static kind: string;
    static styles: StyleList;
    labels: N;
    itable: N;
    constructor(factory: CHTMLWrapperFactory<N, T, D>, node: MmlNode, parent?: CHTMLWrapper<N, T, D>);
    getAlignShift(): [string, number];
    toCHTML(parent: N): void;
    protected shiftColor(): void;
    protected padRows(): void;
    protected handleColumnSpacing(): void;
    protected handleColumnLines(): void;
    protected handleColumnWidths(): void;
    protected handleRowSpacing(): void;
    protected handleRowLines(): void;
    protected handleEqualRows(): void;
    protected setRowHeight(row: CHTMLWrapper<N, T, D>, HD: number, D: number, space: number): void;
    protected setCellBaseline(cell: CHTMLWrapper<N, T, D>, ralign: string, HD: number, D: number): boolean;
    protected handleFrame(): void;
    protected handleWidth(): void;
    protected handleAlign(): void;
    protected handleJustify(): void;
    protected handleLabels(): void;
    protected addLabelPadding(side: string): [string, number];
    protected updateRowHeights(): void;
    protected addLabelSpacing(): void;
}
export {};
