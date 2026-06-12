import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, Image as ImageIcon, Wand2 } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { VisualAsset, ScenePlan } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import CopyButton from '../ui/CopyButton';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateImagePrompts } from '../../services/gemini.service';
import { mockGenerateImagePrompts } from '../../services/mock.service';

function AssetSceneAssigner({
  assets,
  scenes,
  onAssign,
}: {
  assets: VisualAsset[];
  scenes: ScenePlan[];
  onAssign: (assetId: string, sceneNum: number | undefined) => void;
}) {
  return (
    <div className="space-y-4">
      {assets.map(asset => (
        <div key={asset.id} className="wizard-card">
          <div className="flex gap-3 items-start">
            <div className="shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
              {asset.type === 'image' && asset.url ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{asset.name}</p>
              {asset.aiSummary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{asset.aiSummary}</p>
              )}
              <div className="mt-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">씬 배정</label>
                <select
                  value={asset.assignedScene ?? ''}
                  onChange={e => onAssign(asset.id, e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 input-base py-1.5 text-xs"
                >
                  <option value="">배정 안 함</option>
                  {scenes.map(s => (
                    <option key={s.sceneNumber} value={s.sceneNumber}>
                      씬 {s.sceneNumber} ({s.timeRange}) — {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MediaStep() {
  const { session, settings, setImagePrompts, updatePlanning, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasAssets = (session.planning?.uploadedAssets?.length ?? 0) > 0;

  useEffect(() => {
    if (!hasAssets && !session.imagePrompts.length && session.planning && session.selectedIdea && session.script) {
      doGeneratePrompts();
    }
  }, []);

  async function doGeneratePrompts() {
    if (!session.planning || !session.selectedIdea || !session.script) return;
    setLoading(true);
    setError('');
    try {
      const prompts = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateImagePrompts()
        : await generateImagePrompts(
            settings.geminiApiKey,
            session.planning,
            session.selectedIdea,
            session.script,
          );
      setImagePrompts(prompts);
    } catch (e) {
      setError(`이미지 프롬프트 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setLoading(false);
    }
  }

  function handleAssign(assetId: string, sceneNum: number | undefined) {
    if (!session.planning) return;
    const updated = session.planning.uploadedAssets.map(a =>
      a.id === assetId ? { ...a, assignedScene: sceneNum } : a,
    );
    updatePlanning({ ...session.planning, uploadedAssets: updated });
  }

  if (loading) return <LoadingOverlay label="AI가 비주얼 프롬프트를 생성하고 있습니다..." />;

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">비주얼 자산</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {hasAssets ? '업로드된 미디어를 씬에 배정하세요' : 'AI가 생성한 이미지 프롬프트를 확인하세요'}
          </p>
        </div>
        {!hasAssets && (
          <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGeneratePrompts}>
            다시 생성
          </Button>
        )}
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {hasAssets ? (
        <>
          <Alert variant="info">
            업로드된 이미지/영상을 각 씬에 배정하세요. AI가 자동으로 씬을 추천합니다.
          </Alert>
          <AssetSceneAssigner
            assets={session.planning?.uploadedAssets ?? []}
            scenes={session.script?.scenes ?? []}
            onAssign={handleAssign}
          />
        </>
      ) : (
        <>
          <Alert variant="info">
            사진이 없어 AI가 이미지 프롬프트를 생성했습니다. Google Flow 또는 이미지 AI에서 사용하세요.
          </Alert>

          <div className="space-y-4">
            {session.imagePrompts.map((ip) => (
              <div key={ip.id} className="wizard-card">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">씬 {ip.sceneNumber}</Badge>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {ip.visualDescription}
                    </span>
                  </div>
                  <CopyButton text={ip.prompt} label="프롬프트 복사" />
                </div>

                {/* Image placeholder */}
                <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center mb-3">
                  <div className="text-center text-slate-400 dark:text-slate-500">
                    <Wand2 className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">이미지 생성 AI에 아래 프롬프트를 사용하세요</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">{ip.prompt}</p>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge variant="default">{ip.style}</Badge>
                </div>
              </div>
            ))}
          </div>

          {session.imagePrompts.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>이미지 프롬프트를 생성해주세요.</p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('script')}>
          이전
        </Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('safety')}>
          안전 검토로
        </Button>
      </div>
    </div>
  );
}
