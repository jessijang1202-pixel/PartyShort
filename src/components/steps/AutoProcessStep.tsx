import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Loader2, Circle, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { generateHooks, generateScriptSplit } from '../../services/gemini.service';
import { mockGenerateHooks, mockGenerateScriptSplit } from '../../services/mock.service';
import type { SubtitleNarrationSettings } from '../../types';

type StepStatus = 'idle' | 'processing' | 'done' | 'error';

interface ProcessItem {
  label: string;
  desc: string;
  status: StepStatus;
}

const DEFAULT_NARRATION: SubtitleNarrationSettings = {
  subtitleEnabled: false,
  subtitlePosition: 'bottom',
  subtitleSize: 'medium',
  subtitleStyle: 'default',
  narrationEnabled: false,
  narrationGender: 'female',
  narrationMood: '차분한',
  narrationSpeed: 1.0,
  soundEffectsEnabled: false,
  soundEffects: [],
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function AutoProcessStep() {
  const { session, settings, simpleUploads, setHooks, selectHook, setScriptSplit, setSubtitleNarration, setStep } = useApp();
  const ran = useRef(false);

  const [items, setItems] = useState<ProcessItem[]>([
    { label: '훅 선택', desc: '시청자를 사로잡는 최적의 도입부를 AI가 선택합니다', status: 'idle' },
    { label: '대본 + 구성 분리', desc: '30초 대본을 초반부(Veo 영상)와 후반부(슬라이드)로 분리합니다', status: 'idle' },
    { label: 'Veo 클립 프롬프트', desc: '핵심 8-10초 영상을 위한 생성 프롬프트를 완성합니다', status: 'idle' },
    { label: '슬라이드 씬 구성', desc: '후반부 씬 구조와 나레이션 텍스트를 배치합니다', status: 'idle' },
    { label: '자막/나레이션 설정', desc: '자막과 나레이션 기본 설정을 적용합니다', status: 'idle' },
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  function setStatus(idx: number, status: StepStatus) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, status } : item));
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runAutoProcess();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runAutoProcess() {
    const { planning, selectedIdea } = session;
    if (!planning || !selectedIdea) {
      setErrorMsg('기획 정보 또는 아이디어가 없습니다. 처음부터 다시 시작해주세요.');
      return;
    }

    try {
      // ── 1. 훅 선택 ──────────────────────────────────────────────
      setStatus(0, 'processing');
      const hooks = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateHooks()
        : await generateHooks(settings.geminiApiKey, planning, selectedIdea);
      setHooks(hooks);
      selectHook(hooks[0]);
      setStatus(0, 'done');

      // ── 2. 대본 + 구성 분리 ──────────────────────────────────────
      setStatus(1, 'processing');
      const rawSplit = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateScriptSplit()
        : await generateScriptSplit(settings.geminiApiKey, planning, selectedIdea, hooks[0]);

      // Apply uploaded media to the split before saving
      const split = { ...rawSplit };
      if (simpleUploads?.videoUrl) {
        split.veo_core_clip = { ...split.veo_core_clip, videoUrl: simpleUploads.videoUrl, status: 'done' };
      }
      if (simpleUploads?.photoUrls && simpleUploads.photoUrls.length > 0) {
        split.slide_scenes = split.slide_scenes.map((scene, idx) =>
          simpleUploads.photoUrls[idx]
            ? { ...scene, imageUrl: simpleUploads.photoUrls[idx], imageStatus: 'done' as const }
            : scene
        );
      }
      setScriptSplit(split);
      setStatus(1, 'done');

      // ── 3. Veo 클립 (프롬프트는 split에 포함, 생성은 스킵) ────────
      setStatus(2, 'processing');
      await delay(900);
      setStatus(2, 'done');

      // ── 4. 슬라이드 씬 (구조는 split에 포함, 이미지 생성은 스킵) ──
      setStatus(3, 'processing');
      await delay(700);
      setStatus(3, 'done');

      // ── 5. 자막/나레이션 기본값 적용 ─────────────────────────────
      setStatus(4, 'processing');
      await delay(500);
      setSubtitleNarration(DEFAULT_NARRATION);
      setStatus(4, 'done');

      // 완료 → 스토리보드로
      await delay(800);
      setStep('storyboard');

    } catch (e) {
      const failedIdx = items.findIndex(it => it.status === 'processing');
      if (failedIdx >= 0) setStatus(failedIdx, 'error');
      setErrorMsg(e instanceof Error ? e.message : '자동 처리 중 오류가 발생했습니다.');
    }
  }

  const doneCount = items.filter(it => it.status === 'done').length;
  const progress = Math.round((doneCount / items.length) * 100);
  const hasError = !!errorMsg;

  return (
    <div className="slide-up max-w-xl mx-auto py-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI가 자동으로 처리 중</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {hasError ? '오류가 발생했습니다.' : doneCount === items.length ? '모든 단계 완료! 스토리보드로 이동합니다...' : '잠시만 기다려주세요. 영상 구성을 준비하고 있습니다.'}
        </p>
      </div>

      {/* Process list */}
      <div className="space-y-3 mb-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${
              item.status === 'done'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : item.status === 'processing'
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-sm'
                : item.status === 'error'
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-50'
            }`}
          >
            {/* Status icon */}
            <div className="shrink-0 mt-0.5">
              {item.status === 'done' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              {item.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {item.status === 'idle' && <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${
                  item.status === 'done' ? 'text-emerald-700 dark:text-emerald-400'
                  : item.status === 'processing' ? 'text-blue-700 dark:text-blue-300'
                  : item.status === 'error' ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {idx + 3}단계 — {item.label}
                </p>
                {item.status === 'processing' && (
                  <span className="text-xs text-blue-500 dark:text-blue-400 animate-pulse">처리 중...</span>
                )}
                {item.status === 'done' && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">완료</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {!hasError && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold mb-1">오류 발생</p>
          <p>{errorMsg}</p>
          <button
            type="button"
            onClick={() => { setErrorMsg(''); ran.current = false; setItems(prev => prev.map(it => ({ ...it, status: 'idle' }))); runAutoProcess(); }}
            className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400 underline"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
