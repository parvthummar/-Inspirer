import { useDeleteProject, type Project } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";

type DeleteProjectDialogProps = {
  project: Project;
  onClose: () => void;
};

export default function DeleteProjectDialog({ project, onClose }: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();
  const toast = useToast();

  function confirm() {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast("Project deleted");
        onClose();
      },
    });
  }

  return (
    <Modal
      title="Delete this project?"
      width="sm"
      onClose={onClose}
      dismissible={!deleteProject.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleteProject.isPending} data-autofocus>
            Keep project
          </Button>
          <Button
            onClick={confirm}
            loading={deleteProject.isPending}
            className="bg-danger hover:bg-danger/90 disabled:bg-danger/60"
          >
            {deleteProject.isPending ? "Deleting project" : "Delete project"}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        <span className="font-medium text-ink">{project.name}</span> and its chat history, plans and previews will be
        removed for good. This can't be undone.
      </p>
      {deleteProject.isError && (
        <div className="mt-4">
          <Alert>{deleteProject.error.message}</Alert>
        </div>
      )}
    </Modal>
  );
}
