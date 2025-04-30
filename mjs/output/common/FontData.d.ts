import { OptionList } from '../../util/Options.js';
import { StyleJson } from '../../util/StyleJson.js';
export { DIRECTION } from './Direction.js';
export interface CharOptions {
    ic?: number;
    oc?: number;
    sk?: number;
    dx?: number;
    unknown?: boolean;
    smp?: number;
    hd?: [number, number];
}
export type CharDataArray<C extends CharOptions> = [number, number, number] | [number, number, number, C];
export type CharData<C extends CharOptions> = DynamicFile | CharDataArray<C>;
export type CharMap<C extends CharOptions> = {
    [n: number]: CharData<C>;
};
export type CharMapMap<C extends CharOptions> = {
    [name: string]: CharMap<C>;
};
export interface VariantData<C extends CharOptions> {
    linked: CharMap<C>[];
    chars: CharMap<C>;
}
export type VariantMap<C extends CharOptions, V extends VariantData<C>> = {
    [name: string]: V;
};
export type CssFontData = [string, boolean, boolean];
export type CssFontMap = {
    [name: string]: CssFontData;
};
export type DelimiterData = {
    dir: string;
    sizes?: number[];
    variants?: number[];
    schar?: number[];
    stretch?: number[];
    stretchv?: number[];
    HDW?: number[];
    hd?: number[];
    ext?: number;
    min?: number;
    c?: number;
    fullExt?: [number, number];
};
export type DelimiterMap<D extends DelimiterData> = {
    [n: number]: D | DynamicFile;
};
export declare const NOSTRETCH: DelimiterData;
export type RemapData = string;
export type RemapMap = {
    [key: number]: RemapData;
};
export type RemapMapMap = {
    [key: string]: RemapMap;
};
export type SmpMap = {
    [c: number]: number;
};
export type SmpData = [
    number,
    number,
    number?,
    number?,
    number?,
    {
        [n: number]: number;
    }?
];
export type FontParameters = {
    x_height: number;
    quad: number;
    num1: number;
    num2: number;
    num3: number;
    denom1: number;
    denom2: number;
    sup1: number;
    sup2: number;
    sup3: number;
    sub1: number;
    sub2: number;
    sup_drop: number;
    sub_drop: number;
    delim1: number;
    delim2: number;
    axis_height: number;
    rule_thickness: number;
    big_op_spacing1: number;
    big_op_spacing2: number;
    big_op_spacing3: number;
    big_op_spacing4: number;
    big_op_spacing5: number;
    surd_height: number;
    scriptspace: number;
    nulldelimiterspace: number;
    delimiterfactor: number;
    delimitershortfall: number;
    rule_factor: number;
    min_rule_thickness: number;
    separation_factor: number;
    extra_ic: number;
    extender_factor: number;
};
export type FontParameterList = {
    [key in keyof FontParameters]?: number;
};
export type Font = FontData<CharOptions, VariantData<CharOptions>, DelimiterData>;
export type DynamicSetup = (font: Font) => void;
export type DynamicRanges = (number | [number, number])[];
export type DynamicVariants = {
    [name: string]: DynamicRanges;
};
export type DynamicFileDef = [string, DynamicVariants, DynamicRanges?];
export type DynamicFile = {
    extension: string;
    file: string;
    variants: DynamicVariants;
    delimiters: DynamicRanges;
    setup: DynamicSetup;
    promise: Promise<void>;
    failed: boolean;
};
export type DynamicFileList = {
    [name: string]: DynamicFile;
};
export type DynamicFont = {
    name: string;
    prefix: string;
    files: DynamicFileList;
    sizeN: number;
    stretchN: number;
};
export type DynamicFontMap = Map<string, DynamicFont>;
export type DynamicCharMap = {
    [name: number]: DynamicFile;
};
export interface FontExtensionData<C extends CharOptions, D extends DelimiterData> {
    name: string;
    options?: OptionList;
    variants?: string[][] | {
        '[+]'?: string[][];
        '[-]'?: string[][];
    };
    variantSmp?: {
        [name: string]: SmpData | string;
    };
    cssFonts?: CssFontMap;
    accentMap?: RemapMap;
    moMap?: RemapMap;
    mnMap?: RemapMap;
    parameters?: FontParameterList;
    delimiters?: DelimiterMap<D>;
    chars?: CharMapMap<C>;
    sizeVariants?: string[] | {
        '[+]'?: string[];
        '[-]'?: string[];
    };
    stretchVariants?: string[] | {
        '[+]'?: string[];
        '[-]'?: string[];
    };
    ranges?: DynamicFileDef[];
}
export declare function mergeOptions(obj: OptionList, dst: string, src: OptionList): OptionList;
export declare class FontData<C extends CharOptions, V extends VariantData<C>, D extends DelimiterData> {
    static OPTIONS: OptionList;
    static JAX: string;
    static NAME: string;
    static defaultVariants: string[][];
    static defaultCssFonts: CssFontMap;
    protected static defaultCssFamilyPrefix: string;
    static VariantSmp: {
        [name: string]: SmpData | string;
    };
    static SmpRanges: number[][];
    static SmpRemap: SmpMap;
    static SmpRemapGreekU: SmpMap;
    static SmpRemapGreekL: SmpMap;
    static defaultAccentMap: RemapMap;
    protected static defaultMoMap: RemapMap;
    protected static defaultMnMap: RemapMap;
    static defaultParams: FontParameters;
    protected static defaultDelimiters: DelimiterMap<DelimiterData>;
    protected static defaultChars: CharMapMap<CharOptions>;
    protected static defaultSizeVariants: string[];
    protected static defaultStretchVariants: string[];
    protected static dynamicFiles: DynamicFileList;
    static dynamicExtensions: DynamicFontMap;
    protected options: OptionList;
    protected variant: VariantMap<C, V>;
    protected delimiters: DelimiterMap<D>;
    protected sizeVariants: string[];
    protected stretchVariants: string[];
    protected cssFontMap: CssFontMap;
    cssFamilyPrefix: string;
    cssFontPrefix: string;
    protected remapChars: RemapMapMap;
    params: FontParameters;
    skewIcFactor: number;
    protected _styles: StyleJson;
    get CLASS(): typeof FontData;
    static charOptions(font: CharMap<CharOptions>, n: number): CharOptions;
    static defineDynamicFiles(dynamicFiles: DynamicFileDef[], extension?: string): DynamicFileList;
    static dynamicSetup<C extends CharOptions, D extends DelimiterData>(extension: string, file: string, variants: CharMapMap<C>, delimiters?: DelimiterMap<D>, fonts?: string[]): void;
    static adjustDelimiters(delimiters: DelimiterMap<DelimiterData>, keys: string[], sizeN: number, stretchN: number): void;
    protected static adjustArrayIndices(list: number[], N: number): number[];
    static addExtension(data: FontExtensionData<CharOptions, DelimiterData>, prefix?: string): void;
    constructor(options?: OptionList);
    setOptions(options: OptionList): void;
    addExtension(data: FontExtensionData<C, D>, prefix?: string): string[];
    get styles(): StyleJson;
    set styles(style: StyleJson);
    createVariant(name: string, inherit?: string, link?: string): void;
    protected remapSmpChars(chars: CharMap<C>, name: string): void;
    protected smpChar(n: number): CharDataArray<C>;
    createVariants(variants: string[][]): void;
    defineChars(name: string, chars: CharMap<C>): void;
    defineCssFonts(fonts: CssFontMap): void;
    defineDelimiters(delims: DelimiterMap<D>): void;
    defineRemap(name: string, remap: RemapMap): void;
    defineDynamicCharacters(dynamicFiles: DynamicFileList): void;
    protected flattenRanges(ranges: DynamicRanges, dynamic: DynamicFile): DynamicCharMap;
    protected dynamicFileName(dynamic: DynamicFile): string;
    loadDynamicFile(dynamic: DynamicFile): Promise<void>;
    loadDynamicFiles(): Promise<void[]>;
    loadDynamicFilesSync(): void;
    loadDynamicFileSync(dynamic: DynamicFile): void;
    addDynamicFontCss(_fonts: string[], _root?: string): void;
    getDelimiter(n: number): DelimiterData;
    getSizeVariant(n: number, i: number): string;
    getStretchVariant(n: number, i: number): string;
    getStretchVariants(n: number): string[];
    getChar(name: string, n: number): CharDataArray<C>;
    getVariant(name: string): V;
    getCssFont(variant: string): CssFontData;
    getFamily(family: string): string;
    getRemappedChar(name: string, c: number): string;
}
export interface FontDataClass<C extends CharOptions, V extends VariantData<C>, D extends DelimiterData> {
    OPTIONS: OptionList;
    defaultCssFonts: CssFontMap;
    defaultVariants: string[][];
    defaultParams: FontParameters;
    defaultAccentMap: RemapMap;
    charOptions(font: CharMap<C>, n: number): C;
    defineDynamicFiles(dynamicFiles: DynamicFileDef[], prefix?: string): DynamicFileList;
    dynamicSetup<C extends CharOptions, D extends DelimiterData>(font: string, file: string, variants: CharMapMap<C>, delimiters?: DelimiterMap<D>, fonts?: string[]): void;
    addExtension(data: FontExtensionData<C, D>, prefix?: string): void;
    new (...args: any[]): FontData<C, V, D>;
}
