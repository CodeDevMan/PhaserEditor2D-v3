namespace colibri.ui.controls.properties {

    export declare type Updater = () => void;

    export abstract class PropertySection<T> {

        private _id: string;
        private _title: string;
        private _page: PropertyPage;
        private _updaters: Updater[];
        private _fillSpace: boolean;
        private _collapsedByDefault: boolean;

        constructor(page: PropertyPage, id: string, title: string, fillSpace = false, collapsedByDefault = false) {

            this._page = page;
            this._id = id;
            this._title = title;
            this._fillSpace = fillSpace;
            this._collapsedByDefault = collapsedByDefault;
            this._updaters = [];
        }

        protected abstract createForm(parent: HTMLDivElement);

        abstract canEdit(obj: any, n: number): boolean;

        abstract canEditNumber(n: number): boolean;

        createMenu(menu: controls.Menu) {
            // nothing by default
        }

        hasMenu() {

            return false;
        }

        updateWithSelection(): void {

            for (const updater of this._updaters) {
                updater();
            }
        }

        addUpdater(updater: Updater) {
            this._updaters.push(updater);
        }

        isFillSpace() {
            return this._fillSpace;
        }

        isCollapsedByDefault() {

            return this._collapsedByDefault;
        }

        getPage() {
            return this._page;
        }

        getSelection(): T[] {

            return this._page.getSelection();
        }

        getSelectionFirstElement(): T {

            return this.getSelection()[0];
        }

        getId() {
            return this._id;
        }

        getTitle() {
            return this._title;
        }

        create(parent: HTMLDivElement): void {
            this.createForm(parent);
        }

        flatValues_Number(values: number[]): string {

            const set = new Set(values);

            if (set.size === 1) {

                const value = set.values().next().value;

                return value.toString();
            }

            return "";
        }

        flatValues_StringJoin(values: string[]): string {
            return values.join(",");
        }

        flatValues_StringJoinDifferent(values: string[]): string {

            const set = new Set(values);

            return [...set].join(",");
        }

        flatValues_StringOneOrNothing(values: string[]): string {

            const set = new Set(values);

            return set.size === 1 ? values[0] : `(${values.length} selected)`;
        }

        protected createGridElement(parent: HTMLElement, cols = 0, simpleProps = true) {

            const div = document.createElement("div");

            div.classList.add("formGrid");

            if (cols > 0) {
                div.classList.add("formGrid-cols-" + cols);
            }

            if (simpleProps) {
                div.classList.add("formSimpleProps");
            }

            parent.appendChild(div);

            return div;
        }

        protected createLabel(parent: HTMLElement, text = "", tooltip = "") {

            const label = document.createElement("label");

            label.classList.add("formLabel");
            label.innerText = text;

            if (tooltip) {
                Tooltip.tooltip(label, tooltip);
            }

            parent.appendChild(label);

            return label;
        }

        protected createButton(parent: HTMLElement, text: string, callback: (e?: MouseEvent) => void) {

            const btn = document.createElement("button");

            btn.innerText = text;

            btn.addEventListener("click", e => callback(e));

            parent.appendChild(btn);

            return btn;
        }

        protected createMenuButton(
            parent: HTMLElement, text: string,
            items: Array<{ name: string, value: any }>,
            callback: (value: any) => void) {

            const btn = this.createButton(parent, text, e => {

                const menu = new controls.Menu();

                for (const item of items) {

                    menu.add(new Action({
                        text: item.name,
                        callback: () => {
                            callback(item.value);
                        }
                    }));
                }

                menu.createWithEvent(e);
            });

            return btn;
        }

        protected createText(parent: HTMLElement, readOnly = false) {

            const text = document.createElement("input");

            text.type = "text";
            text.classList.add("formText");
            text.readOnly = readOnly;

            parent.appendChild(text);

            return text;
        }

        protected createColor(parent: HTMLElement, readOnly = false, allowAlpha = true) {

            const text = document.createElement("input");

            text.type = "text";
            text.classList.add("formText");
            text.readOnly = readOnly;

            const btn = document.createElement("button");
            // btn.textContent = "...";
            btn.appendChild(
                new IconControl(ColibriPlugin.getInstance().getIcon(colibri.ICON_COLOR)).getCanvas());

            const colorElement = document.createElement("div");
            colorElement.style.display = "grid";
            colorElement.style.gridTemplateColumns = "1fr auto";
            colorElement.style.gridGap = "5px";
            colorElement.appendChild(text);
            colorElement.appendChild(btn);

            parent.appendChild(colorElement);

            btn.addEventListener("mousedown", e => {

                if (text.readOnly) {

                    return;
                }

                e.preventDefault();
                e.stopImmediatePropagation();

                if (ColorPickerManager.isActivePicker()) {

                    ColorPickerManager.closeActive();

                    return;
                }

                const picker = ColorPickerManager.createPicker();

                btn["__picker"] = picker;

                picker.setOptions({
                    popup: "left",
                    editor: false,
                    alpha: false,
                    onClose: () => {

                        ColorPickerManager.closeActive();
                    },
                    onDone: (color) => {

                        text.value = allowAlpha ? color.hex : color.hex.substring(0, 7);
                        btn.style.background = text.value;
                        text.dispatchEvent(new CustomEvent("change"));
                    }
                });

                try {

                    picker.setColour(text.value, false);

                } catch (e) {

                    picker.setColour("#fff", false);
                }

                picker.show();

                const pickerElement = picker.domElement as HTMLElement;
                const pickerBounds = pickerElement.getBoundingClientRect();
                const textBounds = text.getBoundingClientRect();

                pickerElement.getElementsByClassName("picker_arrow")[0].remove();

                let top = textBounds.top - pickerBounds.height;

                if (top + pickerBounds.height > window.innerHeight) {

                    top = window.innerHeight - pickerBounds.height;
                }

                if (top < 0) {

                    top = textBounds.bottom;
                }

                let left = textBounds.left;

                if (left + pickerBounds.width > window.innerWidth) {

                    left = window.innerWidth - pickerBounds.width;
                }

                pickerElement.style.top = top + "px";
                pickerElement.style.left = left + "px";

            });

            return {
                element: colorElement,
                text: text,
                btn: btn
            };
        }

        protected createTextArea(parent: HTMLElement, readOnly = false) {

            const text = document.createElement("textarea");

            text.classList.add("formText");
            text.readOnly = readOnly;

            parent.appendChild(text);

            return text;
        }

        private static NEXT_ID = 0;

        protected createCheckbox(parent: HTMLElement, label?: HTMLLabelElement) {

            const check = document.createElement("input");

            if (label) {

                const id = (PropertySection.NEXT_ID++).toString();

                label.htmlFor = id;

                check.setAttribute("id", id);
            }

            check.type = "checkbox";
            check.classList.add("formCheckbox");

            parent.appendChild(check);

            return check;
        }
    }
}