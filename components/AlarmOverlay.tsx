
import React, { useEffect, useRef } from 'react';
import { Period, UserProfile } from '../types';
import { Button } from './ui/Button';

interface AlarmOverlayProps {
  period: Period;
  profile: UserProfile;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ period, profile, onDismiss, onSnooze }) => {
  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playAlarm = () => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Sound Profiles logic
      switch (profile.ringtoneId) {
        case 'electronic':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime); // C#5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          break;
        case 'gentle':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
          break;
        case 'rapid':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
          break;
        default: // 'default' / System Alarm
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + (profile.ringtoneId === 'rapid' ? 0.1 : 0.5));
    };

    const intervalTime = profile.ringtoneId === 'rapid' ? 300 : 1000;
    const interval = setInterval(playAlarm, intervalTime);
    
    return () => {
      clearInterval(interval);
      audioCtx.close();
    };
  }, [profile.ringtoneId]);

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-900 flex flex-col items-center justify-center p-6 text-white text-center animate-pulse-slow">
      <div className="bg-white/10 p-8 rounded-full mb-8 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold mb-2">Class Starting Now!</h2>
      <p className="text-xl opacity-90 mb-6">
        You have <span className="font-bold text-yellow-400">{period.subjectName}</span> in <span className="font-bold text-yellow-400">{period.className}</span> at {profile.schoolName || 'School'}.
      </p>

      {/* Quranic Ayah and Urdu Translation (Preserved) */}
      <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-sm backdrop-blur-sm">
        <p className="text-2xl mb-4 leading-relaxed font-serif text-yellow-100" dir="rtl">
          إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا
        </p>
        <p className="text-lg opacity-90 leading-normal" dir="rtl">
          بے شک اللہ تمہیں حکم دیتا ہے کہ امانتیں ان کے حق داروں تک پہنچاؤ۔
        </p>
        <p className="text-[10px] opacity-40 mt-4 uppercase tracking-[0.2em]">سورۃ النساء — آیت 58</p>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <Button 
          variant="secondary" 
          fullWidth 
          className="!bg-white !text-indigo-900 hover:!bg-gray-100 py-4 text-lg font-bold border-none" 
          onClick={onDismiss}
        >
          I'm Ready! (Dismiss)
        </Button>
        <Button 
          variant="ghost" 
          fullWidth 
          className="text-white border border-white/30 hover:bg-white/10" 
          onClick={onSnooze}
        >
          Snooze 5 Mins
        </Button>
      </div>
    </div>
  );
};
