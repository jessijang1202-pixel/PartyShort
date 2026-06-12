import type {
  ContentIdea, HookOption, ScriptDraft, ImagePrompt,
  SafetyReview, VideoPromptPackage, UploadCopyPackage,
} from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─── Demo Seed Data (검찰개혁 시나리오) ──────────────────────────────────────

export const DEMO_IDEAS: ContentIdea[] = [
  {
    id: 'idea_1',
    title: '내 일상과 검찰개혁의 연결고리',
    targetAudienceAngle: '정치에 무관심한 20~40대 직장인',
    emotionalAngle: '공감과 피로감 → 변화에 대한 기대',
    resonanceReason: '추상적인 정치 이슈를 내 삶의 문제로 연결해 공감 유발',
    summary: '검찰개혁이 왜 나의 일상과 직결되는지 쉽게 보여주는 영상',
  },
  {
    id: 'idea_2',
    title: '지금 검찰개혁이 필요한 단 하나의 이유',
    targetAudienceAngle: '정의와 공정함에 관심 있는 시청자',
    emotionalAngle: '분노와 실망 → 희망과 실천 의지',
    resonanceReason: '"지금이 아니면 안 된다"는 긴박감으로 행동 촉구',
    summary: '타이밍과 필요성을 강조한 직설적 메시지',
  },
  {
    id: 'idea_3',
    title: '국민 눈높이에서 본 검찰 권력',
    targetAudienceAngle: '제도 개혁에 회의적인 중도층',
    emotionalAngle: '의심과 냉소 → 사실 기반 납득',
    resonanceReason: '감정이 아닌 국민 시각의 팩트로 설득하는 접근',
    summary: '팩트 기반으로 검찰 권력의 문제를 국민 시각으로 설명',
  },
];

export const DEMO_HOOKS: HookOption[] = [
  { id: 'hook_1', text: '내 월급에 검찰이 영향을 준다고?', style: '질문형' },
  { id: 'hook_2', text: '지금 바꾸지 않으면 기회는 없습니다', style: '선언형' },
  { id: 'hook_3', text: '여러분, 이미 느끼고 계시죠?', style: '공감형' },
];

export const DEMO_SCRIPT: ScriptDraft = {
  fullScript: `[훅] 검찰개혁, 나랑 무슨 상관이냐고요?\n\n[문제] 지금 이 순간에도 무소불위의 수사권이 국민 위에 군림하고 있습니다. 아무런 제도적 견제 없이요.\n\n[공감] 내 사건은 몇 달째 방치되고, 유력자의 사건은 신속하게 무혐의. 이 불공정함, 느껴보신 적 있으시죠?\n\n[해결] 검찰 권력을 국민이 통제할 수 있어야 합니다. 수사와 기소를 분리하고, 독립적인 감시를 만드는 것, 그게 검찰개혁의 핵심입니다.\n\n[행동] 지금 이 변화를 함께 만들어가야 합니다. 관심 갖고 지켜봐 주세요.`,
  estimatedReadingTime: '약 28초',
  structure: {
    problem: '지금 이 순간에도 무소불위의 수사권이 국민 위에 군림하고 있습니다.',
    empathy: '내 사건은 몇 달째 방치되고, 유력자의 사건은 신속하게 무혐의. 이 불공정함, 느껴보신 적 있으시죠?',
    solution: '검찰 권력을 국민이 통제할 수 있어야 합니다. 수사와 기소를 분리하고, 독립적인 감시를 만드는 것이 핵심입니다.',
    action: '지금 이 변화를 함께 만들어가야 합니다. 관심 갖고 지켜봐 주세요.',
  },
  narrationScript: '검찰개혁, 나랑 무슨 상관이냐고요? 지금 이 순간에도 무소불위의 수사권이 국민 위에 군림합니다. 내 사건은 방치되고, 유력자 사건은 신속 무혐의. 이 불공정함 느껴보셨죠? 검찰 권력을 국민이 통제해야 합니다. 수사와 기소의 분리, 독립적 감시. 그게 검찰개혁입니다. 함께 만들어가요.',
  scenes: [
    {
      sceneNumber: 1, timeRange: '0-3s', title: '훅',
      narration: '검찰개혁, 나랑 무슨 상관이냐고요?',
      onScreenText: '검찰개혁 = 내 문제',
      visualDescription: '일상 속 직장인의 모습, 뉴스를 보며 고민하는 표정',
      cameraFraming: '클로즈업, 정면 응시',
      textOverlay: '검찰개혁이 왜 내 문제일까요?',
    },
    {
      sceneNumber: 2, timeRange: '3-10s', title: '문제',
      narration: '지금 이 순간에도 무소불위의 수사권이 국민 위에 군림하고 있습니다.',
      onScreenText: '수사권 ≠ 견제 없음',
      visualDescription: '법원/검찰청 건물 외관, 거대한 구조물 강조',
      cameraFraming: '로우앵글, 건물 위압감 강조',
      textOverlay: '견제 없는 권력',
    },
    {
      sceneNumber: 3, timeRange: '10-17s', title: '공감',
      narration: '내 사건은 몇 달째 방치되고, 유력자의 사건은 신속하게 무혐의.',
      onScreenText: '불공정한 현실',
      visualDescription: '서류 더미, 달력에 X 표시, 대조되는 두 장면',
      cameraFraming: '컷편집, 대비 강조',
      textOverlay: '일반 시민 vs 유력자',
    },
    {
      sceneNumber: 4, timeRange: '17-24s', title: '해결',
      narration: '검찰 권력을 국민이 통제할 수 있어야 합니다. 수사와 기소를 분리하고 독립적인 감시를.',
      onScreenText: '수사·기소 분리 / 독립 감시',
      visualDescription: '도식화된 그래픽, 균형 잡힌 저울 이미지',
      cameraFraming: '미디엄샷, 설명형 그래픽 오버레이',
      textOverlay: '검찰개혁 = 권력 균형',
    },
    {
      sceneNumber: 5, timeRange: '24-30s', title: '행동/CTA',
      narration: '지금 이 변화를 함께 만들어가야 합니다. 관심 갖고 지켜봐 주세요.',
      onScreenText: '함께 만드는 변화',
      visualDescription: '다양한 시민들의 모습, 밝고 희망적인 분위기',
      cameraFraming: '와이드샷 후 줌인',
      textOverlay: '구독 / 공유 / 함께해요',
    },
  ],
};

