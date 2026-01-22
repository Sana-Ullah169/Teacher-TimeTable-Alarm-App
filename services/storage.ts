
import { UserProfile, Period } from '../types';
import { STORAGE_KEYS } from '../constants';

export const storage = {
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const defaultProfile = { teacherName: '', schoolName: '', ringtoneId: 'default' };
    return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },
  getPeriods: (): Period[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
    return data ? JSON.parse(data) : [];
  },
  savePeriods: (periods: Period[]) => {
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
  },
  setAlarmEnabled: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEYS.ALARM_STATE, String(enabled));
  },
  getAlarmEnabled: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ALARM_STATE) === 'true';
  }
};
