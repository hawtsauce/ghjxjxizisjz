import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OrganizerEventsListProps {
  userId: string;
  limit?: number;
  onViewAll?: () => void;
  onViewRegistrations: (eventId: string) => void;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  target_date: string;
  background_image_url: string;
  address: string;
  registrationCount?: number;
}

export const OrganizerEventsList: React.FC<OrganizerEventsListProps> = ({ 
  userId, 
  limit,
  onViewAll,
  onViewRegistrations 
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('id, title, date, time, target_date, background_image_url, address')
        .eq('created_by', userId)
        .order('target_date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch registration counts for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return { ...event, registrationCount: count || 0 };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventStatus = (targetDate: string) => {
    const now = new Date();
    const eventDate = new Date(targetDate);
    if (eventDate < now) return { label: 'Past', color: 'bg-muted text-muted-foreground' };
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) return { label: 'This Week', color: 'bg-[#FA76FF] text-foreground' };
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-foreground bg-background">
      <div className="flex items-center justify-between p-4 border-b border-foreground bg-muted">
        <h2 className="text-lg font-medium text-foreground">{limit ? 'Recent Events' : 'All Events'}</h2>
        {onViewAll && events.length > 0 && (
          <button 
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No events yet</p>
          <button
            onClick={() => navigate('/create-event')}
            className="mt-4 px-4 py-2 bg-[#FA76FF] border border-foreground text-sm text-foreground hover:bg-[#FA76FF]/80 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {events.map((event) => {
            const status = getEventStatus(event.target_date);
            return (
              <div 
                key={event.id}
                className="p-4 hover:bg-muted transition-colors"
              >
                <div className="flex gap-4">
                  <div 
                    className="w-20 h-20 bg-cover bg-center border border-foreground flex-shrink-0"
                    style={{ backgroundImage: `url(${event.background_image_url})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-lg truncate text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
                        <p className="text-sm text-muted-foreground truncate">{event.address}</p>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-medium uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => onViewRegistrations(event.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Users className="w-4 h-4" />
                        {event.registrationCount} registrations
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="p-2 border border-foreground hover:bg-muted transition-colors"
                          title="View Event"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/event/${event.id}/edit`)}
                          className="p-2 border border-foreground hover:bg-muted transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(event.id, e)}
                          className="p-2 border border-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
