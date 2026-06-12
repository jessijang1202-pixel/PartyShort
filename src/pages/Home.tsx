import { useNavigate } from 'react-router-dom';
import { Film, Zap, Shield, Download, Settings, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../store/AppContext';
import Button from '../components/ui/Button';

const FEATURES = [
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: 'AI 아이디어 & 대본', desc: 'Gemini AI가 주제와 톤에 맞는 숏폼 아이디어, 훅, 30초 대본을 자동 생성합니다.' },
  { icon: <Film className="w-5 h-5 text-blue-500" />, title: '영상 프롬프트 패키지', desc: 'Google Flow에서 즉시 사용 가능한 씬별 영상 프롬프트를 자동으로 구성합니다.' },
  { icon: <Shield className="w-5 h-5 text-emerald-500" />, title: 'AI 안전 검토', desc: '과격한 표현, 명예훼손 위험, 플랫폼 제재 가능성을 사전 분석합니다.' },
  { icon: <Download className="w-5 h-5 text-violet-500" />, title: '플랫폼별 업로드 카피', desc: 'YouTube Shorts, Instagram Reels, TikTok, 카카오 맞춤 제목·캡션·해시태그 제공.' },
];

const STEPS = [
  '기획 입력',
  '아이디어 선택',
  '훅 선택',
  '대본 생성',
  '비주얼 자산',
  '안전 검토',
  '영상 생성',
  '미리보기/승인',
  '업로드 카피',
];

export default function Home() {
  const navigate = useNavigate();
  const { settings, resetSession } = useApp();

  function handleStart() {
    resetSession();
    navigate('/wizard');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Gemini AI + Google Flow
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          Party Shorts Studio
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-2">
          당원을 위한 30초 숏폼 영상 제작 스튜디오
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xl mx-auto">
          기획부터 업로드 카피까지, AI가 단계별로 안내합니다.
          비전문가도 한 번의 세션으로 완성도 높은 정치 숏폼 영상을 만들 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />} onClick={handleStart}>
            영상 제작 시작하기
          </Button>
          <Button size="lg" variant="secondary" leftIcon={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
            API 키 설정
          </Button>
        </div>

        {/* Mock mode indicator */}
        <div className="mt-4">
          {settings.useMockMode ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              데모 모드 (Mock) — API 키 없이 체험 가능
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3" />
              Gemini API 연결됨
            </span>
          )}
        </div>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {FEATURES.map((f) => (
          <div key={f.title} className="wizard-card flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {f.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step flow */}
      <div className="wizard-card mb-12">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4 text-center">9단계 제작 워크플로우</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo scenario */}
      <div className="wizard-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <h2 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          데모 시나리오 포함
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          "기획 입력" 단계에서 <strong>데모 자동입력</strong> 버튼을 누르면 아래 샘플 데이터로 바로 체험해볼 수 있습니다.
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div><span className="font-medium text-slate-800 dark:text-slate-200">소개:</span> 조국혁신당 당원</div>
            <div><span className="font-medium text-slate-800 dark:text-slate-200">카테고리:</span> 정책</div>
            <div><span className="font-medium text-slate-800 dark:text-slate-200">주제:</span> 검찰개혁</div>
            <div><span className="font-medium text-slate-800 dark:text-slate-200">말투:</span> 쉽고 단호한</div>
          </div>
        </div>
        <Button variant="primary" className="mt-4 w-full sm:w-auto" onClick={handleStart}>
          데모로 바로 시작하기
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
        Party Shorts Studio — 세션 중 데이터만 보관됩니다. API 키는 브라우저에만 저장됩니다.
      </p>
    </div>
  );
}
