import { IconAlertTriangle, IconX } from './icons';

type NoticeProps = {
  message: string;
  onDismiss: () => void;
};

export function Notice({ message, onDismiss }: NoticeProps) {
  return (
    <div className="notice" role="alert">
      <span className="notice-icon">
        <IconAlertTriangle size={18} />
      </span>
      <span>{message}</span>
      <button type="button" className="notice-dismiss" onClick={onDismiss} aria-label="Dismiss notice">
        <IconX size={16} />
      </button>
    </div>
  );
}
