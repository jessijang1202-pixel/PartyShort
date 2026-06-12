import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, RefreshCcw, Play, Film, FileText, Zap, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';

function SectionBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="wizard-card">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function PreviewStep() {
  const { session, approvePreview, setStep } = useApp();
  const [approved, setApproved] = useState(session.previewApproved);

  const { planning, selectedIdea, selectedHook, script, videoPackage, safetyReview } = session;

  function handleApprove() {
    approvePreview();
    setApproved(true);
  }

  function handleNext() {
    if (!approved) return;
    setStep('upload-copy');
  }

  const riskBadge = safetyReview
    ? safetyReview.riskLevel === 'low' ? 'green'
    : safetyReview.riskLevel === 'medium' ? 'yellow' : 'red'
    : 'default';

  return (
    <div className="slide-up space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">미리보기 및 승인</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          최종 확인 후 승인해야 다음 단계로 넘어갈 수 있습니다
        </p>
      </div>

      {/* Video preview area */}
      <div className="wizard-card bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
        <div className="aspect-[9/16] max-w-xs mx-auto bg-black rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/10">
          {videoPackage?.finalVideoUrl && videoPackage.finalVideoUrl !== '#mock-final-video' ? (
            <video
              src={videoPackage.finalVideoUrl}
              controls
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Film className="w-8 h-8 text-white/60" />
              </div>
              <div className="text-center px-4">
                <p className="font-semibold text-white/80 text-sm">영상 미리보기</p>
                <p className="text-white/40 text-xs mt-1">
                  {videoPackage?.status === 'done'
                    ? '영상이 준비되었습니다'
                    : 'Google Flow에서 생성 후 확인하세요'}
                </p>
              </div>
              {videoPackage?.status === 'done' && (
                <Button size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} className="bg-white/20 hover:bg-white/30 text-white border-transparent">
                  재생
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Summary blocks */}
      <div className="grid gap-4">
        {selectedIdea && (
          <SectionBlock title="선택된 아이디어" icon={<Lightbulb className="w-4 h-4 text-amber-500" />}>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedIdea.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedIdea.summary}</p>
          </SectionBlock>
        )}

        {selectedHook && (
          <SectionBlock title="선택된 훅" icon={<Zap className="w-4 h-4 text-violet-500" />}>
            <p className="text-lg font-bold text-slate-900 dark:text-white">"{selectedHook.text}"</p>
            <Badge variant="purple" className="mt-1">{selectedHook.style}</Badge>
          </SectionBlock>
        )}

        {script && (
          <SectionBlock title="최종 대본" icon={<FileText className="w-4 h-4 text-blue-500" />}>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                {script.fullScript}
              </pre>
            </div>
            <p className="text-xs text-slate-400 mt-2">{script.estimatedReadingTime}</p>
          </SectionBlock>
        )}

        {safetyReview && (
          <SectionBlock title="안전 검토 결과" icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}>
            <div className="flex items-center gap-2">
              <Badge variant={riskBadge as any}>
                {safetyReview.riskLevel === 'low' ? '위험도 낮음' : safetyReview.riskLevel === 'medium' ? '위험도 중간' : '위험도 높음'}
              </Badge>
              <p className="text-sm text-slate-600 dark:text-slate-400">{safetyReview.overallNote}</p>
            </div>
          </SectionBlock>
        )}
      </div>

      {/* Approval or re-actions */}
      {approved ? (
        <Alert variant="success" title="승인 완료">
          이 영상이 승인되었습니다. 업로드 카피 생성으로 넘어갈 수 있습니다.
        </Alert>
      ) : (
        <div className="wizard-card border-2 border-dashed border-blue-300 dark:border-blue-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-center">최종 승인</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
            위 내용을 검토하셨나요? 승인 후에는 업로드 카피를 생성할 수 있습니다.
          </p>
          <Button className="w-full" size="lg" leftIcon={<CheckCircle className="w-5 h-5" />} onClick={handleApprove}>
            승인하고 진행
          </Button>
        </div>
      )}

      {/* Re-generate actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={() => setStep('hooks')}>
          훅 다시 만들기
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={() => setStep('script')}>
          대본 다시 만들기
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={() => setStep('media')}>
          이미지 다시 만들기
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCcw className="w-3.5 h-3.5" />} onClick={() => setStep('video')}>
          영상 다시 만들기
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('video')}>
          이전
        </Button>
        <Button
          rightIcon={<ChevronRight className="w-4 h-4" />}
          onClick={handleNext}
          disabled={!approved}
        >
          업로드 카피 생성
        </Button>
      </div>
    </div>
  );
}
