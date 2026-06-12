import { useState, useRef } from 'react';
import { Upload, X, Sparkles, ChevronRight, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import { CATEGORIES, TONE_OPTIONS, type PlanningInput, type VisualAsset, type Category } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { analyzeImage } from '../../services/gemini.service';
import { mockAnalyzeImage } from '../../services/mock.service';

const DEMO_FILL: PlanningInput = {
  identity: '조국혁신당 당원',
  category: '정책',
  topic: '검찰개혁',
  mainPoints: ['국민 관점에서 바라본 검찰 권력 문제', '왜 지금 검찰개혁이 중요한가', '검찰개혁이 내 일상 생활과 어떻게 연결되는가'],
  uploadedAssets: [],
  bannedExpressions: '과격한 비난, 확인되지 않은 단정',
  tone: '쉬운',
};

export default function PlanningStep() {
  const { session, settings, updatePlanning, setStep } = useApp();

  const initial = session.planning ?? {
    identity: '', category: '정책' as Category, topic: '',
    mainPoints: ['', '', ''] as [string, string, string],
    uploadedAssets: [], bannedExpressions: '', tone: '',
  };

  const [form, setForm] = useState<PlanningInput>(initial);
  // 말투 복수 선택: form.tone은 저장 시 join(",  ")로 병합
  const [selectedTones, setSelectedTones] = useState<string[]>(() =>
    initial.tone ? initial.tone.split(', ').filter(Boolean) : [],
  );
  const [customTone, setCustomTone] = useState('');
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PlanningInput>(key: K, val: PlanningInput[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setPoint = (idx: number, val: string) => {
    const pts = [...form.mainPoints] as [string, string, string];
    pts[idx] = val;
    set('mainPoints', pts);
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newAssets: VisualAsset[] = files.map(f => ({
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: f.type.startsWith('image/') ? 'image' : 'video',
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));

    set('uploadedAssets', [...form.uploadedAssets, ...newAssets]);

    // AI analysis for images
    for (const asset of newAssets) {
      if (asset.type !== 'image') continue;
      setAnalyzingIds(prev => new Set(prev).add(asset.id));
      try {
        const summary = settings.useMockMode || !settings.geminiApiKey
          ? await mockAnalyzeImage(asset.file!)
          : await analyzeImage(settings.geminiApiKey, asset.file!);
        set('uploadedAssets', (form.uploadedAssets.concat(newAssets)).map(a =>
          a.id === asset.id ? { ...a, aiSummary: summary } : a,
        ));
      } catch {
        // silently fail image analysis
      } finally {
        setAnalyzingIds(prev => { const s = new Set(prev); s.delete(asset.id); return s; });
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeAsset(id: string) {
    set('uploadedAssets', form.uploadedAssets.filter(a => a.id !== id));
  }

  function toggleTone(t: string) {
    setSelectedTones(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t],
    );
    setCustomTone('');
  }

  function validate(): string {
    if (!form.identity.trim()) return '내 소개를 입력해주세요.';
    if (!form.topic.trim()) return '주제를 입력해주세요.';
    if (form.mainPoints.some(p => !p.trim())) return '주요 포인트 3개를 모두 입력해주세요.';
    if (selectedTones.length === 0 && !customTone.trim()) return '원하는 말투를 선택하거나 입력해주세요.';
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    const finalTone = selectedTones.length > 0
      ? [...selectedTones, ...(customTone.trim() ? [customTone.trim()] : [])].join(', ')
      : customTone.trim();
    updatePlanning({ ...form, tone: finalTone });
    setStep('ideas');
  }

  function autoFill() {
    setForm(DEMO_FILL);
    setSelectedTones(['쉬운']);
    setCustomTone('');
    setError('');
  }

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">기획 입력</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            영상 제작을 위한 기본 정보를 입력해주세요
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />} onClick={autoFill}>
          데모 자동입력
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Identity */}
      <div className="wizard-card space-y-2">
        <label className="section-label">내 소개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">나는 누구인가요? 짧게 입력해주세요.</p>
        <input
          className="input-base"
          placeholder="예: 조국혁신당 당원"
          value={form.identity}
          onChange={e => set('identity', e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="wizard-card space-y-3">
        <label className="section-label">카테고리 *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => set('category', cat)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200',
                form.category === cat
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="wizard-card space-y-2">
        <label className="section-label">주제 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">30초 영상으로 전달할 핵심 주제를 입력하세요.</p>
        <input
          className="input-base"
          placeholder="예: 검찰개혁"
          value={form.topic}
          onChange={e => set('topic', e.target.value)}
        />
      </div>

      {/* Main Points */}
      <div className="wizard-card space-y-3">
        <label className="section-label">주요 포인트 3개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">영상에서 강조할 핵심 포인트를 3가지 입력하세요.</p>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-2 items-center">
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <input
              className="input-base"
              placeholder={['예: 국민 관점에서 바라본 문제', '예: 왜 지금 중요한가', '예: 내 생활과의 연결'][i]}
              value={form.mainPoints[i]}
              onChange={e => setPoint(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Media Upload */}
      <div className="wizard-card space-y-3">
        <label className="section-label">사진 또는 영상 업로드 (선택)</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          업로드 시 AI가 내용을 분석하여 씬에 자동으로 활용합니다.
        </p>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
          <Upload className="w-6 h-6 text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">클릭하여 파일 선택</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">이미지 또는 동영상 파일</span>
        </button>

        {/* Asset previews */}
        {form.uploadedAssets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.uploadedAssets.map(asset => (
              <div key={asset.id} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center">
                    <Video className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{asset.name}</p>
                  {analyzingIds.has(asset.id) ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span className="text-xs text-blue-500">AI 분석 중...</span>
                    </div>
                  ) : asset.aiSummary ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-2">
                      ✓ {asset.aiSummary}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banned Expressions */}
      <div className="wizard-card space-y-2">
        <label className="section-label">꼭 피해야 할 표현</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          영상에서 사용하지 말아야 할 표현이 있으면 입력해주세요.
        </p>
        <textarea
          className="input-base resize-none"
          rows={3}
          placeholder="예: 과격한 비난, 확인되지 않은 단정, 특정인 실명 비방"
          value={form.bannedExpressions}
          onChange={e => set('bannedExpressions', e.target.value)}
        />
      </div>

      {/* Tone */}
      <div className="wizard-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="section-label">원하는 말투 *</label>
          {selectedTones.length > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {selectedTones.length}개 선택됨
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">여러 개 중복 선택 가능합니다.</p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(t => {
            const active = selectedTones.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTone(t)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 flex items-center gap-1.5',
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300',
                )}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                {t}
              </button>
            );
          })}
        </div>
        {selectedTones.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            선택: <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedTones.join(', ')}</span>
          </p>
        )}
        <input
          className="input-base"
          placeholder="직접 추가 (예: 열정적인, 차분한, 희망적인)"
          value={customTone}
          onChange={e => setCustomTone(e.target.value)}
        />
      </div>

      {/* Next */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          rightIcon={<ChevronRight className="w-5 h-5" />}
          onClick={handleNext}
        >
          아이디어 생성하기
        </Button>
      </div>
    </div>
  );
}
