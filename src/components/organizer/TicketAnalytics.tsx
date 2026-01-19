import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, DollarSign, TrendingUp, Users, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  is_free: boolean;
  event_id: string;
  eventTitle?: string;
}

interface TicketStats {
  totalTickets: number;
  totalSold: number;
  totalRevenue: number;
  freeTickets: number;
  paidTickets: number;
}

const COLORS = ['#FA76FF', '#4ade80', '#60a5fa', '#f97316', '#a855f7', '#ec4899'];

export const TicketAnalytics: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    totalTickets: 0,
    totalSold: 0,
    totalRevenue: 0,
    freeTickets: 0,
    paidTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    try {
      // Fetch all events first
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .order('target_date', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Fetch all tickets with event info
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          name,
          price,
          quantity,
          sold,
          is_free,
          event_id,
          events (title)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      const formattedTickets: TicketType[] = (ticketsData || []).map((t: any) => ({
        ...t,
        eventTitle: t.events?.title || 'Unknown Event',
      }));

      setTickets(formattedTickets);

      // Calculate stats
      const totalTickets = formattedTickets.reduce((acc, t) => acc + t.quantity, 0);
      const totalSold = formattedTickets.reduce((acc, t) => acc + t.sold, 0);
      const totalRevenue = formattedTickets.reduce((acc, t) => acc + (t.sold * t.price), 0);
      const freeTickets = formattedTickets.filter(t => t.is_free).length;
      const paidTickets = formattedTickets.filter(t => !t.is_free).length;

      setStats({
        totalTickets,
        totalSold,
        totalRevenue,
        freeTickets,
        paidTickets,
      });
    } catch (error) {
      console.error('Error fetching ticket data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = !selectedEvent || t.event_id === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  // Prepare chart data
  const ticketsByEvent = events.map(event => {
    const eventTickets = tickets.filter(t => t.event_id === event.id);
    const sold = eventTickets.reduce((acc, t) => acc + t.sold, 0);
    const available = eventTickets.reduce((acc, t) => acc + (t.quantity - t.sold), 0);
    return {
      name: event.title.length > 15 ? event.title.slice(0, 15) + '...' : event.title,
      sold,
      available,
    };
  }).filter(e => e.sold > 0 || e.available > 0);

  const ticketTypeData = [
    { name: 'Free', value: stats.freeTickets },
    { name: 'Paid', value: stats.paidTickets },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted"></div>
            ))}
          </div>
          <div className="h-64 bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#FA76FF] rounded-lg">
              <Ticket className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalTickets}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Tickets</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">{stats.totalSold}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Tickets Sold</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">৳{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Revenue</div>
        </div>

        <div className="border border-foreground p-6 bg-background hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1 text-foreground">
            {stats.totalTickets > 0 ? Math.round((stats.totalSold / stats.totalTickets) * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">Sell-through Rate</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Event */}
        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <Ticket className="w-5 h-5" />
              Tickets by Event
            </h2>
          </div>
          <div className="p-6">
            {ticketsByEvent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="w-12 h-12 mx-auto mb-4" />
                <p>No ticket data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ticketsByEvent}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" fontSize={11} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 0,
                      backgroundColor: 'hsl(var(--background))'
                    }}
                  />
                  <Bar dataKey="sold" fill="#FA76FF" name="Sold" />
                  <Bar dataKey="available" fill="#4ade80" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ticket Type Distribution */}
        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5" />
              Ticket Types
            </h2>
          </div>
          <div className="p-6">
            {ticketTypeData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="w-12 h-12 mx-auto mb-4" />
                <p>No ticket types created</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={ticketTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {ticketTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 0,
                        backgroundColor: 'hsl(var(--background))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {ticketTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#FA76FF]"
          />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-foreground bg-background min-w-[200px] justify-between hover:bg-muted transition-colors text-foreground"
          >
            <span className="truncate">
              {selectedEvent ? events.find(e => e.id === selectedEvent)?.title : 'All Events'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 border border-foreground bg-background max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors text-foreground ${
                  !selectedEvent ? 'bg-[#FA76FF]' : ''
                }`}
              >
                All Events
              </button>
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors text-foreground ${
                    event.id === selectedEvent ? 'bg-[#FA76FF]' : ''
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2 text-foreground">
            <Ticket className="w-5 h-5" />
            All Tickets ({filteredTickets.length})
          </h3>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No tickets found</p>
            <p className="text-sm text-muted-foreground mt-1">Create tickets for your events to start tracking</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Ticket Name</TableHead>
                <TableHead className="font-medium">Event</TableHead>
                <TableHead className="font-medium">Price</TableHead>
                <TableHead className="font-medium">Sold / Total</TableHead>
                <TableHead className="font-medium">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const progress = ticket.quantity > 0 ? (ticket.sold / ticket.quantity) * 100 : 0;
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{ticket.name}</span>
                        {ticket.is_free && (
                          <span className="px-2 py-0.5 text-[10px] font-medium uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Free
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ticket.eventTitle}</TableCell>
                    <TableCell className="text-foreground">
                      {ticket.is_free ? 'Free' : `৳${ticket.price}`}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {ticket.sold} / {ticket.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-10">{Math.round(progress)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
