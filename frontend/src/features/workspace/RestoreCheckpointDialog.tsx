import { useRestoreCheckpoint } from "../../api/checkpoints";
import type { Message } from "../../api/messages";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";

type RestoreCheckpointDialogProps = {
  projectId: string;
  message: Message;
  laterMessages: number;
  onClose: () => void;
};

const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });

export default function RestoreCheckpointDialog({ projectId, message, laterMessages, onClose }: RestoreCheckpointDialogProps) {
  const restore = useRestoreCheckpoint(projectId);
  const toast = useToast();
  const excerpt = message.content.length > 90 ? `${message.content.slice(0, 87)}...` : message.content;

  return (
    <Modal
      title="Restore to this point?"
      width="sm"
      onClose={onClose}
      dismissible={!restore.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={restore.isPending} data-autofocus>
            Keep everything
          </Button>
          <Button
            onClick={() =>
              restore.mutate(message.id, {
                onSuccess: () => {
                  toast("Project restored");
                  onClose();
                },
              })
            }
            loading={restore.isPending}
          >
            {restore.isPending ? "Restoring project" : "Restore project"}
          </Button>
        </>
      }
    >
      <blockquote className="rounded-md border-l-2 border-accent bg-surface px-3 py-2 text-sm">
        <p className="text-[11px] text-muted">{timeFormat.format(new Date(message.created_at))}</p>
        <p className="mt-0.5">{excerpt}</p>
      </blockquote>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The {laterMessages} {laterMessages === 1 ? "message" : "messages"} after this will be removed, along with any plan
        changes and builds they made. Your agent settings, GitHub history and deployments stay as they are.
      </p>
      {restore.isError && (
        <div className="mt-3">
          <Alert>{restore.error.message}</Alert>
        </div>
      )}
    </Modal>
  );
}
