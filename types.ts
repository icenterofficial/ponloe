
export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
}

export enum ViewMode {
  HOME = 'HOME',
  FRAMES = 'FRAMES',
  PROFILE = 'PROFILE',
  PRAYER = 'PRAYER',
  ALLAH_NAMES = 'ALLAH_NAMES',
  HALAL = 'HALAL',
  HADITH = 'HADITH',
  HISNUL_MUSLIM = 'HISNUL_MUSLIM',
  CALENDAR = 'CALENDAR',
  QIBLA = 'QIBLA',
  QURAN = 'QURAN',
  FAQ = 'FAQ',
  START_HERE = 'START_HERE',
  WATCH = 'WATCH',
  LISTEN = 'LISTEN',
  LIBRARY = 'LIBRARY',
  POSTERS = 'POSTERS',
  COMMUNITY = 'COMMUNITY',
  ZAKAT = 'ZAKAT',
  TASBIH = 'TASBIH',
  QADA = 'QADA',
  NAMES = 'NAMES'
}
