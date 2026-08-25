'use client';

import { useEffect, useRef, useState } from 'react';
import { BottomNav } from './components/bottom-nav';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { LandingHero } from './components/landing-hero';
import { CheckInModal } from './components/modals/check-in-modal';
import { OpenSessionModal } from './components/modals/open-session-modal';
import { Notice } from './components/notice';
import { DashboardTab } from './components/tabs/dashboard-tab';
import { HomeTab } from './components/tabs/home-tab';
import { ToastHost } from './components/toast-host';
import type { TabId } from './types';
import { useAttendanceStore } from '../store/use-attendance-store';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [inputCourseCode, setInputCourseCode] = useState('');
  const [inputStudentId, setInputStudentId] = useState('');

  const wallet = useAttendanceStore((state) => state.wallet);
  const isConnecting = useAttendanceStore((state) => state.isConnecting);
  const sessionState = useAttendanceStore((state) => state.sessionState);
  const courseCode = useAttendanceStore((state) => state.courseCode);
  const walletError = useAttendanceStore((state) => state.walletError);
  const connect = useAttendanceStore((state) => state.connect);
  const clearWalletError = useAttendanceStore((state) => state.clearWalletError);
  const openSession = useAttendanceStore((state) => state.openSession);
  const submitCheckIn = useAttendanceStore((state) => state.submitCheckIn);

  // Auto-connect on page load — ref guard prevents Strict Mode double-fire
  const hasConnected = useRef(false);
  useEffect(() => {
    if (!wallet && !isConnecting && !hasConnected.current) {
      hasConnected.current = true;
      void connect();
    }
  }, []); // empty deps: intentional one-time connect on mount

  const handleOpenSession = () => {
    openSession(inputCourseCode);
    setShowOpenModal(false);
  };

  const handleCheckIn = () => {
    void submitCheckIn(inputStudentId, inputCourseCode || courseCode || 'CS-401 · Distributed Systems & ZK');
    setShowCheckInModal(false);
  };

  const openCheckInModal = () => {
    if (!inputCourseCode && courseCode) setInputCourseCode(courseCode);
    setShowCheckInModal(true);
  };

  return (
    <>
      {activeTab === 'home' && (
        <LandingHero
          isOpenSession={sessionState === 'OPEN'}
          onOpenSession={() => setShowOpenModal(true)}
          onCheckIn={openCheckInModal}
          onNavigate={setActiveTab}
          activeTab={activeTab}
        />
      )}

      <div className="shell" style={{ paddingTop: activeTab === 'home' ? '2rem' : undefined }}>
        {activeTab !== 'home' && <Header activeTab={activeTab} onTabChange={setActiveTab} />}

        {walletError && <Notice message={walletError} onDismiss={clearWalletError} />}

        <div className="shell-content">
          {activeTab === 'home' && (
            <HomeTab
              onOpenSession={() => setShowOpenModal(true)}
              onCheckIn={openCheckInModal}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab
              courseCodeInput={inputCourseCode}
              onCourseCodeChange={setInputCourseCode}
              studentIdInput={inputStudentId}
              onStudentIdChange={setInputStudentId}
            />
          )}
        </div>

        <Footer />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showOpenModal && (
        <OpenSessionModal
          courseCodeInput={inputCourseCode}
          onCourseCodeChange={setInputCourseCode}
          onSubmit={handleOpenSession}
          onClose={() => setShowOpenModal(false)}
        />
      )}

      {showCheckInModal && (
        <CheckInModal
          studentIdInput={inputStudentId}
          onStudentIdChange={setInputStudentId}
          courseCodeInput={inputCourseCode}
          onCourseCodeChange={setInputCourseCode}
          onSubmit={handleCheckIn}
          onClose={() => setShowCheckInModal(false)}
        />
      )}

      <ToastHost />
    </>
  );
}
