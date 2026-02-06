import { Trophy } from 'lucide-react';
import { getTopScores, LeaderboardEntry } from '@/hooks/useAudio';

interface LeaderboardWidgetProps {
  className?: string;
}

const LeaderboardWidget = ({ className = '' }: LeaderboardWidgetProps) => {
  const snakeScores = getTopScores('snake', 5);
  const pongScores = getTopScores('pong', 5);

  if (snakeScores.length === 0 && pongScores.length === 0) {
    return null;
  }

  const renderScores = (scores: LeaderboardEntry[], gameName: string, emoji: string) => {
    if (scores.length === 0) return null;
    
    return (
      <div className="flex-1 min-w-[120px]">
        <h4 className="font-pixel text-[8px] text-accent mb-2 flex items-center gap-1">
          <span>{emoji}</span> {gameName}
        </h4>
        <ol className="space-y-1">
          {scores.map((entry, i) => (
            <li key={i} className="flex items-center justify-between text-[10px]">
              <span className={`font-pixel ${i === 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                {i + 1}.
              </span>
              <span className={`font-bold ${i === 0 ? 'text-secondary' : 'text-foreground'}`}>
                {entry.score}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className={`p-4 bg-muted/30 rounded-lg border border-border/50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-secondary" />
        <h3 className="font-pixel text-[10px] text-foreground">HIGH SCORES</h3>
      </div>
      <div className="flex gap-4 flex-wrap">
        {renderScores(snakeScores, 'SNAKE', '🐍')}
        {renderScores(pongScores, 'PONG', '🏓')}
      </div>
    </div>
  );
};

export default LeaderboardWidget;
