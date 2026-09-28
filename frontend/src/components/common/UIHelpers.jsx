import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-elevation max-w-md w-full mx-4 p-6 border border-charcoal-200">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-govDanger' : 'text-safety-amber'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-navy-900">{title}</h3>
            <p className="text-sm text-charcoal-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-charcoal-500 hover:text-navy-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 hover:bg-charcoal-100 rounded-lg border border-charcoal-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
              danger
                ? 'bg-govDanger hover:bg-govDanger-dark'
                : 'bg-navy-900 hover:bg-navy-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} border-3 border-charcoal-200 border-t-infra-sky rounded-full animate-spin`} style={{ borderWidth: '3px' }} />
      <span className="text-sm text-charcoal-500 font-medium">{label}</span>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-charcoal-50 border border-charcoal-200 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-charcoal-500" />
        </div>
      )}
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      <p className="text-sm text-charcoal-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
