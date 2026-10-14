import { Inbox, AlertCircle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center mb-4 text-text-muted">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      {description && (
        <p className="text-text-secondary text-sm max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 size={32} className="animate-spin text-school-blue mb-4" />
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-error" />
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-semibold text-school-blue border border-school-blue/30 rounded-lg hover:bg-school-blue/5 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
