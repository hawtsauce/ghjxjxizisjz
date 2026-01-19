import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar, Users, BarChart3 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OrganizerAnalyticsProps {
  userId: string;
  compact?: boolean;
}

interface EventStats {
  id: string;
  title: string;
  registrations: number;
}

interface DailyRegistration {
  date: string;
  count: number;
}

const COLORS = ['#ff6bff', '#4ade80', '#60a5fa', '#f97316', '#a855f7'];

export const OrganizerAnalytics: React.FC<OrganizerAnalyticsProps> = ({ userId, compact }) => {
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [dailyRegistrations, setDailyRegistrations] = useState<DailyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all events by user
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .eq('created_by', userId);

      if (eventsError) throw eventsError;

      // Get registration counts per event
      const statsWithCounts = await Promise.all(
        (events || []).map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            id: event.id,
            title: event.title.length > 20 ? event.title.slice(0, 20) + '...' : event.title,
            registrations: count || 0,
          };
        })
      );

      setEventStats(statsWithCounts.sort((a, b) => b.registrations - a.registrations).slice(0, 5));

      // Get daily registrations for the last 7 days
      const eventIds = events?.map(e => e.id) || [];
      if (eventIds.length > 0) {
        const last7Days: DailyRegistration[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayStart = startOfDay(date).toISOString();
          const dayEnd = endOfDay(date).toISOString();

          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .in('event_id', eventIds)
            .gte('registered_at', dayStart)
            .lte('registered_at', dayEnd);

          last7Days.push({
            date: format(date, 'EEE'),
            count: count || 0,
          });
        }

        setDailyRegistrations(last7Days);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-foreground p-6 bg-background">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted">
          <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Registrations (Last 7 Days)
          </h2>
        </div>
        <div className="p-4">
          {dailyRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No registration data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 0,
                    backgroundColor: 'hsl(var(--background))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FA76FF" 
                  strokeWidth={2}
                  dot={{ fill: '#FA76FF', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registrations Over Time */}
      <div className="border border-foreground bg-background">
        <div className="p-4 border-b border-foreground bg-muted">
          <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5" />
            Registrations Over Time (Last 7 Days)
          </h2>
        </div>
        <div className="p-6">
          {dailyRegistrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>No registration data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 0,
                    backgroundColor: 'hsl(var(--background))'
                  }}
                />
                <Bar dataKey="count" fill="#FA76FF" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Event Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5" />
              Top Events by Registrations
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={eventStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" fontSize={12} allowDecimals={false} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="title" fontSize={11} width={100} className="fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 0,
                      backgroundColor: 'hsl(var(--background))'
                    }}
                  />
                  <Bar dataKey="registrations" fill="#FA76FF" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="border border-foreground bg-background">
          <div className="p-4 border-b border-foreground bg-muted">
            <h2 className="text-lg font-medium flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5" />
              Registration Distribution
            </h2>
          </div>
          <div className="p-6">
            {eventStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={eventStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="registrations"
                    label={({ title, percent }) => 
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {eventStats.map((entry, index) => (
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
            )}
            {eventStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {eventStats.map((event, index) => (
                  <div key={event.id} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate max-w-[100px] text-muted-foreground">{event.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
