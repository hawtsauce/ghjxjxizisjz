import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket, ChevronRight } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

interface RegisteredEvent {
  id: string;
  event_id: string;
  registered_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    address: string;
    background_image_url: string;
    target_date: string;
  };
}

const MyTickets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      fetchRegistrations(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchRegistrations(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRegistrations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          event_id,
          registered_at,
          events:event_id (
            id,
            title,
            date,
            time,
            address,
            background_image_url,
            target_date
          )
        `)
        .eq('user_id', userId)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((reg: any) => ({
        id: reg.id,
        event_id: reg.event_id,
        registered_at: reg.registered_at,
        event: reg.events
      })).filter((reg: RegisteredEvent) => reg.event);

      setRegistrations(formattedData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = registrations.filter(reg => !isPast(parseISO(reg.event.target_date)));
  const pastEvents = registrations.filter(reg => isPast(parseISO(reg.event.target_date)));
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="My Tickets"
        description="View all your registered events and tickets."
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">My Tickets</h1>
            </div>
            <p className="text-black/60">Events you've registered for</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-[#FA76FF] text-black'
                  : 'bg-white text-black border border-black hover:bg-black/5'
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'past'
                  ? 'bg-[#FA76FF] text-black'
                  : 'bg-white text-black border border-black hover:bg-black/5'
              }`}
            >
              Past ({pastEvents.length})
            </button>
          </div>

          {/* Events List */}
          {displayedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 border border-dashed border-black/20"
            >
              <Ticket className="w-12 h-12 mx-auto mb-4 text-black/30" />
              <h3 className="text-lg font-medium mb-2">
                {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              </h3>
              <p className="text-black/60 mb-6">
                {activeTab === 'upcoming' 
                  ? "You haven't registered for any upcoming events yet."
                  : "You don't have any past event registrations."
                }
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
              >
                Discover Events
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {displayedEvents.map((reg, index) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/event/${reg.event.id}`)}
                  className="border border-black hover:border-[#FA76FF] transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                      <img
                        src={reg.event.background_image_url}
                        alt={reg.event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg md:text-xl font-medium mb-2 group-hover:text-[#FA76FF] transition-colors">
                          {reg.event.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-black/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{reg.event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{reg.event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{reg.event.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-black/40">
                          Registered {format(parseISO(reg.registered_at), 'MMM d, yyyy')}
                        </span>
                        <ChevronRight className="w-5 h-5 text-black/40 group-hover:text-[#FA76FF] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyTickets;