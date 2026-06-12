import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  AppSession, WizardStep, PlanningInput, ContentIdea, HookOption,
  ScriptSplit, SlideScene, VeoCoreClip, UploadCopyPackage, UserApiSettings,
} from '../types';

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialSession: AppSession = {
  planning: null,
  ideas: [],
  selectedIdea: null,
  hooks: [],
  selectedHook: null,
  scriptSplit: null,
  uploadCopy: null,
  currentStep: 'planning',
};

const defaultSettings: UserApiSettings = {
  geminiApiKey: '',
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
  setScriptSplit: (split: ScriptSplit) => void;
  updateVeoClip: (clip: VeoCoreClip) => void;
  updateSlideScene: (scene: SlideScene) => void;
  setUploadCopy: (copy: UploadCopyPackage) => void;
  resetSession: () => void;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

function loadSettings(): UserApiSettings {
  try {
    const raw = sessionStorage.getItem('pss2_settings');
    if (raw) return JSON.parse(raw) as UserApiSettings;
  } catch { /* ignore */ }
  return defaultSettings;
}

function persistSettings(s: UserApiSettings) {
  try { sessionStorage.setItem('pss2_settings', JSON.stringify(s)); } catch { /* ignore */ }
}

function getInitialDark() {
  try {
    if (localStorage.getItem('pss_dark') === 'true') return true;
    if (localStorage.getItem('pss_dark') === 'false') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession>(initialSession);
  const [settings, setSettingsState] = useState<UserApiSettings>(loadSettings);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const d = getInitialDark();
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

  const setScriptSplit = useCallback((scriptSplit: ScriptSplit) =>
    setSession(s => ({ ...s, scriptSplit })), []);

  const updateVeoClip = useCallback((clip: VeoCoreClip) =>
    setSession(s => s.scriptSplit
      ? { ...s, scriptSplit: { ...s.scriptSplit, veo_core_clip: clip } }
      : s
    ), []);

  const updateSlideScene = useCallback((scene: SlideScene) =>
    setSession(s => s.scriptSplit ? {
      ...s,
      scriptSplit: {
        ...s.scriptSplit,
        slide_scenes: s.scriptSplit.slide_scenes.map(sc =>
          sc.scene_id === scene.scene_id ? scene : sc
        ),
      },
    } : s), []);

  const setUploadCopy = useCallback((uploadCopy: UploadCopyPackage) =>
    setSession(s => ({ ...s, uploadCopy })), []);

  const resetSession = useCallback(() => setSession(initialSession), []);

  return (
    <AppContext.Provider value={{
      session, settings, isDark,
      setSettings, toggleDark, setStep,
      updatePlanning, setIdeas, selectIdea,
      setHooks, selectHook, setScriptSplit,
      updateVeoClip, updateSlideScene,
      setUploadCopy, resetSession,
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
