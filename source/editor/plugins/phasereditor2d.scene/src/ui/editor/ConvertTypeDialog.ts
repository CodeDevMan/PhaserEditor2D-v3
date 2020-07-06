namespace phasereditor2d.scene.ui.editor {

    import controls = colibri.ui.controls;
    import io = colibri.core.io;

    export class ConvertTypeDialog extends controls.dialogs.ViewerFormDialog {

        private _editor: SceneEditor;
        private _keepOriginalTexture: boolean;

        constructor(editor: SceneEditor) {
            super(new viewers.ObjectExtensionAndPrefabViewer(), true);

            this._editor = editor;

            const size = this.getSize();
            this.setSize(size.width, size.height * 1.5);
        }

        static canConvert(editor: SceneEditor) {

            return this.getObjectsToMorph(editor).length > 0;
        }

        private static getObjectsToMorph(editor: SceneEditor) {

            return editor.getSelection().filter(obj => obj instanceof Phaser.GameObjects.GameObject);
        }

        create() {

            const viewer = this.getViewer();

            super.create();

            this.setTitle("Replace Type");

            this.enableButtonOnlyWhenOneElementIsSelected(
                this.addOpenButton("Replace", async (sel: any[]) => {

                    const targetType = viewer.getSelectionFirstElement();

                    let extraData: any = {};

                    if (targetType instanceof sceneobjects.SceneObjectExtension) {

                        const result = await targetType.collectExtraDataForCreateEmptyObject();

                        if (result.abort) {

                            return;
                        }

                        if (result.dataNotFoundMessage) {

                            alert(result.dataNotFoundMessage);

                            return;
                        }

                        extraData = result.data;
                    }


                    if (typeof extraData !== "object") {

                        extraData = {};
                    }

                    extraData.keepOriginalTexture = this._keepOriginalTexture;

                    this._editor.getUndoManager().add(
                        new undo.ConvertTypeOperation(this._editor, targetType, extraData));

                    this.close();
                })
            );

            viewer.selectFirst();

            this.addCancelButton();
        }

        createFormArea(formArea: HTMLDivElement) {

            this._keepOriginalTexture = window.localStorage["phasereditor2d.scene.ui.editor.ConvertTypeDialog.keepOriginalTexture"] === "true";

            const checkbox = document.createElement("input");
            checkbox.id = "checkbox1";
            checkbox.type = "checkbox";
            checkbox.checked = this._keepOriginalTexture;
            checkbox.addEventListener("change", e => {

                this._keepOriginalTexture = checkbox.checked;

                window.localStorage["phasereditor2d.scene.ui.editor.ConvertTypeDialog.keepOriginalTexture"] = this._keepOriginalTexture;
            });

            const label = document.createElement("label");
            label.innerHTML = "Keep the original texture.";
            label.htmlFor = "checkbox1";

            const fieldElement = document.createElement("div");
            fieldElement.style.gridColumn = "1 / span 2";
            fieldElement.style.display = "flex";
            fieldElement.style.alignItems = "center";
            fieldElement.appendChild(checkbox);
            fieldElement.appendChild(label);

            formArea.appendChild(fieldElement);
        }
    }
}