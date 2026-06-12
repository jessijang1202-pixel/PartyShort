import type { PlanningInput, ContentIdea, HookOption, ScriptDraft } from '../types';

// ─── Context Builder ───────────────────────────────────────────────────────────

function buildContext(p: PlanningInput) {
  return `
[기획 컨텍스트]
- 작성자 소개: ${p.identity}
- 카테고리: ${p.category}
- 주제: ${p.topic}
- 주요 포인트 1: ${p.mainPoints[0]}
- 주요 포인트 2: ${p.mainPoints[1]}
- 주요 포인트 3: ${p.mainPoints[2]}
- 피해야 할 표현: ${p.bannedExpressions || '없음'}
- 원하는 말투: ${p.tone}
`.trim();
}

// ─── Idea Generation ───────────────────────────────────────────────────────────

export function buildIdeaPrompt(planning: PlanningInput): string {
  return `
당신은 한국 정치 숏폼 콘텐츠 전략 전문가입니다.
아래 기획 정보를 바탕으로 30초 숏폼 영상 콘텐츠 아이디어 3가지를 생성해주세요.

${buildContext(planning)}

규칙:
- 카테고리와 말투를 철저히 반영할 것
- 피해야 할 표현을 절대 사용하지 말 것
- 확인되지 않은 사실을 단정하지 말 것
- 혐오, 폭력, 명예훼손, 과격한 표현 금지
- 설득력 있고 감성적이되, 근거가 있어야 함

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "아이디어 제목",
      "targetAudienceAngle": "어떤 시청자층에게 어떻게 접근할지",
      "emotionalAngle": "어떤 감정을 자극하는지",
      "resonanceReason": "왜 공감을 받을 수 있는지",
      "summary": "한 줄 요약"
    },
    { "id": "idea_2", ... },
    { "id": "idea_3", ... }
  ]
}
`.trim();
}

// ─── Hook Generation ───────────────────────────────────────────────────────────

export function buildHookPrompt(planning: PlanningInput, idea: ContentIdea): string {
  return `
당신은 숏폼 영상 오프닝 카피라이터입니다.
첫 3초 안에 시청자를 사로잡는 훅 라인 3가지를 만들어주세요.

${buildContext(planning)}

선택된 아이디어:
- 제목: ${idea.title}
- 타겟 앵글: ${idea.targetAudienceAngle}
- 감성 앵글: ${idea.emotionalAngle}

규칙:
- 15자 이내로 짧고 강렬하게
- 읽기 쉽고 말하기 편한 문장
- 과격하거나 선동적인 표현 금지
- 각 훅은 서로 다른 스타일(질문형/선언형/공감형 등)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "hooks": [
    { "id": "hook_1", "text": "훅 텍스트", "style": "질문형" },
    { "id": "hook_2", "text": "훅 텍스트", "style": "선언형" },
    { "id": "hook_3", "text": "훅 텍스트", "style": "공감형" }
  ]
}
`.trim();
}

// ─── Script Generation ─────────────────────────────────────────────────────────

export function buildScriptPrompt(
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
): string {
  return `
당신은 한국 정치 숏폼 대본 작가입니다.
30초 분량의 숏폼 영상 대본을 작성해주세요.

${buildContext(planning)}

선택된 아이디어: ${idea.title}
선택된 훅: "${hook.text}" (${hook.style})

대본 구조 (필수):
1. 문제 (Problem) - 3~7초
2. 공감 (Empathy) - 7~12초
3. 해결 (Solution) - 12~22초
4. 행동 (Action/CTA) - 22~30초

씬 구성:
- Scene 1 (0-3s): 훅
- Scene 2 (3-10s): 문제
- Scene 3 (10-17s): 공감
- Scene 4 (17-24s): 해결
- Scene 5 (24-30s): 행동/CTA

규칙:
- 피해야 할 표현 절대 금지
- 확인되지 않은 사실 단정 금지
- 말투: ${planning.tone}
- 자막 친화적 줄바꿈 포함

반드시 아래 JSON 형식으로만 응답하세요:
{
  "fullScript": "전체 대본 텍스트",
  "estimatedReadingTime": "약 28초",
  "structure": {
    "problem": "문제 파트 텍스트",
    "empathy": "공감 파트 텍스트",
    "solution": "해결 파트 텍스트",
    "action": "행동 파트 텍스트"
  },
  "narrationScript": "나레이션 전용 스크립트",
  "scenes": [
    {
      "sceneNumber": 1,
      "timeRange": "0-3s",
      "title": "훅",
      "narration": "나레이션 텍스트",
      "onScreenText": "화면 자막",
      "visualDescription": "시각적 장면 설명",
      "cameraFraming": "카메라/프레이밍 제안",
      "textOverlay": "텍스트 오버레이 제안"
    }
  ]
}
`.trim();
}

// ─── Image Analysis ────────────────────────────────────────────────────────────

export function buildImageAnalysisPrompt(): string {
  return `
이 이미지를 분석해주세요. 정치 숏폼 콘텐츠 제작에 활용할 수 있도록 아래 내용을 간략히 설명해주세요:
1. 이미지에 보이는 주요 내용 (장소, 인물, 상황)
2. 전달되는 분위기 또는 감성
3. 영상 콘텐츠에서 어떤 씬에 활용하면 좋을지

3~5문장으로 간결하게 답해주세요.
`.trim();
}

