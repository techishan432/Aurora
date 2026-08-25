'use client';

import { useAttendanceStore } from '../../store/use-attendance-store';
import { IconAlertTriangle, IconCheckCircle, IconInfo, IconX } from './icons';

const toastIcon = {
  success: IconCheckCircle,
  info: IconInfo,
  warning: IconAlertTriangle,
  error: IconAlertTriangle,
} as const;

export function ToastHost() {
  const notifications = useAttendanceStore((state) => state.notifications);
  const dismissNotification = useAttendanceStore((state) => state.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {notifications.map((notification) => {
        const ToastIcon = toastIcon[notification.kind];
        return (
          <div
            key={notification.id}
            className="glass glass--elevated toast"
            role={notification.kind === 'error' ? 'alert' : 'status'}
          >
            <span className={`toast-icon-${notification.kind}`}>
              <ToastIcon size={18} />
            </span>
            <span className="toast-message">{notification.message}</span>
            <button
              type="button"
              className="notice-dismiss"
              onClick={() => dismissNotification(notification.id)}
              aria-label="Dismiss notification"
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