export const DEMO_IMAGE_PROMPTS: ImagePrompt[] = [
  {
    id: 'img_1', sceneNumber: 2,
    prompt: 'Korean courthouse exterior, dramatic low angle shot, imposing government building, overcast sky, documentary style, cinematic lighting',
    visualDescription: '웅장한 검찰청/법원 건물 외관 — 권력의 거대함을 상징',
    style: 'realistic, documentary, cinematic',
  },
  {
    id: 'img_2', sceneNumber: 3,
    prompt: 'Split screen: left side messy office desk with stacked legal documents, calendar with X marks; right side clean desk, VIP treatment, contrast composition, Korean office setting',
    visualDescription: '일반 시민의 처리 지연 vs 유력자의 신속 처리 대비 구도',
    style: 'editorial, infographic style',
  },
  {
    id: 'img_3', sceneNumber: 5,
    prompt: 'Diverse Korean citizens of all ages gathering outdoors, hopeful expressions, morning light, community feeling, clean modern urban background, warm color palette',
    visualDescription: '다양한 계층의 시민들이 함께하는 희망적인 장면',
    style: 'warm, optimistic, photojournalistic',
  },
];

export const DEMO_SAFETY_REVIEW: SafetyReview = {
  riskLevel: 'low',
  overallNote: '전반적으로 안전한 대본입니다. 정책 비판은 표현의 자유 범위 내에 있으며, 확인되지 않은 사실 단정이나 명예훼손 표현은 없습니다. 플랫폼 제재 위험도 낮습니다.',
  flags: [
    {
      phrase: '무소불위의 수사권',
      riskType: '과장 표현 가능성',
      reason: '일부 시청자에게 과격한 표현으로 받아들여질 수 있습니다',
      saferAlternative: '견제받지 않는 수사권',
    },
  ],
  saferScriptSuggestion: undefined,
};

export const DEMO_VIDEO_PACKAGE: VideoPromptPackage = {
  masterPrompt: 'A 30-second Korean political short-form video about judicial reform (검찰개혁). Documentary style, informative and persuasive tone, 9:16 vertical format for Shorts/Reels. Clean, modern visual style with text overlays. Targeted at Korean general public aged 20-50.',
  mode: 'text-to-video',
  aspectRatio: '9:16',
  estimatedDuration: '30s',
  styleInstructions: 'Documentary-style cinematography. Color grading: slightly desaturated with blue/gray tones for authority scenes, warm tones for citizen scenes. Clean sans-serif Korean subtitles. Smooth transitions.',
  continuityInstructions: 'Maintain consistent color palette throughout. Use Korean text overlays for key phrases. Each scene should flow naturally into the next with smooth cuts or dissolves.',
  status: 'idle',
  scenes: [
    { sceneNumber: 1, duration: '3s', prompt: 'Close-up of Korean office worker watching news with concerned expression, questioning look, modern Korean apartment background', ingredients: [], status: 'pending' as const },
    { sceneNumber: 2, duration: '7s', prompt: 'Low angle shot of imposing Korean courthouse/prosecutors office exterior, dramatic sky, text overlay: "견제 없는 권력"', ingredients: [], status: 'pending' as const },
    { sceneNumber: 3, duration: '7s', prompt: 'Split screen documentary style: ordinary citizen paperwork delay vs. VIP fast-track treatment, Korean office setting', ingredients: [], status: 'pending' as const },
    { sceneNumber: 4, duration: '7s', prompt: 'Clean graphic animation of scales of justice, separation of investigation and prosecution powers, Korean text labels', ingredients: [], status: 'pending' as const },
    { sceneNumber: 5, duration: '6s', prompt: 'Wide shot of diverse Korean citizens in urban setting, hopeful expressions, morning light, text overlay CTA', ingredients: [], status: 'pending' as const },
  ],
};

