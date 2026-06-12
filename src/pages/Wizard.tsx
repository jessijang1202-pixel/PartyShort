import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { WIZARD_STEPS, type WizardStep } from '../types';
import { WizardSidebar, WizardTopBar } from '../components/layout/WizardProgress';
import PlanningStep from '../components/steps/PlanningStep';
import IdeaStep from '../components/steps/IdeaStep';
import HookStep from '../components/steps/HookStep';
import ScriptStep from '../components/steps/ScriptStep';
import MediaStep from '../components/steps/MediaStep';
import SafetyStep from '../components/steps/SafetyStep';
import VideoStep from '../components/steps/VideoStep';
import PreviewStep from '../components/steps/PreviewStep';
import UploadCopyStep from '../components/steps/UploadCopyStep';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { Settings } from 'lucide-react';

const STEP_COMPONENTS: Record<WizardStep, React.ComponentType> = {
  planning:     PlanningStep,
  ideas:        IdeaStep,
  hooks:        HookStep,
  script:       ScriptStep,
  media:        MediaStep,
  safety:       SafetyStep,
  video:        VideoStep,
  preview:      PreviewStep,
  'upload-copy': UploadCopyStep,
};

function getCompletedSteps(currentStep: WizardStep): WizardStep[] {
  const idx = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  return WIZARD_STEPS.slice(0, idx).map(s => s.id);
}

export default function Wizard() {
  const { session, settings, setStep } = useApp();
  const navigate = useNavigate();

  const currentStep = session.currentStep;
  const completed = getCompletedSteps(currentStep);
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <WizardTopBar currentStep={currentStep} completedSteps={completed} />

      {/* API key warning */}
      {settings.useMockMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <Alert variant="warning">
            <span className="font-medium">데모 모드</span>로 실행 중입니다. 실제 AI 생성을 원하면{' '}
            <button
              onClick={() => navigate('/settings')}
              className="underline font-semibold"
            >
              설정에서 Gemini API 키를 입력하세요
            </button>.
          </Alert>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <WizardSidebar
            currentStep={currentStep}
            completedSteps={completed}
            onStepClick={(step) => setStep(step)}
          />

          {/* Step content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <StepComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
