import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  Ticket,
  Activity,
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { OrganizerStatsPublic } from '@/components/organizer/OrganizerStatsPublic';
import { OrganizerEventsListPublic } from '@/components/organizer/OrganizerEventsListPublic';
import { EventRegistrationsPublic } from '@/components/organizer/EventRegistrationsPublic';
import { OrganizerAnalyticsPublic } from '@/components/organizer/OrganizerAnalyticsPublic';
import { TicketAnalytics } from '@/components/organizer/TicketAnalytics';
import { AttendeeInsights } from '@/components/organizer/AttendeeInsights';
import { QuickActions } from '@/components/organizer/QuickActions';
import { RecentActivity } from '@/components/organizer/RecentActivity';

type ActiveSection = 'overview' | 'events' | 'registrations' | 'analytics' | 'tickets' | 'attendees';

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveSection('registrations');
  };

  const navTabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'events' as const, label: 'My Events', icon: Calendar },
    { id: 'tickets' as const, label: 'Tickets', icon: Ticket },
    { id: 'attendees' as const, label: 'Attendees', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <>
      <SEOHead 
        title="Organizer Dashboard"
        description="Manage your events, view registrations, track tickets and analyze performance"
      />
      <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-32 pb-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#FA76FF] border border-foreground flex items-center justify-center">
                    <Activity className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight text-foreground">
                      Organizer Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your events, tickets, and track performance</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/create-event')}
                className="flex items-center gap-2 px-6 py-3 bg-[#FA76FF] border border-foreground text-foreground text-sm font-medium uppercase hover:bg-[#FA76FF]/80 transition-colors w-fit"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-0 mb-8 border border-foreground w-fit">
              {navTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id);
                    if (tab.id !== 'registrations') setSelectedEventId(null);
                  }}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 text-[11px] font-medium uppercase transition-colors ${
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

            {/* Content */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <QuickActions onNavigate={navigate} />
                
                {/* Stats Overview */}
                <OrganizerStatsPublic />
                
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <OrganizerEventsListPublic 
                    limit={4} 
                    onViewAll={() => setActiveSection('events')}
                    onViewRegistrations={handleViewRegistrations}
                  />
                  <OrganizerAnalyticsPublic compact />
                </div>
                
                {/* Recent Activity */}
                <RecentActivity />
              </div>
            )}

            {activeSection === 'events' && (
              <OrganizerEventsListPublic 
                onViewRegistrations={handleViewRegistrations}
              />
            )}

            {activeSection === 'registrations' && (
              <EventRegistrationsPublic 
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
            )}

            {activeSection === 'tickets' && (
              <TicketAnalytics />
            )}

            {activeSection === 'attendees' && (
              <AttendeeInsights />
            )}

            {activeSection === 'analytics' && (
              <OrganizerAnalyticsPublic />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;
