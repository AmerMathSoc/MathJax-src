import { mathjax } from '../../mathjax.js';
import { STATE } from '../../core/MathItem.js';
import { MathJax as MJX } from '../../components/global.js';
import { userOptions, defaultOptions, expandable } from '../../util/Options.js';
import * as AnnotationMenu from './AnnotationMenu.js';
import { MJContextMenu } from './MJContextMenu.js';
import { RadioCompare } from './RadioCompare.js';
import { MmlVisitor } from './MmlVisitor.js';
import { SelectableInfo } from './SelectableInfo.js';
import * as MenuUtil from './MenuUtil.js';
import { Info, Parser, Rule, CssStyles } from './mj-context-menu.js';
const MathJax = MJX;
const XMLDECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
export class Menu {
    get isLoading() {
        return Menu.loading > 0;
    }
    get loadingPromise() {
        if (!this.isLoading) {
            return Promise.resolve();
        }
        if (!Menu._loadingPromise) {
            Menu._loadingPromise = new Promise((ok, failed) => {
                Menu._loadingOK = ok;
                Menu._loadingFailed = failed;
            });
        }
        return Menu._loadingPromise;
    }
    constructor(document, options = {}) {
        this.settings = null;
        this.defaultSettings = null;
        this.menu = null;
        this.MmlVisitor = new MmlVisitor();
        this.jax = {
            CHTML: null,
            SVG: null
        };
        this.rerenderStart = STATE.LAST;
        this.about = new Info('<b style="font-size:120%;">MathJax</b> v' + mathjax.version, () => {
            const lines = [];
            lines.push('Input Jax: ' + this.document.inputJax.map(jax => jax.name).join(', '));
            lines.push('Output Jax: ' + this.document.outputJax.name);
            lines.push('Document Type: ' + this.document.kind);
            return lines.join('<br/>');
        }, '<a href="https://www.mathjax.org">www.mathjax.org</a>');
        this.help = new Info('<b>MathJax Help</b>', () => {
            return [
                '<p><b>MathJax</b> is a JavaScript library that allows page',
                ' authors to include mathematics within their web pages.',
                ' As a reader, you don\'t need to do anything to make that happen.</p>',
                '<p><b>Browsers</b>: MathJax works with all modern browsers including',
                ' Edge, Firefox, Chrome, Safari, Opera, and most mobile browsers.</p>',
                '<p><b>Math Menu</b>: MathJax adds a contextual menu to equations.',
                ' Right-click or CTRL-click on any mathematics to access the menu.</p>',
                '<div style="margin-left: 1em;">',
                '<p><b>Show Math As:</b> These options allow you to view the formula\'s',
                ' source markup (as MathML or in its original format).</p>',
                '<p><b>Copy to Clipboard:</b> These options copy the formula\'s source markup,',
                ' as MathML or in its original format, to the clipboard',
                ' (in browsers that support that).</p>',
                '<p><b>Math Settings:</b> These give you control over features of MathJax,',
                ' such the size of the mathematics, and the mechanism used',
                ' to display equations.</p>',
                '<p><b>Accessibility</b>: MathJax can work with screen',
                ' readers to make mathematics accessible to the visually impaired.',
                ' Turn on the explorer to enable generation of speech strings',
                ' and the ability to investigate expressions interactively.</p>',
                '<p><b>Language</b>: This menu lets you select the language used by MathJax',
                ' for its menus and warning messages. (Not yet implemented in version 3.)</p>',
                '</div>',
                '<p><b>Math Zoom</b>: If you are having difficulty reading an',
                ' equation, MathJax can enlarge it to help you see it better, or',
                ' you can scall all the math on the page to make it larger.',
                ' Turn these features on in the <b>Math Settings</b> menu.</p>',
                '<p><b>Preferences</b>: MathJax uses your browser\'s localStorage database',
                ' to save the preferences set via this menu locally in your browser.  These',
                ' are not used to track you, and are not transferred or used remotely by',
                ' MathJax in any way.</p>'
            ].join('\n');
        }, '<a href="https://www.mathjax.org">www.mathjax.org</a>');
        this.mathmlCode = new SelectableInfo('MathJax MathML Expression', () => {
            if (!this.menu.mathItem)
                return '';
            const text = this.toMML(this.menu.mathItem);
            return '<pre>' + this.formatSource(text) + '</pre>';
        }, '');
        this.originalText = new SelectableInfo('MathJax Original Source', () => {
            if (!this.menu.mathItem)
                return '';
            const text = this.menu.mathItem.math;
            return '<pre style="font-size:125%; margin:0">' + this.formatSource(text) + '</pre>';
        }, '');
        this.annotationBox = new SelectableInfo('MathJax Annotation Text', () => {
            const text = AnnotationMenu.annotation;
            return '<pre style="font-size:125%; margin:0">' + this.formatSource(text) + '</pre>';
        }, '');
        this.svgImage = new SelectableInfo('MathJax SVG Image', () => {
            return '<div id="svg-image" style="font-family: monospace; font-size:125%; margin:0">' +
                'Generative SVG Image...</div>';
        }, '');
        this.speechText = new SelectableInfo('MathJax Speech Text', () => {
            if (!this.menu.mathItem)
                return '';
            return '<div style="font-size:125%; margin:0">'
                + this.formatSource(this.menu.mathItem.outputData.speech)
                + '</div>';
        }, '');
        this.errorMessage = new SelectableInfo('MathJax Error Message', () => {
            if (!this.menu.mathItem)
                return '';
            return '<pre style="font-size:125%; margin:0">' + this.formatSource(this.menu.errorMsg) + '</pre>';
        }, '');
        this.zoomBox = new Info('MathJax Zoomed Expression', () => {
            if (!this.menu.mathItem)
                return '';
            const element = this.menu.mathItem.typesetRoot.cloneNode(true);
            element.style.margin = '0';
            const scale = 1.25 * parseFloat(this.settings.zscale);
            return '<div style="font-size: ' + scale + '%">' + element.outerHTML + '</div>';
        }, '');
        this.document = document;
        this.options = userOptions(defaultOptions({}, this.constructor.OPTIONS), options);
        this.initSettings();
        this.mergeUserSettings();
        this.initMenu();
        this.applySettings();
    }
    initSettings() {
        this.settings = this.options.settings;
        this.jax = this.options.jax;
        const jax = this.document.outputJax;
        this.jax[jax.name] = jax;
        this.settings.renderer = jax.name;
        if (MathJax._.a11y && MathJax._.a11y.explorer) {
            Object.assign(this.settings, this.document.options.a11y);
        }
        this.settings.scale = jax.options.scale;
        this.defaultSettings = Object.assign({}, this.settings);
        this.settings.overflow =
            jax.options.displayOverflow.substr(0, 1).toUpperCase() + jax.options.displayOverflow.substr(1).toLowerCase();
        this.settings.breakInline = jax.options.linebreaks.inline;
    }
    initMenu() {
        let parser = new Parser([
            ['contextMenu', MJContextMenu.fromJson.bind(MJContextMenu)],
            ['radioCompare', RadioCompare.fromJson.bind(RadioCompare)]
        ]);
        this.menu = parser.parse({
            type: 'contextMenu',
            id: 'MathJax_Menu',
            pool: [
                this.variable('filterSRE'),
                this.variable('texHints'),
                this.variable('semantics'),
                this.variable('zoom'),
                this.variable('zscale'),
                this.variable('renderer', jax => this.setRenderer(jax)),
                this.variable('overflow', overflow => this.setOverflow(overflow)),
                this.variable('breakInline', breaks => this.setInlineBreaks(breaks)),
                this.variable('alt'),
                this.variable('cmd'),
                this.variable('ctrl'),
                this.variable('shift'),
                this.variable('scale', scale => this.setScale(scale)),
                this.variable('explorer', explore => this.setExplorer(explore)),
                this.a11yVar('highlight'),
                this.a11yVar('backgroundColor'),
                this.a11yVar('backgroundOpacity'),
                this.a11yVar('foregroundColor'),
                this.a11yVar('foregroundOpacity'),
                this.a11yVar('speech'),
                this.a11yVar('subtitles'),
                this.a11yVar('braille'),
                this.a11yVar('viewBraille'),
                this.a11yVar('voicing'),
                this.a11yVar('locale', value => {
                    MathJax._.a11y.sre.Sre.setupEngine({ locale: value });
                }),
                this.a11yVar('speechRules', value => {
                    const [domain, style] = value.split('-');
                    this.document.options.sre.domain = domain;
                    this.document.options.sre.style = style;
                }),
                this.a11yVar('magnification'),
                this.a11yVar('magnify'),
                this.a11yVar('treeColoring'),
                this.a11yVar('infoType'),
                this.a11yVar('infoRole'),
                this.a11yVar('infoPrefix'),
                this.variable('autocollapse'),
                this.variable('collapsible', collapse => this.setCollapsible(collapse)),
                this.variable('inTabOrder', tab => this.setTabOrder(tab)),
                this.variable('assistiveMml', mml => this.setAssistiveMml(mml))
            ],
            items: [
                this.submenu('Show', 'Show Math As', [
                    this.command('MathMLcode', 'MathML Code', () => this.mathmlCode.post()),
                    this.command('Original', 'Original Form', () => this.originalText.post()),
                    this.rule(),
                    this.command('Speech', 'Speech Text', () => this.speechText.post(), { disabled: true }),
                    this.command('SVG', 'SVG Image', () => this.postSvgImage(), { disabled: true }),
                    this.submenu('ShowAnnotation', 'Annotation'),
                    this.rule(),
                    this.command('Error', 'Error Message', () => this.errorMessage.post(), { disabled: true })
                ]),
                this.submenu('Copy', 'Copy to Clipboard', [
                    this.command('MathMLcode', 'MathML Code', () => this.copyMathML()),
                    this.command('Original', 'Original Form', () => this.copyOriginal()),
                    this.rule(),
                    this.command('Speech', 'Speech Text', () => this.copySpeechText(), { disabled: true }),
                    this.command('SVG', 'SVG Image', () => this.copySvgImage(), { disabled: true }),
                    this.submenu('CopyAnnotation', 'Annotation'),
                    this.rule(),
                    this.command('Error', 'Error Message', () => this.copyErrorMessage(), { disabled: true })
                ]),
                this.rule(),
                this.submenu('Settings', 'Math Settings', [
                    this.submenu('Renderer', 'Math Renderer', this.radioGroup('renderer', [['CHTML'], ['SVG']])),
                    this.submenu('Overflow', 'Wide Expressions', [
                        this.radioGroup('overflow', [
                            ['Overflow'], ['Scroll'], ['Linebreak'], ['Scale'], ['Truncate'], ['Elide']
                        ]),
                        this.rule(),
                        this.checkbox('BreakInline', 'Allow In-line Breaks', 'breakInline'),
                    ]),
                    this.rule(),
                    this.submenu('ZoomTrigger', 'Zoom Trigger', [
                        this.command('ZoomNow', 'Zoom Once Now', () => this.zoom(null, '', this.menu.mathItem)),
                        this.rule(),
                        this.radioGroup('zoom', [
                            ['Click'], ['DoubleClick', 'Double-Click'], ['NoZoom', 'No Zoom']
                        ]),
                        this.rule(),
                        this.label('TriggerRequires', 'Trigger Requires:'),
                        this.checkbox((MenuUtil.isMac ? 'Option' : 'Alt'), (MenuUtil.isMac ? 'Option' : 'Alt'), 'alt'),
                        this.checkbox('Command', 'Command', 'cmd', { hidden: !MenuUtil.isMac }),
                        this.checkbox('Control', 'Control', 'ctrl', { hiddne: MenuUtil.isMac }),
                        this.checkbox('Shift', 'Shift', 'shift')
                    ]),
                    this.submenu('ZoomFactor', 'Zoom Factor', this.radioGroup('zscale', [
                        ['150%'], ['175%'], ['200%'], ['250%'], ['300%'], ['400%']
                    ])),
                    this.rule(),
                    this.command('Scale', 'Scale All Math...', () => this.scaleAllMath()),
                    this.rule(),
                    this.checkbox('filterSRE', 'Filter semantic annotations', 'filterSRE'),
                    this.checkbox('texHints', 'Add TeX hints to MathML', 'texHints'),
                    this.checkbox('semantics', 'Add original as annotation', 'semantics'),
                    this.rule(),
                    this.command('Reset', 'Reset to defaults', () => this.resetDefaults())
                ]),
                this.submenu('Accessibility', 'Accessibility', [
                    this.checkbox('Activate', 'Activate', 'explorer'),
                    this.submenu('Speech', 'Speech', [
                        this.checkbox('Speech', 'Speech Output', 'speech'),
                        this.checkbox('Subtitles', 'Speech Subtitles', 'subtitles'),
                        this.checkbox('Auto Voicing', 'Auto Voicing', 'voicing'),
                        this.checkbox('Braille', 'Braille Output', 'braille'),
                        this.checkbox('View Braille', 'Braille Subtitles', 'viewBraille'),
                        this.rule(),
                        this.submenu('A11yLanguage', 'Language'),
                        this.rule(),
                        this.submenu('Mathspeak', 'Mathspeak Rules', this.radioGroup('speechRules', [
                            ['mathspeak-default', 'Verbose'],
                            ['mathspeak-brief', 'Brief'],
                            ['mathspeak-sbrief', 'Superbrief']
                        ])),
                        this.submenu('Clearspeak', 'Clearspeak Rules', this.radioGroup('speechRules', [
                            ['clearspeak-default', 'Auto']
                        ])),
                        this.submenu('ChromeVox', 'ChromeVox Rules', this.radioGroup('speechRules', [
                            ['chromevox-default', 'Standard'],
                            ['chromevox-alternative', 'Alternative']
                        ]))
                    ]),
                    this.submenu('Highlight', 'Highlight', [
                        this.submenu('Background', 'Background', this.radioGroup('backgroundColor', [
                            ['Blue'], ['Red'], ['Green'], ['Yellow'], ['Cyan'], ['Magenta'], ['White'], ['Black']
                        ])),
                        { 'type': 'slider',
                            'variable': 'backgroundOpacity',
                            'content': ' '
                        },
                        this.submenu('Foreground', 'Foreground', this.radioGroup('foregroundColor', [
                            ['Black'], ['White'], ['Magenta'], ['Cyan'], ['Yellow'], ['Green'], ['Red'], ['Blue']
                        ])),
                        { 'type': 'slider',
                            'variable': 'foregroundOpacity',
                            'content': ' '
                        },
                        this.rule(),
                        this.radioGroup('highlight', [
                            ['None'], ['Hover'], ['Flame']
                        ]),
                        this.rule(),
                        this.checkbox('TreeColoring', 'Tree Coloring', 'treeColoring')
                    ]),
                    this.submenu('Magnification', 'Magnification', [
                        this.radioGroup('magnification', [
                            ['None'], ['Keyboard'], ['Mouse']
                        ]),
                        this.rule(),
                        this.radioGroup('magnify', [
                            ['200%'], ['300%'], ['400%'], ['500%']
                        ])
                    ]),
                    this.submenu('Semantic Info', 'Semantic Info', [
                        this.checkbox('Type', 'Type', 'infoType'),
                        this.checkbox('Role', 'Role', 'infoRole'),
                        this.checkbox('Prefix', 'Prefix', 'infoPrefix')
                    ], true),
                    this.rule(),
                    this.checkbox('Collapsible', 'Collapsible Math', 'collapsible'),
                    this.checkbox('AutoCollapse', 'Auto Collapse', 'autocollapse', { disabled: true }),
                    this.rule(),
                    this.checkbox('InTabOrder', 'Include in Tab Order', 'inTabOrder'),
                    this.checkbox('AssistiveMml', 'Include Hidden MathML', 'assistiveMml')
                ]),
                this.submenu('Language', 'Language'),
                this.rule(),
                this.command('About', 'About MathJax', () => this.about.post()),
                this.command('Help', 'MathJax Help', () => this.help.post())
            ]
        });
        const menu = this.menu;
        menu.findID('Settings', 'Overflow', 'Elide').disable();
        menu.setJax(this.jax);
        this.about.attachMenu(menu);
        this.help.attachMenu(menu);
        this.originalText.attachMenu(menu);
        this.mathmlCode.attachMenu(menu);
        this.originalText.attachMenu(menu);
        this.svgImage.attachMenu(menu);
        this.speechText.attachMenu(menu);
        this.errorMessage.attachMenu(menu);
        this.zoomBox.attachMenu(menu);
        this.checkLoadableItems();
        this.enableExplorerItems(this.settings.explorer);
        const cache = [];
        MJContextMenu.DynamicSubmenus.set('ShowAnnotation', AnnotationMenu.showAnnotations(this.annotationBox, this.options.annotationTypes, cache));
        MJContextMenu.DynamicSubmenus.set('CopyAnnotation', AnnotationMenu.copyAnnotations(cache));
        CssStyles.addInfoStyles(this.document.document);
        CssStyles.addMenuStyles(this.document.document);
    }
    checkLoadableItems() {
        if (MathJax && MathJax._ && MathJax.loader && MathJax.startup) {
            if (this.settings.collapsible && (!MathJax._.a11y || !MathJax._.a11y.complexity)) {
                this.loadA11y('complexity');
            }
            if (this.settings.explorer && (!MathJax._.a11y || !MathJax._.a11y.explorer)) {
                this.loadA11y('explorer');
            }
            if (this.settings.assistiveMml && (!MathJax._.a11y || !MathJax._.a11y['assistive-mml'])) {
                this.loadA11y('assistive-mml');
            }
        }
        else {
            const menu = this.menu;
            for (const name of Object.keys(this.jax)) {
                if (!this.jax[name]) {
                    menu.findID('Settings', 'Renderer', name).disable();
                }
            }
            menu.findID('Accessibility', 'Activate').disable();
            menu.findID('Accessibility', 'AutoCollapse').disable();
            menu.findID('Accessibility', 'Collapsible').disable();
        }
    }
    enableExplorerItems(enable) {
        const menu = this.menu.findID('Accessibility', 'Activate').menu;
        for (const item of menu.items.slice(1)) {
            if (item instanceof Rule)
                break;
            enable ? item.enable() : item.disable();
        }
    }
    mergeUserSettings() {
        try {
            const settings = localStorage.getItem(Menu.MENU_STORAGE);
            if (!settings)
                return;
            Object.assign(this.settings, JSON.parse(settings));
            this.setA11y(this.settings);
        }
        catch (err) {
            console.log('MathJax localStorage error: ' + err.message);
        }
    }
    saveUserSettings() {
        const settings = {};
        for (const name of Object.keys(this.settings)) {
            if (this.settings[name] !== this.defaultSettings[name]) {
                settings[name] = this.settings[name];
            }
        }
        try {
            if (Object.keys(settings).length) {
                localStorage.setItem(Menu.MENU_STORAGE, JSON.stringify(settings));
            }
            else {
                localStorage.removeItem(Menu.MENU_STORAGE);
            }
        }
        catch (err) {
            console.log('MathJax localStorage error: ' + err.message);
        }
    }
    setA11y(options) {
        if (MathJax._.a11y && MathJax._.a11y.explorer) {
            MathJax._.a11y.explorer_ts.setA11yOptions(this.document, options);
        }
    }
    getA11y(option) {
        if (MathJax._.a11y && MathJax._.a11y.explorer) {
            if (this.document.options.a11y[option] !== undefined) {
                return this.document.options.a11y[option];
            }
            return this.document.options.sre[option];
        }
    }
    applySettings() {
        this.setTabOrder(this.settings.inTabOrder);
        this.document.options.enableAssistiveMml = this.settings.assistiveMml;
        const renderer = this.settings.renderer.replace(/[^a-zA-Z0-9]/g, '') || 'CHTML';
        const promise = (renderer !== this.defaultSettings.renderer ?
            this.setRenderer(renderer, false) :
            Promise.resolve());
        promise.then(() => {
            this.document.options.enableExplorer = this.settings.explorer;
            this.document.outputJax.options.scale = parseFloat(this.settings.scale);
            this.document.outputJax.options.displayOverflow = this.settings.overflow.toLowerCase();
            this.document.outputJax.options.linebreaks.inline = this.settings.breakInline;
        });
    }
    setOverflow(overflow) {
        this.document.outputJax.options.displayOverflow = overflow.toLowerCase();
        this.document.rerender();
    }
    setInlineBreaks(breaks) {
        this.document.outputJax.options.linebreaks.inline = breaks;
        this.document.rerender();
    }
    setScale(scale) {
        this.document.outputJax.options.scale = parseFloat(scale);
        this.document.rerender();
    }
    setRenderer(jax, rerender = true) {
        if (this.jax.hasOwnProperty(jax) && this.jax[jax]) {
            return this.setOutputJax(jax, rerender);
        }
        const name = jax.toLowerCase();
        return new Promise((ok, fail) => {
            this.loadComponent('output/' + name, () => {
                const startup = MathJax.startup;
                if (!(name in startup.constructors)) {
                    return fail(new Error(`Component ${name} not loaded`));
                }
                startup.useOutput(name, true);
                startup.output = startup.getOutputJax();
                startup.output.setAdaptor(this.document.adaptor);
                startup.output.initialize();
                this.jax[jax] = startup.output;
                this.setOutputJax(jax, rerender)
                    .then(() => ok())
                    .catch((err) => fail(err));
            });
        });
    }
    setOutputJax(jax, rerender = true) {
        this.jax[jax].setAdaptor(this.document.adaptor);
        this.document.outputJax = this.jax[jax];
        return (rerender ? mathjax.handleRetriesFor(() => this.rerender()) : Promise.resolve());
    }
    setTabOrder(tab) {
        this.menu.store.inTaborder(tab);
    }
    setAssistiveMml(mml) {
        this.document.options.enableAssistiveMml = mml;
        if (!mml || (MathJax._.a11y && MathJax._.a11y['assistive-mml'])) {
            this.rerender();
        }
        else {
            this.loadA11y('assistive-mml');
        }
    }
    setExplorer(explore) {
        this.enableExplorerItems(explore);
        this.document.options.enableExplorer = explore;
        if (!explore || (MathJax._.a11y && MathJax._.a11y.explorer)) {
            this.rerender(this.settings.collapsible ? STATE.RERENDER : STATE.COMPILED);
        }
        else {
            this.loadA11y('explorer');
        }
    }
    setCollapsible(collapse) {
        this.document.options.enableComplexity = collapse;
        if (!collapse || (MathJax._.a11y && MathJax._.a11y.complexity)) {
            this.rerender(STATE.COMPILED);
        }
        else {
            this.loadA11y('complexity');
        }
    }
    scaleAllMath() {
        const scale = (parseFloat(this.settings.scale) * 100).toFixed(1).replace(/.0$/, '');
        const percent = prompt('Scale all mathematics (compared to surrounding text) by', scale + '%');
        if (percent) {
            if (percent.match(/^\s*\d+(\.\d*)?\s*%?\s*$/)) {
                const scale = parseFloat(percent) / 100;
                if (scale) {
                    this.menu.pool.lookup('scale').setValue(String(scale));
                }
                else {
                    alert('The scale should not be zero');
                }
            }
            else {
                alert('The scale should be a percentage (e.g., 120%)');
            }
        }
    }
    resetDefaults() {
        Menu.loading++;
        const pool = this.menu.pool;
        const settings = this.defaultSettings;
        for (const name of Object.keys(this.settings)) {
            const variable = pool.lookup(name);
            if (variable) {
                variable.setValue(settings[name]);
                const item = variable.items[0];
                if (item) {
                    item.executeCallbacks_();
                }
            }
            else {
                this.settings[name] = settings[name];
            }
        }
        Menu.loading--;
        this.rerender(STATE.COMPILED);
    }
    checkComponent(name) {
        const promise = Menu.loadingPromises.get(name);
        if (promise) {
            mathjax.retryAfter(promise);
        }
    }
    loadComponent(name, callback) {
        if (Menu.loadingPromises.has(name))
            return;
        const loader = MathJax.loader;
        if (!loader)
            return;
        Menu.loading++;
        const promise = loader.load(name).then(() => {
            Menu.loading--;
            Menu.loadingPromises.delete(name);
            callback();
            if (Menu.loading === 0 && Menu._loadingPromise) {
                Menu._loadingPromise = null;
                Menu._loadingOK();
            }
        }).catch((err) => {
            if (Menu._loadingPromise) {
                Menu._loadingPromise = null;
                Menu._loadingFailed(err);
            }
            else {
                console.log(err);
            }
        });
        Menu.loadingPromises.set(name, promise);
    }
    loadA11y(component) {
        const noEnrich = !STATE.ENRICHED;
        this.loadComponent('a11y/' + component, () => {
            const startup = MathJax.startup;
            mathjax.handlers.unregister(startup.handler);
            startup.handler = startup.getHandler();
            mathjax.handlers.register(startup.handler);
            const document = this.document;
            this.document = startup.document = startup.getDocument();
            this.document.menu = this;
            this.document.outputJax.reset();
            this.transferMathList(document);
            this.document.processed = document.processed;
            if (!Menu._loadingPromise) {
                this.document.outputJax.reset();
                mathjax.handleRetriesFor(() => {
                    this.rerender(component === 'complexity' || noEnrich ? STATE.COMPILED : STATE.TYPESET);
                });
            }
        });
    }
    transferMathList(document) {
        const MathItem = this.document.options.MathItem;
        for (const item of document.math) {
            const math = new MathItem();
            Object.assign(math, item);
            this.document.math.push(math);
        }
    }
    formatSource(text) {
        return text.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    toMML(math) {
        const mml = this.MmlVisitor.visitTree(math.root, math, {
            texHints: this.settings.texHints,
            semantics: (this.settings.semantics && math.inputJax.name !== 'MathML')
        });
        return (!this.settings.filterSRE ? mml :
            mml.replace(/ (?:data-semantic-.*?|role|aria-(?:level|posinset|setsize))=".*?"/g, ''));
    }
    toSVG(math) {
        const jax = this.jax.SVG;
        if (!jax)
            return Promise.resolve('SVG can\'t be produced.<br>Try switching to SVG output first.');
        const adaptor = jax.adaptor;
        const cache = jax.options.fontCache;
        const breaks = !!math.root.getProperty('process-breaks');
        if (cache !== 'global' && (math.display || !breaks) &&
            adaptor.getAttribute(math.typesetRoot, 'jax') === 'SVG') {
            for (const child of adaptor.childNodes(math.typesetRoot)) {
                if (adaptor.kind(child) === 'svg') {
                    return Promise.resolve(this.formatSvg(adaptor.outerHTML(child)));
                }
            }
        }
        return this.typesetSVG(math, cache, breaks);
    }
    typesetSVG(math, cache, breaks) {
        const jax = this.jax.SVG;
        const div = jax.html('div');
        if (cache === 'global') {
            jax.options.fontCache = 'local';
        }
        const root = math.root;
        math.root = root.copy(true);
        math.root.setInheritedAttributes({}, math.display, 0, false);
        if (breaks) {
            math.root.walkTree((n) => {
                n.removeProperty('process-breaks');
                n.removeProperty('forcebreak');
                n.removeProperty('breakable');
            });
        }
        const promise = mathjax.handleRetriesFor(() => {
            jax.toDOM(math, div, jax.document);
        });
        return promise.then(() => {
            math.root = root;
            jax.options.fontCache = cache;
            return this.formatSvg(jax.adaptor.innerHTML(div));
        });
    }
    formatSvg(svg) {
        const css = this.constructor.SvgCss;
        svg = (svg.match(/^<svg.*?><defs>/) ?
            svg.replace(/<defs>/, `<defs><style>${css}</style>`) :
            svg.replace(/^(<svg.*?>)/, `$1<defs><style>${css}</style></defs>`));
        svg = svg.replace(/ (?:role|focusable)=".*?"/g, '')
            .replace(/"currentColor"/g, '"black"');
        return `${XMLDECLARATION}\n${svg}`;
    }
    postSvgImage() {
        this.svgImage.post();
        this.toSVG(this.menu.mathItem).then((svg) => {
            const html = this.svgImage.html.querySelector('#svg-image');
            html.innerHTML = this.formatSource(svg).replace(/\n/g, '<br>');
        });
    }
    zoom(event, type, math) {
        if (!event || this.isZoomEvent(event, type)) {
            this.menu.mathItem = math;
            if (event) {
                this.menu.post(event);
            }
            this.zoomBox.post();
        }
    }
    isZoomEvent(event, zoom) {
        return (this.settings.zoom === zoom &&
            (!this.settings.alt || event.altKey) &&
            (!this.settings.ctrl || event.ctrlKey) &&
            (!this.settings.cmd || event.metaKey) &&
            (!this.settings.shift || event.shiftKey));
    }
    rerender(start = STATE.TYPESET) {
        this.rerenderStart = Math.min(start, this.rerenderStart);
        if (!Menu.loading) {
            if (this.rerenderStart <= STATE.COMPILED) {
                this.document.reset({ inputJax: [] });
            }
            this.document.rerender(this.rerenderStart);
            this.rerenderStart = STATE.LAST;
        }
    }
    copyMathML() {
        MenuUtil.copyToClipboard(this.toMML(this.menu.mathItem));
    }
    copyOriginal() {
        MenuUtil.copyToClipboard(this.menu.mathItem.math.trim());
    }
    copySvgImage() {
        this.toSVG(this.menu.mathItem).then((svg) => {
            MenuUtil.copyToClipboard(svg);
        });
    }
    copySpeechText() {
        MenuUtil.copyToClipboard(this.menu.mathItem.outputData.speech);
    }
    copyErrorMessage() {
        MenuUtil.copyToClipboard(this.menu.errorMsg.trim());
    }
    addMenu(math) {
        const element = math.typesetRoot;
        element.addEventListener('contextmenu', () => this.menu.mathItem = math, true);
        element.addEventListener('keydown', () => this.menu.mathItem = math, true);
        element.addEventListener('click', event => this.zoom(event, 'Click', math), true);
        element.addEventListener('dblclick', event => this.zoom(event, 'DoubleClick', math), true);
        this.menu.store.insert(element);
    }
    clear() {
        this.menu.store.clear();
    }
    variable(name, action) {
        return {
            name: name,
            getter: () => this.settings[name],
            setter: (value) => {
                this.settings[name] = value;
                action && action(value);
                this.saveUserSettings();
            }
        };
    }
    a11yVar(name, action) {
        return {
            name: name,
            getter: () => this.getA11y(name),
            setter: (value) => {
                this.settings[name] = value;
                let options = {};
                options[name] = value;
                this.setA11y(options);
                action && action(value);
                this.saveUserSettings();
            }
        };
    }
    submenu(id, content, entries = [], disabled = false) {
        let items = [];
        for (const entry of entries) {
            if (Array.isArray(entry)) {
                items = items.concat(entry);
            }
            else {
                items.push(entry);
            }
        }
        return { type: 'submenu', id, content, menu: { items }, disabled: (items.length === 0) || disabled };
    }
    command(id, content, action, other = {}) {
        return Object.assign({ type: 'command', id, content, action }, other);
    }
    checkbox(id, content, variable, other = {}) {
        return Object.assign({ type: 'checkbox', id, content, variable }, other);
    }
    radioGroup(variable, radios) {
        return radios.map(def => this.radio(def[0], def[1] || def[0], variable));
    }
    radio(id, content, variable, other = {}) {
        return Object.assign({ type: 'radio', id, content, variable }, other);
    }
    label(id, content) {
        return { type: 'label', id, content };
    }
    rule() {
        return { type: 'rule' };
    }
}
Menu.MENU_STORAGE = 'MathJax-Menu-Settings';
Menu.OPTIONS = {
    settings: {
        filterSRE: true,
        texHints: true,
        semantics: false,
        zoom: 'NoZoom',
        zscale: '200%',
        renderer: 'CHTML',
        alt: false,
        cmd: false,
        ctrl: false,
        shift: false,
        scale: 1,
        overflow: 'Scroll',
        breakInline: true,
        autocollapse: false,
        collapsible: false,
        inTabOrder: true,
        assistiveMml: false,
        explorer: false
    },
    jax: {
        CHTML: null,
        SVG: null
    },
    annotationTypes: expandable({
        TeX: ['TeX', 'LaTeX', 'application/x-tex'],
        StarMath: ['StarMath 5.0'],
        Maple: ['Maple'],
        ContentMathML: ['MathML-Content', 'application/mathml-content+xml'],
        OpenMath: ['OpenMath']
    })
};
Menu.SvgCss = [
    'svg a{fill:blue;stroke:blue}',
    '[data-mml-node="merror"]>g{fill:red;stroke:red}',
    '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
    '[data-frame],[data-line]{stroke-width:70px;fill:none}',
    '.mjx-dashed{stroke-dasharray:140}',
    '.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}',
    'use[data-c]{stroke-width:3px}'
].join('');
Menu.loading = 0;
Menu.loadingPromises = new Map();
Menu._loadingPromise = null;
Menu._loadingOK = null;
Menu._loadingFailed = null;
//# sourceMappingURL=Menu.js.map