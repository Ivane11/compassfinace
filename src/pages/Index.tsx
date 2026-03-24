import { useState, useEffect } from 'react';
import BottomNav, { Tab } from '@/components/BottomNav';
import { FinanceProvider } from '@/hooks/useFinance';
import { ThemeProvider } from '@/hooks/useTheme';
import DashboardPage from '@/pages/DashboardPage';
import RevenusPage from '@/pages/RevenusPage';
import BudgetPage from '@/pages/BudgetPage';
import SettingsPage from '@/pages/SettingsPage';
import IntroPage from '@/pages/IntroPage';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showIntro, setShowIntro] = useState(true); // Always show intro first

  useEffect(() => {
    // Intro page always shows on app launch
    // The localStorage check is removed so it appears every time
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const renderPage = () => {
    switch (tab) {
      case 'dashboard': return <DashboardPage />;
      case 'revenus': return <RevenusPage />;
      case 'depenses': return <BudgetPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <ThemeProvider>
      <FinanceProvider>
        {showIntro ? (
          <IntroPage onComplete={handleIntroComplete} />
        ) : (
          <div className="min-h-screen min-h-[100dvh] bg-background flex justify-center overflow-hidden">
            <div className="w-full max-w-[480px] relative flex flex-col h-screen h-[100dvh]">
              {/* Header - iPhone safe area aware with glassmorphism */}
              <header className="sticky top-0 z-40 glass px-5 pt-4 pb-3 safe-area-top">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-primary tracking-wide">CashCompass</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      v1.0
                    </span>
                  </div>
                </div>
              </header>

              {/* Content - Scrollable with keyboard padding */}
              <main 
                className="flex-1 overflow-y-auto px-5 pb-28 keyboard-scroll-container"
                style={{ 
                  paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {renderPage()}
              </main>

              {/* Bottom Nav - iPhone safe area aware */}
              <BottomNav active={tab} onChange={setTab} />
            </div>
          </div>
        )}
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default Index;
