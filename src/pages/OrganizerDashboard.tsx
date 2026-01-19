import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Eye,
  Plus,
  ChevronRight,
  Download,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { OrganizerStats } from '@/components/organizer/OrganizerStats';
import { OrganizerEventsList } from '@/components/organizer/OrganizerEventsList';
import { EventRegistrations } from '@/components/organizer/EventRegistrations';
import { OrganizerAnalytics } from '@/components/organizer/OrganizerAnalytics';

const OrganizerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'events' | 'registrations' | 'analytics'>('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate]);

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveSection('registrations');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Organizer Dashboard"
        description="Manage your events, view registrations, and track analytics"
      />
      <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        
        <div className="pt-32 pb-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight">
                  Organizer Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Manage your events and track performance</p>
              </div>
              <button
                onClick={() => navigate('/create-event')}
                className="flex items-center gap-2 px-6 py-3 bg-[#ff6bff] border border-black text-black text-sm font-medium uppercase hover:bg-[#ff8fff] transition-colors w-fit"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-0 mb-8 border border-black w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'events', label: 'My Events', icon: Calendar },
                { id: 'registrations', label: 'Registrations', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id as typeof activeSection);
                    if (tab.id !== 'registrations') setSelectedEventId(null);
                  }}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 text-[11px] font-medium uppercase transition-colors ${
                    index > 0 ? 'border-l border-black' : ''
                  } ${
                    activeSection === tab.id 
                      ? 'bg-[#ff6bff] text-black' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {activeSection === 'overview' && user && (
              <div className="space-y-8">
                <OrganizerStats userId={user.id} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <OrganizerEventsList 
                    userId={user.id} 
                    limit={4} 
                    onViewAll={() => setActiveSection('events')}
                    onViewRegistrations={handleViewRegistrations}
                  />
                  <OrganizerAnalytics userId={user.id} compact />
                </div>
              </div>
            )}

            {activeSection === 'events' && user && (
              <OrganizerEventsList 
                userId={user.id} 
                onViewRegistrations={handleViewRegistrations}
              />
            )}

            {activeSection === 'registrations' && user && (
              <EventRegistrations 
                userId={user.id} 
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            )}

            {activeSection === 'analytics' && user && (
              <OrganizerAnalytics userId={user.id} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;
