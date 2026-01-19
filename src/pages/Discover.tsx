import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { HeroSection } from '@/components/HeroSection';
import { EventsCarousel } from '@/components/EventsCarousel';
import { CategoryFilters } from '@/components/CategoryFilters';
import { UpcomingThisWeek } from '@/components/UpcomingThisWeek';
import { NewsletterCTA } from '@/components/NewsletterCTA';
import { FeaturedEvents } from '@/components/FeaturedEvents';
import { StatsSection } from '@/components/StatsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

const Discover = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, background_image_url, target_date, address')
        .order('target_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Discover Events"
        description="Explore popular events near you, browse by category, or check out some of the great community calendars."
        keywords="events, discover events, community events, local events, event calendar"
      />
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      {/* New Hero Section */}
      <HeroSection />

      {/* Auto-scrolling Events Carousel */}
      <EventsCarousel />

      {/* Category Filters */}
      <CategoryFilters 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />

      {/* Upcoming This Week */}
      <section id="events-section">
        <UpcomingThisWeek events={events} />
      </section>

      {/* Featured Events */}
      <FeaturedEvents events={events} />

      {/* Stats Section */}
      <StatsSection eventsCount={events.length} />

      {/* How It Works */}
      <HowItWorks />

      {/* Newsletter CTA */}
      <NewsletterCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Discover;
