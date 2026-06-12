import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  AppSession, WizardStep, PlanningInput, ContentIdea, HookOption,
  ScriptDraft, ImagePrompt, SafetyReview, VideoPromptPackage,
  UploadCopyPackage, UserApiSettings,
} from '../types';

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialSession: AppSession = {
  planning: null,
  ideas: [],
  selectedIdea: null,
  hooks: [],
  selectedHook: null,
  script: null,
  imagePrompts: [],
  safetyReview: null,
  videoPackage: null,
  previewApproved: false,
  uploadCopy: null,
  currentStep: 'planning',
};

const defaultSettings: UserApiSettings = {
  geminiApiKey: '',
  flowApiKey: '',
  useMockMode: true,
};

// ─── Context Interface ─────────────────────────────────────────────────────────

interface AppContextType {
  session: AppSession;
  settings: UserApiSettings;
  isDark: boolean;
  setSettings: (s: UserApiSettings) => void;
  toggleDark: () => void;
  setStep: (step: WizardStep) => void;
  updatePlanning: (planning: PlanningInput) => void;
  setIdeas: (ideas: ContentIdea[]) => void;
  selectIdea: (idea: ContentIdea) => void;
  setHooks: (hooks: HookOption[]) => void;
  selectHook: (hook: HookOption) => void;
  setScript: (script: ScriptDraft) => void;
  setImagePrompts: (prompts: ImagePrompt[]) => void;
  setSafetyReview: (review: SafetyReview) => void;
  setVideoPackage: (pkg: VideoPromptPackage) => void;
  approvePreview: () => void;
  setUploadCopy: (copy: UploadCopyPackage) => void;
  resetSession: () => void;
}

// ─── Context Creation ──────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

function loadSettings(): UserApiSettings {
  try {
    const raw = sessionStorage.getItem('pss_settings');
    if (raw) return JSON.parse(raw) as UserApiSettings;
  } catch { /* ignore */ }
  return defaultSettings;
}

function persistSettings(s: UserApiSettings) {
  try {
    const safe = { ...s };
    sessionStorage.setItem('pss_settings', JSON.stringify(safe));
  } catch { /* ignore */ }
}

function getSystemDark() {
  try {
    return (
      localStorage.getItem('pss_dark') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  } catch {
    return false;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession>(initialSession);
  const [settings, setSettingsState] = useState<UserApiSettings>(loadSettings);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const d = getSystemDark();
    if (d) document.documentElement.classList.add('dark');
    return d;
  });

  const setSettings = useCallback((s: UserApiSettings) => {
    setSettingsState(s);
    persistSettings(s);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('pss_dark', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setStep = useCallback((step: WizardStep) =>
    setSession(s => ({ ...s, currentStep: step })), []);

  const updatePlanning = useCallback((planning: PlanningInput) =>
    setSession(s => ({ ...s, planning })), []);

  const setIdeas = useCallback((ideas: ContentIdea[]) =>
    setSession(s => ({ ...s, ideas, selectedIdea: null })), []);

  const selectIdea = useCallback((selectedIdea: ContentIdea) =>
    setSession(s => ({ ...s, selectedIdea })), []);

  const setHooks = useCallback((hooks: HookOption[]) =>
    setSession(s => ({ ...s, hooks, selectedHook: null })), []);

  const selectHook = useCallback((selectedHook: HookOption) =>
    setSession(s => ({ ...s, selectedHook })), []);

  const setScript = useCallback((script: ScriptDraft) =>
    setSession(s => ({ ...s, script })), []);

  const setImagePrompts = useCallback((imagePrompts: ImagePrompt[]) =>
    setSession(s => ({ ...s, imagePrompts })), []);

  const setSafetyReview = useCallback((safetyReview: SafetyReview) =>
    setSession(s => ({ ...s, safetyReview })), []);

  const setVideoPackage = useCallback((videoPackage: VideoPromptPackage) =>
    setSession(s => ({ ...s, videoPackage })), []);

  const approvePreview = useCallback(() =>
    setSession(s => ({ ...s, previewApproved: true })), []);

  const setUploadCopy = useCallback((uploadCopy: UploadCopyPackage) =>
    setSession(s => ({ ...s, uploadCopy })), []);

  const resetSession = useCallback(() =>
    setSession(initialSession), []);

  return (
    <AppContext.Provider value={{
      session, settings, isDark,
      setSettings, toggleDark, setStep,
      updatePlanning, setIdeas, selectIdea,
      setHooks, selectHook, setScript,
      setImagePrompts, setSafetyReview, setVideoPackage,
      approvePreview, setUploadCopy, resetSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
