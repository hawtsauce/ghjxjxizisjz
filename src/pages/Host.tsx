import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { OrganizerStats } from '@/components/organizer/OrganizerStats';
import { OrganizerEventsList } from '@/components/organizer/OrganizerEventsList';
import { OrganizerAnalytics } from '@/components/organizer/OrganizerAnalytics';
import { EventRegistrations } from '@/components/organizer/EventRegistrations';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, BarChart3, Sparkles, TrendingUp, Settings } from 'lucide-react';

const Host = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'events' | 'registrations' | 'analytics'>('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        setIsAdmin(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer admin check
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!roleData);
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveSection('registrations');
  };

  // Show landing page for non-authenticated users or non-admin users
  if (!loading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Host Your Event"
          description="Create and manage amazing events. Reach your audience and sell tickets effortlessly."
        />
        <Navbar />
        
        {/* Hero Section for Hosts */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 border border-foreground px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">For Event Organizers</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 text-foreground">
              <span className="border border-foreground px-4 py-2 inline-block">Host</span>
              <span className="mx-2">your</span>
              <span className="border border-[#FA76FF] bg-[#FA76FF] px-4 py-2 inline-block">event</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Create, manage, and grow your events with powerful tools designed for organizers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/become-host')}
                className="px-8 py-4 bg-foreground text-background text-sm font-medium uppercase tracking-wider hover:bg-foreground/90 transition-colors"
              >
                Apply to Become a Host
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="px-8 py-4 border border-foreground text-foreground text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
              >
                Browse Events
              </motion.button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4"
          >
            {[
              { icon: Calendar, title: 'Easy Event Creation', desc: 'Create beautiful event pages in minutes' },
              { icon: Users, title: 'Manage Registrations', desc: 'Track attendees and manage capacity' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Understand your audience with insights' },
            ].map((feature, i) => (
              <div key={i} className="border border-foreground p-6 text-center hover:border-[#FA76FF] transition-colors bg-background">
                <feature.icon className="w-8 h-8 mx-auto mb-4 text-foreground" />
                <h3 className="font-medium mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ] as const;

  // Authenticated Host Dashboard
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Host Dashboard"
        description="Manage your events, view registrations, and track analytics."
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">Host Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your events and track performance</p>
            </div>
            <button
              onClick={() => navigate('/create-event')}
              className="flex items-center gap-2 px-6 py-3 bg-[#FA76FF] text-foreground text-sm font-medium uppercase tracking-wider hover:bg-[#FA76FF]/80 transition-colors border border-foreground w-fit"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-0 mb-8 border border-foreground w-fit">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  if (tab.id !== 'registrations') setSelectedEventId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] font-medium uppercase transition-colors ${
                  index > 0 ? 'border-l border-foreground' : ''
                } ${
                  activeSection === tab.id
                    ? 'bg-[#FA76FF] text-foreground'
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeSection === 'overview' && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <OrganizerStats userId={user.id} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <OrganizerEventsList 
                  userId={user.id} 
                  limit={3} 
                  onViewAll={() => setActiveSection('events')}
                  onViewRegistrations={handleViewRegistrations}
                />
                <OrganizerAnalytics userId={user.id} compact />
              </div>
            </motion.div>
          )}

          {activeSection === 'events' && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <OrganizerEventsList 
                userId={user.id}
                onViewRegistrations={handleViewRegistrations}
              />
            </motion.div>
          )}

          {activeSection === 'registrations' && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EventRegistrations 
                userId={user.id}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            </motion.div>
          )}

          {activeSection === 'analytics' && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <OrganizerAnalytics userId={user.id} />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Host;