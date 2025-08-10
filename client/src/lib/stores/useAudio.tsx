import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  volume: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playHit: () => void;
  playSuccess: () => void;
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  volume: 0.5,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    
    // Handle background music playback
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(error => {
          console.log("Background music autoplay prevented:", error);
        });
      }
    }
    
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  setVolume: (volume) => {
    const { backgroundMusic } = get();
    set({ volume });
    
    if (backgroundMusic) {
      backgroundMusic.volume = volume * 0.3; // Background music at 30% of master volume
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted, volume } = get();
    if (hitSound && !isMuted) {
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = volume * 0.5;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted, volume } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.volume = volume * 0.6;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted, volume } = get();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.volume = volume * 0.3;
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }
}));
