import { CharMap, CharOptions, CharData, VariantData, DelimiterData, FontData } from '../common/FontData.js';
export * from '../common/FontData.js';
export declare type CharStringMap = {
    [name: number]: string;
};
export interface SvgCharOptions extends CharOptions {
    c?: string;
    p?: string;
}
export declare type SvgCharMap = CharMap<SvgCharOptions>;
export declare type SvgCharData = CharData<SvgCharOptions>;
export interface SvgVariantData extends VariantData<SvgCharOptions> {
    cacheID: string;
}
export interface SvgDelimiterData extends DelimiterData {
}
export declare class SvgFontData extends FontData<SvgCharOptions, SvgVariantData, SvgDelimiterData> {
    static OPTIONS: {
        dynamicPrefix: string;
    };
    static JAX: string;
    static charOptions(font: SvgCharMap, n: number): SvgCharOptions;
}
export declare type SvgFontDataClass = typeof SvgFontData;
export declare function AddPaths(font: SvgCharMap, paths: CharStringMap, content: CharStringMap): SvgCharMap;
