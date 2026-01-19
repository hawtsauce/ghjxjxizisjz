import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Download, Calendar, ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EventRegistrationsProps {
  userId: string;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

interface Event {
  id: string;
  title: string;
}

interface Registration {
  id: string;
  user_id: string;
  registered_at: string;
  user_email?: string;
  user_name?: string;
}

export const EventRegistrations: React.FC<EventRegistrationsProps> = ({ 
  userId, 
  selectedEventId,
  onSelectEvent 
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('created_by', userId)
        .order('target_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      
      // Auto-select first event if none selected
      if (!selectedEventId && data && data.length > 0) {
        onSelectEvent(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegistrations(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          user_id,
          registered_at
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each registration
      const registrationsWithProfiles = await Promise.all(
        (data || []).map(async (reg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', reg.user_id)
            .maybeSingle();

          return {
            ...reg,
            user_name: profile?.display_name || 'Anonymous User',
            user_email: `user-${reg.user_id.slice(0, 8)}@example.com`, // Placeholder since we don't have email access
          };
        })
      );

      setRegistrations(registrationsWithProfiles);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.error('No registrations to export');
      return;
    }

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const headers = ['Name', 'Registered At'];
    const rows = registrations.map(r => [
      r.user_name || 'Anonymous',
      format(new Date(r.registered_at), 'PPpp')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent?.title || 'event'}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Registrations exported successfully');
  };

  const filteredRegistrations = registrations.filter(r =>
    r.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="border border-foreground p-12 text-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="border border-foreground p-12 text-center bg-background">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No events found</p>
        <p className="text-sm text-muted-foreground mt-2">Create an event to start receiving registrations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selector and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-foreground bg-background min-w-[250px] justify-between hover:bg-muted transition-colors text-foreground"
          >
            <span className="truncate">{selectedEvent?.title || 'Select an event'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 border border-foreground bg-background max-h-60 overflow-y-auto">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    onSelectEvent(event.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors text-foreground ${
                    event.id === selectedEventId ? 'bg-[#FA76FF]' : ''
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-3 border border-foreground hover:bg-muted transition-colors text-foreground"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search registrations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#FA76FF]"
        />
      </div>

      {/* Registrations Table */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5" />
            Registrations ({filteredRegistrations.length})
          </h3>
        </div>

        {loadingRegistrations ? (
          <div className="p-12 text-center">
            <div className="animate-pulse text-muted-foreground">Loading registrations...</div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No matching registrations found' : 'No registrations yet'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Name</TableHead>
                <TableHead className="font-medium">Registered At</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FA76FF] rounded-full flex items-center justify-center text-foreground font-medium">
                        {registration.user_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-foreground">{registration.user_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(registration.registered_at), 'PPpp')}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => toast.info('Email feature coming soon!')}
                      className="p-2 border border-foreground hover:bg-muted transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
