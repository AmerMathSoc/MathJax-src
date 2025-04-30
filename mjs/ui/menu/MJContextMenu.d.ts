import { MathItem } from '../../core/MathItem.js';
import { OptionList } from '../../util/Options.js';
import { JaxList } from './Menu.js';
import { ContextMenu, SubMenu, Submenu, Item } from './mj-context-menu.js';
export declare class MJContextMenu extends ContextMenu {
    static DynamicSubmenus: Map<string, [
        (menu: MJContextMenu, sub: Submenu) => SubMenu,
        string
    ]>;
    mathItem: MathItem<HTMLElement, Text, Document>;
    settings: OptionList;
    errorMsg: string;
    protected jax: JaxList;
    post(x?: any, y?: number): void;
    unpost(): void;
    findID(...names: string[]): Item;
    setJax(jax: JaxList): void;
    protected getOriginalMenu(): void;
    protected getSemanticsMenu(): void;
    protected getSpeechMenu(): void;
    protected getBrailleMenu(): void;
    protected getSvgMenu(): void;
    protected getErrorMessage(): void;
    dynamicSubmenus(): void;
}
