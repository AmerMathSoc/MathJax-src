import { CHTMLWrapper, Constructor } from '../Wrapper.js';
import { CHTMLscriptbase } from './scriptbase.js';
import { StyleList } from '../../../util/StyleList.js';
declare const CHTMLmsub_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsub<CHTMLWrapper<any, any, any>>> & Constructor<CHTMLscriptbase<any, any, any>>;
export declare class CHTMLmsub<N, T, D> extends CHTMLmsub_base {
    static kind: string;
}
declare const CHTMLmsup_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsup<CHTMLWrapper<any, any, any>>> & Constructor<CHTMLscriptbase<any, any, any>>;
export declare class CHTMLmsup<N, T, D> extends CHTMLmsup_base {
    static kind: string;
}
declare const CHTMLmsubsup_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsubsup<CHTMLWrapper<any, any, any>>> & Constructor<CHTMLscriptbase<any, any, any>>;
export declare class CHTMLmsubsup<N, T, D> extends CHTMLmsubsup_base {
    static kind: string;
    static styles: StyleList;
    markUsed(): void;
    toCHTML(parent: N): void;
}
export {};
