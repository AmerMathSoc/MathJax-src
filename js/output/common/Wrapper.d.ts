import { AbstractWrapper, WrapperClass } from '../../core/Tree/Wrapper.js';
import { PropertyList } from '../../core/Tree/Node.js';
import { MmlNode, MmlNodeClass, TextNode } from '../../core/MmlTree/MmlNode.js';
import { Property } from '../../core/Tree/Node.js';
import { Styles } from '../../util/Styles.js';
import { StyleList } from '../../util/StyleList.js';
import { CommonOutputJax } from '../common.js';
import { CommonWrapperFactory } from './WrapperFactory.js';
import { CommonMo } from './Wrappers/mo.js';
import { BBox } from '../../util/BBox.js';
import { LineBBox } from './LineBBox.js';
import { FontData, FontDataClass, DelimiterData, VariantData, CharData, CharOptions, DIRECTION } from './FontData.js';
export declare type StringMap = {
    [key: string]: string;
};
export declare type StyleData = {
    padding: [number, number, number, number];
    border: {
        width: [number, number, number, number];
        style: [string, string, string, string];
        color: [string, string, string, string];
    };
};
export declare type Constructor<T> = new (...args: any[]) => T;
export declare type CommonWrapperConstructor<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>, CW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC> = CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>> = new (factory: WF, node: MmlNode, parent?: WW) => CW;
export interface CommonWrapperClass<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends WrapperClass<MmlNode, MmlNodeClass, WW> {
    kind: string;
    styles: StyleList;
    removeStyles: string[];
    skipAttributes: {
        [name: string]: boolean;
    };
    BOLDVARIANTS: {
        [name: string]: StringMap;
    };
    ITALICVARIANTS: {
        [name: string]: StringMap;
    };
    new (factory: WF, node: MmlNode, parent?: WW): WW;
}
export declare class CommonWrapper<N, T, D, JX extends CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW extends CommonWrapper<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WF extends CommonWrapperFactory<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, WC extends CommonWrapperClass<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>, CC extends CharOptions, VV extends VariantData<CC>, DD extends DelimiterData, FD extends FontData<CC, VV, DD>, FC extends FontDataClass<CC, VV, DD>> extends AbstractWrapper<MmlNode, MmlNodeClass, WW> {
    static kind: string;
    static styles: StyleList;
    static removeStyles: string[];
    static skipAttributes: {
        [name: string]: boolean;
    };
    static BOLDVARIANTS: {
        [name: string]: StringMap;
    };
    static ITALICVARIANTS: {
        [name: string]: StringMap;
    };
    factory: WF;
    parent: WW;
    childNodes: WW[];
    dom: N[];
    protected removedStyles: StringMap;
    styles: Styles;
    styleData: StyleData;
    variant: string;
    bbox: BBox;
    protected bboxComputed: boolean;
    protected _breakCount: number;
    lineBBox: LineBBox[];
    stretch: DD;
    font: FD;
    get jax(): JX;
    get adaptor(): import("../../core/DOMAdaptor.js").DOMAdaptor<N, T, D>;
    get metrics(): import("../../core/MathItem.js").Metrics;
    get containerWidth(): number;
    get linebreaks(): import("./LinebreakVisitor.js").Linebreaks<N, T, D, CommonOutputJax<N, T, D, WW, WF, WC, CC, VV, DD, FD, FC>, WW, WF, WC, CC, VV, DD, FD, FC>;
    get linebreakOptions(): any;
    get fixesPWidth(): boolean;
    get breakCount(): number;
    breakTop(mrow: WW, _child: WW): WW;
    constructor(factory: WF, node: MmlNode, parent?: WW);
    wrap<TT = WW>(node: MmlNode, parent?: WW): TT;
    getBBox(save?: boolean): BBox;
    getOuterBBox(save?: boolean): BBox;
    getUnbrokenHD(): [number, number];
    protected computeBBox(bbox: BBox, recompute?: boolean): void;
    getLineBBox(i: number): LineBBox;
    protected embellishedBBox(i: number): LineBBox;
    protected computeLineBBox(i: number): LineBBox;
    getBreakNode(bbox: LineBBox): [WW, WW];
    protected getChildLineBBox(child: WW, i: number): LineBBox;
    protected addLeftBorders(bbox: BBox): void;
    protected addMiddleBorders(bbox: BBox): void;
    protected addRightBorders(bbox: BBox): void;
    setChildPWidths(recompute: boolean, w?: (number | null), clear?: boolean): boolean;
    breakToWidth(_W: number): void;
    invalidateBBox(bubble?: boolean): void;
    protected copySkewIC(bbox: BBox): void;
    protected getStyles(): void;
    protected getStyleData(): void;
    protected getVariant(): void;
    protected explicitVariant(fontFamily: string, fontWeight: string, fontStyle: string): string;
    protected getScale(): void;
    protected getSpace(): void;
    protected getMathMLSpacing(): void;
    protected getTeXSpacing(isTop: boolean, hasSpacing: boolean): void;
    protected isTopEmbellished(): boolean;
    core(): WW;
    coreMO(): CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>;
    getText(): string;
    canStretch(direction: DIRECTION): boolean;
    protected getAlignShift(): [string, number];
    processIndent(indentalign: string, indentshift: string, align?: string, shift?: string, width?: number): [string, number];
    protected getAlignX(W: number, bbox: BBox, align: string): number;
    protected getAlignY(H: number, D: number, h: number, d: number, align: string): number;
    getWrapWidth(i: number): number;
    getChildAlign(_i: number): string;
    protected percent(m: number): string;
    protected em(m: number): string;
    protected px(m: number, M?: number): string;
    protected length2em(length: Property, size?: number, scale?: number): number;
    protected unicodeChars(text: string, name?: string): number[];
    remapChars(chars: number[]): number[];
    mmlText(text: string): TextNode;
    mmlNode(kind: string, properties?: PropertyList, children?: MmlNode[]): MmlNode;
    protected createMo(text: string): CommonMo<N, T, D, JX, WW, WF, WC, CC, VV, DD, FD, FC>;
    protected getVariantChar(variant: string, n: number): CharData<CC>;
}
