import React, { useState, useEffect } from 'react';
import { ViewMode } from '@/types';
import { Navigation } from '@/components/Navigation';
import { FrameEditor } from '@/components/frames';
import { PrayerTimesView } from '@/components/prayer';
import { AllahNamesView } from '@/components/allah-names';
import { HalalFinderView } from '@/components/halal';
import { Hadith40View } from '@/components/hadith';
import { HisnulMuslimView } from '@/components/hisnul-muslim';
import { MuslimCalendarView } from '@/components/calendar';
import { QiblaFinderView } from '@/components/qibla';
import { QuranView } from '@/components/quran'; 
import { FAQView } from '@/components/faq';
import { StartHereView } from '@/components/start-here';
import { WatchView } from '@/components/watch'; 
import { ListenView } from '@/components/listen'; 
import { LibraryView } from '@/components/library'; 
import { PostersView } from '@/components/posters';
import { FeedView } from '@/components/community/FeedView';
import { ZakatView } from '@/components/zakat';
import { TasbihView } from '@/components/tasbih';
import { QadaView } from '@/components/qada';
import { MuslimNamesView } from '@/components/names';
import { ProfileView } from '@/components/profile/ProfileView';
import { Header, SmartPrayerCard, DailyInspiration, ServiceGrid, DiscoverSection } from '@/components/home/HomeWidgets';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ToastProvider } from '@/contexts/ToastContext';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Handle Deep Linking
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/hisn')) {
      setView(ViewMode.HISNUL_MUSLIM);
    }

    const handleNavigateToQuran = () => {
      setView(ViewMode.QURAN);
    };
    window.addEventListener('navigate-to-quran', handleNavigateToQuran);
    return () => window.removeEventListener('navigate-to-quran', handleNavigateToQuran);
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <div className={`min-h-screen flex flex-col md:flex-row font-khmer transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-gray-900'
        }`}>
          {/* Navigation Layer */}
          <Navigation 
            currentView={view} 
            setView={setView} 
          />

          {/* Main Content Area */}
          <main className={`flex-1 md:ml-20 ${
            view === ViewMode.QURAN 
              ? 'h-[calc(100vh-80px)] md:h-screen overflow-hidden' 
              : 'min-h-screen pb-20 md:pb-8'
          }`}>
            
            {/* Global Header for sub-views */}
            {view !== ViewMode.HOME && 
             view !== ViewMode.PRAYER && view !== ViewMode.QURAN && view !== ViewMode.START_HERE && 
             view !== ViewMode.CALENDAR && view !== ViewMode.QIBLA && view !== ViewMode.WATCH && 
             view !== ViewMode.LISTEN && view !== ViewMode.LIBRARY && view !== ViewMode.POSTERS && 
             view !== ViewMode.COMMUNITY && view !== ViewMode.ZAKAT && view !== ViewMode.TASBIH && 
             view !== ViewMode.QADA && view !== ViewMode.NAMES && view !== ViewMode.FAQ && view !== ViewMode.HADITH && view !== ViewMode.PROFILE && (
              <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'
              }`}>
                <div>
                  <h2 className={`text-xl font-bold font-khmer-title ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                     {t('app.title')}
                  </h2>
                </div>
              </header>
            )}

            <div className="h-full">
              
              {/* HOME / DASHBOARD VIEW - SUPER APP STYLE */}
              {view === ViewMode.HOME && (
                <div className="p-5 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
                   <Header setView={setView} />
                   <SmartPrayerCard setView={setView} />
                   <ServiceGrid setView={setView} />
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <DailyInspiration setView={setView} />
                      <div className={`hidden lg:block p-6 rounded-2xl border shadow-sm h-fit ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                      }`}>
                          <h3 className={`font-bold mb-4 font-khmer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('events.title')}</h3>
                          <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg font-bold text-center w-12 shrink-0">
                                      <span className="block text-xs uppercase">Mar</span>
                                      <span className="block text-lg">12</span>
                                  </div>
                                  <div>
                                      <h4 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{t('events.ramadan')}</h4>
                                      <p className="text-xs text-gray-500">{t('events.daysLeft')}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                   </div>
                   <DiscoverSection setView={setView} />
                </div>
              )}
              
              {/* Main Features */}
              {view === ViewMode.START_HERE && <StartHereView />}
              {view === ViewMode.FRAMES && <FrameEditor />}
              {view === ViewMode.PRAYER && <PrayerTimesView />}
              {view === ViewMode.ALLAH_NAMES && <AllahNamesView />}
              {view === ViewMode.HALAL && <HalalFinderView />}
              {view === ViewMode.HADITH && <Hadith40View />}
              {view === ViewMode.HISNUL_MUSLIM && <HisnulMuslimView />}
              {view === ViewMode.CALENDAR && <MuslimCalendarView />}
              {view === ViewMode.QIBLA && <QiblaFinderView />}
              {view === ViewMode.QURAN && <QuranView />}
              {view === ViewMode.FAQ && <FAQView />}
              {view === ViewMode.WATCH && <WatchView />}
              {view === ViewMode.LISTEN && <ListenView />}
              {view === ViewMode.LIBRARY && <LibraryView />}
              {view === ViewMode.POSTERS && <PostersView />}
              {view === ViewMode.COMMUNITY && <FeedView />}
              {view === ViewMode.ZAKAT && <ZakatView />}
              {view === ViewMode.TASBIH && <TasbihView />}
              {view === ViewMode.QADA && <QadaView />}
              {view === ViewMode.NAMES && <MuslimNamesView />}

              {view === ViewMode.PROFILE && <ProfileView />}
            </div>
          </main>
        </div>
      </ChatProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
