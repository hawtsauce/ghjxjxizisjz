import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Check, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CreatorProfileProps {
  creatorName: string;
  creatorId?: string;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({ creatorName, creatorId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [eventCount, setEventCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndFollowStatus();
    fetchCreatorStats();
  }, [creatorId]);

  const checkAuthAndFollowStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session?.user);
    // In a real app, you'd check if the user follows this creator
  };

  const fetchCreatorStats = async () => {
    if (!creatorId) return;
    
    // Count events by this creator
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', creatorId);
    
    setEventCount(count || 1);
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to follow creators');
      return;
    }
    
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      setFollowerCount(prev => prev + 1);
      toast.success(`You're now following ${creatorName}`);
    } else {
      setFollowerCount(prev => prev - 1);
      toast.info(`Unfollowed ${creatorName}`);
    }
  };

  // Generate initials from creator name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border border-black p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Event Organizer</h3>
      
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-[#ff6bff] border border-black flex items-center justify-center text-xl font-bold text-black shrink-0">
          {getInitials(creatorName)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium truncate">{creatorName}</h4>
          
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {eventCount} {eventCount === 1 ? 'event' : 'events'}
            </span>
            <span>{followerCount} followers</span>
          </div>
          
          <button
            onClick={handleFollow}
            className={`mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isFollowing
                ? 'bg-black text-white border border-black'
                : 'bg-white text-black border border-black hover:bg-[#ff6bff] hover:border-[#ff6bff]'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </button>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Follow to get notified about future events from this organizer.
      </p>
    </div>
  );
};
