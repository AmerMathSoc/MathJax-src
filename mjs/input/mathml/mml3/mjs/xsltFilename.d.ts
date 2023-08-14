export type Path = {
    resolve: (...parts: string[]) => string;
    dirname: (file: string) => string;
};
export declare function xsltFilename(path: Path): string;
