import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider, useAudioContext } from "@/contexts/AudioContext";
import MouseEffects from "@/components/effects/MouseEffects";
import React, { useState } from "react";
import StartupBoot from "@/components/effects/StartupBoot";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [bootComplete, setBootComplete] = useState(false);

  // Global Audio Feedback
  React.useEffect(() => {
    if (!bootComplete) return;

    // We need to access the audio context here, but we can't use the hook inside useEffect if it's not provided yet.
    // However, App is inside QueryClientProvider but AudioProvider is INSIDE App (in the return).
    // This is a problem. We need a wrapper component or move AudioProvider up.
    // For now, let's create a child component that handles the global listeners.
  }, [bootComplete]);

  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        {!bootComplete && <StartupBoot onComplete={() => setBootComplete(true)} />}
        <div className={bootComplete ? 'opacity-100 transition-opacity duration-1000' : 'opacity-0'}>
          <MouseEffects />
          <GlobalAudioHandler />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </div>
      </AudioProvider>
    </QueryClientProvider>
  );
};

// Helper component to handle global audio events since it needs to be inside AudioProvider
const GlobalAudioHandler = () => {
  const { playSound } = useAudioContext();

  React.useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], input, select, textarea')) {
        playSound('blip');
      }
    };

    const handleClick = () => {
      playSound('click');
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick, true); // Capture phase to hear all clicks

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick, true);
    };
  }, [playSound]);

  return null;
};

export default App;
