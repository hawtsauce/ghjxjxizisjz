import React from 'react';
import { Check } from 'lucide-react';

interface TicketOption {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
}

interface TicketOptionsProps {
  selectedTicket: string | null;
  onSelectTicket: (ticketId: string) => void;
}

const ticketOptions: TicketOption[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'General admission',
    perks: ['Event access', 'Community networking']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 25,
    description: 'Enhanced experience',
    perks: ['Priority seating', 'Event access', 'Refreshments included']
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 75,
    description: 'Premium experience',
    perks: ['Front row seating', 'Meet & greet', 'Exclusive merch', 'All Standard perks']
  }
];

export const TicketOptions: React.FC<TicketOptionsProps> = ({ 
  selectedTicket, 
  onSelectTicket 
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Tickets
      </h3>
      <div className="flex flex-col gap-3">
        {ticketOptions.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket.id)}
            className={`
              relative flex flex-col gap-2 p-4 border transition-all text-left
              ${selectedTicket === ticket.id 
                ? 'border-foreground bg-foreground/5' 
                : 'border-border hover:border-foreground/50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{ticket.name}</span>
              <span className="text-foreground font-medium">
                {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {ticket.perks.map((perk, index) => (
                <li key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-foreground" />
                  {perk}
                </li>
              ))}
            </ul>
            {selectedTicket === ticket.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-foreground rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-background" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
