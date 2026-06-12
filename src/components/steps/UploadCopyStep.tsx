import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronLeft, Hash, Youtube, Instagram, Share2, MessageSquare, Download, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { PlatformCopy, UploadTitle } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import CopyButton from '../ui/CopyButton';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { generateUploadCopy } from '../../services/gemini.service';
import { mockGenerateUploadCopy } from '../../services/mock.service';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube:   <Youtube className="w-4 h-4 text-red-500" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  tiktok:    <Share2 className="w-4 h-4 text-slate-800 dark:text-slate-200" />,
  kakao:     <MessageSquare className="w-4 h-4 text-yellow-500" />,
};

function TitleCard({ title, selected, onSelect }: { title: UploadTitle; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Badge variant="default" className="mb-2">{title.style}</Badge>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{title.text}</p>
        </div>
        <div className="flex gap-1">
          {selected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
          <CopyButton text={title.text} />
        </div>
      </div>
    </div>
  );
}

function PlatformCard({ copy }: { copy: PlatformCopy }) {
  const fullText = `${copy.title}\n\n${copy.caption}\n\n${copy.hashtags.join(' ')}\n\n${copy.cta}`;
  return (
    <div className="wizard-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {PLATFORM_ICONS[copy.platform]}
          <h4 className="font-semibold text-slate-900 dark:text-white">{copy.platformLabel}</h4>
        </div>
        <CopyButton text={fullText} label="전체 복사" />
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">제목</p>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{copy.title}</p>
            <CopyButton text={copy.title} />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">캡션</p>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{copy.caption}</p>
            <CopyButton text={copy.caption} />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">해시태그</p>
          <div className="flex flex-wrap gap-1">
            {copy.hashtags.map(h => (
              <Badge key={h} variant="blue">{h}</Badge>
            ))}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">CTA</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">{copy.cta}</p>
        </div>
      </div>
    </div>
  );
}

function ExportSummary() {
  const { session } = useApp();
  const { planning, selectedIdea, selectedHook, script, safetyReview, videoPackage, uploadCopy } = session;

  const fullExport = [
    '=== 조국혁신당 숏츠 제작소 — 최종 산출물 ===',
    '',
    `[ 기획 ]`,
    `- 작성자: ${planning?.identity}`,
    `- 카테고리: ${planning?.category}`,
    `- 주제: ${planning?.topic}`,
    `- 말투: ${planning?.tone}`,
    '',
    `[ 선택된 아이디어 ]`,
    selectedIdea?.title ?? '',
    selectedIdea?.summary ?? '',
    '',
    `[ 선택된 훅 ]`,
    `"${selectedHook?.text}" (${selectedHook?.style})`,
    '',
    `[ 최종 대본 ]`,
    script?.fullScript ?? '',
    '',
    `[ 안전 검토 ]`,
    `위험도: ${safetyReview?.riskLevel === 'low' ? '낮음' : safetyReview?.riskLevel === 'medium' ? '중간' : '높음'}`,
    safetyReview?.overallNote ?? '',
    '',
    `[ 제목 옵션 ]`,
    ...(uploadCopy?.titles.map(t => `- [${t.style}] ${t.text}`) ?? []),
    '',
    `[ 해시태그 ]`,
    uploadCopy?.hashtags.join(' ') ?? '',
  ].join('\n');

  return (
    <div className="wizard-card border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Download className="w-4 h-4" />
          전체 산출물 요약
        </h3>
        <CopyButton text={fullExport} label="전체 복사" />
      </div>
      <p className="text-xs text-emerald-600 dark:text-emerald-400">
        모든 기획, 대본, 프롬프트, 업로드 카피를 클립보드에 복사합니다.
      </p>
    </div>
  );
}

export default function UploadCopyStep() {
  const { session, settings, setUploadCopy, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTitleId, setSelectedTitleId] = useState<string>('');

  useEffect(() => {
    if (!session.uploadCopy && session.planning && session.selectedIdea && session.selectedHook) {
      doGenerate();
    }
  }, []);

  async function doGenerate() {
    if (!session.planning || !session.selectedIdea || !session.selectedHook) return;
    setLoading(true);
    setError('');
    try {
      const copy = settings.useMockMode || !settings.geminiApiKey
        ? await mockGenerateUploadCopy()
        : await generateUploadCopy(
            settings.geminiApiKey,
            session.planning,
            session.selectedIdea,
            session.selectedHook,
          );
      setUploadCopy(copy);
    } catch (e) {
      setError(`업로드 카피 생성에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingOverlay label="AI가 업로드 카피를 생성하고 있습니다..." />;

  const copy = session.uploadCopy;

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">업로드 카피</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">제목, 캡션, 해시태그를 플랫폼별로 확인하세요</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doGenerate}>
          다시 생성
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <Alert variant="success" title="제작 완성!">
        모든 단계가 완료되었습니다. 아래 카피를 각 플랫폼에 맞게 사용하세요.
      </Alert>

      {!copy ? (
        <div className="text-center py-12 text-slate-400">
          <Share2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>업로드 카피를 생성해주세요.</p>
        </div>
      ) : (
        <>
          {/* Title options */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">제목 옵션 (3가지)</h3>
            <div className="grid gap-3">
              {copy.titles.map(title => (
                <TitleCard
                  key={title.id}
                  title={title}
                  selected={selectedTitleId === title.id}
                  onSelect={() => setSelectedTitleId(title.id)}
                />
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div className="wizard-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-500" />
                해시태그 세트
              </h3>
              <CopyButton text={copy.hashtags.join(' ')} />
            </div>
            <div className="flex flex-wrap gap-2">
              {copy.hashtags.map(tag => (
                <Badge key={tag} variant="blue">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Platform versions */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">플랫폼별 카피</h3>
            <div className="space-y-4">
              {copy.platformVersions.map(pv => (
                <PlatformCard key={pv.platform} copy={pv} />
              ))}
            </div>
          </div>

          {/* Export summary */}
          <ExportSummary />
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-start pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('preview')}>
          이전 (미리보기)
        </Button>
      </div>
    </div>
  );
}
