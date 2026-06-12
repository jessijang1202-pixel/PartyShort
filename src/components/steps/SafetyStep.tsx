import { useEffect, useState } from 'react';
import { RefreshCcw, ChevronRight, ChevronLeft, Shield, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import type { RiskLevel } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import { LoadingOverlay } from '../ui/LoadingSpinner';
import { runSafetyReview } from '../../services/gemini.service';
import { mockSafetyReview } from '../../services/mock.service';

const RISK_CONFIG: Record<RiskLevel, { label: string; badge: 'green' | 'yellow' | 'red'; desc: string }> = {
  low:    { label: '위험도 낮음', badge: 'green',  desc: '전반적으로 안전한 대본입니다. 공개 전 최종 확인을 권장합니다.' },
  medium: { label: '위험도 중간', badge: 'yellow', desc: '일부 표현을 수정하면 더 안전한 콘텐츠가 됩니다.' },
  high:   { label: '위험도 높음', badge: 'red',    desc: '대본에 위험한 표현이 포함되어 있습니다. 수정 후 재생성을 권장합니다.' },
};

export default function SafetyStep() {
  const { session, settings, setSafetyReview, setScript, setStep } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session.safetyReview && session.script && session.planning) {
      doReview();
    }
  }, []);

  async function doReview() {
    if (!session.script || !session.planning) return;
    setLoading(true);
    setError('');
    try {
      const review = settings.useMockMode || !settings.geminiApiKey
        ? await mockSafetyReview()
        : await runSafetyReview(settings.geminiApiKey, session.script, session.planning);
      setSafetyReview(review);
    } catch (e) {
      setError(`안전 검토에 실패했습니다. ${e instanceof Error ? e.message : ''}`);
    } finally {
      setLoading(false);
    }
  }

  function applySaferScript() {
    if (session.safetyReview?.saferScriptSuggestion && session.script) {
      setScript({ ...session.script, fullScript: session.safetyReview.saferScriptSuggestion });
    }
  }

  if (loading) return <LoadingOverlay label="AI가 안전 검토를 진행하고 있습니다..." />;

  const review = session.safetyReview;

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">안전 검토</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            대본의 위험 요소를 AI가 사전 검토합니다
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={doReview}>
          재검토
        </Button>
      </div>

      <Alert variant="warning" title="안전 검토 안내">
        이 검토는 콘텐츠 가이드라인 참고용 AI 보조 도구입니다. 법적 조언이 아닙니다.
        최종 판단과 책임은 사용자에게 있습니다.
      </Alert>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      {!review ? (
        <div className="text-center py-12 text-slate-400">
          <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>안전 검토를 시작해주세요.</p>
          <Button className="mt-4" onClick={doReview} leftIcon={<Shield className="w-4 h-4" />}>
            안전 검토 시작
          </Button>
        </div>
      ) : (
        <>
          {/* Risk Level */}
          {(() => {
            const config = RISK_CONFIG[review.riskLevel];
            return (
              <div className={clsx(
                'rounded-2xl p-5 border-2 flex items-start gap-4',
                review.riskLevel === 'low'
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                  : review.riskLevel === 'medium'
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30',
              )}>
                <Shield className={clsx(
                  'w-8 h-8 shrink-0',
                  review.riskLevel === 'low' ? 'text-emerald-500' : review.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500',
                )} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={config.badge}>{config.label}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{config.desc}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.overallNote}</p>
                </div>
              </div>
            );
          })()}

          {/* Flagged phrases */}
          {review.flags.length > 0 ? (
            <div className="wizard-card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                주의 표현 {review.flags.length}건
              </h3>
              <div className="space-y-3">
                {review.flags.map((flag, idx) => (
                  <div key={idx} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-white">"{flag.phrase}"</span>
                      <Badge variant="yellow">{flag.riskType}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{flag.reason}</p>
                    <div className="bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">더 안전한 표현</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">"{flag.saferAlternative}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Alert variant="success">
              주의가 필요한 표현이 발견되지 않았습니다. 대본이 안전합니다.
            </Alert>
          )}

          {/* Apply safer script */}
          {review.saferScriptSuggestion && (
            <div className="wizard-card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">수정된 안전 대본</h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-3">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
                  {review.saferScriptSuggestion}
                </pre>
              </div>
              <Button variant="success" size="sm" onClick={applySaferScript}>
                이 안전 대본 적용하기
              </Button>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('media')}>
          이전
        </Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('video')} disabled={!review}>
          영상 생성으로
        </Button>
      </div>
    </div>
  );
}
