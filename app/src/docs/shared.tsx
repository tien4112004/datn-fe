import React from 'react';
import { ArrowRight } from 'lucide-react';

export type FlowNodeColor = 'blue' | 'purple' | 'green' | 'orange' | 'indigo' | 'slate';

export interface FlowNodeProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: FlowNodeColor;
}

export interface ConnectionArrowProps {
  label?: string;
  vertical?: boolean;
  short?: boolean;
}

export const FlowNode = ({ icon: Icon, title, description, color = 'blue' }: FlowNodeProps) => {
  const colorClasses: Record<FlowNodeColor, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <div
      className={`rounded-xl border-2 p-3 ${colorClasses[color]} flex w-36 flex-col items-center text-center shadow-sm transition-all hover:shadow-md`}
    >
      <div className="mb-2 rounded-full bg-white p-2 shadow-sm">
        <Icon size={18} />
      </div>
      <h4 className="mb-1 text-[11px] font-bold uppercase leading-tight tracking-tight">{title}</h4>
      <p className="text-[9px] font-medium leading-tight opacity-80">{description}</p>
    </div>
  );
};

export const ConnectionArrow = ({ label, vertical = false, short = false }: ConnectionArrowProps) => (
  <div
    className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center justify-center ${short ? 'px-0.5' : 'px-1'}`}
  >
    {label && (
      <span className="mb-1 whitespace-nowrap text-[8px] font-bold uppercase text-slate-400">{label}</span>
    )}
    <ArrowRight className={`text-slate-200 ${vertical ? 'rotate-90' : ''}`} size={short ? 12 : 16} />
  </div>
);
