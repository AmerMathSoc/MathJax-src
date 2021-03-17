import { CHTMLWrapper } from '../Wrapper.js';
import { BBox } from '../../../util/BBox.js';
declare const CHTMLscriptbase_base: import("../Wrapper.js").Constructor<import("../../common/Wrappers/scriptbase.js").CommonScriptbase<CHTMLWrapper<any, any, any>>> & import("../Wrapper.js").Constructor<CHTMLWrapper<any, any, any>>;
export declare class CHTMLscriptbase<N, T, D> extends CHTMLscriptbase_base {
    static kind: string;
    static useIC: boolean;
    toCHTML(parent: N): void;
    protected setDeltaW(nodes: N[], dx: number[]): void;
    protected adjustOverDepth(over: N, overbox: BBox): void;
    protected adjustUnderDepth(under: N, underbox: BBox): void;
    protected adjustBaseWidth(): void;
}
export {};
