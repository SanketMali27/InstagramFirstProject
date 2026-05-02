import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

import { useToast } from '../context/ToastContext';

const iconMap = {
  error: FiAlertCircle,
  success: FiCheckCircle,
  info: FiInfo
};

const colorMap = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700'
};

function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || FiInfo;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-lg ${colorMap[toast.type] || colorMap.info}`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 text-xl" />
              <div className="flex-1">
                {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
                <p className="text-sm">{toast.message}</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-black/5"
                onClick={() => removeToast(toast.id)}
              >
                <FiX />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