// ─── Image Prompt Generation ───────────────────────────────────────────────────

export function buildImagePromptGeneration(
  planning: PlanningInput,
  idea: ContentIdea,
  script: ScriptDraft,
): string {
  return `
당신은 정치 콘텐츠 비주얼 디렉터입니다.
아래 정보를 바탕으로 숏폼 영상에 사용할 이미지 프롬프트 3개를 생성해주세요.

${buildContext(planning)}
아이디어: ${idea.title}
대본 핵심: ${script.structure.problem} / ${script.structure.solution}

규칙:
- 현실적이고 설득력 있는 이미지
- 선정적, 폭력적, 선동적 이미지 금지
- 각 프롬프트는 서로 다른 씬을 커버
- 영어로 이미지 생성 AI용 프롬프트 작성
- 시각적 일관성 유지

반드시 아래 JSON 형식으로만 응답하세요:
{
  "imagePrompts": [
    {
      "id": "img_1",
      "sceneNumber": 2,
      "prompt": "English prompt for image generation AI",
      "visualDescription": "한국어 시각 설명",
      "style": "realistic, cinematic, documentary-style"
    }
  ]
}
`.trim();
}

// ─── Safety Review ─────────────────────────────────────────────────────────────

export function buildSafetyPrompt(script: ScriptDraft, planning: PlanningInput): string {
  return `
당신은 정치 콘텐츠 위험도 검토 전문가입니다.
아래 대본을 검토하고 위험 요소를 분석해주세요.

[대본]
${script.fullScript}

[피해야 할 표현]
${planning.bannedExpressions || '없음'}

검토 항목:
1. 과장된 주장
2. 위험한 표현
3. 명예훼손 가능성
4. 확인되지 않은 사실 단정
5. 지나치게 공격적인 표현
6. 플랫폼 제재 가능성이 있는 표현

중요: 이 검토는 법적 조언이 아닌 콘텐츠 가이드라인 참고용입니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "riskLevel": "low",
  "overallNote": "전반적 검토 의견",
  "flags": [
    {
      "phrase": "문제가 될 수 있는 표현",
      "riskType": "명예훼손 가능성",
      "reason": "왜 위험한지 설명",
      "saferAlternative": "더 안전한 대안 표현"
    }
  ],
  "saferScriptSuggestion": "위험 표현을 수정한 전체 대본 (선택사항)"
}
`.trim();
}

// ─── Video Prompt Generation ───────────────────────────────────────────────────

export function buildVideoPromptPackage(
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
  script: ScriptDraft,
  hasImages: boolean,
): string {
  return `
당신은 Google Flow 영상 생성 프롬프트 전문가입니다.
아래 정보를 바탕으로 30초 숏폼 영상 생성을 위한 프롬프트 패키지를 만들어주세요.

${buildContext(planning)}
아이디어: ${idea.title}
훅: "${hook.text}"
이미지 재료 존재: ${hasImages ? '예' : '아니오'}

씬별 대본:
${script.scenes.map(s => `씬 ${s.sceneNumber} (${s.timeRange}): ${s.narration}`).join('\n')}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "masterPrompt": "전체 영상의 마스터 프롬프트 (영어)",
  "mode": "${hasImages ? 'image-to-video' : 'text-to-video'}",
  "aspectRatio": "9:16",
  "estimatedDuration": "30s",
  "styleInstructions": "스타일 지침 (영어)",
  "continuityInstructions": "연속성 지침 (영어)",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": "3s",
      "prompt": "씬별 영어 프롬프트",
      "ingredients": ["사용할 이미지나 텍스트 재료"],
      "status": "pending"
    }
  ]
}
`.trim();
}

// ─── Upload Copy Generation ────────────────────────────────────────────────────

export function buildUploadCopyPrompt(
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
): string {
  return `
당신은 SNS 콘텐츠 카피라이터입니다.
아래 정보를 바탕으로 각 플랫폼에 맞는 업로드 카피를 생성해주세요.

${buildContext(planning)}
아이디어: ${idea.title}
훅: "${hook.text}"

생성할 내용:
1. 제목 3가지 (스타일별: 직접적/질문형/감성형)
2. 해시태그 세트
3. 플랫폼별 카피 (YouTube Shorts, Instagram Reels, TikTok, Kakao)
   - 플랫폼마다 길이, 말투, 해시태그 밀도, CTA 방식을 다르게

반드시 아래 JSON 형식으로만 응답하세요:
{
  "titles": [
    { "id": "t1", "text": "제목 1", "style": "직접적" },
    { "id": "t2", "text": "제목 2", "style": "질문형" },
    { "id": "t3", "text": "제목 3", "style": "감성형" }
  ],
  "hashtags": ["#검찰개혁", "#정치", "#숏폼"],
  "platformVersions": [
    {
      "platform": "youtube",
      "platformLabel": "YouTube Shorts",
      "title": "유튜브용 제목",
      "caption": "유튜브용 설명",
      "hashtags": ["#shorts", "#정치"],
      "cta": "구독과 좋아요 부탁드립니다"
    },
    { "platform": "instagram", "platformLabel": "Instagram Reels", ... },
    { "platform": "tiktok", "platformLabel": "TikTok", ... },
    { "platform": "kakao", "platformLabel": "카카오 공유", ... }
  ]
}
`.trim();
}
