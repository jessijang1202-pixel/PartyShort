import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, Film, Copy, Play, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import CopyButton from '../ui/CopyButton';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateVideoPromptPackage } from '../../services/gemini.service';
import { mockGenerateVideoPackage, mockSimulateVideoGeneration } from '../../services/mock.service';
import { formatFlowPromptForCopy, getFlowSetupGuide } from '../../services/flow.service';

const STATUS_LABELS: Record<string, { label: string; badge: 'default' | 'blue' | 'green' | 'yellow' }> = {
  pending:    { label: '대기중', badge: 'default' },
  generating: { label: '생성중', badge: 'yellow' },
  done:       { label: '완료', badge: 'green' },
  error:      { label: '오류', badge: 'red' as any },
};

export default function VideoStep() {
  const { session, settings, setVideoPackage, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!session.videoPackage && session.planning && session.selectedIdea && session.selectedHook && session.script) {
      doGenerate();
    }
  }, []);

  async function doGenerate() {
    if (!session.planning || !session.selectedIdea || !session.selectedHook || !session.script) return;
    setLoading(true);
    setError('');
    try {
      const hasImages = (session.planning.uploadedAssets?.length ?? 0) > 0 || session.imagePrompts.length > 0;
      const pkg = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateVideoPackage()
        : await generateVideoPromptPackage(
            settings.geminiApiKey,
            session.planning,
            session.selectedIdea,
            session.selectedHook,
            session.script,
            hasImages,
          );
      setVideoPackage(pkg);
    } catch (e) {
      setError(`영상 프롬프트 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setLoading(false);
    }
  }

  async function doSimulate() {
    if (!session.videoPackage) return;
    setSimulating(true);
    try {
      await mockSimulateVideoGeneration(session.videoPackage, (updated) => {
        setVideoPackage(updated);
      });
    } finally {
      setSimulating(false);
    }
  }

  if (loading) return <LoadingOverlay label="AI가 영상 프롬프트를 구성하고 있습니다..." />;

  const pkg = session.videoPackage;

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">영상 생성</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Google Flow에서 사용할 영상 프롬프트 패키지
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <Alert variant="info" title="Google Flow 안내">
        영상 생성은 <strong>Google Flow (labs.google/flow)</strong>에서 아래 프롬프트를 사용하세요.
        직접 API 연동은 추후 지원 예정입니다.
      </Alert>

      {!pkg ? (
        <div className="text-center py-12 text-slate-400">
          <Film className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>영상 프롬프트를 생성해주세요.</p>
        </div>
      ) : (
        <>
          {/* Overview */}
          <div className="wizard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">마스터 프롬프트</h3>
              <div className="flex gap-2">
                <Badge variant={pkg.mode === 'image-to-video' ? 'purple' : 'blue'}>
                  {pkg.mode === 'image-to-video' ? '이미지→영상' : '텍스트→영상'}
                </Badge>
                <Badge variant="default">{pkg.aspectRatio}</Badge>
                <Badge variant="default">{pkg.estimatedDuration}</Badge>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-3">
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{pkg.masterPrompt}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <CopyButton text={pkg.masterPrompt} label="마스터 프롬프트 복사" />
              <CopyButton text={formatFlowPromptForCopy(pkg)} label="전체 패키지 복사" />
            </div>
          </div>

          {/* Style & continuity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="wizard-card">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2">스타일 지침</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pkg.styleInstructions}</p>
            </div>
            <div className="wizard-card">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2">연속성 지침</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pkg.continuityInstructions}</p>
            </div>
          </div>

          {/* Scene cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">씬별 프롬프트</h3>
              {settings.useMockMode && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  onClick={doSimulate}
                  disabled={simulating || pkg.status === 'done'}
                >
                  {simulating ? '생성 시뮬레이션 중...' : '생성 시뮬레이션'}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {pkg.scenes.map(scene => {
                const { label, badge } = STATUS_LABELS[scene.status] ?? STATUS_LABELS.pending;
                return (
                  <div key={scene.sceneNumber} className="wizard-card">
                    <div className="flex items-start gap-3">
                      <div className={clsx(
                        'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                        scene.status === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                        scene.status === 'generating' ? 'bg-blue-100 dark:bg-blue-900/40' :
                        'bg-slate-100 dark:bg-slate-700',
                      )}>
                        {scene.status === 'done' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : scene.status === 'generating' ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : (
                          <Film className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-800 dark:text-slate-200">씬 {scene.sceneNumber}</span>
                          <Badge variant="default">{scene.duration}</Badge>
                          <Badge variant={badge as any}>{label}</Badge>
                        </div>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">{scene.prompt}</p>
                        {scene.ingredients.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {scene.ingredients.map((ing, i) => (
                              <Badge key={i} variant="default">{ing}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <CopyButton text={scene.prompt} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow guide */}
          <div className="wizard-card">
            <button
              className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 dark:text-slate-300"
              onClick={() => setShowGuide(g => !g)}
            >
              <span>Google Flow 사용 가이드</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            {showGuide && (
              <ol className="mt-3 space-y-2">
                {getFlowSetupGuide().map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('safety')}>
          이전
        </Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('preview')} disabled={!pkg}>
          미리보기/승인으로
        </Button>
      </div>
    </div>
  );
}
