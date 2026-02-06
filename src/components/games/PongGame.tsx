import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Pause } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { saveScore } from '@/hooks/useAudio';

const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 160;
const PADDLE_HEIGHT = 40;
const PADDLE_WIDTH = 8;
const BALL_SIZE = 8;
const PADDLE_SPEED = 5;
const INITIAL_BALL_SPEED = 3;

const PongGame = () => {
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballPos, setBallPos] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [ballVel, setBallVel] = useState({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const { playSound } = useAudioContext();

  const resetBall = useCallback((direction: number = 1) => {
    setBallPos({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    setBallVel({ 
      x: INITIAL_BALL_SPEED * direction, 
      y: (Math.random() - 0.5) * INITIAL_BALL_SPEED * 2 
    });
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setWinner(null);
    setIsPlaying(false);
    resetBall();
    playSound('blip');
  }, [resetBall, playSound]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Player movement
      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
        setPlayerY(y => Math.max(0, y - PADDLE_SPEED));
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
        setPlayerY(y => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y + PADDLE_SPEED));
      }

      // AI movement (simple follow)
      setAiY(y => {
        const aiCenter = y + PADDLE_HEIGHT / 2;
        const diff = ballPos.y - aiCenter;
        const speed = Math.min(PADDLE_SPEED * 0.7, Math.abs(diff));
        if (diff > 5) return Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y + speed);
        if (diff < -5) return Math.max(0, y - speed);
        return y;
      });

      // Ball movement
      setBallPos(pos => {
        let newX = pos.x + ballVel.x;
        let newY = pos.y + ballVel.y;
        let newVelX = ballVel.x;
        let newVelY = ballVel.y;

        // Top/bottom collision
        if (newY <= 0 || newY >= CANVAS_HEIGHT - BALL_SIZE) {
          newVelY = -newVelY;
          newY = newY <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
        }

        // Player paddle collision
        if (
          newX <= PADDLE_WIDTH + 10 &&
          newY + BALL_SIZE >= playerY &&
          newY <= playerY + PADDLE_HEIGHT
        ) {
          newVelX = Math.abs(newVelX) * 1.05;
          const hitPos = (newY - playerY) / PADDLE_HEIGHT;
          newVelY = (hitPos - 0.5) * 6;
          newX = PADDLE_WIDTH + 10;
          playSound('paddle');
        }

        // AI paddle collision
        if (
          newX >= CANVAS_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE &&
          newY + BALL_SIZE >= aiY &&
          newY <= aiY + PADDLE_HEIGHT
        ) {
          newVelX = -Math.abs(newVelX) * 1.05;
          const hitPos = (newY - aiY) / PADDLE_HEIGHT;
          newVelY = (hitPos - 0.5) * 6;
          newX = CANVAS_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE;
          playSound('paddle');
        }

        // Score
        if (newX <= 0) {
          setAiScore(s => {
            const newScore = s + 1;
            if (newScore >= 5) {
              setGameOver(true);
              setWinner('ai');
              setIsPlaying(false);
              playSound('gameover');
              saveScore('pong', playerScore);
            } else {
              playSound('error');
              setTimeout(() => resetBall(-1), 500);
            }
            return newScore;
          });
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
        }
        if (newX >= CANVAS_WIDTH) {
          setPlayerScore(s => {
            const newScore = s + 1;
            if (newScore >= 5) {
              setGameOver(true);
              setWinner('player');
              setIsPlaying(false);
              playSound('success');
              saveScore('pong', newScore);
            } else {
              playSound('score');
              setTimeout(() => resetBall(1), 500);
            }
            return newScore;
          });
          return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
        }

        if (newVelX !== ballVel.x || newVelY !== ballVel.y) {
          setBallVel({ x: newVelX, y: newVelY });
        }

        return { x: newX, y: newY };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, ballVel, playerY, aiY, ballPos.y, resetBall, playSound, playerScore]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Score display */}
      <div className="flex justify-center gap-8 w-full">
        <div className="font-pixel text-[10px] text-secondary">
          YOU: {playerScore}
        </div>
        <div className="font-pixel text-[10px] text-primary">
          CPU: {aiScore}
        </div>
      </div>

      {/* Game canvas */}
      <div 
        className="relative border-4 border-accent arcade-glow overflow-hidden"
        style={{ 
          width: CANVAS_WIDTH, 
          height: CANVAS_HEIGHT,
          background: 'hsl(var(--background))'
        }}
      >
        {/* Center line */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-0.5 opacity-30"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--accent)) 0px, hsl(var(--accent)) 8px, transparent 8px, transparent 16px)'
          }}
        />

        {/* Player paddle */}
        <div
          className="absolute bg-secondary arcade-glow-yellow transition-all duration-75"
          style={{
            left: 10,
            top: playerY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />

        {/* AI paddle */}
        <div
          className="absolute bg-primary arcade-glow-red transition-all duration-75"
          style={{
            right: 10,
            top: aiY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />

        {/* Ball */}
        <div
          className="absolute bg-accent arcade-glow"
          style={{
            left: ballPos.x,
            top: ballPos.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
        />

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
            <span className={`font-pixel text-xs glitch-text ${winner === 'player' ? 'text-secondary' : 'text-primary'}`}>
              {winner === 'player' ? 'YOU WIN!' : 'CPU WINS'}
            </span>
          </div>
        )}

        {/* Start overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="font-pixel text-accent text-[10px] animate-pulse">PRESS PLAY</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            playSound('blip');
            setIsPlaying(!isPlaying);
          }}
          disabled={gameOver}
          className="font-pixel text-[8px] border-accent hover:bg-accent/20"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="font-pixel text-[8px] border-primary hover:bg-primary/20"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <p className="font-pixel text-[8px] text-muted-foreground text-center">
        USE ARROW KEYS OR W/S
      </p>
    </div>
  );
};

export default PongGame;
