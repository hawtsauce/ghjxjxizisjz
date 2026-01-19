import React from 'react';
import { Facebook, Twitter, Mail, Link2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import bkashLogo from '@/assets/bkash-logo.png';
import sslcommerzLogos from '@/assets/sslcommerz-logos.jpg';
import pathaoPayLogo from '@/assets/pathao-pay-logo.png';

interface PaymentAndShareProps {
  eventTitle: string;
  eventDate: string;
  eventAddress: string;
}

export const PaymentAndShare: React.FC<PaymentAndShareProps> = ({
  eventTitle,
  eventDate,
  eventAddress
}) => {
  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(eventTitle);
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this event: ${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${encodeURIComponent(eventAddress)}&sf=true&output=xml`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* Payment Methods */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Payment Methods
        </h3>
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-3 p-4 border border-border hover:border-foreground/50 transition-all bg-background">
            <img src={bkashLogo} alt="bKash" className="h-6 w-auto" />
            <span className="text-sm text-foreground">Pay with bKash</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border border-border hover:border-foreground/50 transition-all bg-background">
            <img src={sslcommerzLogos} alt="SSLCommerz" className="h-8 w-auto" />
            <span className="text-xs text-muted-foreground">Pay with SSLCommerz (Card, Mobile Banking)</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 border border-border hover:border-foreground/50 transition-all bg-background">
            <img src={pathaoPayLogo} alt="Pathao Pay" className="h-6 w-auto" />
            <span className="text-sm text-foreground">Pay with Pathao Pay</span>
          </button>
        </div>
      </div>

      {/* Share on Socials */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Share on Socials
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center gap-2 p-3 border border-border hover:border-foreground/50 transition-all bg-background"
          >
            <Facebook className="w-4 h-4" />
            <span className="text-sm">Facebook</span>
          </button>
          
          <button 
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center gap-2 p-3 border border-border hover:border-foreground/50 transition-all bg-background"
          >
            <Twitter className="w-4 h-4" />
            <span className="text-sm">Twitter</span>
          </button>
          
          <button 
            onClick={() => handleShare('email')}
            className="flex items-center justify-center gap-2 p-3 border border-border hover:border-foreground/50 transition-all bg-background"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">Email</span>
          </button>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 p-3 border border-border hover:border-foreground/50 transition-all bg-background"
          >
            <Link2 className="w-4 h-4" />
            <span className="text-sm">Copy Link</span>
          </button>
        </div>
        
        <button 
          onClick={handleAddToCalendar}
          className="flex items-center justify-center gap-2 p-3 border border-border hover:border-foreground/50 transition-all bg-background w-full"
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="text-sm">Add to Calendar</span>
        </button>
      </div>
    </div>
  );
};
