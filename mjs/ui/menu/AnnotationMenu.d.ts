import { SubMenu, Submenu } from './mj-context-menu.js';
import { MJContextMenu } from './MJContextMenu.js';
import { SelectableInfo } from './SelectableInfo.js';
type AnnotationTypes = {
    [type: string]: string[];
};
export declare function showAnnotations(box: SelectableInfo, types: AnnotationTypes, cache: [string, string][]): (menu: MJContextMenu, sub: Submenu) => SubMenu;
export declare function copyAnnotations(cache: [string, string][]): (menu: MJContextMenu, sub: Submenu) => SubMenu;
export declare let annotation: string;
export {};
