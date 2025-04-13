import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import EventPage from "@/pages/EventPage";
import { WebSocketProvider } from "./lib/websocket";
import { TemplatesPage } from './components/TemplatesPage';
import { RoleBasedEventPage } from '@/pages/RoleBasedEventPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/event/:id" element={<EventPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/events/:eventId" element={<RoleBasedEventPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
