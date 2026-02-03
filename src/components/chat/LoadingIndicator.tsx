const LoadingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-accent loading-dot" />
        <div className="w-2 h-2 rounded-full bg-accent loading-dot" />
        <div className="w-2 h-2 rounded-full bg-accent loading-dot" />
      </div>
      <span className="text-xs font-pixel text-muted-foreground animate-pulse-slow">
        Processing...
      </span>
    </div>
  );
};

export default LoadingIndicator;
