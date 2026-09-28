import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Clock,
  Hammer,
  Route,
  Zap,
  HardHat,
  CircleDot,
} from 'lucide-react';

export const AssetTypeBadge = ({ type, size = 'sm' }) => {
  const configs = {
    ROAD: {
      label: 'ROAD',
      bg: 'bg-blue-50',
      text: 'text-[#1976A5]',
      border: 'border-blue-200',
      icon: Route,
    },
    HIGHWAY: {
      label: 'HIGHWAY',
      bg: 'bg-slate-100',
      text: 'text-[#123B5D]',
      border: 'border-slate-300',
      icon: Zap,
    },
    BRIDGE: {
      label: 'BRIDGE',
      bg: 'bg-amber-50',
      text: 'text-[#B45309]',
      border: 'border-amber-200',
      icon: CircleDot,
    },
  };

  const config = configs[type] || configs.ROAD;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md border ${
        config.bg
      } ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};

export const ConditionBadge = ({ condition, size = 'sm' }) => {
  const configs = {
    EXCELLENT: {
      label: 'EXCELLENT',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
      border: 'border-[#86EFAC]',
    },
    GOOD: {
      label: 'GOOD',
      bg: 'bg-[#E0F2FE]',
      text: 'text-[#0369A1]',
      border: 'border-[#7DD3FC]',
    },
    FAIR: {
      label: 'FAIR',
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#92400E]',
      border: 'border-[#FCD34D]',
    },
    POOR: {
      label: 'POOR',
      bg: 'bg-[#FFEDD5]',
      text: 'text-[#C2410C]',
      border: 'border-[#FDBA74]',
    },
    CRITICAL: {
      label: 'CRITICAL',
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#991B1B]',
      border: 'border-[#FCA5A5]',
    },
  };

  const config = configs[condition] || configs.GOOD;

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider rounded-md border ${
        config.bg
      } ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {config.label}
    </span>
  );
};

export const StatusBadge = ({ status, size = 'sm' }) => {
  const configs = {
    PLANNED: {
      label: 'PLANNED',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    UNDER_CONSTRUCTION: {
      label: 'UNDER CONSTRUCTION',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
    },
    OPERATIONAL: {
      label: 'OPERATIONAL',
      bg: 'bg-[#DCFCE7]',
      text: 'text-[#166534]',
      border: 'border-[#BBF7D0]',
    },
    UNDER_MAINTENANCE: {
      label: 'UNDER MAINTENANCE',
      bg: 'bg-amber-50',
      text: 'text-[#B45309]',
      border: 'border-amber-200',
    },
    CRITICAL: {
      label: 'CRITICAL ALERT',
      bg: 'bg-red-50',
      text: 'text-[#991B1B]',
      border: 'border-red-200',
    },
    RETIRED: {
      label: 'RETIRED',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-300',
    },
  };

  const config = configs[status] || {
    label: status || 'UNKNOWN',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border ${
        config.bg
      } ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'sm' }) => {
  const configs = {
    LOW: { label: 'LOW', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    MEDIUM: { label: 'MEDIUM', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    HIGH: { label: 'HIGH', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    URGENT: { label: 'URGENT', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded border ${
        config.bg
      } ${config.text} ${config.border} ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
      }`}
    >
      {config.label}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const configs = {
    ADMIN: { label: 'ADMINISTRATOR', bg: 'bg-[#123B5D]', text: 'text-white' },
    FIELD_INSPECTOR: { label: 'FIELD INSPECTOR', bg: 'bg-[#1976A5]', text: 'text-white' },
    MAINTENANCE_OFFICER: { label: 'MAINTENANCE OFFICER', bg: 'bg-[#D89B24]', text: 'text-black' },
  };

  const config = configs[role] || { label: role, bg: 'bg-slate-600', text: 'text-white' };

  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-sm ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};
