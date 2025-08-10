import { useState, useRef, useEffect } from "react";

export default function FPSCounter() {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;
    
    const updateFPS = () => {
      const now = performance.now();
      frameCount.current++;
      
      // Calculate frame time
      const currentFrameTime = now - lastFrameTime.current;
      lastFrameTime.current = now;
      
      // Update FPS every second (1000ms)
      if (now >= lastTime.current + 1000) {
        const actualFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        console.log(`FPS Update: ${actualFps} (${frameCount.current} frames in ${now - lastTime.current}ms)`);
        
        setFps(actualFps);
        setFrameTime(Math.round(currentFrameTime * 10) / 10);
        
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };

    console.log("Starting FPS counter...");
    animationId = requestAnimationFrame(updateFPS);

    return () => {
      console.log("Stopping FPS counter");
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Get color based on performance
  const getFpsColor = (fps: number) => {
    if (fps >= 55) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  const getFrameTimeColor = (frameTime: number) => {
    if (frameTime <= 16.7) return "text-green-400"; // 60fps = 16.67ms
    if (frameTime <= 33.3) return "text-yellow-400"; // 30fps = 33.33ms
    return "text-red-400";
  };

  return (
    <div 
      className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/20 font-mono text-sm transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact View */}
      <div className="px-3 py-2 flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <span className="text-gray-300">FPS:</span>
          <span className={`font-bold ${getFpsColor(fps)}`}>
            {fps}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-gray-300">MS:</span>
          <span className={`font-bold ${getFrameTimeColor(frameTime)}`}>
            {frameTime.toFixed(1)}
          </span>
        </div>

        {/* Performance indicator dot */}
        <div className={`w-2 h-2 rounded-full ${getFpsColor(fps).replace('text-', 'bg-')}`} />
        
        {/* Expand/collapse indicator */}
        <span className="text-gray-400 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t border-white/20 px-3 py-2 space-y-1 min-w-[200px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Target:</span>
              <span className="text-blue-400">60 FPS</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Performance:</span>
              <span className={getFpsColor(fps)}>
                {Math.round((fps / 60) * 100)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Frames:</span>
              <span className="text-gray-300">
                {frameCount.current}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={getFpsColor(fps)}>
                {fps >= 55 ? 'Excellent' : fps >= 30 ? 'Good' : fps === 0 ? 'Starting...' : 'Poor'}
              </span>
            </div>
          </div>
          
          {/* Performance bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Performance</span>
              <span>{Math.round((fps / 60) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 relative overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-300 rounded-full ${
                  fps >= 55 ? 'bg-green-400' : 
                  fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ 
                  width: `${Math.min((fps / 60) * 100, 100)}%`,
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 pt-1 border-t border-white/10">
            Click to collapse • Updates every second
          </div>
        </div>
      )}
    </div>
  );
}
