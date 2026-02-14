import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  autoClose?: number; // milliseconds, 0 = no auto-close
}

/**
 * Displays feedback messages (success, error, info)
 */
export function FeedbackMessage({
  type,
  message,
  autoClose = 5000,
}: FeedbackMessageProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [autoClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
  };

  const style = styles[type];
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`flex items-start gap-2 rounded border ${style.bg} ${style.border} p-3`}>
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${style.icon}`} />
      <p className={`text-sm ${style.text}`}>{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className={`ml-auto flex-shrink-0 ${style.icon} hover:opacity-75`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
