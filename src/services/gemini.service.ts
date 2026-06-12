import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  PlanningInput, ContentIdea, HookOption, ScriptDraft,
  ImagePrompt, SafetyReview, VideoPromptPackage, UploadCopyPackage,
} from '../types';
import {
  buildIdeaPrompt, buildHookPrompt, buildScriptPrompt,
  buildImageAnalysisPrompt, buildImagePromptGeneration,
  buildSafetyPrompt, buildVideoPromptPackage,
  buildUploadCopyPrompt,
} from '../prompts';

const MODEL_ID = 'gemini-2.0-flash-exp';

function getClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

function getModel(apiKey: string) {
  return getClient(apiKey).getGenerativeModel({ model: MODEL_ID });
}

async function generateJSON<T>(apiKey: string, prompt: string): Promise<T> {
  const model = getModel(apiKey);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('응답에서 JSON을 찾을 수 없습니다.');
  return JSON.parse(jsonMatch[0]) as T;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function generateIdeas(
  apiKey: string,
  planning: PlanningInput,
): Promise<ContentIdea[]> {
  const prompt = buildIdeaPrompt(planning);
  const data = await generateJSON<{ ideas: ContentIdea[] }>(apiKey, prompt);
  return data.ideas;
}

export async function generateHooks(
  apiKey: string,
  planning: PlanningInput,
  idea: ContentIdea,
): Promise<HookOption[]> {
  const prompt = buildHookPrompt(planning, idea);
  const data = await generateJSON<{ hooks: HookOption[] }>(apiKey, prompt);
  return data.hooks;
}

export async function generateScript(
  apiKey: string,
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
): Promise<ScriptDraft> {
  const prompt = buildScriptPrompt(planning, idea, hook);
  return generateJSON<ScriptDraft>(apiKey, prompt);
}

export async function analyzeImage(
  apiKey: string,
  file: File,
): Promise<string> {
  const model = getModel(apiKey);
  const prompt = buildImageAnalysisPrompt();

  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType: file.type } },
  ]);
  return result.response.text();
}

export async function generateImagePrompts(
  apiKey: string,
  planning: PlanningInput,
  idea: ContentIdea,
  script: ScriptDraft,
): Promise<ImagePrompt[]> {
  const prompt = buildImagePromptGeneration(planning, idea, script);
  const data = await generateJSON<{ imagePrompts: ImagePrompt[] }>(apiKey, prompt);
  return data.imagePrompts;
}

export async function runSafetyReview(
  apiKey: string,
  script: ScriptDraft,
  planning: PlanningInput,
): Promise<SafetyReview> {
  const prompt = buildSafetyPrompt(script, planning);
  return generateJSON<SafetyReview>(apiKey, prompt);
}

export async function generateVideoPromptPackage(
  apiKey: string,
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
  script: ScriptDraft,
  hasImages: boolean,
): Promise<VideoPromptPackage> {
  const prompt = buildVideoPromptPackage(planning, idea, hook, script, hasImages);
  const data = await generateJSON<VideoPromptPackage>(apiKey, prompt);
  return { ...data, status: 'idle' };
}

export async function generateUploadCopy(
  apiKey: string,
  planning: PlanningInput,
  idea: ContentIdea,
  hook: HookOption,
): Promise<UploadCopyPackage> {
  const prompt = buildUploadCopyPrompt(planning, idea, hook);
  return generateJSON<UploadCopyPackage>(apiKey, prompt);
}

// ─── API Key Validation ────────────────────────────────────────────────────────

export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const model = getModel(apiKey);
    await model.generateContent('안녕하세요. API 연결 테스트입니다. 한 단어로만 응답하세요.');
    return true;
  } catch {
    return false;
  }
}
