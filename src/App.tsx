/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimelineProvider } from './context/TimelineContext';
import { AIProvider, useAI } from './context/AIContext';
import { AuthProvider } from './context/AuthContext';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AIHome } from './components/AIHome';
import { AIChatView } from './components/AIChatView';
import { CommunityView } from './components/CommunityView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { FeatureUnavailable } from './components/FeatureUnavailable';
import { UserProfileModal } from './components/UserProfileModal';
import { AboutPage } from './components/AboutPage';
import { AuthModal } from './components/AuthModal';
import { WelcomeGateway } from './components/WelcomeGateway';
import { WelcomeModal } from './components/WelcomeModal';
import { ApiKeysModal } from './components/ApiKeysModal';
import { Footer } from './components/Footer';
import { X } from 'lucide-react';

// Keep existing workspace components imported in architecture for future re-activation
export { CreateWorkspace } from './components/CreateWorkspace';
export { ProjectsWorkspace } from './components/ProjectsWorkspace';
export { OtherwiseModeContainer } from './components/OtherwiseModeContainer';

const GlobalModals: React.FC = () => {
  const { isKeysModalOpen, setIsKeysModalOpen } = useAI();
  return (
    <ApiKeysModal isOpen={isKeysModalOpen} onClose={() => setIsKeysModalOpen(false)} />
  );
};

interface MainContentProps {
  targetMessageUserId: string | null;
  onStartMessage: (userId: string) => void;
  onOpenProfile: (userId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  targetMessageUserId,
  onStartMessage,
  onOpenProfile,
}) => {
  const { activeNav } = useAI();

  return (
    <main className="relative z-10 flex-1">
      {activeNav === 'home' && (
        <AIHome onStartMessage={onStartMessage} onOpenProfile={onOpenProfile} />
      )}
      {activeNav === 'ai' && <AIChatView />}
      {activeNav === 'community' && (
        <CommunityView onOpenProfile={onOpenProfile} onStartMessage={onStartMessage} />
      )}
      {activeNav === 'messages' && (
        <MessagesView
          initialTargetUserId={targetMessageUserId}
          onViewUserProfile={onOpenProfile}
        />
      )}
      {activeNav === 'profile' && <ProfileView onStartMessage={onStartMessage} />}

      {/* Temporarily disabled unfinished AI features show clean development status */}
      {activeNav === 'create' && (
        <FeatureUnavailable
          featureId="create"
          featureName="AI Creation Studio"
          customMessage="Creation Studio generation tools (Song AI, Video AI, Image AI, 3D AI) are temporarily disabled while each service backend is verified and connected."
        />
      )}
      {activeNav === 'projects' && (
        <FeatureUnavailable
          featureId="projects"
          featureName="Projects Workspace"
          customMessage="This feature is temporarily unavailable while we complete development."
        />
      )}
      {activeNav === 'otherwise' && (
        <FeatureUnavailable
          featureId="otherwise"
          featureName="OTHERWISE Life Simulator"
          customMessage="This feature is temporarily unavailable while we complete development."
        />
      )}
      {activeNav === 'about' && <AboutPage />}
    </main>
  );
};

export default function App() {
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);
  const [targetMessageUserId, setTargetMessageUserId] = useState<string | null>(null);
  const [publicProfileUserId, setPublicProfileUserId] = useState<string | null>(null);

  const openPrivacy = () => {
    setLegalModal({
      title: 'Privacy Policy',
      content:
        'OTHERWISE values human privacy and creative ownership. User prompts, generated messages, and private conversations are kept strictly confidential between authorized participants. We never expose private messages to public community feeds or search results. Built with safety and respect for all creators.',
    });
  };

  const openTerms = () => {
    setLegalModal({
      title: 'Terms of Service',
      content:
        'By using OTHERWISE, you enter an experimental conversational and creative community intelligence platform. Chat AI is powered by Google Gemini. Please maintain respect and constructive communication in private messaging and community spaces.',
    });
  };

  const openContact = () => {
    setLegalModal({
      title: 'Contact & Inquiries',
      content:
        'For inquiries, ideas, feedback, or collaborations regarding OTHERWISE, please connect through your account feedback channel. Built by David Bodunde at Pottersville School.',
    });
  };

  return (
    <TimelineProvider>
      <AIProvider>
        <AuthProvider>
          <AppContent
            targetMessageUserId={targetMessageUserId}
            setTargetMessageUserId={setTargetMessageUserId}
            publicProfileUserId={publicProfileUserId}
            setPublicProfileUserId={setPublicProfileUserId}
            legalModal={legalModal}
            setLegalModal={setLegalModal}
            openPrivacy={openPrivacy}
            openTerms={openTerms}
            openContact={openContact}
          />
        </AuthProvider>
      </AIProvider>
    </TimelineProvider>
  );
}

function AppContent({
  targetMessageUserId,
  setTargetMessageUserId,
  publicProfileUserId,
  setPublicProfileUserId,
  legalModal,
  setLegalModal,
  openPrivacy,
  openTerms,
  openContact,
}: any) {
  const { setActiveNav } = useAI();

  const handleStartMessage = (userId: string) => {
    setTargetMessageUserId(userId);
    setActiveNav('messages');
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-[#edf0f5] flex flex-col font-sans selection:bg-amber-900/40 selection:text-amber-100 pb-16 md:pb-0">
      <AtmosphericBackground />
      <Header />
      <MainContent
        targetMessageUserId={targetMessageUserId}
        onStartMessage={handleStartMessage}
        onOpenProfile={setPublicProfileUserId}
      />
      <Footer
        onOpenPrivacy={openPrivacy}
        onOpenTerms={openTerms}
        onOpenContact={openContact}
      />
      <BottomNav />
      <WelcomeGateway />
      <AuthModal />
      <WelcomeModal />
      <GlobalModals />

      {/* User Public Profile Modal */}
      {publicProfileUserId && (
        <UserProfileModal
          userId={publicProfileUserId}
          onClose={() => setPublicProfileUserId(null)}
          onStartMessage={handleStartMessage}
        />
      )}

      {/* Legal / Policy Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-xl text-white font-bold">{legalModal.title}</h3>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1.5 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {legalModal.content}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
