import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

interface FeaturedEventsProps {
  events: Event[];
}

export const FeaturedEvents: React.FC<FeaturedEventsProps> = ({ events }) => {
  const navigate = useNavigate();
  
  // Get top 3 upcoming events as "featured"
  const featuredEvents = events
    .filter(event => new Date(event.target_date) > new Date())
    .slice(0, 3);

  if (featuredEvents.length === 0) return null;

  return (
    <section className="px-4 md:px-8 py-12 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-medium">Featured Events</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event, index) => (
            <div
              key={event.id}
              className="relative cursor-pointer group overflow-hidden rounded-lg border border-border bg-card"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              {/* Featured badge */}
              <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </div>
              
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${event.background_image_url})` }}
                />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{event.date}</span>
                  <span>•</span>
                  <span>{event.time}</span>
                </div>
                <h3 className="text-lg font-medium mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{event.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
