// ─── Mock Service — Demo data for "조국님 수고하셨습니다" scenario ────────────────

import type {
  ContentIdea, HookOption, ScriptSplit, UploadCopyPackage, VeoCoreClip, SlideScene,
} from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Demo Seed Data ────────────────────────────────────────────────────────────

export const DEMO_IDEAS: ContentIdea[] = [
  {
    id: 'idea_1',
    idea_title: '수고하셨습니다, 조국 대표님',
    main_angle: '낙선 이후에도 계속되는 헌신에 감사를 전하는 메시지',
    target_audience: '재선거에서 함께 뛴 지지자들과 당원',
    emotional_angle: '아쉬움과 감사, 그리고 앞으로에 대한 희망',
    why_it_resonates: '지지자들의 감정을 직접 대변하며 함께 위로하는 구성',
    one_line_synopsis: '낙선이 끝이 아니라 또 다른 시작임을 따뜻하게 전하는 30초',
  },
  {
    id: 'idea_2',
    idea_title: '우리가 기억할 것들',
    main_angle: '선거 기간 보여주신 진정성과 소통을 기록으로 남기는 영상',
    target_audience: '선거 과정을 가까이서 본 지지자, 청년 당원',
    emotional_angle: '진심으로 응원했던 기억을 공유하는 따뜻한 회고',
    why_it_resonates: '개인의 기억을 공유로 확장시키는 감성적 접근',
    one_line_synopsis: '선거 과정에서 남은 기억들을 함께 돌아보는 영상',
  },
  {
    id: 'idea_3',
    idea_title: '지금부터가 진짜입니다',
    main_angle: '낙선 이후의 새로운 출발과 지지자들이 해야 할 것들',
    target_audience: '다음을 바라보는 능동적 지지자, 20-40대',
    emotional_angle: '아쉬움을 행동으로 바꾸는 힘찬 전진 메시지',
    why_it_resonates: '좌절을 동력으로 전환하는 희망적 서사',
    one_line_synopsis: '낙선은 끝이 아닌 새로운 출발 — 지금부터 함께하자',
  },
];

export const DEMO_HOOKS: HookOption[] = [
  { id: 'hook_1', text: '조국 대표님, 정말 수고하셨습니다.', style: '공감형' },
  { id: 'hook_2', text: '이 마음, 전하고 싶었어요.', style: '감성형' },
  { id: 'hook_3', text: '낙선이 끝이라고요? 아닙니다.', style: '선언형' },
];

