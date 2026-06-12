import { useState, useRef } from 'react';
import { Upload, X, Sparkles, ChevronRight, Video, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import { CATEGORIES, TONE_OPTIONS, type PlanningInput, type VisualAsset, type Category } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { analyzeImage } from '../../services/gemini.service';
import { mockAnalyzeImage, DEMO_PLANNING_AUTOFILL } from '../../services/mock.service';

export default function PlanningStep() {
  const { session, settings, updatePlanning, setStep } = useApp();

  const initial: PlanningInput = session.planning ?? {
    identity: '', category: '조국대표님' as Category, topic: '',
    mainPoints: ['', '', ''] as [string, string, string],
    uploadedAssets: [], bannedExpressions: '', tone: '',
  };

  const [form, setForm] = useState<PlanningInput>(initial);
  const [selectedTones, setSelectedTones] = useState<string[]>(() =>
    initial.tone ? initial.tone.split(', ').filter(Boolean) : [],
  );
  const [customTone, setCustomTone] = useState('');
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PlanningInput>(key: K, val: PlanningInput[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setPoint = (i: number, val: string) => {
    const pts = [...form.mainPoints] as [string, string, string];
    pts[i] = val;
    set('mainPoints', pts);
  };

  const toggleTone = (t: string) =>
    setSelectedTones(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newAssets: VisualAsset[] = files.map(f => ({
      id: `a_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: f.type.startsWith('image/') ? 'image' : 'video',
      file: f, url: URL.createObjectURL(f), name: f.name,
    }));
    set('uploadedAssets', [...form.uploadedAssets, ...newAssets]);
    for (const asset of newAssets) {
      if (asset.type !== 'image') continue;
      setAnalyzingIds(prev => new Set(prev).add(asset.id));
      try {
        const summary = settings.useMockMode || !settings.geminiApiKey
          ? await mockAnalyzeImage(asset.file!)
          : await analyzeImage(settings.geminiApiKey, asset.file!);
        setForm(f => ({
          ...f,
          uploadedAssets: f.uploadedAssets.map(a =>
            a.id === asset.id ? { ...a, aiSummary: summary, editedSummary: summary } : a,
          ),
        }));
      } catch { /* silent */ } finally {
        setAnalyzingIds(prev => { const s = new Set(prev); s.delete(asset.id); return s; });
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function validate() {
    if (!form.identity.trim()) return '내 소개를 입력해주세요.';
    if (!form.topic.trim()) return '주제를 입력해주세요.';
    if (form.mainPoints.some(p => !p.trim())) return '주요 포인트 3개를 모두 입력해주세요.';
    if (selectedTones.length === 0 && !customTone.trim()) return '원하는 말투를 선택하거나 입력해주세요.';
    return '';
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    const tone = selectedTones.length > 0
      ? [...selectedTones, ...(customTone.trim() ? [customTone.trim()] : [])].join(', ')
      : customTone.trim();
    updatePlanning({ ...form, tone });
    setStep('ideas');
  }

  function autoFill() {
    setForm({ ...DEMO_PLANNING_AUTOFILL, uploadedAssets: [] });
    setSelectedTones(['따뜻한', '진중한']);
    setCustomTone('');
    setError('');
  }

  return (
    <div className="slide-up space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">기획 입력</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">영상 제작의 첫 단계입니다</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />} onClick={autoFill}>
          예시 자동 채우기
        </Button>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Identity */}
      <div className="wizard-card space-y-2">
        <label className="section-label">내 소개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">나는 누구인가요?</p>
        <input className="input-base" placeholder="예: 조국혁신당 당원, 청년 지지자" value={form.identity} onChange={e => set('identity', e.target.value)} />
      </div>

      {/* Category */}
      <div className="wizard-card space-y-3">
        <label className="section-label">카테고리 *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => set('category', cat)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                form.category === cat
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
              )}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="wizard-card space-y-2">
        <label className="section-label">주제 *</label>
        <input className="input-base" placeholder="예: 조국님 수고하셨습니다. 재선거 낙선 이후 이야기" value={form.topic} onChange={e => set('topic', e.target.value)} />
      </div>

      {/* Main Points */}
      <div className="wizard-card space-y-3">
        <label className="section-label">주요 포인트 3개 *</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">각 포인트를 한 줄로 요약해 주세요</p>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-2 items-center">
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <input className="input-base"
              placeholder={['예: 선거 과정에서 보여주신 헌신과 진정성', '예: 낙선 이후에도 계속되는 가치와 메시지', '예: 지지자들이 함께 이어갈 응원과 행동'][i]}
              value={form.mainPoints[i]} onChange={e => setPoint(i, e.target.value)} />
          </div>
        ))}
      </div>

      {/* File Upload */}
      <div className="wizard-card space-y-3">
        <label className="section-label">사진 또는 영상 업로드 (선택)</label>
        <p className="text-xs text-slate-500 dark:text-slate-400">업로드 시 AI가 내용을 분석하여 씬 구성에 활용합니다.</p>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-7 flex flex-col items-center gap-2 hover:border-blue-400 transition-colors">
          <Upload className="w-6 h-6 text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">클릭하여 파일 선택</span>
          <span className="text-xs text-slate-400">이미지 또는 동영상 (세로 비율 권장)</span>
        </button>
        {form.uploadedAssets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.uploadedAssets.map(asset => (
              <div key={asset.id} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {asset.type === 'image'
                  ? <img src={asset.url} alt={asset.name} className="w-full h-24 object-cover" />
                  : <div className="w-full h-24 flex items-center justify-center"><Video className="w-8 h-8 text-slate-400" /></div>
                }
                <button onClick={() => set('uploadedAssets', form.uploadedAssets.filter(a => a.id !== asset.id))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                  <X className="w-3 h-3" />
                </button>
                <div className="p-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{asset.name}</p>
                  {analyzingIds.has(asset.id)
                    ? <div className="flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin text-blue-500" /><span className="text-xs text-blue-500">분석 중...</span></div>
                    : asset.editedSummary
                      ? <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-2">✓ {asset.editedSummary}</p>
                      : null
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banned Expressions */}
      <div className="wizard-card space-y-2">
        <label className="section-label">꼭 피해야 할 표현</label>
        <textarea className="input-base resize-none" rows={3}
          placeholder="예: 상대 진영에 대한 조롱이나 모욕, 증거 없는 부정선거 단정"
          value={form.bannedExpressions} onChange={e => set('bannedExpressions', e.target.value)} />
      </div>

      {/* Tone */}
      <div className="wizard-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="section-label">원하는 말투 *</label>
          {selectedTones.length > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{selectedTones.length}개 선택됨</span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">여러 개 중복 선택 가능합니다.</p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(t => {
            const active = selectedTones.includes(t);
            return (
              <button key={t} onClick={() => { toggleTone(t); setCustomTone(''); }}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all flex items-center gap-1.5',
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                )}>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                {t}
              </button>
            );
          })}
        </div>
        {selectedTones.length > 0 && (
          <p className="text-xs text-slate-500">선택: <span className="text-blue-600 dark:text-blue-400 font-medium">{selectedTones.join(', ')}</span></p>
        )}
        <input className="input-base" placeholder="직접 추가 (예: 희망적인, 열정적인)" value={customTone} onChange={e => setCustomTone(e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} onClick={handleNext}>
          아이디어 생성하기
        </Button>
      </div>
    </div>
  );
}
