import { SVGWrapper, Constructor } from '../Wrapper.js';
import { SVGscriptbase } from './scriptbase.js';
declare const SVGmsub_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsub<SVGWrapper<any, any, any>>> & Constructor<SVGscriptbase<any, any, any>>;
export declare class SVGmsub<N, T, D> extends SVGmsub_base {
    static kind: string;
    static useIC: boolean;
}
declare const SVGmsup_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsup<SVGWrapper<any, any, any>>> & Constructor<SVGscriptbase<any, any, any>>;
export declare class SVGmsup<N, T, D> extends SVGmsup_base {
    static kind: string;
    static useIC: boolean;
}
declare const SVGmsubsup_base: Constructor<import("../../common/Wrappers/msubsup.js").CommonMsubsup<SVGWrapper<any, any, any>>> & Constructor<SVGscriptbase<any, any, any>>;
export declare class SVGmsubsup<N, T, D> extends SVGmsubsup_base {
    static kind: string;
    static useIC: boolean;
    toSVG(parent: N): void;
}
export {};
