import React from 'react';
import { Plus, Calendar, Users, Ticket, BarChart3, Mail } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface QuickActionsProps {
  onNavigate: NavigateFunction;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      label: 'Create Event',
      icon: Plus,
      color: 'bg-[#FA76FF]',
      onClick: () => onNavigate('/create-event'),
    },
    {
      label: 'View Events',
      icon: Calendar,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      onClick: () => onNavigate('/my-events'),
    },
    {
      label: 'Manage Tickets',
      icon: Ticket,
      color: 'bg-green-100 dark:bg-green-900/30',
      onClick: () => {},
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      color: 'bg-orange-100 dark:bg-orange-900/30',
      onClick: () => {},
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`${action.color} border border-foreground p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all group`}
        >
          <action.icon className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium uppercase text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
};
