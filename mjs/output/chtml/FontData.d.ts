import { CharMap, CharOptions, CharDataArray, VariantData, DelimiterData, FontData, FontExtensionData } from '../common/FontData.js';
import { Usage } from './Usage.js';
import { StringMap } from './Wrapper.js';
import { StyleList, StyleData } from '../../util/StyleList.js';
export * from '../common/FontData.js';
export interface ChtmlCharOptions extends CharOptions {
    c?: string;
    f?: string;
    ff?: string;
    cmb?: boolean;
}
export type ChtmlCharMap = CharMap<ChtmlCharOptions>;
export type ChtmlCharData = CharDataArray<ChtmlCharOptions>;
export interface ChtmlVariantData extends VariantData<ChtmlCharOptions> {
    letter: string;
}
export interface ChtmlDelimiterData extends DelimiterData {
}
export interface ChtmlFontExtensionData<C extends ChtmlCharOptions, D extends ChtmlDelimiterData> extends FontExtensionData<C, D> {
    fonts?: string[];
    fontURL?: string;
}
export declare class ChtmlFontData extends FontData<ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData> {
    static OPTIONS: {
        dynamicPrefix: string;
        fontURL: string;
    };
    static JAX: string;
    protected static defaultVariantLetters: StringMap;
    protected static defaultStyles: {};
    protected static defaultFonts: {};
    protected static combiningChars: [number, number][];
    charUsage: Usage<[string, number]>;
    delimUsage: Usage<number>;
    fontUsage: StyleList;
    protected newFonts: number;
    static charOptions(font: ChtmlCharMap, n: number): ChtmlCharOptions;
    static addFontURLs(styles: StyleList, fonts: StyleList, url: string): void;
    static addDynamicFontCss(styles: StyleList, fonts: string[], root: string): void;
    static addExtension(data: ChtmlFontExtensionData<ChtmlCharOptions, ChtmlDelimiterData>, prefix?: string): void;
    adaptiveCSS(adapt: boolean): void;
    clearCache(): void;
    createVariant(name: string, inherit?: string, link?: string): void;
    defineChars(name: string, chars: ChtmlCharMap): void;
    addDynamicFontCss(fonts: string[], root?: string): void;
    updateDynamicStyles(): StyleList;
    get styles(): StyleList;
    updateStyles(styles: StyleList): StyleList;
    protected allStyles(styles: StyleList): void;
    protected addDelimiterStyles(styles: StyleList, n: number, data: ChtmlDelimiterData): void;
    protected addDelimiterVStyles(styles: StyleList, n: number, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterVPart(styles: StyleList, c: string, part: string, n: number, v: string, HDW: ChtmlCharData): number;
    protected addDelimiterHStyles(styles: StyleList, n: number, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterHPart(styles: StyleList, c: string, part: string, n: number, v: string, HDW: ChtmlCharData): number;
    protected addCharStyles(styles: StyleList, vletter: string, n: number, data: ChtmlCharData): void;
    protected checkCombiningChar(options: ChtmlCharOptions, css: StyleData): void;
    em(n: number): string;
    em0(n: number): string;
    padding([h, d, w]: ChtmlCharData, ic?: number): string;
    charSelector(n: number): string;
}
export type ChtmlFontDataClass = typeof ChtmlFontData;
export type CharOptionsMap = {
    [name: number]: ChtmlCharOptions;
};
export type CssMap = {
    [name: number]: number;
};
export declare function AddCSS(font: ChtmlCharMap, options: CharOptionsMap): ChtmlCharMap;
