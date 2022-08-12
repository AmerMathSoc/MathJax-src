import { CharMap, CharOptions, CharData, VariantData, DelimiterData, FontData } from '../common/FontData.js';
import { Usage } from './Usage.js';
import { StringMap } from './Wrapper.js';
import { StyleList } from '../../util/StyleList.js';
export * from '../common/FontData.js';
export interface ChtmlCharOptions extends CharOptions {
    c?: string;
    f?: string;
}
export declare type ChtmlCharMap = CharMap<ChtmlCharOptions>;
export declare type ChtmlCharData = CharData<ChtmlCharOptions>;
export interface ChtmlVariantData extends VariantData<ChtmlCharOptions> {
    classes?: string;
    letter: string;
}
export interface ChtmlDelimiterData extends DelimiterData {
}
export declare class ChtmlFontData extends FontData<ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData> {
    static OPTIONS: {
        fontURL: string;
    };
    static JAX: string;
    protected static defaultVariantClasses: StringMap;
    protected static defaultVariantLetters: StringMap;
    protected static defaultStyles: {
        'mjx-c::before': {
            display: string;
            width: number;
        };
    };
    protected static defaultFonts: {
        '@font-face /* 0 */': {
            'font-family': string;
            src: string;
        };
    };
    charUsage: Usage<[string, number]>;
    delimUsage: Usage<number>;
    static charOptions(font: ChtmlCharMap, n: number): ChtmlCharOptions;
    adaptiveCSS(adapt: boolean): void;
    clearCache(): void;
    createVariant(name: string, inherit?: string, link?: string): void;
    defineChars(name: string, chars: ChtmlCharMap): void;
    get styles(): StyleList;
    updateStyles(styles: StyleList): StyleList;
    protected allStyles(styles: StyleList): void;
    protected addFontURLs(styles: StyleList, fonts: StyleList, url: string): void;
    protected addDelimiterStyles(styles: StyleList, n: number, data: ChtmlDelimiterData): void;
    protected addDelimiterVStyles(styles: StyleList, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterVPart(styles: StyleList, c: string, part: string, n: number, HDW: ChtmlCharData): number;
    protected addDelimiterHStyles(styles: StyleList, c: string, data: ChtmlDelimiterData): void;
    protected addDelimiterHPart(styles: StyleList, c: string, part: string, n: number, HDW: ChtmlCharData): void;
    protected addCharStyles(styles: StyleList, vletter: string, n: number, data: ChtmlCharData): void;
    protected getDelimiterData(n: number): ChtmlCharData;
    em(n: number): string;
    em0(n: number): string;
    padding([h, d, w]: ChtmlCharData, dw?: number, ic?: number): string;
    charContent(n: number): string;
    charSelector(n: number): string;
}
export declare type ChtmlFontDataClass = typeof ChtmlFontData;
export declare type CharOptionsMap = {
    [name: number]: ChtmlCharOptions;
};
export declare type CssMap = {
    [name: number]: number;
};
export declare function AddCSS(font: ChtmlCharMap, options: CharOptionsMap): ChtmlCharMap;
