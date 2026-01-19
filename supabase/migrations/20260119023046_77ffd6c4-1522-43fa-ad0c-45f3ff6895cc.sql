-- Create tickets table for event ticket types
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 100,
  sold INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Tickets are viewable by everyone (for event pages)
CREATE POLICY "Tickets are viewable by everyone" 
ON public.tickets 
FOR SELECT 
USING (true);

-- Event creators can insert tickets for their own events
CREATE POLICY "Event creators can insert tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_id 
    AND events.created_by = auth.uid()
  )
);

-- Event creators can update tickets for their own events
CREATE POLICY "Event creators can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_id 
    AND events.created_by = auth.uid()
  )
);

-- Event creators can delete tickets for their own events
CREATE POLICY "Event creators can delete tickets" 
ON public.tickets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_id 
    AND events.created_by = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();