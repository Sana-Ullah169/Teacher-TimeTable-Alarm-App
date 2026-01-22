
export enum Day {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday'
}

export interface Period {
  id: string;
  className: string;
  subjectName: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  day: Day;
  isAlarmOn: boolean;
}

export interface UserProfile {
  teacherName: string;
  schoolName: string;
  ringtoneId: string;
}

export interface AppState {
  profile: UserProfile;
  periods: Period[];
}
