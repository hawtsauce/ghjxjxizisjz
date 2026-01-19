import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, UserPlus, Calendar, Ticket } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'registration' | 'event_created' | 'ticket_sold';
  description: string;
  timestamp: string;
  eventTitle?: string;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent registrations
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          registered_at,
          event_id,
          events (title)
        `)
        .order('registered_at', { ascending: false })
        .limit(10);

      if (regError) throw regError;

      // Fetch recent events
      const { data: events, error: eventError } = await supabase
        .from('events')
        .select('id, title, created_by, target_date')
        .order('target_date', { ascending: false })
        .limit(5);

      if (eventError) throw eventError;

      // Combine and format activities
      const regActivities: ActivityItem[] = (registrations || []).map((reg: any) => ({
        id: reg.id,
        type: 'registration' as const,
        description: `New registration for "${reg.events?.title || 'Unknown Event'}"`,
        timestamp: reg.registered_at,
        eventTitle: reg.events?.title,
      }));

      // Sort by timestamp
      const allActivities = [...regActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return UserPlus;
      case 'event_created':
        return Calendar;
      case 'ticket_sold':
        return Ticket;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'event_created':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ticket_sold':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="border border-foreground bg-background p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted w-3/4 mb-2"></div>
                <div className="h-3 bg-muted w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-foreground bg-background">
      <div className="p-4 border-b border-foreground bg-muted flex items-center gap-2">
        <Clock className="w-5 h-5 text-foreground" />
        <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
      </div>
      
      {activities.length === 0 ? (
        <div className="p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1">Activity will appear here as people register for your events</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-muted transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
