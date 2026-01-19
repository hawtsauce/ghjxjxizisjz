import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MyEvents from "./pages/MyEvents";
import MyTickets from "./pages/MyTickets";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Host from "./pages/Host";
import BecomeHost from "./pages/BecomeHost";
import NotFound from "./pages/NotFound";
import HelpCenter from "./pages/HelpCenter";
import Blog from "./pages/Blog";
import FAQs from "./pages/FAQs";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      {/* Attendee Routes */}
      <Route path="/" element={<Discover />} />
      <Route path="/event/:id" element={<Index />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/become-host" element={<BecomeHost />} />
      
      {/* Host Routes (Admin Only) */}
      <Route path="/host" element={<Host />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/event/:id/edit" element={<EditEvent />} />
      
      {/* Auth & Admin */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin" element={<Admin />} />
      
      {/* Info Pages */}
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
