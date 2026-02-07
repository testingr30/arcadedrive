import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';
import { useAudioContext } from '@/contexts/AudioContext';
import { saveScore } from '@/hooks/useAudio';

const COLORS = ['red', 'green', 'blue', 'yellow'] as const;
type Color = typeof COLORS[number];

const MemoryGame = () => {
    const [sequence, setSequence] = useState<Color[]>([]);
    const [userSequence, setUserSequence] = useState<Color[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [activeColor, setActiveColor] = useState<Color | null>(null);

    const { playSound } = useAudioContext();

    const playColorSound = useCallback((color: Color) => {
        // Map colors to sounds
        const sounds: Record<Color, 'blip' | 'success' | 'eat' | 'score'> = {
            red: 'blip',
            green: 'success',
            blue: 'eat',
            yellow: 'score'
        };
        playSound(sounds[color]);
    }, [playSound]);

    const addToSequence = useCallback(() => {
        const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setSequence(prev => [...prev, newColor]);
        setUserSequence([]);
        setIsShowingSequence(true);
    }, []);

    const startGame = () => {
        setSequence([]);
        setUserSequence([]);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        addToSequence();
        playSound('blip');
    };

    // Play sequence
    useEffect(() => {
        if (isShowingSequence && sequence.length > 0) {
            let i = 0;
            const interval = setInterval(() => {
                if (i >= sequence.length) {
                    clearInterval(interval);
                    setActiveColor(null);
                    setIsShowingSequence(false);
                    return;
                }

                const color = sequence[i];
                setActiveColor(color);
                playColorSound(color);

                setTimeout(() => {
                    setActiveColor(null);
                }, 300);

                i++;
            }, 600);

            return () => clearInterval(interval);
        }
    }, [isShowingSequence, sequence, playColorSound]);

    const handleColorClick = (color: Color) => {
        if (!isPlaying || isShowingSequence || gameOver) return;

        playColorSound(color);
        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 200);

        const newUserSequence = [...userSequence, color];
        setUserSequence(newUserSequence);

        // Check correctness
        if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
            setGameOver(true);
            setIsPlaying(false);
            playSound('gameover');
            saveScore('snake', score); // Reusing snake leaderboard for now or generic
        } else {
            // Completed sequence?
            if (newUserSequence.length === sequence.length) {
                setScore(prev => prev + 1);
                setTimeout(() => {
                    addToSequence();
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="font-pixel text-[10px] text-accent">
                SCORE: {score}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border-4 border-accent arcade-glow rounded-full bg-black">
                {COLORS.map(color => (
                    <button
                        key={color}
                        className={`
              w-16 h-16 rounded-full transition-all duration-100
              ${color === 'red' ? 'bg-red-500 hover:bg-red-400' : ''}
              ${color === 'green' ? 'bg-green-500 hover:bg-green-400' : ''}
              ${color === 'blue' ? 'bg-blue-500 hover:bg-blue-400' : ''}
              ${color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-400' : ''}
              ${activeColor === color ? 'scale-95 brightness-150 arcade-glow-white' : ''}
              ${!isPlaying || isShowingSequence ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
            `}
                        onClick={() => handleColorClick(color)}
                        disabled={!isPlaying || isShowingSequence}
                    />
                ))}
            </div>

            {gameOver && (
                <div className="font-pixel text-primary text-xs glitch-text animate-pulse">
                    GAME OVER
                </div>
            )}

            {!isPlaying && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={startGame}
                    className="font-pixel text-[8px] border-accent hover:bg-accent/20"
                >
                    {gameOver ? <RotateCcw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {gameOver ? 'RETRY' : 'START MEMORY'}
                </Button>
            )}
        </div>
    );
};

export default MemoryGame;
