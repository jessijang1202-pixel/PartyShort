// ─── Core Data Structures ────────────────────────────────────────────────────

export type Category = '뉴스' | '정책' | '당이슈' | '조국대표님';

export const CATEGORIES: Category[] = ['뉴스', '정책', '당이슈', '조국대표님'];

export const TONE_OPTIONS = [
  '단호한', '따뜻한', '진중한', '쉬운', '젊은', '뉴스형', '연설형',
] as const;

export interface VisualAsset {
  id: string;
  type: 'image' | 'video';
  file?: File;
  url?: string;
  name: string;
  aiSummary?: string;
  assignedScene?: number;
}

export interface PlanningInput {
  identity: string;
  category: Category;
  topic: string;
  mainPoints: [string, string, string];
  uploadedAssets: VisualAsset[];
  bannedExpressions: string;
  tone: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  targetAudienceAngle: string;
  emotionalAngle: string;
  resonanceReason: string;
  summary: string;
}

export interface HookOption {
  id: string;
  text: string;
  style: string;
}

export interface ScenePlan {
  sceneNumber: number;
  timeRange: string;
  title: string;
  narration: string;
  onScreenText: string;
  visualDescription: string;
  cameraFraming: string;
  textOverlay: string;
  assignedAssetId?: string;
}

export interface ScriptDraft {
  fullScript: string;
  estimatedReadingTime: string;
  structure: {
    problem: string;
    empathy: string;
    solution: string;
    action: string;
  };
  scenes: ScenePlan[];
  narrationScript: string;
}

export interface ImagePrompt {
  id: string;
  sceneNumber: number;
  prompt: string;
  visualDescription: string;
  style: string;
  generatedImageUrl?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface SafetyFlag {
  phrase: string;
  riskType: string;
  reason: string;
  saferAlternative: string;
}

export interface SafetyReview {
  riskLevel: RiskLevel;
  flags: SafetyFlag[];
  overallNote: string;
  saferScriptSuggestion?: string;
}

export type VideoGenerationStatus = 'idle' | 'pending' | 'generating' | 'done' | 'error';

export interface VideoScene {
  sceneNumber: number;
  prompt: string;
  ingredients: string[];
  duration: string;
  status: VideoGenerationStatus;
  videoUrl?: string;
}

export interface VideoPromptPackage {
  masterPrompt: string;
  scenes: VideoScene[];
  styleInstructions: string;
  continuityInstructions: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  estimatedDuration: string;
  mode: 'text-to-video' | 'image-to-video' | 'frames-to-video';
  status: VideoGenerationStatus;
  finalVideoUrl?: string;
}

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

// ─── Wizard Navigation ────────────────────────────────────────────────────────

export type WizardStep =
  | 'planning'
  | 'ideas'
  | 'hooks'
  | 'script'
  | 'media'
  | 'safety'
  | 'video'
  | 'preview'
  | 'upload-copy';

export interface WizardStepMeta {
  id: WizardStep;
  label: string;
  shortLabel: string;
  stepNumber: number;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { id: 'planning',     label: '기획 입력',     shortLabel: '기획',    stepNumber: 1 },
  { id: 'ideas',        label: '아이디어 선택',  shortLabel: '아이디어', stepNumber: 2 },
  { id: 'hooks',        label: '훅 선택',       shortLabel: '훅',     stepNumber: 3 },
  { id: 'script',       label: '대본 생성',     shortLabel: '대본',    stepNumber: 4 },
  { id: 'media',        label: '비주얼 자산',    shortLabel: '비주얼',  stepNumber: 5 },
  { id: 'safety',       label: '안전 검토',     shortLabel: '안전',    stepNumber: 6 },
  { id: 'video',        label: '영상 생성',     shortLabel: '영상',    stepNumber: 7 },
  { id: 'preview',      label: '미리보기/승인',  shortLabel: '승인',    stepNumber: 8 },
  { id: 'upload-copy',  label: '업로드 카피',   shortLabel: '카피',    stepNumber: 9 },
];

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserApiSettings {
  geminiApiKey: string;
  flowApiKey: string;
  useMockMode: boolean;
}

// ─── Full Session ─────────────────────────────────────────────────────────────

export interface AppSession {
  planning: PlanningInput | null;
  ideas: ContentIdea[];
  selectedIdea: ContentIdea | null;
  hooks: HookOption[];
  selectedHook: HookOption | null;
  script: ScriptDraft | null;
  imagePrompts: ImagePrompt[];
  safetyReview: SafetyReview | null;
  videoPackage: VideoPromptPackage | null;
  previewApproved: boolean;
  uploadCopy: UploadCopyPackage | null;
  currentStep: WizardStep;
}