export const DEMO_UPLOAD_COPY: UploadCopyPackage = {
  titles: [
    { id: 't1', text: '검찰개혁이 내 삶과 직결된 이유 | 30초 요약', style: '직접적' },
    { id: 't2', text: '왜 지금 검찰개혁이어야 하나요? 🔍', style: '질문형' },
    { id: 't3', text: '불공정한 현실, 이제는 바꿀 수 있습니다', style: '감성형' },
  ],
  hashtags: ['#검찰개혁', '#조국혁신당', '#정치', '#숏폼', '#공정', '#정의', '#검찰', '#개혁', '#한국정치'],
  platformVersions: [
    {
      platform: 'youtube', platformLabel: 'YouTube Shorts',
      title: '검찰개혁이 내 삶과 직결된 이유 | 30초 요약',
      caption: '검찰개혁이 왜 우리 일상의 문제인지 30초 안에 알아보세요.\n\n수사와 기소 분리, 독립적 감시 — 지금 꼭 필요한 이유를 설명합니다.\n\n#검찰개혁 #조국혁신당 #정치 #Shorts',
      hashtags: ['#검찰개혁', '#조국혁신당', '#정치', '#Shorts'],
      cta: '구독하고 더 많은 정치 콘텐츠를 받아보세요 🔔',
    },
    {
      platform: 'instagram', platformLabel: 'Instagram Reels',
      title: '왜 지금 검찰개혁이어야 하나요? 🔍',
      caption: '불공정한 현실을 바꿀 수 있는 방법이 있어요 💪\n검찰개혁의 핵심을 30초로 정리했습니다.\n.\n.\n#검찰개혁 #조국혁신당 #정치 #공정 #정의 #reels #숏폼 #정치콘텐츠',
      hashtags: ['#검찰개혁', '#조국혁신당', '#공정', '#정의', '#reels'],
      cta: '저장하고 주변에 공유해주세요 ❤️',
    },
    {
      platform: 'tiktok', platformLabel: 'TikTok',
      title: '검찰개혁 30초 완전정복 🔥',
      caption: '이거 모르면 손해 😮 검찰개혁이 내 일상에 영향 준다는 거 알고 계셨나요? #검찰개혁 #정치 #알쓸신잡 #한국 #foryou',
      hashtags: ['#검찰개혁', '#정치', '#알쓸신잡', '#foryou', '#한국'],
      cta: '팔로우하고 더 알아보기 👆',
    },
    {
      platform: 'kakao', platformLabel: '카카오 공유',
      title: '[영상] 검찰개혁이 내 삶과 연결된 이유',
      caption: '30초 영상으로 보는 검찰개혁 핵심 정리입니다. 주변에 공유해 주세요 🙏\n\n#검찰개혁 #조국혁신당',
      hashtags: ['#검찰개혁', '#조국혁신당'],
      cta: '카카오톡으로 공유하기',
    },
  ],
};

// ─── Mock Service Functions ────────────────────────────────────────────────────

export async function mockGenerateIdeas(): Promise<ContentIdea[]> {
  await delay(1800);
  return DEMO_IDEAS;
}

export async function mockGenerateHooks(): Promise<HookOption[]> {
  await delay(1400);
  return DEMO_HOOKS;
}

export async function mockGenerateScript(): Promise<ScriptDraft> {
  await delay(2200);
  return DEMO_SCRIPT;
}

export async function mockAnalyzeImage(_file: File): Promise<string> {
  await delay(1200);
  return '정치 집회나 공식 행사 관련 이미지로 보입니다. 진지하고 공식적인 분위기를 전달하며, 씬 2(문제 제시) 또는 씬 5(행동 촉구)에 활용하면 효과적입니다.';
}

export async function mockGenerateImagePrompts(): Promise<ImagePrompt[]> {
  await delay(1600);
  return DEMO_IMAGE_PROMPTS;
}

export async function mockSafetyReview(): Promise<SafetyReview> {
  await delay(1500);
  return DEMO_SAFETY_REVIEW;
}

export async function mockGenerateVideoPackage(): Promise<VideoPromptPackage> {
  await delay(2000);
  return { ...DEMO_VIDEO_PACKAGE };
}

export async function mockSimulateVideoGeneration(
  pkg: VideoPromptPackage,
  onProgress: (updated: VideoPromptPackage) => void,
): Promise<VideoPromptPackage> {
  let current = { ...pkg, status: 'generating' as const };
  onProgress(current);

  for (let i = 0; i < current.scenes.length; i++) {
    await delay(1200);
    current = {
      ...current,
      scenes: current.scenes.map((s, idx) =>
        idx === i ? { ...s, status: 'done' as const, videoUrl: '#mock-video' } : s,
      ),
    };
    onProgress(current);
  }

  await delay(600);
  const final = { ...current, status: 'done' as const, finalVideoUrl: '#mock-final-video' };
  onProgress(final);
  return final;
}

export async function mockGenerateUploadCopy(): Promise<UploadCopyPackage> {
  await delay(1800);
  return DEMO_UPLOAD_COPY;
}
