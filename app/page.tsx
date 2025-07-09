'use client'
import { SetStateAction, useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

// Aceternity UI Components
import { Spotlight } from '@/components/ui/spotlight';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Meteors } from '@/components/ui/meteors';
import { WobbleCard } from '@/components/ui/wobble-card';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { AuroraBackground } from '@/components/ui/aurora-background';

// NavigationBar component for consistent navigation buttons
function NavigationBar({
  onBack,
  onContinue,
  showBack = true,
  continueDisabled = false,
}: {
  onBack: () => void;
  onContinue: () => void;
  showBack?: boolean;
  continueDisabled?: boolean;
}) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      {showBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700 px-4 py-2 rounded-md transition-all duration-200 shadow-md border border-gray-700 backdrop-blur-sm bg-black/10"
        >
          ← Back
        </Button>
      )}
      <Button
        onClick={onContinue}
        disabled={continueDisabled}
        className="bg-white text-black hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-transform px-4 py-2 rounded-md shadow-md border border-gray-700 backdrop-blur-sm bg-black/10"
      >
        Continue
      </Button>
    </div>
  );
}

// Onboarding context for state across routes
type Agent = { id: number; name: string; avatar: string; voice: string };
type IntegrationKey = 'jira' | 'github' | 'slack' | 'teams' | 'calendar';
type KnowledgeBaseItem = { id: number; type: string; content: string };
type OnboardingContextType = {
  step: number;
  setStep: (step: number) => void;
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  integrations: Record<IntegrationKey, boolean>;
  setIntegrations: React.Dispatch<React.SetStateAction<Record<IntegrationKey, boolean>>>;
  knowledgeBase: KnowledgeBaseItem[];
  setKnowledgeBase: (v: KnowledgeBaseItem[]) => void;
  newKBContent: string;
  setNewKBContent: (v: string) => void;
  newKBType: string;
  setNewKBType: (v: string) => void;
  analyticsLoading: boolean;
  setAnalyticsLoading: (v: boolean) => void;
  resetAll: () => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  customAgents: Agent[];
  setCustomAgents: (v: Agent[]) => void;
  avatarOptions: string[];
  voiceSamples: Record<string, string>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [integrations, setIntegrations] = useState<Record<IntegrationKey, boolean>>({
    jira: false,
    github: false,
    slack: false,
    teams: false,
    calendar: false,
  });
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([
    { id: 1, type: 'text', content: 'Project mission: Empower agile teams with AI.' },
    { id: 2, type: 'link', content: 'https://scrum.ai/docs' },
  ]);
  const [newKBContent, setNewKBContent] = useState('');
  const [newKBType, setNewKBType] = useState('text');
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const defaultAgents: Agent[] = [
    { id: 1, name: 'ScrumBot', avatar: 'https://placehold.co/100x100?text=SB', voice: 'calm' },
    { id: 2, name: 'AgileMate', avatar: 'https://placehold.co/100x100?text=AM', voice: 'energetic' },
    { id: 3, name: 'SprintMaster', avatar: 'https://placehold.co/100x100?text=SM', voice: 'formal' },
  ];
  const [customAgents, setCustomAgents] = useState<Agent[]>(defaultAgents);
  const avatarOptions = ['https://placehold.co/100x100?text=SB', 'https://placehold.co/100x100?text=AM', 'https://placehold.co/100x100?text=SM'];
  const voiceSamples = {
    calm: 'https://example.com/calm.mp3',
    energetic: 'https://example.com/energetic.mp3',
    formal: 'https://example.com/formal.mp3',
  };
  const resetAll = () => {
    setStep(1);
    setSelectedAgent(null);
    setIntegrations({ jira: false, github: false, slack: false, teams: false, calendar: false });
    setKnowledgeBase([
      { id: 1, type: 'text', content: 'Project mission: Empower agile teams with AI.' },
      { id: 2, type: 'link', content: 'https://scrum.ai/docs' },
    ]);
    setNewKBContent('');
    setNewKBType('text');
    setAnalyticsLoading(true);
    setCustomAgents(defaultAgents);
    audioRefs.current = [];
  };
  return (
    <OnboardingContext.Provider value={{ step, setStep, selectedAgent, setSelectedAgent, integrations, setIntegrations, knowledgeBase, setKnowledgeBase, newKBContent, setNewKBContent, newKBType, setNewKBType, analyticsLoading, setAnalyticsLoading, resetAll, loginEmail: '', setLoginEmail: () => {}, customAgents, setCustomAgents, avatarOptions, voiceSamples }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export default function App() {
  // Use onboarding context
  return (
    <OnboardingProvider>
      <OnboardingApp />
    </OnboardingProvider>
  );
}

function OnboardingApp() {
  const {
    step, setStep, selectedAgent, setSelectedAgent, integrations, setIntegrations,
    knowledgeBase, setKnowledgeBase, newKBContent, setNewKBContent, newKBType, setNewKBType,
    analyticsLoading, setAnalyticsLoading, resetAll,
    loginEmail, setLoginEmail, customAgents, setCustomAgents, avatarOptions, voiceSamples
  } = useOnboarding();

  const agents = [
    { id: 1, name: 'ScrumBot', avatar: 'SB', voice: 'calm' },
    { id: 2, name: 'AgileMate', avatar: 'AM', voice: 'energetic' },
    { id: 3, name: 'SprintMaster', avatar: 'SM', voice: 'formal' },
  ];

  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Product Owner', contribution: 'High' },
    { id: 2, name: 'Bob Smith', role: 'Developer', contribution: 'Medium' },
    { id: 3, name: 'Cara Lee', role: 'QA Engineer', contribution: 'High' },
  ];

  const handleLogin = () => setStep(2);
  const continueAsGuest = () => {
    setStep(3);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const goToNext = () => {
    if (step === 2 && !selectedAgent) return;
    if (step < 6) setStep(step + 1);
  };

  // Validation for enabling Continue button
  const isContinueDisabled = () => {
    if (step === 2) return !selectedAgent;
    if (step === 3) return !Object.values(integrations).some(Boolean);
    if (step === 5) return knowledgeBase.length === 0;
    // Add more step validations as needed
    return false;
  };

  type IntegrationKey = keyof typeof integrations;

  useEffect(() => {
    if (step === 6) {
      setAnalyticsLoading(true);
      const timer = setTimeout(() => setAnalyticsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Local ref for audio elements
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* NavigationBar: show on all steps except 1 */}
      {step !== 1 && (
        <NavigationBar
          onBack={goBack}
          onContinue={goToNext}
          showBack={step !== 1}
          continueDisabled={isContinueDisabled()}
        />
      )}
      {/* Step 1: Welcome/Login */}
      {step === 1 && (
        <AuroraBackground>
          <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Welcome to Scrum.ai
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-8 text-gray-300">
              The AI-powered Scrum Master helping your team work smarter.
            </p>
            {/* Login Container */}
            <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-white">Sign In with Your Work Email</h2>
              <div className="space-y-3">
                {/* Email Input */}
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white border-gray-600"
                />
                {/* Google Workspace Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-white border-gray-600 hover:bg-gray-800 active:scale-95 transition-transform"
                  onClick={handleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16.5 21v-2a4.5 4.5 0 0 0-9 0v2"></path>
                    <circle cx="12" cy="11" r="3"></circle>
                    <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5"></path>
                  </svg>
                  Google Workspace
                </Button>
                {/* Microsoft Outlook Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-white border-gray-600 hover:bg-gray-800 active:scale-95 transition-transform"
                  onClick={handleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  Microsoft Outlook
                </Button>
                {/* Zoho Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-white border-gray-600 hover:bg-gray-800 active:scale-95 transition-transform"
                  onClick={handleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                  Zoho
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                We only use your email to verify identity and connect tools.
              </p>
              {/* Continue Button */}
              <Button
                className="mt-4 w-full bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 active:scale-95 transition-transform"
                onClick={handleLogin}
                disabled={!loginEmail}
              >
                Continue
              </Button>
              {/* Continue as Guest Button */}
              <Button
                variant="ghost"
                className="mt-2 w-full text-gray-400 hover:text-white active:text-gray-300 active:scale-95 transition-transform"
                onClick={continueAsGuest}
              >
                Continue as Guest
              </Button>
            </div>
            <Meteors number={20} />
          </div>
        </AuroraBackground>
      )}
      {/* Step 2: Agent Selection */}
      {step === 2 && (
        <section className="p-8 relative min-h-screen">
          <h2 className="text-3xl font-semibold mb-6">Select Your AI Scrum Master</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {customAgents.map((agent, idx) => (
              <Card
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`cursor-pointer border-2 transition-all ${selectedAgent?.id === agent.id ? 'border-blue-500 shadow-lg' : 'border-gray-700'}`}
              >
                <CardHeader>
                  <div className="flex flex-col items-center gap-2">
                    {/* Avatar customization */}
                    <div className="flex gap-2 mb-2">
                      {avatarOptions.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt="avatar option"
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer ${agent.avatar === url ? 'border-blue-500' : 'border-gray-500'}`}
                          onClick={e => {
                            e.stopPropagation();
                            setCustomAgents(customAgents.map((a: Agent) => a.id === agent.id ? { ...a, avatar: url } : a));
                          }}
                        />
                      ))}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    {/* Name edit */}
                    <Input
                      value={agent.name}
                      onChange={e => setCustomAgents(customAgents.map((a: Agent) => a.id === agent.id ? { ...a, name: e.target.value } : a))}
                      className="mt-2 text-center bg-gray-800 text-white border-gray-600"
                    />
                    <div className="text-center mt-2">Voice: {agent.voice}</div>
                    {/* Play Voice */}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full text-white border-blue-700 hover:bg-blue-800"
                      onClick={e => {
                        e.stopPropagation();
                        if (audioRefs.current[idx]) audioRefs.current[idx]?.play();
                      }}
                    >
                      ▶ Play Voice
                    </Button>
                    <audio ref={el => { audioRefs.current[idx] = el; }} src={voiceSamples[agent.voice]} preload="auto" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}
      {/* Step 3: Tool Integration */}
      {step === 3 && (
        <section className="p-8 relative min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold mb-6">Integrate Team Tools</h2>
          <p className="mb-4 text-gray-300 max-w-xl text-center">Connect the platforms your team uses. Scrum.ai will use these integrations to fetch data and build context for your agent.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {(Object.entries(integrations) as [IntegrationKey, boolean][]).map(([tool, connected]) => (
              <div key={tool} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <Checkbox
                  id={tool}
                  checked={connected}
                  onCheckedChange={(checked) => setIntegrations((prev) => ({ ...prev, [tool]: checked }))}
                />
                <Label htmlFor={tool} className="capitalize text-lg text-white cursor-pointer">{tool === 'teams' ? 'MS Teams' : tool.charAt(0).toUpperCase() + tool.slice(1)}</Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400">You can connect more tools later in settings.</p>
        </section>
      )}
      {/* Step 4: Agent Onboarding Confirmation and Summary Report */}
      {step === 4 && (
        <section className="p-8 relative min-h-screen flex flex-col items-center justify-center">
          {/* Blast animation placeholder */}
          <div className="mb-6">
            <span className="inline-block animate-bounce text-5xl">🎉</span>
          </div>
          <h2 className="text-3xl font-semibold mb-4 text-center">Thank you for adding me!</h2>
          <p className="mb-6 text-gray-300 text-center max-w-xl">I'm your new Scrum AI agent. Here's a quick summary of your project so far:</p>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mb-4">
            <h3 className="text-xl font-bold mb-2">Project Summary</h3>
            <ul className="list-disc pl-6 text-gray-200 space-y-1">
              <li><b>Mission:</b> Empower agile teams with AI-driven insights.</li>
              <li><b>Vision:</b> Streamline sprints, automate standups, and resolve blockers faster.</li>
              <li><b>Current Progress:</b> Sprint 3 of 6, 60% complete.</li>
              <li><b>Key Features:</b> Automated standups, backlog grooming, sprint analytics.</li>
              <li><b>Upcoming Epics:</b> Cross-team reporting, advanced retrospectives.</li>
              <li><b>Known Hurdles:</b> Integration delays with Jira. <span className="text-yellow-400">Mitigation: Schedule sync with DevOps.</span></li>
            </ul>
          </div>
        </section>
      )}
      {/* Step 5: Knowledge Base Generation */}
      {step === 5 && (
        <section className="p-8 relative min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold mb-6">Project Knowledge Base</h2>
          <p className="mb-4 text-gray-300 max-w-xl text-center">Scrum.ai has generated a knowledge base from your connected tools. You can review, edit, and add more content below. Supported: text, PDFs, videos, links.</p>
          <div className="w-full max-w-2xl mb-6">
            <ul className="space-y-3">
              {knowledgeBase.map((item) => (
                <li key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
                  <span className="font-bold capitalize text-blue-300">{item.type}:</span>
                  <span className="flex-1 text-white">{item.content}</span>
                  {/* Remove button */}
                  <Button size="sm" variant="ghost" onClick={() => setKnowledgeBase(knowledgeBase.filter((kb) => kb.id !== item.id))}>Remove</Button>
                </li>
              ))}
            </ul>
          </div>
          <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); if (newKBContent) { setKnowledgeBase([...knowledgeBase, { id: Date.now(), type: newKBType, content: newKBContent }]); setNewKBContent(''); }}}>
            <select value={newKBType} onChange={e => setNewKBType(e.target.value)} className="bg-gray-700 text-white rounded px-2 py-1">
              <option value="text">Text</option>
              <option value="link">Link</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
            </select>
            <input
              type="text"
              value={newKBContent}
              onChange={e => setNewKBContent(e.target.value)}
              placeholder="Add new knowledge base content..."
              className="bg-gray-700 text-white rounded px-2 py-1 flex-1"
            />
            <Button type="submit" disabled={!newKBContent}>Add</Button>
          </form>
          <div className="w-full max-w-2xl flex flex-wrap gap-2 mt-2">
            {/* Example tags/categories */}
            <span className="bg-blue-700 text-white px-2 py-1 rounded text-xs">#agile</span>
            <span className="bg-green-700 text-white px-2 py-1 rounded text-xs">#standup</span>
            <span className="bg-purple-700 text-white px-2 py-1 rounded text-xs">#retrospective</span>
          </div>
        </section>
      )}
      {step === 6 && (
        <section className="p-6">
          {/* Personalized Welcome */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Agent Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-2">
                <AvatarImage src={`https://placehold.co/100x100?text=${selectedAgent?.avatar ?? 'AI'}`} alt={selectedAgent?.name ?? 'Agent'} />
                <AvatarFallback>{selectedAgent?.avatar ?? 'AI'}</AvatarFallback>
              </Avatar>
              <span className="text-lg font-semibold text-white">{selectedAgent?.name ?? 'Your Agent'}</span>
              <span className="text-xs text-gray-400">{selectedAgent?.voice ? `Style: ${selectedAgent.voice}` : 'AI Scrum Master'}</span>
            </div>
            {/* Welcome and Stats */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Welcome back{selectedAgent ? `, ${selectedAgent.name}` : ''}! 👋</h2>
              <p className="text-gray-300 mb-2">Scrum.ai is ready to help your team sprint ahead.</p>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center">
                  <div className="text-xl font-bold text-blue-400">3</div>
                  <div className="text-xs text-gray-400">Sprints Completed</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center">
                  <div className="text-xl font-bold text-green-400">12</div>
                  <div className="text-xs text-gray-400">Tasks This Week</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-center">
                  <div className="text-xl font-bold text-yellow-400">1</div>
                  <div className="text-xs text-gray-400">Blockers Resolved</div>
                </div>
              </div>
            </div>
          </div>
          {/* Since your last visit */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-white">Since your last visit</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>3 stories completed</li>
              <li>1 blocker resolved</li>
              <li>2 new comments from team</li>
            </ul>
          </div>
          {/* Team Shoutout */}
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 border border-gray-700 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <span className="text-white font-semibold">Bob Smith closed the most tickets this week!</span>
          </div>
          {/* Motivational Quote */}
          <div className="bg-gray-800 border-l-4 border-blue-500 rounded-lg p-4 mb-8">
            <span className="italic text-gray-200">“Did you know? Teams using daily standups are 23% more productive.”</span>
          </div>
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="flex gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700 mb-4">
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 py-2 rounded transition-all">Activity Log</TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 py-2 rounded transition-all">Suggested Actions</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 py-2 rounded transition-all">Analytics</TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 py-2 rounded transition-all">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <BentoGrid className="max-w-4xl mx-auto">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <BentoGridItem
                    key={day}
                    title={day}
                    description="Standup reminder | Blocked story check"
                    header={<Spotlight className="h-16 w-16" fill="white" />}
                  />
                ))}
              </BentoGrid>
            </TabsContent>

            <TabsContent value="actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WobbleCard containerClassName="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold">Reallocate Tasks</h4>
                  <p>Due to uneven sprint load, suggest redistributing tasks among developers.</p>
                </WobbleCard>
                <WobbleCard containerClassName="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold">Schedule Sync Meeting</h4>
                  <p>Coordinate with QA and Devs to resolve blockers on critical path stories.</p>
                </WobbleCard>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800 text-white">
                  <CardHeader>
                    <CardTitle>Sprint Velocity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-32 bg-gray-700 rounded animate-pulse flex items-center justify-center text-gray-400">Loading chart...</div>
                    ) : (
                      <svg width="100%" height="100" viewBox="0 0 200 100">
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          points="0,80 30,60 60,65 90,40 120,50 150,30 180,40 200,20"
                        />
                        <circle cx="200" cy="20" r="4" fill="#3b82f6" />
                      </svg>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 text-white">
                  <CardHeader>
                    <CardTitle>Burndown Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-32 bg-gray-700 rounded animate-pulse flex items-center justify-center text-gray-400">Loading chart...</div>
                    ) : (
                      <svg width="100%" height="100" viewBox="0 0 200 100">
                        <rect x="20" y="60" width="20" height="30" fill="#f59e42" />
                        <rect x="50" y="40" width="20" height="50" fill="#f59e42" />
                        <rect x="80" y="30" width="20" height="60" fill="#f59e42" />
                        <rect x="110" y="50" width="20" height="40" fill="#f59e42" />
                        <rect x="140" y="20" width="20" height="70" fill="#f59e42" />
                      </svg>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team">
              <div className="flex flex-wrap gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="bg-gray-800 text-white w-64">
                    <CardHeader>
                      <AnimatedTooltip items={[{ id: member.id, name: member.name, designation: member.role, image: `https://placehold.co/100x100` }]} />
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">{member.contribution}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
}
