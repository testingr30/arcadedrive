import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthConnectButtonProps {
  url: string;
  integration: string;
}

const integrationLabels: Record<string, { label: string; emoji: string }> = {
  googledrive: { label: 'Google Drive', emoji: '📁' },
  googlesheets: { label: 'Google Sheets', emoji: '📊' },
  default: { label: 'Service', emoji: '🔗' },
};

const AuthConnectButton = ({ url, integration }: AuthConnectButtonProps) => {
  const config = integrationLabels[integration] || integrationLabels.default;

  return (
    <div className="my-4 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.emoji}</span>
        <div className="flex-1">
          <p className="text-foreground font-medium mb-1">
            Connect {config.label}
          </p>
          <p className="text-muted-foreground text-sm mb-3">
            I need permission to access your {config.label}. Please connect your account to continue.
          </p>
          <Button
            asChild
            className="bg-accent hover:bg-accent/90 text-accent-foreground arcade-glow"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect {config.label}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthConnectButton;
