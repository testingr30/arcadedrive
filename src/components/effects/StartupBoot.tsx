
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAudioContext } from '@/contexts/AudioContext';

interface StartupBootProps {
    onComplete: () => void;
}



const StartupBoot: React.FC<StartupBootProps> = ({ onComplete }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const { resume } = useAudioContext(); // Use the newly exposed resume function method

    useEffect(() => {
        const bootSequence = [
            "BIOS Date 01/15/98 14:23:55 Ver: 1.0.2",
            "CPU: QUANTUM NEURAL PROCESSOR T-800",
            "Checking Memory Test: 640K OK",
            "detecting primary master ... ARCADE_DRIVE_V1",
            "detecting primary slave ... GOOGLE_DRIVE_API",
            "Loading NEON_OS ...",
            "Mounting volumes ... OK",
            "Initializing AI Core ... OK",
            "System Ready."
        ];

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex >= bootSequence.length) {
                clearInterval(interval);
                setIsReady(true);
                return;
            }

            setLines(prev => [...prev, bootSequence[currentIndex]]);
            currentIndex++;
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleStart = () => {
        if (!isReady) return;
        setIsComplete(true);
        setTimeout(onComplete, 500);
    };

    useEffect(() => {
        if (isReady) {
            const handleKeyDown = () => handleStart();
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isReady, handleStart]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] bg-black text-green-500 font-mono p-8 md:p-12 overflow-hidden flex flex-col cursor-pointer",
                "transition-opacity duration-500",
                isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onClick={handleStart}
        >
            <div className="flex-1 max-w-3xl mx-auto w-full space-y-2">
                {lines.map((line, index) => (
                    <div key={index} className="typewriter-line">
                        <span className="mr-2">{'>'}</span>
                        {line}
                    </div>
                ))}
                {isReady && (
                    <div className="mt-8 animate-pulse text-green-400 font-bold border-2 border-green-500 p-4 text-center hover:bg-green-500/10 transition-colors">
                        {'>'} CLICK TO INITIALIZE SYSTEM {'<'}
                    </div>
                )}
                {!isReady && <div className="animate-pulse">_</div>}
            </div>

            <div className="text-xs text-green-800 mt-auto border-t border-green-900 pt-4 flex justify-between">
                <span>ARCADE SYSTEM V.2.0 (C) 2024</span>
                <span>MEM: 640K</span>
            </div>
        </div>
    );
};

export default StartupBoot;
