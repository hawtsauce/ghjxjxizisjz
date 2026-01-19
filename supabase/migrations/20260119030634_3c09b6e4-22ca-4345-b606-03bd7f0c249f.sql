-- Create host_applications table for organizer applications
CREATE TABLE public.host_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Personal/Business Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization_name TEXT,
  organization_type TEXT, -- individual, company, ngo, etc.
  
  -- Event Details
  event_type TEXT NOT NULL, -- concert, workshop, conference, etc.
  event_description TEXT NOT NULL,
  expected_attendees TEXT NOT NULL, -- range like "50-100", "100-500", etc.
  event_frequency TEXT, -- one-time, weekly, monthly, etc.
  
  -- Documents/Links
  website_url TEXT,
  social_media_links TEXT,
  portfolio_url TEXT,
  additional_info TEXT,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.host_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can insert their own applications"
ON public.host_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.host_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
ON public.host_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_host_applications_updated_at
BEFORE UPDATE ON public.host_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();