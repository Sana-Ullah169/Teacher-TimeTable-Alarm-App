
import React, { useState, useEffect, useCallback } from 'react';
import { Period, UserProfile, Day } from './types';
import { storage } from './services/storage';
import { DAYS_OF_WEEK } from './constants';
import { Button } from './components/ui/Button';
import { PeriodForm } from './components/PeriodForm';
import { AlarmOverlay } from './components/AlarmOverlay';

const RINGTONES = [
  { id: 'default', name: 'System Default' },
  { id: 'electronic', name: 'Electronic Pulse' },
  { id: 'gentle', name: 'Gentle Chime' },
  { id: 'rapid', name: 'Rapid Alert' },
];

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [periods, setPeriods] = useState<Period[]>(storage.getPeriods());
  const [activeTab, setActiveTab] = useState<'timetable' | 'profile'>('timetable');
  const [selectedDay, setSelectedDay] = useState<Day>(DAYS_OF_WEEK[new Date().getDay() - 1] || Day.MONDAY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<Period | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState(storage.getAlarmEnabled());
  const [lastAlarmTime, setLastAlarmTime] = useState<string | null>(null);
  const [showRingtonePicker, setShowRingtonePicker] = useState(false);

  // Persistence effects
  useEffect(() => { storage.saveProfile(profile); }, [profile]);
  useEffect(() => { storage.savePeriods(periods); }, [periods]);
  useEffect(() => { storage.setAlarmEnabled(alarmEnabled); }, [alarmEnabled]);

  // Alarm Engine logic
  useEffect(() => {
    const checkAlarms = () => {
      if (!alarmEnabled || activeAlarm) return;

      const now = new Date();
      const currentDay = DAYS_OF_WEEK[now.getDay() - 1]; // getDay() is 0 for Sunday
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Prevent re-triggering for the same minute
      if (currentTime === lastAlarmTime) return;

      const periodToTrigger = periods.find(p => 
        p.isAlarmOn && 
        p.day === currentDay && 
        p.startTime === currentTime
      );

      if (periodToTrigger) {
        setActiveAlarm(periodToTrigger);
        setLastAlarmTime(currentTime);
        
        // Browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(`Class Alert: ${periodToTrigger.subjectName}`, {
            body: `You have ${periodToTrigger.subjectName} in ${periodToTrigger.className} at ${profile.schoolName}.`,
            icon: 'https://picsum.photos/100/100'
          });
        }
      }
    };

    const interval = setInterval(checkAlarms, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [periods, alarmEnabled, activeAlarm, lastAlarmTime, profile.schoolName]);

  const handleAddPeriod = (data: Omit<Period, 'id'>) => {
    const newPeriod: Period = {
      ...data,
      id: crypto.randomUUID()
    };
    setPeriods(prev => [...prev, newPeriod]);
    setShowAddForm(false);
  };

  const handleUpdatePeriod = (data: Omit<Period, 'id'>) => {
    if (!editingPeriod) return;
    setPeriods(prev => prev.map(p => p.id === editingPeriod.id ? { ...data, id: p.id } : p));
    setEditingPeriod(null);
  };

  const handleDeletePeriod = (id: string) => {
    if (confirm('Are you sure you want to delete this period?')) {
      setPeriods(prev => prev.filter(p => p.id !== id));
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert('Notifications enabled!');
      }
    }
  };

  const snoozeAlarm = () => {
    setActiveAlarm(null);
    alert('Snoozed! (Simulated - alarm dismissed)');
  };

  const selectRingtone = (id: string) => {
    setProfile(prev => ({ ...prev, ringtoneId: id }));
    setShowRingtonePicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto shadow-xl relative pb-20">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-6 py-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Teacher Timetable</h1>
          <button 
            onClick={() => setAlarmEnabled(!alarmEnabled)}
            className={`p-2 rounded-full transition-colors ${alarmEnabled ? 'bg-indigo-500' : 'bg-red-400'}`}
          >
            {alarmEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-indigo-100 font-medium">Hello, {profile.teacherName || 'Teacher'} 👋</p>
        <p className="text-indigo-200 text-sm opacity-80">{profile.schoolName || 'Set your school in profile'}</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {activeTab === 'timetable' ? (
          <>
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedDay === day 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-indigo-50 border border-gray-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {periods.filter(p => p.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).length > 0 ? (
                periods.filter(p => p.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group transition-transform active:scale-[0.99]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {p.className}
                        </span>
                        {!p.isAlarmOn && <span className="text-gray-400 text-xs italic">Alarm Off</span>}
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">{p.subjectName}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {p.startTime} — {p.endTime}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingPeriod(p)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeletePeriod(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h5 className="text-gray-800 font-semibold mb-1">No classes scheduled</h5>
                  <p className="text-gray-500 text-sm">Tap the + button to add your first period for {selectedDay}.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold text-gray-800">Your Profile</h3>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={profile.teacherName}
                  onChange={e => setProfile(prev => ({ ...prev, teacherName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  placeholder="Enter school name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={profile.schoolName}
                  onChange={e => setProfile(prev => ({ ...prev, schoolName: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="font-semibold text-gray-800">Settings</h4>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="font-medium text-gray-700">Alarm Ringtone</p>
                  <p className="text-xs text-indigo-500 font-semibold">{RINGTONES.find(r => r.id === profile.ringtoneId)?.name || 'Default'}</p>
                </div>
                <Button variant="ghost" className="text-indigo-600 text-xs py-1 px-2" onClick={() => setShowRingtonePicker(true)}>
                  Change
                </Button>
              </div>

              <Button variant="secondary" fullWidth onClick={requestNotificationPermission}>
                Enable System Notifications
              </Button>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-700">Auto Alarm</p>
                  <p className="text-xs text-gray-500">Play sound when class starts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={alarmEnabled}
                  onChange={() => setAlarmEnabled(!alarmEnabled)}
                  className="w-5 h-5 accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Developer Details Footer */}
        <div className="mt-16 mb-8 text-center border-t border-gray-100 pt-8">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-1">Developed by</p>
          <p className="text-lg text-indigo-900 font-black tracking-tight">SANA ULLAH</p>
          <div className="flex justify-center mt-4">
            <a
              href="https://wa.me/923419854128"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-green-200 hover:bg-green-600 hover:scale-105 transition-all active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              03419854128
            </a>
          </div>
          <p className="text-center text-gray-400 text-[10px] mt-10">Version 1.2.0 (Teacher Edition)</p>
        </div>
      </main>

      {/* Ringtone Picker Modal */}
      {showRingtonePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Select Ringtone</h4>
            <div className="space-y-2 mb-6">
              {RINGTONES.map(ring => (
                <button
                  key={ring.id}
                  onClick={() => selectRingtone(ring.id)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between border-2 transition-all ${
                    profile.ringtoneId === ring.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <span className={`font-medium ${profile.ringtoneId === ring.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {ring.name}
                  </span>
                  {profile.ringtoneId === ring.id && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <Button variant="ghost" fullWidth onClick={() => setShowRingtonePicker(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Other Modals */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <PeriodForm onSave={handleAddPeriod} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}

      {editingPeriod && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <PeriodForm 
              initialData={editingPeriod} 
              onSave={handleUpdatePeriod} 
              onCancel={() => setEditingPeriod(null)} 
            />
          </div>
        </div>
      )}

      {activeAlarm && (
        <AlarmOverlay 
          period={activeAlarm} 
          profile={profile}
          onDismiss={() => setActiveAlarm(null)}
          onSnooze={snoozeAlarm}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-lg mx-auto flex h-20 items-center justify-around px-8 z-40">
        <button 
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'timetable' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeTab === 'timetable' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Schedule</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={activeTab === 'profile' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
