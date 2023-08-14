import { StackItem } from './StackItem.js';
import { Symbol } from './Symbol.js';
import TexParser from './TexParser.js';
export type Args = boolean | number | string | null;
export type Attributes = Record<string, Args>;
export type Environment = Record<string, Args>;
export type ParseInput = [TexParser, string];
export type ParseResult = void | boolean | StackItem;
export type ParseMethod = (parser: TexParser, c: string | Symbol | StackItem, ...rest: any[]) => ParseResult;
