import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import CopyButton from '../ui/CopyButton';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateScript } from '../../services/gemini.service';
import { mockGenerateScript } from '../../services/mock.service';
import type { ScenePlan } from '../../types';

const SCENE_COLORS = [
  'bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800',
  'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800',
  'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
  'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
  'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
];

function SceneCard({ scene, colorClass }: { scene: ScenePlan; colorClass: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">씬 {scene.sceneNumber}</span>
          <Badge variant="default">{scene.timeRange}</Badge>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{scene.title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-medium">{scene.narration}</p>
      {expanded && (
        <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-black/10 dark:border-white/10 pt-3">
          <div><span className="font-semibold">화면 자막:</span> {scene.onScreenText}</div>
          <div><span className="font-semibold">시각 설명:</span> {scene.visualDescription}</div>
          <div><span className="font-semibold">카메라:</span> {scene.cameraFraming}</div>
          <div><span className="font-semibold">텍스트 오버레이:</span> {scene.textOverlay}</div>
        </div>
      )}
    </div>
  );
}

export default function ScriptStep() {
  const { session, settings, setScript, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!session.script && session.planning && session.selectedIdea && session.selectedHook) {
      doGenerate();
    }
  }, []);

  async function doGenerate() {
    if (!session.planning || !session.selectedIdea || !session.selectedHook) return;
    setLoading(true);
    setError('');
    try {
      const script = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateScript()
        : await generateScript(
            settings.geminiApiKey,
            session.planning,
            session.selectedIdea,
            session.selectedHook,
          );
      setScript(script);
    } catch (e) {
      setError(`대본 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingOverlay label="AI가 대본을 작성하고 있습니다..." />;

  const script = session.script;

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">대본 생성</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">30초 숏폼 영상 대본을 확인하세요</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {!script ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>대본을 생성해주세요.</p>
        </div>
      ) : (
        <>
          {/* Reading time */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>예상 낭독 시간: <strong className="text-slate-700 dark:text-slate-300">{script.estimatedReadingTime}</strong></span>
          </div>

          {/* Full script */}
          <div className="wizard-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                전체 대본
              </h3>
              <CopyButton text={script.fullScript} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {script.fullScript}
              </pre>
            </div>
          </div>

          {/* Structure breakdown */}
          <div className="wizard-card">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">구조별 분해</h3>
            <div className="grid gap-3">
              {[
                { label: '🔴 문제 (Problem)', text: script.structure.problem, bg: 'bg-red-50 dark:bg-red-950/20' },
                { label: '🟡 공감 (Empathy)', text: script.structure.empathy, bg: 'bg-amber-50 dark:bg-amber-950/20' },
                { label: '🟢 해결 (Solution)', text: script.structure.solution, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                { label: '🔵 행동 (Action)', text: script.structure.action, bg: 'bg-blue-50 dark:bg-blue-950/20' },
              ].map(({ label, text, bg }) => (
                <div key={label} className={`rounded-xl p-3 ${bg}`}>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scene breakdown */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">씬별 구성</h3>
            <div className="space-y-3">
              {script.scenes.map((scene, idx) => (
                <SceneCard key={scene.sceneNumber} scene={scene} colorClass={SCENE_COLORS[idx % SCENE_COLORS.length]} />
              ))}
            </div>
          </div>

          {/* Advanced: Narration script */}
          <div className="wizard-card">
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setShowAdvanced(a => !a)}
            >
              <span className="font-semibold text-slate-900 dark:text-white text-sm">나레이션 스크립트</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
            </button>
            {showAdvanced && (
              <div className="mt-3">
                <div className="flex justify-end mb-2">
                  <CopyButton text={script.narrationScript} label="나레이션 복사" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {script.narrationScript}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('hooks')}>
          이전
        </Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('media')} disabled={!script}>
          비주얼 자산으로
        </Button>
      </div>
    </div>
  );
}
