import { useState } from 'react';
import { ChevronRight, ChevronLeft, Image, RefreshCcw, Loader2, CheckCircle, AlertCircle, Edit2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { SlideScene } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { buildSlideImagePrompt } from '../../prompts';
import { generateSlideImage } from '../../services/imagen.service';
import { mockGenerateSlideImage } from '../../services/mock.service';

export default function SlidesStep() {
  const { session, settings, updateSlideScene, setStep } = useApp();
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});

  const scenes = session.scriptSplit?.slide_scenes ?? [];
  const idea = session.selectedIdea;

  async function generateImage(scene: SlideScene) {
    updateSlideScene({ ...scene, imageStatus: 'generating', imageUrl: undefined });
    try {
      const prompt = buildSlideImagePrompt(scene, idea!);
      const result = settings.useMockMode || !settings.geminiApiKey
        ? { imageUrl: await mockGenerateSlideImage(scene) }
        : await generateSlideImage(settings.geminiApiKey, prompt);
      updateSlideScene({ ...scene, imageStatus: 'done', imageUrl: result.imageUrl });
    } catch (e) {
      updateSlideScene({ ...scene, imageStatus: 'error' });
      setError(`씬 ${scene.scene_title} 이미지 생성 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
    }
  }

  async function generateAllImages() {
    setError('');
    for (const scene of scenes) {
      if (scene.imageStatus !== 'done') await generateImage(scene);
    }
  }

  function startEdit(scene: SlideScene) {
    setEditingId(scene.scene_id);
    setEditTexts(t => ({ ...t, [scene.scene_id]: scene.on_screen_text }));
  }

  function saveEdit(scene: SlideScene) {
    const text = editTexts[scene.scene_id] ?? scene.on_screen_text;
    updateSlideScene({ ...scene, on_screen_text: text });
    setEditingId(null);
  }

  const allDone = scenes.length > 0 && scenes.every(s => s.imageStatus === 'done');
  const anyGenerating = scenes.some(s => s.imageStatus === 'generating');

  return (
    <div className="slide-up space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">슬라이드 씬</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {scenes.length}개 씬 · {scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}초
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Image className="w-3.5 h-3.5" />}
          onClick={generateAllImages} loading={anyGenerating} disabled={anyGenerating}>
          전체 이미지 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {settings.useMockMode && (
        <Alert variant="info">
          데모 모드: SVG 플레이스홀더 이미지가 생성됩니다. 실제 이미지는 Gemini API 키 설정 후 생성하세요.
        </Alert>
      )}

      <div className="space-y-4">
        {scenes.map((scene, idx) => (
          <div key={scene.scene_id}
            className="wizard-card space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{scene.scene_title}</p>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{scene.duration_seconds}초</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={scene.imageStatus} />
            </div>

            {/* Main content: image + text */}
            <div className="flex gap-3">
              {/* Image preview */}
              <div className={clsx(
                'shrink-0 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800',
                'aspect-[9/16]',
              )}>
                {scene.imageStatus === 'generating' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={scene.scene_title} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-6 h-6 text-slate-300" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* On-screen text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-500">화면 텍스트</p>
                    <button onClick={() => editingId === scene.scene_id ? saveEdit(scene) : startEdit(scene)}
                      className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                      <Edit2 className="w-3 h-3" />
                      {editingId === scene.scene_id ? '저장' : '편집'}
                    </button>
                  </div>
                  {editingId === scene.scene_id ? (
                    <textarea
                      className="input-base text-sm resize-none"
                      rows={3}
                      value={editTexts[scene.scene_id] ?? scene.on_screen_text}
                      onChange={e => setEditTexts(t => ({ ...t, [scene.scene_id]: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium leading-relaxed">
                      {scene.on_screen_text}
                    </p>
                  )}
                </div>

                {/* Narration */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">나레이션</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{scene.narration_text}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button variant="secondary" size="sm"
                leftIcon={scene.imageStatus === 'generating' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                onClick={() => generateImage(scene)}
                disabled={scene.imageStatus === 'generating'}>
                {scene.imageStatus === 'done' ? '이미지 재생성' : '이미지 생성'}
              </Button>
              {scene.imageStatus === 'error' && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />생성 실패
                </span>
              )}
              {scene.imageStatus === 'done' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />완료
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!allDone && (
        <Alert variant="info">
          이미지를 생성하지 않아도 스토리보드로 진행할 수 있습니다. 이미지는 나중에 생성해도 됩니다.
        </Alert>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('veo-clip')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('storyboard')}>
          스토리보드 보기
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SlideScene['imageStatus'] }) {
  if (status === 'idle') return <span className="text-xs text-slate-400">대기 중</span>;
  if (status === 'generating') return (
    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
      <Loader2 className="w-3 h-3 animate-spin" />생성 중
    </span>
  );
  if (status === 'done') return (
    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="w-3 h-3" />완료
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3" />오류
    </span>
  );
  return null;
}
