import { useState } from 'react';
import { ChevronRight, ChevronLeft, Video, Play, RefreshCcw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { VeoCoreClip } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { mockGenerateVeoClip } from '../../services/mock.service';
import { generateVeoClip } from '../../services/veo.service';

export default function VeoClipStep() {
  const { session, settings, updateVeoClip, setStep } = useApp();
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const clip = session.scriptSplit?.veo_core_clip;
  if (!clip) return null;

  const isIdle = clip.status === 'idle';
  const isPending = clip.status === 'pending' || clip.status === 'generating';
  const isDone = clip.status === 'done';
  const isError = clip.status === 'error';

  async function handleGenerate() {
    if (!clip) return;
    setError(''); setProgress('');
    updateVeoClip({ ...clip, status: 'pending', errorMessage: undefined });

    const onProgress = (msg: string) => {
      setProgress(msg);
      updateVeoClip({ ...clip, status: 'generating', errorMessage: undefined });
    };

    try {
      if (settings.useMockMode || !settings.geminiApiKey) {
        await mockGenerateVeoClip(clip, onProgress);
        updateVeoClip({ ...clip, status: 'done' });
      } else {
        const result = await generateVeoClip(
          settings.geminiApiKey,
          { prompt: clip.prompt, durationSeconds: clip.duration },
          onProgress,
        );
        updateVeoClip({ ...clip, status: 'done', videoUrl: result.videoUrl });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(msg);
      updateVeoClip({ ...clip, status: 'error', errorMessage: msg });
    }
  }

  function handleSkip() {
    if (!clip) return;
    updateVeoClip({ text: clip.text, prompt: clip.prompt, duration: clip.duration, status: 'done' });
    setStep('slides');
  }

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Veo 핵심 클립 생성</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Veo 3.1 Lite로 첫 {clip.duration}초 AI 영상을 생성합니다
        </p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {settings.useMockMode && (
        <Alert variant="warning">
          <span className="font-medium">데모 모드:</span> 실제 영상은 생성되지 않으며 시뮬레이션만 실행됩니다.
          실제 생성을 원하면 설정에서 Gemini API 키를 입력하세요.
        </Alert>
      )}

      {/* Clip Info */}
      <div className="wizard-card border-2 border-blue-200 dark:border-blue-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">핵심 클립</h3>
            <p className="text-xs text-slate-500">9:16 세로형 · {clip.duration}초 · Veo 3.1 Lite</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">나레이션 내용</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2.5">
              {clip.text}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Veo 프롬프트 (영문)</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 leading-relaxed">
              {clip.prompt}
            </p>
          </div>
        </div>

        {/* Generation Area */}
        {isIdle && (
          <Button size="lg" className="w-full" leftIcon={<Video className="w-4 h-4" />} onClick={handleGenerate}>
            Veo 클립 생성 시작
          </Button>
        )}

        {isPending && (
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">영상 생성 중...</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{progress || 'Veo API에 요청 중...'}</p>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500">Veo 영상 생성은 최대 3–5분 소요될 수 있습니다</p>
          </div>
        )}

        {isDone && (
          <div className="space-y-3">
            {clip.videoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-80 mx-auto max-w-[180px]">
                <video
                  src={clip.videoUrl}
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">시뮬레이션 완료 (데모 모드)</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">실제 API 키 사용 시 영상이 여기에 표시됩니다</p>
                </div>
              </div>
            )}
            <Button variant="secondary" size="sm" className="w-full" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={handleGenerate}>
              다시 생성
            </Button>
          </div>
        )}

        {isError && (
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">생성 실패</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{clip.errorMessage}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={handleGenerate}>
              다시 시도
            </Button>
          </div>
        )}
      </div>

      {/* Note about Flow */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        이 클립은 슬라이드 씬과 함께 스토리보드에서 통합됩니다. Google Flow 내보내기는 향후 업데이트에서 지원될 예정입니다.
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('script-split')}>이전</Button>
        <div className="flex gap-2">
          {isIdle && (
            <Button variant="secondary" leftIcon={<Play className="w-4 h-4" />} onClick={handleSkip}>
              건너뛰기
            </Button>
          )}
          <Button rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => setStep('slides')}
            disabled={isIdle || isPending}>
            슬라이드 씬으로
          </Button>
        </div>
      </div>
    </div>
  );
}
