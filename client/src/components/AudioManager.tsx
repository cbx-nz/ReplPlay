import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Settings } from "lucide-react";

export default function AudioManager() {
  const { 
    backgroundMusic, 
    hitSound, 
    successSound, 
    isMuted, 
    volume,
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    toggleMute,
    setVolume
  } = useAudio();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log("AudioManager: Initializing audio system...");
    
    // Initialize background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.preload = "auto";
    backgroundMusicRef.current = bgMusic;
    setBackgroundMusic(bgMusic);
    
    // Initialize hit sound
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    hit.preload = "auto";
    hitSoundRef.current = hit;
    setHitSound(hit);
    
    // Initialize success sound
    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.6;
    success.preload = "auto";
    successSoundRef.current = success;
    setSuccessSound(success);
    
    console.log("AudioManager: Audio assets loaded");
    
    return () => {
      // Cleanup audio elements
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      if (hitSoundRef.current) {
        hitSoundRef.current.pause();
        hitSoundRef.current = null;
      }
      if (successSoundRef.current) {
        successSoundRef.current.pause();
        successSoundRef.current = null;
      }
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Handle background music playback based on mute state
  useEffect(() => {
    if (backgroundMusic) {
      if (!isMuted) {
        // Start playing background music when unmuted
        backgroundMusic.play().catch(error => {
          console.log("Background music autoplay prevented:", error);
        });
      } else {
        // Pause background music when muted
        backgroundMusic.pause();
      }
    }
  }, [isMuted, backgroundMusic]);

  const handleToggleMute = () => {
    toggleMute();
    
    // Log current state for debugging
    console.log(`Audio ${!isMuted ? 'muted' : 'unmuted'}`);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2">
        {/* Volume Control */}
        {showVolumeControl && (
          <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/20 p-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs w-8">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}

        {/* Volume Settings Button */}
        <button
          onClick={() => setShowVolumeControl(!showVolumeControl)}
          className="flex items-center justify-center w-10 h-10 bg-black/60 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/20 hover:bg-black/80 transition-all duration-200"
          title="Volume Settings"
        >
          <Settings className="w-4 h-4 text-gray-300" />
        </button>

        {/* Mute/Unmute Button */}
        <button
          onClick={handleToggleMute}
          className="flex items-center justify-center w-12 h-12 bg-black/80 backdrop-blur-sm text-white rounded-lg shadow-lg border border-white/20 hover:bg-black/90 transition-all duration-200"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-green-400" />
          )}
        </button>
      </div>
      
      {/* Audio Status Indicator */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className={`text-xs font-mono ${isMuted ? 'text-red-400' : 'text-green-400'}`}>
          {isMuted ? 'MUTED' : `AUDIO ${Math.round(volume * 100)}%`}
        </span>
      </div>
    </div>
  );
}
