import { PrioritizedList, PrioritizedListItem } from './PrioritizedList.js';
type AnyFunction = (...args: unknown[]) => unknown;
export interface FunctionListItem extends PrioritizedListItem<AnyFunction> {
}
export declare class FunctionList extends PrioritizedList<AnyFunction> {
    execute(...data: any[]): boolean;
    asyncExecute(...data: any[]): Promise<boolean>;
}
export {};
