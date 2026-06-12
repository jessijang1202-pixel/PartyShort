import type { VideoPromptPackage } from '../types';

// ─── Google Flow Integration ───────────────────────────────────────────────────
// Google Flow (VideoFX) is in limited access. This service provides:
// 1. Prompt package preparation (ready for manual use in Flow UI)
// 2. Placeholder for future direct API integration
// 3. Export-ready prompts users can copy into Google Flow directly

export interface FlowGenerationOptions {
  masterPrompt: string;
  scenePrompts: string[];
  styleInstructions: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  durationSeconds: number;
}

export interface FlowGenerationResult {
  jobId?: string;
  status: 'prepared' | 'submitted' | 'processing' | 'done' | 'error';
  videoUrl?: string;
  message: string;
}

/**
 * Prepares the Flow-compatible prompt package without making an API call.
 * Users can copy these prompts and use them directly in the Google Flow UI.
 */
export function prepareFlowPackage(pkg: VideoPromptPackage): FlowGenerationOptions {
  return {
    masterPrompt: pkg.masterPrompt,
    scenePrompts: pkg.scenes.map(s => s.prompt),
    styleInstructions: pkg.styleInstructions,
    aspectRatio: pkg.aspectRatio,
    durationSeconds: 30,
  };
}

/**
 * Formats the complete Flow prompt for clipboard copying.
 */
export function formatFlowPromptForCopy(pkg: VideoPromptPackage): string {
  const lines = [
    '=== Google Flow 영상 생성 프롬프트 패키지 ===',
    '',
    '[ 마스터 프롬프트 ]',
    pkg.masterPrompt,
    '',
    '[ 스타일 지침 ]',
    pkg.styleInstructions,
    '',
    '[ 연속성 지침 ]',
    pkg.continuityInstructions,
    '',
    `[ 화면비 ] ${pkg.aspectRatio}  [ 예상 길이 ] ${pkg.estimatedDuration}`,
    '',
    '=== 씬별 프롬프트 ===',
    ...pkg.scenes.map(s =>
      `씬 ${s.sceneNumber} (${s.duration}):\n${s.prompt}`,
    ),
    '',
    '=== Google Flow 사용 방법 ===',
    '1. labs.google/flow 에 접속하세요',
    '2. 새 프로젝트를 생성하세요',
    '3. 마스터 프롬프트를 입력하세요',
    '4. 업로드한 이미지를 재료로 추가하세요 (있는 경우)',
    '5. 씬별 프롬프트로 각 클립을 생성하세요',
    '6. 생성된 클립들을 순서대로 조합하세요',
  ];
  return lines.join('\n');
}

/**
 * Placeholder for future direct Flow API integration.
 * Currently returns a prepared status with prompt package.
 */
export async function submitToFlow(
  _apiKey: string,
  pkg: VideoPromptPackage,
): Promise<FlowGenerationResult> {
  // INTEGRATION POINT: Replace this with actual Google Flow / Vertex AI Video API call
  // Endpoint: https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning
  // or via Vertex AI: https://us-central1-aiplatform.googleapis.com/v1/...

  await new Promise(r => setTimeout(r, 800));

  return {
    status: 'prepared',
    message: '영상 생성 프롬프트 패키지가 준비되었습니다. 아래 프롬프트를 Google Flow에서 사용하세요.',
  };
}

export function getFlowSetupGuide(): string[] {
  return [
    'Google Flow (labs.google/flow)에 접속하세요',
    '준비된 마스터 프롬프트를 복사하여 붙여넣으세요',
    '이미지 파일이 있다면 재료(Ingredients)로 추가하세요',
    '씬별 프롬프트로 각 클립을 순서대로 생성하세요',
    '생성된 클립을 타임라인에 조합하세요',
    '최종 영상을 다운로드하세요',
  ];
}
