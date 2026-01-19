import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { z } from 'zod';

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isFree: boolean;
}

const ticketSchema = z.object({
  name: z.string().trim().min(1, 'Ticket name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters'),
  price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price is too high'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100000, 'Quantity is too high'),
});

interface TicketManagerProps {
  tickets: TicketType[];
  onTicketsChange: (tickets: TicketType[]) => void;
}

export const TicketManager = ({ tickets, onTicketsChange }: TicketManagerProps) => {
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState<Omit<TicketType, 'id'>>({
    name: '',
    description: '',
    price: 0,
    quantity: 100,
    isFree: true,
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddTicket = () => {
    setError(null);
    
    const validationResult = ticketSchema.safeParse({
      name: newTicket.name,
      description: newTicket.description,
      price: newTicket.isFree ? 0 : newTicket.price,
      quantity: newTicket.quantity,
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    const ticket: TicketType = {
      id: crypto.randomUUID(),
      ...newTicket,
      price: newTicket.isFree ? 0 : newTicket.price,
    };

    onTicketsChange([...tickets, ticket]);
    setNewTicket({
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      isFree: true,
    });
    setIsAddingTicket(false);
  };

  const handleRemoveTicket = (ticketId: string) => {
    onTicketsChange(tickets.filter(t => t.id !== ticketId));
  };

  const handleUpdateTicket = (ticketId: string, updates: Partial<TicketType>) => {
    onTicketsChange(tickets.map(t => 
      t.id === ticketId ? { ...t, ...updates } : t
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          <h3 className="text-[17px] font-medium">Tickets</h3>
        </div>
        {!isAddingTicket && (
          <button
            type="button"
            onClick={() => setIsAddingTicket(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Ticket
          </button>
        )}
      </div>

      {/* Existing Tickets */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="border border-black p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[15px]">{ticket.name}</span>
                    <span className={`text-[13px] px-2 py-0.5 ${ticket.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {ticket.isFree ? 'FREE' : `৳${ticket.price.toFixed(2)}`}
                    </span>
                  </div>
                  {ticket.description && (
                    <p className="text-[14px] text-gray-600">{ticket.description}</p>
                  )}
                  <p className="text-[13px] text-gray-500">
                    {ticket.quantity} tickets available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTicket(ticket.id)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Remove ticket"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ticket Form */}
      {isAddingTicket && (
        <div className="border border-black p-4 space-y-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Ticket name (e.g., General Admission, VIP)"
              value={newTicket.name}
              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
              className="border-black focus:ring-0 focus:border-black"
            />
            <Input
              placeholder="Description (optional)"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              className="border-black focus:ring-0 focus:border-black"
            />
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newTicket.isFree}
                  onCheckedChange={(checked) => setNewTicket({ ...newTicket, isFree: checked, price: checked ? 0 : newTicket.price })}
                />
                <span className="text-[14px]">Free ticket</span>
              </div>
            </div>

            {!newTicket.isFree && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">৳</span>
                <Input
                  type="number"
                  placeholder="Price"
                  value={newTicket.price || ''}
                  onChange={(e) => setNewTicket({ ...newTicket, price: parseFloat(e.target.value) || 0 })}
                  className="w-32 border-black focus:ring-0 focus:border-black"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[14px]">Quantity:</span>
              <Input
                type="number"
                placeholder="100"
                value={newTicket.quantity || ''}
                onChange={(e) => setNewTicket({ ...newTicket, quantity: parseInt(e.target.value) || 0 })}
                className="w-32 border-black focus:ring-0 focus:border-black"
                min="1"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[13px]">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddTicket}
              className="px-4 py-2 text-[13px] font-medium uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Add Ticket
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTicket(false);
                setError(null);
                setNewTicket({
                  name: '',
                  description: '',
                  price: 0,
                  quantity: 100,
                  isFree: true,
                });
              }}
              className="px-4 py-2 text-[13px] font-medium uppercase tracking-wider border border-black hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tickets.length === 0 && !isAddingTicket && (
        <div 
          className="border border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setIsAddingTicket(true)}
        >
          <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-[14px] text-gray-500">No tickets added yet</p>
          <p className="text-[13px] text-gray-400">Click to add your first ticket type</p>
        </div>
      )}
    </div>
  );
};
