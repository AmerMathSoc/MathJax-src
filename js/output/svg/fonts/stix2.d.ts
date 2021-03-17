import { SVGFontData, SVGCharOptions, SVGVariantData, SVGDelimiterData, DelimiterMap, CharMapMap, CssFontMap, RemapMap, FontParameters } from '../FontData.js';
declare const STIX2Font_base: import("../FontData.js").FontDataClass<SVGCharOptions, SVGVariantData, SVGDelimiterData> & typeof SVGFontData;
export declare class STIX2Font extends STIX2Font_base {
    protected static defaultAccentMap: RemapMap;
    static defaultParams: FontParameters;
    protected static defaultDelimiters: DelimiterMap<SVGDelimiterData>;
    static defaultVariants: string[][];
    static defaultCssFonts: CssFontMap;
    protected static defaultChars: CharMapMap<SVGCharOptions>;
    protected static variantCacheIds: {
        [name: string]: string;
    };
    protected static defaultSizeVariants: string[];
    protected static defaultStretchVariants: string[];
    constructor();
}
export {};
