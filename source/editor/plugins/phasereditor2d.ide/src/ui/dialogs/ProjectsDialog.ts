namespace phasereditor2d.ide.ui.dialogs {

    import controls = colibri.ui.controls;

    export class ProjectsDialog extends controls.dialogs.ViewerDialog {

        constructor() {
            super(new controls.viewers.TreeViewer(), false);
        }

        async create() {

            super.create();

            const viewer = this.getViewer();

            viewer.setLabelProvider(new controls.viewers.LabelProvider());
            viewer.setCellRendererProvider(new viewers.ProjectCellRendererProvider());
            viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
            viewer.setInput([]);

            viewer.eventOpenItem.addListener(() => this.openProject());

            const activeWindow = colibri.Platform.getWorkbench().getActiveWindow();

            this.setTitle("Projects");

            this.addButton("New Project", () => this.openNewProjectDialog());

            const root = colibri.ui.ide.FileUtils.getRoot();

            {
                const btn = this.addButton("Open Project", () => this.openProject());

                btn.disabled = true;

                viewer.eventSelectionChanged.addListener(() => {

                    let disabled = false;

                    const sel = viewer.getSelection();

                    try {

                        if (root) {

                            if (sel[0] === root.getName()) {

                                disabled = true;

                                return;
                            }
                        }

                        if (sel.length !== 1) {

                            disabled = true;

                            return;
                        }

                    } finally {

                        btn.disabled = disabled;
                    }
                });
            }

            const projects = await colibri.ui.ide.FileUtils.getProjects_async();

            viewer.setInput(projects);

            if (root) {
                viewer.setSelection([root.getName()]);
            }

            viewer.repaint();
        }

        private async openProject() {

            this.close();

            const project = this.getViewer().getSelectionFirstElement();

            IDEPlugin.getInstance().ideOpenProject(project);
        }

        private openNewProjectDialog() {

            const dlg = new NewProjectDialog();

            dlg.create();
        }
    }
}