export const DEMO_SCRIPT_SPLIT: ScriptSplit = {
  full_script: `조국 대표님, 정말 수고하셨습니다.

재선거 결과가 아쉽지만, 그 과정에서 보여주신 헌신과 진정성은 우리 모두의 마음에 깊이 새겨졌습니다.

매일 현장에 나와 시민들과 함께 뛰어주신 그 모습, 지지자 한 명 한 명과 나눈 진심 어린 대화들—우리는 잊지 않겠습니다.

낙선이 끝이 아닙니다. 함께 만들어온 가치와 메시지는 계속됩니다.

앞으로도 함께 목소리를 내고, 이 길을 이어가겠습니다. 감사합니다.`,

  structure: {
    problem: '재선거 낙선 이후 지지자들이 느끼는 허탈함과 아쉬움',
    empathy: '그 감정을 이해하고 함께 아파하며, 과정을 기억하자는 메시지',
    solution: '낙선이 끝이 아닌 새로운 출발이라는 관점 제시',
    action: '함께 목소리를 내고 이 길을 계속 이어가자는 제안',
  },

  veo_core_clip: {
    text: '조국 대표님, 정말 수고하셨습니다. 재선거 결과가 아쉽지만, 그 과정에서 보여주신 헌신과 진정성은 우리 모두의 마음에 새겨졌습니다.',
    prompt: 'Vertical 9:16 short-form video clip, 9 seconds. Korean person aged 30-40, warm indoor setting, natural window light. Speaking directly to camera with sincere, grateful expression. Warm color grading, soft background blur. Documentary style, authentic, no political logos. Gentle handheld camera movement.',
    duration: 9,
    status: 'idle',
  },

  slide_scenes: [
    {
      scene_id: 'slide_1',
      scene_title: '선거 기간 함께 뛰어준 시간들',
      on_screen_text: '매일 현장에서\n함께 뛰어주셨습니다',
      narration_text: '매일 현장에 나와 시민들과 함께 뛰어주신 그 모습을 기억합니다.',
      visual_description: 'Vertical 9:16, Korean urban outdoor setting, warm morning light, people walking together on a street, community gathering, documentary photography style, warm amber tones, authentic candid moment',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_2',
      scene_title: '시민들과 나눈 진심 어린 대화',
      on_screen_text: '한 명 한 명과\n나눈 진심',
      narration_text: '지지자 한 명 한 명과 나눈 진심 어린 대화들, 우리는 잊지 않겠습니다.',
      visual_description: 'Vertical 9:16, two Korean people in warm conversation, close-up of clasped hands or eye contact, soft natural indoor lighting, sincere and emotional moment, shallow depth of field, warm tones',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_3',
      scene_title: '낙선이 끝이 아닙니다',
      on_screen_text: '낙선이 끝이 아닙니다\n이 길은 계속됩니다',
      narration_text: '낙선이 끝이 아닙니다. 함께 만들어온 가치는 계속됩니다.',
      visual_description: 'Vertical 9:16, Korean dawn or sunrise landscape, silhouette of a person standing and looking forward, hopeful mood, warm orange and gold sky, inspirational and forward-looking composition',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_4',
      scene_title: '우리가 만들어온 가치',
      on_screen_text: '우리가 함께\n만들어온 가치',
      narration_text: '우리가 함께 만들어온 가치와 메시지는 사라지지 않습니다.',
      visual_description: 'Vertical 9:16, Korean community mural or public art on a wall, people passing by in blurred motion, vibrant warm colors, sense of history and continuity, urban street photography style',
      duration_seconds: 4,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_5',
      scene_title: '계속 목소리를 냅시다',
      on_screen_text: '계속 목소리를 내고\n함께 걸어갑시다',
      narration_text: '앞으로도 함께 목소리를 내고 이 길을 이어가겠습니다.',
      visual_description: 'Vertical 9:16, group of Korean people walking forward together on a bright day, motion blur on feet suggesting movement, solidarity and determination, warm golden hour sunlight from the front',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
    {
      scene_id: 'slide_6',
      scene_title: '앞으로도 함께 감사합니다',
      on_screen_text: '앞으로도 함께\n감사합니다 💙',
      narration_text: '앞으로도 함께 가겠습니다. 감사합니다.',
      visual_description: 'Vertical 9:16, diverse group of Korean people of different ages gathered warmly, community celebration, soft warm indoor lighting, hopeful smiling faces, unity and solidarity feeling, clean modern Korean setting',
      duration_seconds: 3,
      imageStatus: 'idle',
    },
  ],
};

export const DEMO_UPLOAD_COPY: UploadCopyPackage = {
  titles: [
    { id: 't1', text: '조국 대표님, 수고하셨습니다 | 낙선 이후에도 계속되는 이야기', style: '직접적' },
    { id: 't2', text: '이 마음, 전할 수 있을까요? 조국 대표님께 보내는 응원 💙', style: '감성형' },
    { id: 't3', text: '낙선이 끝이라고요? 아닙니다 — 지금부터가 진짜입니다', style: '질문형' },
  ],
  hashtags: [
    '#조국혁신당', '#조국대표님', '#수고하셨습니다', '#함께합니다', '#정치', '#숏폼', '#응원', '#조국',
  ],
  platformVersions: [
    {
      platform: 'youtube', platformLabel: 'YouTube Shorts',
      title: '조국 대표님, 수고하셨습니다 — 낙선 이후에도 계속되는 이야기',
      caption: '재선거 낙선 이후, 조국 대표님께 감사와 응원의 메시지를 전합니다.\n\n선거 과정에서 보여주신 헌신과 진정성은 우리 모두의 마음에 새겨졌습니다.\n낙선이 끝이 아닌 새로운 시작이 되길 바랍니다. 💙\n\n#조국혁신당 #조국대표님 #수고하셨습니다 #Shorts',
      hashtags: ['#조국혁신당', '#조국대표님', '#수고하셨습니다', '#Shorts'],
      cta: '구독하고 더 많은 응원 콘텐츠를 받아보세요 🔔',
    },
    {
      platform: 'instagram', platformLabel: 'Instagram Reels',
      title: '이 마음, 전하고 싶었어요 💙',
      caption: '조국 대표님, 정말 수고하셨습니다 🙏\n.\n.\n재선거 결과는 아쉽지만, 그 과정에서 보여주신 진정성은 영원히 남습니다.\n낙선이 끝이 아닙니다. 함께 계속 가요 💪\n.\n.\n#조국혁신당 #조국대표님 #수고하셨습니다 #함께합니다 #정치 #reels',
      hashtags: ['#조국혁신당', '#조국대표님', '#수고하셨습니다', '#reels'],
      cta: '저장하고 주변에 공유해 주세요 ❤️',
    },
    {
      platform: 'tiktok', platformLabel: 'TikTok',
      title: '낙선이 끝이 아닙니다 🔥',
      caption: '조국 대표님 수고하셨습니다 💙 이 감정, 저만 그런 건 아니죠? #조국혁신당 #조국 #정치 #응원 #foryou',
      hashtags: ['#조국혁신당', '#조국', '#정치', '#응원', '#foryou'],
      cta: '팔로우하고 같이 응원해요 👆',
    },
    {
      platform: 'kakao', platformLabel: '카카오 공유',
      title: '[영상] 조국 대표님, 수고하셨습니다',
      caption: '재선거 낙선 이후에도 계속되는 이야기를 담은 30초 영상입니다. 마음이 담긴 응원 메시지를 공유해 주세요 🙏\n\n#조국혁신당 #수고하셨습니다',
      hashtags: ['#조국혁신당', '#수고하셨습니다'],
      cta: '카카오톡으로 공유하기',
    },
  ],
};

// ─── Mock Service Functions ────────────────────────────────────────────────────

export async function mockGenerateIdeas(): Promise<ContentIdea[]> {
  await delay(1600);
  return DEMO_IDEAS;
}

export async function mockGenerateHooks(): Promise<HookOption[]> {
  await delay(1200);
  return DEMO_HOOKS;
}

export async function mockGenerateScriptSplit(): Promise<ScriptSplit> {
  await delay(2000);
  return JSON.parse(JSON.stringify(DEMO_SCRIPT_SPLIT)) as ScriptSplit;
}

export async function mockAnalyzeImage(_file: File): Promise<string> {
  await delay(1000);
  return '조국혁신당 관련 정치 활동 이미지로 보입니다. 지지자들과 함께하는 따뜻한 분위기를 전달하며, 슬라이드 씬 1(현장 활동)이나 씬 3(함께하는 미래)에 활용하면 효과적입니다.';
}

export async function mockGenerateVeoClip(
  _clip: VeoCoreClip,
  onProgress: (msg: string) => void,
): Promise<void> {
  const steps = [
    '영상 생성 요청 중...',
    'Veo 3.1 Lite 처리 중 (5초)...',
    '영상 렌더링 중 (15초)...',
    '영상 인코딩 중 (25초)...',
    '완료!',
  ];
  for (const step of steps) {
    await delay(step === '완료!' ? 400 : 1200);
    onProgress(step);
  }
  // Mock: no actual video URL in demo mode
}

export async function mockGenerateSlideImage(
  _scene: SlideScene,
  onProgress?: (msg: string) => void,
): Promise<string> {
  onProgress?.('이미지 생성 중...');
  await delay(1400);
  // Return a colored placeholder SVG as data URI
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
    <rect width="720" height="1280" fill="${color}" opacity="0.15"/>
    <rect width="720" height="1280" fill="none" stroke="${color}" stroke-width="3" opacity="0.3"/>
    <text x="360" y="600" text-anchor="middle" font-family="sans-serif" font-size="28" fill="${color}" opacity="0.6">슬라이드 이미지</text>
    <text x="360" y="660" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${color}" opacity="0.4">(데모 모드)</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export async function mockGenerateUploadCopy(): Promise<UploadCopyPackage> {
  await delay(1800);
  return DEMO_UPLOAD_COPY;
}

export const DEMO_PLANNING_AUTOFILL = {
  identity: '조국혁신당 당원',
  category: '조국대표님' as const,
  topic: '조국님 수고하셨습니다. 재선거 낙선 이후에도 계속되는 이야기',
  mainPoints: [
    '선거 과정에서 보여주신 헌신과 진정성',
    '낙선 이후에도 계속되는 가치와 메시지',
    '지지자들이 앞으로 함께 이어갈 응원과 행동',
  ] as [string, string, string],
  hasPhotos: false,
  hasVideos: false,
  bannedExpressions: '상대 진영에 대한 조롱이나 모욕, 증거 없는 부정선거 단정',
  tone: '따뜻한, 진중한',
};
