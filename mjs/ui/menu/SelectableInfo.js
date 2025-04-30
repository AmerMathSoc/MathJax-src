import { Info, HtmlClasses } from './mj-context-menu.js';
export class SelectableInfo extends Info {
    keydown(event) {
        if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            this.selectAll();
            this.stop(event);
            return;
        }
        super.keydown(event);
    }
    selectAll() {
        const selection = document.getSelection();
        selection.selectAllChildren(this.html.querySelector('.CtxtMenu_InfoContent').firstChild);
    }
    copyToClipboard() {
        this.selectAll();
        try {
            document.execCommand('copy');
        }
        catch (err) {
            alert(`Can't copy to clipboard: ${err.message}`);
        }
        document.getSelection().removeAllRanges();
    }
    generateHtml() {
        super.generateHtml();
        const footer = this.html.querySelector('span.' + HtmlClasses['INFOSIGNATURE']);
        const button = footer.appendChild(document.createElement('input'));
        button.type = 'button';
        button.value = 'Copy to Clipboard';
        button.addEventListener('click', (_event) => this.copyToClipboard());
    }
}
//# sourceMappingURL=SelectableInfo.js.map