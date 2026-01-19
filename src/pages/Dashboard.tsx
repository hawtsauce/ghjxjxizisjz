import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Ticket, 
  Settings, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  Mail,
  Edit2,
  Save,
  X,
  LogOut
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { toast } from 'sonner';

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

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'settings'>('overview');
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      // Defer data fetching
      setTimeout(() => {
        fetchUserData(session.user.id);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile and registrations in parallel
      const [profileResult, registrationsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
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
          .order('registered_at', { ascending: false })
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
        setDisplayName(profileResult.data.display_name || '');
      }

      if (registrationsResult.data) {
        const formattedData = registrationsResult.data
          .map((reg: any) => ({
            id: reg.id,
            event_id: reg.event_id,
            registered_at: reg.registered_at,
            event: reg.events
          }))
          .filter((reg: RegisteredEvent) => reg.event);
        setRegistrations(formattedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const upcomingEvents = registrations.filter(reg => !isPast(parseISO(reg.event.target_date)));
  const pastEvents = registrations.filter(reg => isPast(parseISO(reg.event.target_date)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Dashboard"
        description="Manage your account, view tickets, and update settings."
      />
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
            </h1>
            <p className="text-muted-foreground mt-1">Manage your account and view your events</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-0 mb-8 border border-foreground w-fit">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] font-medium uppercase transition-colors ${
                  index > 0 ? 'border-l border-foreground' : ''
                } ${
                  activeTab === tab.id 
                    ? 'bg-[#FA76FF] text-foreground' 
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-foreground p-6">
                  <div className="text-3xl font-bold text-foreground">{upcomingEvents.length}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Upcoming</div>
                </div>
                <div className="border border-foreground p-6">
                  <div className="text-3xl font-bold text-foreground">{pastEvents.length}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Attended</div>
                </div>
                <div className="border border-foreground p-6">
                  <div className="text-3xl font-bold text-foreground">{registrations.length}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Total Events</div>
                </div>
                <div className="border border-foreground p-6">
                  <div className="text-3xl font-bold text-foreground">
                    {profile ? format(parseISO(profile.created_at), 'MMM yyyy') : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mt-1">Member Since</div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="border border-foreground p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-foreground">Profile</h2>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-1 px-3 py-1 bg-[#FA76FF] text-foreground text-sm font-medium hover:bg-[#FA76FF]/80 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setDisplayName(profile?.display_name || '');
                        }}
                        className="flex items-center gap-1 px-3 py-1 border border-foreground text-foreground text-sm hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FA76FF] flex items-center justify-center text-foreground text-xl font-bold">
                      {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Display name"
                          className="text-lg font-medium bg-transparent border-b border-foreground focus:outline-none focus:border-[#FA76FF] text-foreground"
                        />
                      ) : (
                        <div className="text-lg font-medium text-foreground">
                          {profile?.display_name || 'Set your display name'}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events Preview */}
              <div className="border border-foreground">
                <div className="flex items-center justify-between p-4 border-b border-foreground">
                  <h2 className="text-lg font-medium text-foreground">Upcoming Events</h2>
                  {upcomingEvents.length > 0 && (
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {upcomingEvents.length === 0 ? (
                  <div className="p-8 text-center">
                    <Ticket className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No upcoming events</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-foreground text-background text-sm font-medium uppercase tracking-wider hover:bg-foreground/90 transition-colors"
                    >
                      Discover Events
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {upcomingEvents.slice(0, 3).map((reg) => (
                      <div
                        key={reg.id}
                        onClick={() => navigate(`/event/${reg.event.id}`)}
                        className="flex items-center gap-4 p-4 hover:bg-muted cursor-pointer transition-colors group"
                      >
                        <img
                          src={reg.event.background_image_url}
                          alt={reg.event.title}
                          className="w-16 h-16 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate group-hover:text-[#FA76FF] transition-colors">
                            {reg.event.title}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            {reg.event.date} • {reg.event.time}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#FA76FF] transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sub-tabs for upcoming/past */}
              <div className="flex gap-2">
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-[#FA76FF] text-foreground text-sm font-medium uppercase tracking-wider"
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 border border-foreground text-foreground text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                >
                  Past ({pastEvents.length})
                </button>
              </div>

              {registrations.length === 0 ? (
                <div className="border border-dashed border-muted-foreground p-16 text-center">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No tickets yet</h3>
                  <p className="text-muted-foreground mb-6">Register for an event to see your tickets here</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-foreground text-background text-sm font-medium uppercase tracking-wider hover:bg-foreground/90 transition-colors"
                  >
                    Discover Events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((reg, index) => (
                    <motion.div
                      key={reg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/event/${reg.event.id}`)}
                      className={`border border-foreground hover:border-[#FA76FF] transition-colors cursor-pointer group ${
                        isPast(parseISO(reg.event.target_date)) ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                          <img
                            src={reg.event.background_image_url}
                            alt={reg.event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {isPast(parseISO(reg.event.target_date)) && (
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] uppercase tracking-wider">
                                  Past
                                </span>
                              )}
                              <h3 className="text-lg md:text-xl font-medium group-hover:text-[#FA76FF] transition-colors text-foreground">
                                {reg.event.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                            <span className="text-xs text-muted-foreground">
                              Registered {format(parseISO(reg.registered_at), 'MMM d, yyyy')}
                            </span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#FA76FF] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Account Settings */}
              <div className="border border-foreground">
                <div className="p-4 border-b border-foreground">
                  <h2 className="text-lg font-medium text-foreground">Account Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Email */}
                  <div>
                    <label className="text-sm text-muted-foreground uppercase tracking-wide">Email Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user?.email}</span>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="text-sm text-muted-foreground uppercase tracking-wide">Display Name</label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        className="flex-1 px-3 py-2 border border-foreground bg-background text-foreground focus:outline-none focus:border-[#FA76FF]"
                      />
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile || displayName === profile?.display_name}
                        className="px-4 py-2 bg-[#FA76FF] text-foreground text-sm font-medium uppercase tracking-wider hover:bg-[#FA76FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingProfile ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="border border-foreground">
                <div className="p-4 border-b border-foreground">
                  <h2 className="text-lg font-medium text-foreground">Account Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="text-foreground">
                      {profile ? format(parseISO(profile.created_at), 'MMMM d, yyyy') : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="text-foreground">
                      {profile ? format(parseISO(profile.updated_at), 'MMMM d, yyyy') : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total events attended</span>
                    <span className="text-foreground">{registrations.length}</span>
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <div className="border border-destructive">
                <div className="p-4 border-b border-destructive">
                  <h2 className="text-lg font-medium text-destructive">Danger Zone</h2>
                </div>
                <div className="p-6">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
