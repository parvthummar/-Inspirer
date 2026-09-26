import Modal from "./Modal";
import UsageSummary from "./UsageSummary";

export default function UsageDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Usage and credits" description="Every plan, chat reply and build uses credits." onClose={onClose}>
      <UsageSummary />
    </Modal>
  );
}
