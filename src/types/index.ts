// ─── Enumerations & Constants ─────────────────────────────────────────────────

export type Category = '뉴스' | '정책' | '당이슈' | '조국대표님';
export const CATEGORIES: Category[] = ['뉴스', '정책', '당이슈', '조국대표님'];

export const TONE_OPTIONS = [
  '따뜻한', '진중한', '차분한', '연설형', '브이로그처럼 편안한',
] as const;

export type GenerationStatus = 'idle' | 'pending' | 'generating' | 'done' | 'error';

// ─── Planning ─────────────────────────────────────────────────────────────────

export interface VisualAsset {
  id: string;
  type: 'image' | 'video';
  file?: File;
  url?: string;
  name: string;
  aiSummary?: string;
  editedSummary?: string;
}

export interface PlanningInput {
  identity: string;
  category: Category;
  topic: string;
  mainPoints: [string, string, string];
  hasPhotos: boolean;
  hasVideos: boolean;
  bannedExpressions: string;
  tone: string;             // comma-joined multi-select, e.g. "따뜻한, 진중한"
}

// ─── Ideas & Hooks ────────────────────────────────────────────────────────────

export interface ContentIdea {
  id: string;
  idea_title: string;
  main_angle: string;
  target_audience: string;
  emotional_angle: string;
  why_it_resonates: string;
  one_line_synopsis: string;
}

export interface HookOption {
  id: string;
  text: string;
  style: string;
}

// ─── Script + Split ───────────────────────────────────────────────────────────

export interface VeoCoreClip {
  text: string;             // spoken narration for the 8-10s clip
  prompt: string;           // full Veo generation prompt (English)
  duration: number;         // 8–10 seconds
  videoUrl?: string;        // base64 data URI or blob URL after generation
  status: GenerationStatus;
  errorMessage?: string;
}

export interface SlideScene {
  scene_id: string;
  scene_title: string;
  on_screen_text: string;   // big text displayed on screen
  narration_text: string;   // optional spoken narration
  visual_description: string;
  duration_seconds: number;
  imageUrl?: string;        // base64 or blob URL
  imageStatus: GenerationStatus;
}

export interface ScriptSplit {
  full_script: string;
  structure: {
    problem: string;
    empathy: string;
    solution: string;
    action: string;
  };
  veo_core_clip: VeoCoreClip;
  slide_scenes: SlideScene[];
}

// ─── Storyboard ───────────────────────────────────────────────────────────────

export interface StoryboardSegment {
  id: string;
  type: 'veo' | 'slide';
  label: string;
  startTime: number;
  endTime: number;
  videoUrl?: string;
  imageUrl?: string;
  on_screen_text?: string;
  narration?: string;
}

// ─── Upload Copy ──────────────────────────────────────────────────────────────

export interface UploadTitle {
  id: string;
  text: string;
  style: string;
}

export interface PlatformCopy {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'kakao';
  platformLabel: string;
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface UploadCopyPackage {
  titles: UploadTitle[];
  hashtags: string[];
  platformVersions: PlatformCopy[];
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserApiSettings {
  geminiApiKey: string;
  useMockMode: boolean;
}

// ─── Wizard Navigation ────────────────────────────────────────────────────────

export type WizardStep =
  | 'planning'
  | 'ideas'
  | 'hooks'
  | 'script-split'
  | 'veo-clip'
  | 'slides'
  | 'storyboard'
  | 'upload-copy'
  | 'export';

export interface WizardStepMeta {
  id: WizardStep;
  label: string;
  shortLabel: string;
  stepNumber: number;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { id: 'planning',     label: '기획 입력',        shortLabel: '기획',      stepNumber: 1 },
  { id: 'ideas',        label: '아이디어 선택',     shortLabel: '아이디어',   stepNumber: 2 },
  { id: 'hooks',        label: '훅 선택',           shortLabel: '훅',        stepNumber: 3 },
  { id: 'script-split', label: '대본 + 구성 분리',  shortLabel: '대본',      stepNumber: 4 },
  { id: 'veo-clip',     label: 'Veo 핵심 클립',    shortLabel: 'Veo',       stepNumber: 5 },
  { id: 'slides',       label: '슬라이드 씬',       shortLabel: '슬라이드',   stepNumber: 6 },
  { id: 'storyboard',   label: '30초 스토리보드',   shortLabel: '스토리보드', stepNumber: 7 },
  { id: 'upload-copy',  label: '업로드 카피',       shortLabel: '카피',      stepNumber: 8 },
  { id: 'export',       label: '내보내기',          shortLabel: '내보내기',  stepNumber: 9 },
];

// ─── Full Session ─────────────────────────────────────────────────────────────

export interface AppSession {
  planning: PlanningInput | null;
  ideas: ContentIdea[];
  selectedIdea: ContentIdea | null;
  hooks: HookOption[];
  selectedHook: HookOption | null;
  scriptSplit: ScriptSplit | null;
  uploadCopy: UploadCopyPackage | null;
  currentStep: WizardStep;
}
