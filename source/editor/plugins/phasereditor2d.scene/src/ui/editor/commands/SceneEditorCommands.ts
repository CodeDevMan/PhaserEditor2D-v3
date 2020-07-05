namespace phasereditor2d.scene.ui.editor.commands {

    import controls = colibri.ui.controls;
    import io = colibri.core.io;

    export const CAT_SCENE_EDITOR = "phasereditor2d.scene.ui.editor.commands.SceneEditor";
    export const CMD_JOIN_IN_CONTAINER = "phasereditor2d.scene.ui.editor.commands.JoinInContainer";
    export const CMD_BREAK_CONTAINER = "phasereditor2d.scene.ui.editor.commands.BreakContainer";
    export const CMD_TRIM_CONTAINER = "phasereditor2d.scene.ui.editor.commands.TrimContainer";
    export const CMD_MOVE_TO_PARENT = "phasereditor2d.scene.ui.editor.commands.MoveToParent";
    export const CMD_SELECT_PARENT = "phasereditor2d.scene.ui.editor.commands.SelectParent";
    export const CMD_OPEN_COMPILED_FILE = "phasereditor2d.scene.ui.editor.commands.OpenCompiledFile";
    export const CMD_COMPILE_SCENE_EDITOR = "phasereditor2d.scene.ui.editor.commands.CompileSceneEditor";
    export const CMD_COMPILE_ALL_SCENE_FILES = "phasereditor2d.scene.ui.editor.commands.CompileAllSceneFiles";
    export const CMD_TRANSLATE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.MoveSceneObject";
    export const CMD_SET_ORIGIN_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.SetOriginSceneObject";
    export const CMD_ROTATE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.RotateSceneObject";
    export const CMD_SCALE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.ScaleSceneObject";
    export const CMD_RESIZE_TILE_SPRITE_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.ResizeTileSpriteSceneObject";
    export const CMD_SELECT_REGION = "phasereditor2d.scene.ui.editor.commands.SelectRegion";
    export const CMD_ADD_SCENE_OBJECT = "phasereditor2d.scene.ui.editor.commands.AddSceneObject";
    export const CMD_TOGGLE_SNAPPING = "phasereditor2d.scene.ui.editor.commands.ToggleSnapping";
    export const CMD_SET_SNAPPING_TO_OBJECT_SIZE = "phasereditor2d.scene.ui.editor.commands.SetSnappingToObjectSize";
    export const CMD_CONVERT_OBJECTS = "phasereditor2d.scene.ui.editor.commands.MorphObjects";
    export const CMD_CONVERT_TO_TILE_SPRITE_OBJECTS = "phasereditor2d.scene.ui.editor.commands.ConvertToTileSprite";
    export const CMD_SELECT_ALL_OBJECTS_SAME_TEXTURE = "phasereditor2d.scene.ui.editor.commands.SelectAllObjectsWithSameTexture";
    export const CMD_REPLACE_TEXTURE = "phasereditor2d.scene.ui.editor.commands.ReplaceTexture";
    export const CMD_OPEN_PREFAB = "phasereditor2d.scene.ui.editor.commands.OpenPrefab";
    export const CMD_CREATE_PREFAB_WITH_OBJECT = "phasereditor2d.scene.ui.editor.commands.CreatePrefabWithObject";
    export const CMD_QUICK_EDIT_OUTPUT_FILE = "phasereditor2d.scene.ui.editor.commands.QuickEditOutputFile";
    export const CMD_OPEN_OUTPUT_FILE_IN_VSCODE = "phasereditor2d.scene.ui.editor.commands.OpenOutputFileInVSCode";
    export const CMD_MOVE_OBJECT_LEFT = "phasereditor2d.scene.ui.editor.commands.MoveObjectLeft";
    export const CMD_MOVE_OBJECT_RIGHT = "phasereditor2d.scene.ui.editor.commands.MoveObjectRight";
    export const CMD_MOVE_OBJECT_UP = "phasereditor2d.scene.ui.editor.commands.MoveObjectUp";
    export const CMD_MOVE_OBJECT_DOWN = "phasereditor2d.scene.ui.editor.commands.MoveObjectDown";

    function isSceneScope(args: colibri.ui.ide.commands.HandlerArgs) {

        return args.activePart instanceof SceneEditor

            || (args.activeEditor instanceof SceneEditor &&
                (
                    args.activePart instanceof phasereditor2d.outline.ui.views.OutlineView
                    || args.activePart instanceof phasereditor2d.inspector.ui.views.InspectorView
                ));
    }

    function isOnlyContainerSelected(args: colibri.ui.ide.commands.HandlerArgs) {

        return isSceneScope(args) && editorHasSelection(args)

            && (args.activeEditor as SceneEditor).getSelectedGameObjects()

                .filter(obj => obj instanceof sceneobjects.Container)

                .length === args.activeEditor.getSelection().length;
    }

    function editorHasSelection(args: colibri.ui.ide.commands.HandlerArgs) {

        return args.activeEditor && args.activeEditor.getSelection().length > 0;
    }

    export class SceneEditorCommands {

        static registerCommands(manager: colibri.ui.ide.commands.CommandManager) {

            manager.addCategory({
                id: CAT_SCENE_EDITOR,
                name: "Scene Editor"
            });

            // copy

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_COPY,

                args => isSceneScope(args) && args.activeEditor.getSelection().length > 0,

                args => {
                    (args.activeEditor as SceneEditor).getClipboardManager().copy();
                });

            // paste

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_PASTE,

                args => isSceneScope(args),

                args => {
                    (args.activeEditor as SceneEditor).getClipboardManager().paste();
                });

            // cut

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_CUT,

                args => isSceneScope(args) && args.activeEditor.getSelection().length > 0,

                args => {
                    (args.activeEditor as SceneEditor).getClipboardManager().cut();
                });

            // update current editor

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_UPDATE_CURRENT_EDITOR,
                args => args.activeEditor instanceof SceneEditor,
                args => (args.activeEditor as SceneEditor).refreshScene());

            // select all

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_SELECT_ALL,

                args => args.activePart instanceof SceneEditor,

                args => {
                    const editor = args.activeEditor as SceneEditor;
                    editor.getSelectionManager().selectAll();
                });

            // clear selection

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_ESCAPE,

                args => {

                    if (controls.dialogs.Dialog.getActiveDialog()

                        || controls.ColorPickerManager.isActivePicker()) {

                        return false;
                    }

                    return isSceneScope(args);
                },

                args => {
                    const editor = args.activeEditor as SceneEditor;
                    editor.getSelectionManager().clearSelection();
                });

            // delete

            manager.addHandlerHelper(colibri.ui.ide.actions.CMD_DELETE,

                args => isSceneScope(args) && args.activeEditor.getSelection().length > 0,

                args => args.activeEditor.getUndoManager()
                    .add(new undo.DeleteOperation(args.activeEditor as SceneEditor))
            );

            SceneEditorCommands.registerContainerCommands(manager);

            SceneEditorCommands.registerCompilerCommands(manager);

            SceneEditorCommands.registerToolsCommands(manager);

            SceneEditorCommands.registerOriginCommands(manager);

            SceneEditorCommands.registerDepthCommands(manager);

            SceneEditorCommands.registerTypeCommands(manager);

            SceneEditorCommands.registerMoveObjectCommands(manager);

            // add object dialog

            manager.add({
                command: {
                    id: CMD_ADD_SCENE_OBJECT,
                    icon: colibri.Platform.getWorkbench().getWorkbenchIcon(colibri.ICON_PLUS),
                    name: "Add Object",
                    tooltip: "Add a new object to the scene",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        if (editor.isLoading()) {

                            alert("Cannot add objects while the editor is loading.");
                            return;
                        }

                        const dlg = new ui.editor.AddObjectDialog(editor);
                        dlg.create();
                    }
                },
                keys: {
                    key: "A"
                }
            });

            // texture

            manager.add({
                command: {
                    id: CMD_SELECT_ALL_OBJECTS_SAME_TEXTURE,
                    name: "Select All With Same Texture",
                    tooltip: "Select all the objects with the same texture.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {

                    testFunc: args => isSceneScope(args)
                        && args.activeEditor.getSelection()
                            .filter(
                                obj => obj instanceof Phaser.GameObjects.GameObject
                                    && sceneobjects.EditorSupport.hasObjectComponent(
                                        obj, sceneobjects.TextureComponent))
                            .length > 0,

                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        const textures = new Set<string>();

                        for (const obj of args.activeEditor.getSelection()) {

                            const textureComponent = sceneobjects.EditorSupport
                                .getObjectComponent(
                                    obj, sceneobjects.TextureComponent) as sceneobjects.TextureComponent;

                            const keys = textureComponent.getTextureKeys();
                            textures.add(JSON.stringify(keys));
                        }

                        const sel = [];

                        editor.getScene().visit(obj => {

                            const textureComponent = sceneobjects.EditorSupport
                                .getObjectComponent(
                                    obj, sceneobjects.TextureComponent) as sceneobjects.TextureComponent;

                            if (textureComponent) {

                                const keys = textureComponent.getTextureKeys();

                                if (textures.has(JSON.stringify(keys))) {

                                    sel.push(obj);
                                }
                            }
                        });

                        editor.setSelection(sel);
                    }
                }
            });

            // change texture

            manager.add({
                command: {
                    id: CMD_REPLACE_TEXTURE,
                    name: "Replace Texture",
                    tooltip: "Change the texture of the selected objects.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {

                    testFunc: args => isSceneScope(args) && args.activeEditor.getSelection().length > 0,

                    executeFunc: args => {
                        sceneobjects.ChangeTextureOperation.runDialog(args.activeEditor as SceneEditor);
                    }
                },
                keys: {
                    key: "X"
                }
            });

            // snapping

            manager.add({
                command: {
                    id: CMD_TOGGLE_SNAPPING,
                    name: "Toggle Snapping",
                    tooltip: "Enable/disable the snapping.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        editor.toggleSnapping();
                    }
                },
                keys: {
                    key: "E"
                }
            });

            manager.add({
                command: {
                    id: CMD_SET_SNAPPING_TO_OBJECT_SIZE,
                    name: "Snap To Object Size",
                    tooltip: "Enable snapping and set size to the selected object.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => isSceneScope(args)
                        && (args.activeEditor as SceneEditor).getSelectedGameObjects().length > 0,
                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        editor.setSnappingToObjectSize();
                    }
                },
                keys: {
                    key: "W"
                }
            });
        }

        private static registerMoveObjectCommands(manager: colibri.ui.ide.commands.CommandManager) {

            class Operation extends undo.SceneSnapshotOperation {

                private _dx: number;
                private _dy: number;

                constructor(editor: SceneEditor, dx: number, dy: number) {
                    super(editor);

                    this._dx = dx;
                    this._dy = dy;
                }

                protected performModification() {

                    for (const obj of this._editor.getSelection()) {

                        const sprite = obj as Phaser.GameObjects.Sprite;

                        sprite.x += this._dx;
                        sprite.y += this._dy;
                    }

                    this.getEditor().dispatchSelectionChanged();
                }
            }

            const dxMap: any = {}
            const dyMap: any = {}
            const nameMap: any = {};

            dxMap[CMD_MOVE_OBJECT_LEFT] = -1;
            dxMap[CMD_MOVE_OBJECT_RIGHT] = 1;
            dxMap[CMD_MOVE_OBJECT_UP] = 0;
            dxMap[CMD_MOVE_OBJECT_DOWN] = 0;

            dyMap[CMD_MOVE_OBJECT_LEFT] = 0;
            dyMap[CMD_MOVE_OBJECT_RIGHT] = 0;
            dyMap[CMD_MOVE_OBJECT_UP] = -1;
            dyMap[CMD_MOVE_OBJECT_DOWN] = 1;

            nameMap[CMD_MOVE_OBJECT_LEFT] = "Left";
            nameMap[CMD_MOVE_OBJECT_RIGHT] = "Right";
            nameMap[CMD_MOVE_OBJECT_UP] = "Up";
            nameMap[CMD_MOVE_OBJECT_DOWN] = "Down";

            for (const cmd of [CMD_MOVE_OBJECT_LEFT, CMD_MOVE_OBJECT_RIGHT, CMD_MOVE_OBJECT_UP, CMD_MOVE_OBJECT_DOWN]) {

                for (const large of [true, false]) {

                    manager.add({
                        command: {
                            id: cmd + (large ? "Large" : ""),
                            category: CAT_SCENE_EDITOR,
                            name: "Move Object Position " + (large ? "10x " : "") + nameMap[cmd],
                            tooltip: (large ? "10x " : "") + "Move selected objects position in the '" + nameMap[cmd] + "' direction"
                        },
                        handler: {
                            testFunc: args => {

                                if (!isSceneScope(args)) {

                                    return false;
                                }

                                if (args.activeEditor.getSelection().length === 0) {

                                    return false;
                                }

                                for (const obj of args.activeEditor.getSelection()) {

                                    if (!sceneobjects.EditorSupport.hasObjectComponent(obj, sceneobjects.TransformComponent)) {

                                        return false;
                                    }
                                }

                                return true;
                            },
                            executeFunc: args => {

                                const editor = args.activeEditor as SceneEditor;
                                const settings = editor.getScene().getSettings();


                                const dx = dxMap[cmd] * (large ? 10 : 1) * (settings.snapEnabled ? settings.snapWidth : 1);
                                const dy = dyMap[cmd] * (large ? 10 : 1) * (settings.snapEnabled ? settings.snapHeight : 1);

                                editor.getUndoManager().add(new Operation(editor, dx, dy));
                            }
                        },
                        keys: {
                            key: "Arrow" + nameMap[cmd],
                            shift: large ? true : undefined
                        }
                    });
                }
            }
        }

        private static registerContainerCommands(manager: colibri.ui.ide.commands.CommandManager) {

            // join in container

            manager.add({
                command: {
                    id: CMD_JOIN_IN_CONTAINER,
                    name: "Create Container With Selection",
                    tooltip: "Create a container with the selected objects",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => isSceneScope(args),

                    executeFunc: args => args.activeEditor.getUndoManager().add(
                        new ui.sceneobjects.CreateContainerWithObjectsOperation(args.activeEditor as SceneEditor)
                    )
                },
                keys: {
                    key: "J"
                }
            });

            // trim container

            manager.add({
                command: {
                    id: CMD_TRIM_CONTAINER,
                    name: "Trim Container",
                    tooltip: "Remove left/top margin of children.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isOnlyContainerSelected,

                    executeFunc: args => args.activeEditor.getUndoManager().add(
                        new ui.sceneobjects.TrimContainerOperation(args.activeEditor as SceneEditor)
                    )
                },
                keys: {
                    key: "T",
                    shift: true
                }
            });

            // break container

            manager.add({
                command: {
                    id: CMD_BREAK_CONTAINER,
                    name: "Break Container",
                    tooltip: "Destroy container and re-parent children.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isOnlyContainerSelected,

                    executeFunc: args => args.activeEditor.getUndoManager().add(
                        new ui.sceneobjects.BreakContainerOperation(args.activeEditor as SceneEditor)
                    )
                },
                keys: {
                    key: "B",
                    shift: true
                }
            });

            // select parent

            manager.add({
                command: {
                    id: CMD_SELECT_PARENT,
                    name: "Select Parent",
                    tooltip: "Select the parent container",
                    category: CAT_SCENE_EDITOR,
                },
                handler: {

                    testFunc: args => isSceneScope(args) && (args.activeEditor as SceneEditor)
                        .getSelectedGameObjects()
                        .map(obj => obj.parentContainer)
                        .filter(parent => parent !== undefined && parent !== null)
                        .length > 0,

                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        const sel = editor.getSelectedGameObjects()
                            .map(obj => obj.parentContainer)
                            .filter(parent => parent !== undefined && parent !== null);

                        editor.setSelection(sel);
                    }
                },
                keys: {
                    key: "P"
                }
            });

            // move to parent

            manager.add({
                command: {
                    id: CMD_MOVE_TO_PARENT,
                    name: "Move To Parent",
                    tooltip: "Re-parent the selected objects.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => isSceneScope(args) && editorHasSelection(args)
                        && (args.activeEditor as SceneEditor).getSelectedGameObjects()
                            .length === args.activeEditor.getSelection().length,

                    executeFunc: args => {

                        const dlg = new ui.sceneobjects.ParentDialog(args.activeEditor as SceneEditor);
                        dlg.create();
                    }
                },
                keys: {
                    shift: true,
                    key: "P"
                }
            });

        }

        private static registerTypeCommands(manager: colibri.ui.ide.commands.CommandManager) {

            // change type dialog

            manager.add({
                command: {
                    id: CMD_CONVERT_OBJECTS,
                    name: "Replace Type",
                    tooltip: "Replace the type of the selected objects.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => isSceneScope(args)
                        && ConvertTypeDialog.canConvert(args.activeEditor as SceneEditor),
                    executeFunc: args => {
                        const dlg = new editor.ConvertTypeDialog(args.activeEditor as SceneEditor);
                        dlg.create();
                    }
                }
            });

            // change type to tile sprite

            manager.add({
                command: {
                    id: CMD_CONVERT_TO_TILE_SPRITE_OBJECTS,
                    name: "Convert To TileSprite",
                    tooltip: "Convert the selected objects into TileSprite instances. Or resize it if it is a TileSprite.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {

                    testFunc: args => isSceneScope(args)
                        && ConvertTypeDialog.canConvert(args.activeEditor as SceneEditor),

                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        editor.getUndoManager().add(
                            new undo.ConvertTypeOperation(
                                editor, sceneobjects.TileSpriteExtension.getInstance()));
                    }
                },
                keys: {
                    key: "L"
                }
            });

            // open prefab

            manager.add({
                command: {
                    id: CMD_OPEN_PREFAB,
                    name: "Open Prefab",
                    category: CAT_SCENE_EDITOR,
                    tooltip: "Open the Prefab file of the selected prefab instance."
                },
                handler: {
                    testFunc: args => {

                        if (!isSceneScope(args)) {

                            return false;
                        }

                        const editor = args.activeEditor as SceneEditor;

                        const sel = editor.getSelectedGameObjects();

                        for (const obj of sel) {

                            if (!obj.getEditorSupport().isPrefabInstance()) {

                                return false;
                            }
                        }

                        return true;
                    },
                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        const sel = editor.getSelectedGameObjects();

                        for (const obj of sel) {

                            const file = obj.getEditorSupport().getPrefabFile();

                            if (file) {

                                colibri.Platform.getWorkbench().openEditor(file);
                            }
                        }
                    }
                },
                keys: {
                    key: "F"
                }
            });

            // create prefab

            manager.add({
                command: {
                    id: CMD_CREATE_PREFAB_WITH_OBJECT,
                    name: "Create Prefab With Object",
                    tooltip: "Create a new prefab file with the selected object.",
                    category: CAT_SCENE_EDITOR,
                },
                handler: {
                    testFunc: args => {

                        if (!isSceneScope(args)) {

                            return false;
                        }

                        const sel = args.activeEditor.getSelection();

                        if (sel.length !== 1) {

                            return false;
                        }

                        const obj = sel[0];

                        return obj instanceof Phaser.GameObjects.GameObject;
                    },
                    executeFunc: args => {

                        const obj = args.activeEditor.getSelection()[0] as sceneobjects.ISceneObject;

                        const objData: core.json.IObjectData = {} as any;

                        obj.getEditorSupport().writeJSON(objData);

                        objData.id = Phaser.Utils.String.UUID();

                        const ext = new dialogs.NewPrefabFileFromObjectDialogExtension(objData);

                        ext.setOpenInEditor(false);
                        ext.setCreatedCallback(newFile => {

                            const editor = args.activeEditor as SceneEditor;

                            editor.getUndoManager().add(
                                new undo.ConvertTypeOperation(
                                    editor, newFile));

                            editor.refreshBlocks();

                        });

                        const dlg = ext.createDialog({
                            initialFileLocation: (args.activeEditor.getInput() as io.FilePath).getParent()
                        });

                        dlg.setTitle("New Prefab File");
                    }
                }
            });

            // quick sort edit

            manager.add({
                command: {
                    id: CMD_QUICK_EDIT_OUTPUT_FILE,
                    name: "Quick Edit Output File",
                    category: CAT_SCENE_EDITOR,
                    tooltip: "Shortcut to edit the compiled code in a popup editor."
                },
                handler: {
                    testFunc: args => args.activeEditor instanceof SceneEditor,
                    executeFunc: args => {

                        const editor = args.activeEditor as SceneEditor;

                        editor.openOutputFileQuickEditorDialog();
                    }
                },
                keys: {
                    key: "Q"
                }
            });

            if (ide.IDEPlugin.getInstance().isDesktopMode()) {

                manager.add({
                    command: {
                        id: CMD_OPEN_OUTPUT_FILE_IN_VSCODE,
                        name: "Open Output File in VS Code",
                        category: CAT_SCENE_EDITOR,
                        tooltip: "Open the compiler output file in Visual Studio Code"
                    },
                    handler: {
                        testFunc: args => args.activeEditor instanceof SceneEditor,
                        executeFunc: args => {

                            const editor = args.activeEditor as SceneEditor;

                            const file = editor.getOutputFile();

                            if (file) {

                                ide.IDEPlugin.getInstance().openFileInVSCode(file);

                            } else {

                                alert(`Output file "${file.getProjectRelativeName()}" not found.`);
                            }
                        }
                    }
                });
            }
        }

        private static registerCompilerCommands(manager: colibri.ui.ide.commands.CommandManager) {

            // open compiled file

            manager.add({
                command: {
                    id: CMD_OPEN_COMPILED_FILE,
                    icon: webContentTypes.WebContentTypesPlugin.getInstance().getIcon(webContentTypes.ICON_FILE_SCRIPT),
                    name: "Open Output File",
                    tooltip: "Open the output source file of the scene.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => args.activeEditor instanceof SceneEditor,
                    executeFunc: args => (args.activeEditor as SceneEditor).openSourceFileInEditor()
                }
            });

            // compile scene editor

            manager.add({
                command: {
                    id: CMD_COMPILE_SCENE_EDITOR,
                    icon: ScenePlugin.getInstance().getIcon(ICON_BUILD),
                    name: "Compile Scene",
                    tooltip: "Compile the editor's Scene.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => args.activeEditor instanceof SceneEditor,
                    executeFunc: args => (args.activeEditor as SceneEditor).compile(),
                }
            });

            // compile all scene files

            manager.add({
                command: {
                    id: CMD_COMPILE_ALL_SCENE_FILES,
                    icon: ScenePlugin.getInstance().getIcon(ICON_BUILD),
                    name: "Compile Scenes",
                    tooltip: "Compile all the Scene files of the project.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: args => args.activeWindow instanceof ide.ui.DesignWindow,
                    executeFunc: args => ScenePlugin.getInstance().compileAll(),
                },
                keys: {
                    control: true,
                    alt: true,
                    key: "B"
                }
            });
        }

        private static registerToolsCommands(manager: colibri.ui.ide.commands.CommandManager) {

            manager.add({
                command: {
                    id: CMD_TRANSLATE_SCENE_OBJECT,
                    name: "Translate Tool",
                    icon: ScenePlugin.getInstance().getIcon(ICON_TRANSLATE),
                    tooltip: "Translate the selected scene objects",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.TranslateTool.ID)
                },
                keys: {
                    key: "T"
                }
            });

            manager.add({
                command: {
                    id: CMD_ROTATE_SCENE_OBJECT,
                    name: "Rotate Tool",
                    icon: ScenePlugin.getInstance().getIcon(ICON_ANGLE),
                    tooltip: "Rotate the selected scene objects",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.RotateTool.ID)
                },
                keys: {
                    key: "R"
                }
            });

            manager.add({
                command: {
                    id: CMD_SCALE_SCENE_OBJECT,
                    name: "Scale Tool",
                    icon: ScenePlugin.getInstance().getIcon(ICON_SCALE),
                    tooltip: "Scale the selected scene objects",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.ScaleTool.ID)
                },
                keys: {
                    key: "S"
                }
            });

            manager.add({
                command: {
                    id: CMD_SET_ORIGIN_SCENE_OBJECT,
                    name: "Origin Tool",
                    icon: ScenePlugin.getInstance().getIcon(ICON_ORIGIN),
                    tooltip: "Change the origin of the selected scene object",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.OriginTool.ID)
                },
                keys: {
                    key: "O"
                }
            });

            manager.add({
                command: {
                    id: CMD_SELECT_REGION,
                    name: "Select Region",
                    category: CAT_SCENE_EDITOR,
                    tooltip: "Select all objects inside a region",
                    icon: ScenePlugin.getInstance().getIcon(ICON_SELECT_REGION)
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.SelectionRegionTool.ID)
                },
                keys: {
                    shift: true,
                    key: "S"
                }
            });

            manager.add({
                command: {
                    id: CMD_RESIZE_TILE_SPRITE_SCENE_OBJECT,
                    name: "Resize TileSprite Tool",
                    tooltip: "Resize selected TileSprite objects.",
                    category: CAT_SCENE_EDITOR
                },
                handler: {
                    testFunc: isSceneScope,
                    executeFunc: args => (args.activeEditor as SceneEditor)
                        .getToolsManager().swapTool(ui.sceneobjects.TileSpriteSizeTool.ID)
                },
                keys: {
                    key: "Z"
                }
            });
        }

        private static registerDepthCommands(manager: colibri.ui.ide.commands.CommandManager) {

            for (const tuple of [["Up", "PageUp"], ["Down", "PageDown"], ["Top", "Home"], ["Bottom", "End"]]) {

                const move = tuple[0];
                const key = tuple[1];

                manager.add({

                    command: {
                        id: "phasereditor2d.scene.ui.editor.commands.Depth" + move,
                        name: "Move Object Depth " + move,
                        category: CAT_SCENE_EDITOR,
                        tooltip: "Move the object in its container to " + move + "."
                    },

                    handler: {
                        testFunc: args => isSceneScope(args) && args.activeEditor.getSelection().length > 0,

                        executeFunc: args => args.activeEditor.getUndoManager().add(
                            new undo.DepthOperation(args.activeEditor as editor.SceneEditor, move as any))
                    },

                    keys: {
                        key
                    }
                });
            }
        }

        static computeOriginCommandData(): Array<{
            command: string,
            name: string,
            key: string,
            x: number,
            y: number
        }> {

            const values = [
                { x: 0, y: 0, k: 7, n: "Top/Left" },
                { x: 0.5, y: 0, k: 8, n: "Top/Center" },
                { x: 1, y: 0, k: 9, n: "Top/Right" },
                { x: 0, y: 0.5, k: 4, n: "Middle/Left" },
                { x: 0.5, y: 0.5, k: 5, n: "Middle/Center" },
                { x: 1, y: 0.5, k: 6, n: "Middle/Right" },
                { x: 0, y: 1, k: 1, n: "Bottom/Left" },
                { x: 0.5, y: 1, k: 2, n: "Bottom/Center" },
                { x: 1, y: 1, k: 3, n: "Bottom/Right" },
            ];

            return values.map(value => {
                return {
                    command: "phasereditor2d.scene.ui.editor.commands.SetOrigin_" + value.n + "_ToObject",
                    name: "Set Origin To " + value.n,
                    x: value.x,
                    y: value.y,
                    key: value.k.toString()
                };
            });
        }

        private static registerOriginCommands(manager: colibri.ui.ide.commands.CommandManager) {

            const originProperty: sceneobjects.IProperty<sceneobjects.IOriginLikeObject> = {
                name: "origin",
                defValue: undefined,
                getValue: obj => ({ x: obj.originX, y: obj.originY }),
                setValue: (obj, value) => {
                    // obj.setOrigin(value.x, value.y);
                    sceneobjects.OriginToolItem
                        .simpleChangeOriginKeepPosition(obj as any, value.x, value.y);
                }
            };

            for (const data of this.computeOriginCommandData()) {

                manager.add({
                    command: {
                        id: data.command,
                        name: data.name,
                        tooltip: `Set the origin of the object to (${data.x},${data.y})`,
                        category: CAT_SCENE_EDITOR
                    },
                    keys: {
                        key: data.key,
                        shift: true,
                    },
                    handler: {
                        testFunc: args => {

                            if (!isSceneScope(args)) {
                                return false;
                            }

                            const sel = args.activeEditor.getSelection();

                            const len = sel

                                .filter(obj =>
                                    sceneobjects.EditorSupport.hasObjectComponent(
                                        obj, sceneobjects.OriginComponent)
                                    && (obj as sceneobjects.ISceneObject)
                                        .getEditorSupport().isUnlockedProperty(sceneobjects.OriginComponent.originX))
                                .length;

                            return len > 0 && len === sel.length;
                        },
                        executeFunc: args => {

                            const objects = args.activeEditor.getSelection()
                                .filter(obj => sceneobjects.EditorSupport
                                    .hasObjectComponent(obj, sceneobjects.TransformComponent));


                            args.activeEditor.getUndoManager().add(
                                new sceneobjects.SimpleOperation(
                                    args.activeEditor as SceneEditor,
                                    objects,
                                    originProperty,
                                    {
                                        x: data.x,
                                        y: data.y
                                    }));
                        }
                    },
                });
            }
        }
    }
}