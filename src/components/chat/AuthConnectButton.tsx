
import { Button } from '@/components/ui/button';
import { CloudLightning } from 'lucide-react';
import { toast } from 'sonner';

interface AuthConnectButtonProps {
  onSendMessage?: (msg: string) => void;
  isConnected?: boolean;
  url?: string;
  integration?: string;
}

const AuthConnectButton = ({ onSendMessage, isConnected = false, url, integration }: AuthConnectButtonProps) => {
  const handleConnect = () => {
    if (url) {
      window.open(url, '_blank');
      return;
    }

    if (onSendMessage) {
      toast.info("Initializing connection...", {
        description: "Asking agent to start authentication flow."
      });
      onSendMessage("I want to connect my Google Drive account. Please provide the authentication link.");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      className={`
        font-pixel text-[8px] gap-2 transition-all
        ${isConnected
          ? 'border-green-500 text-green-500 hover:bg-green-500/10'
          : 'border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
        }
      `}
    >
      <CloudLightning className={`w-3 h-3 ${isConnected ? '' : 'neon-flicker'}`} />
      <span className="hidden sm:inline">
        {isConnected ? 'CONNECTED' : (url ? `CONNECT ${integration?.toUpperCase() || 'APP'}` : 'CONNECT GOOGLE')}
      </span>
      <span className="sm:hidden">
        {isConnected ? 'ON' : (url ? 'LINK' : 'AUTH')}
      </span>
    </Button>
  );
};

export default AuthConnectButton;
