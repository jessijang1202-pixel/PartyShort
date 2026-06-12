import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { WIZARD_STEPS, type WizardStep } from '../types';
import { WizardSidebar, WizardTopBar } from '../components/layout/WizardProgress';
import PlanningStep from '../components/steps/PlanningStep';
import IdeaStep from '../components/steps/IdeaStep';
import HookStep from '../components/steps/HookStep';
import ScriptSplitStep from '../components/steps/ScriptSplitStep';
import VeoClipStep from '../components/steps/VeoClipStep';
import SlidesStep from '../components/steps/SlidesStep';
import StoryboardStep from '../components/steps/StoryboardStep';
import UploadCopyStep from '../components/steps/UploadCopyStep';
import ExportStep from '../components/steps/ExportStep';
import Alert from '../components/ui/Alert';

const STEP_COMPONENTS: Record<WizardStep, React.ComponentType> = {
  'planning':     PlanningStep,
  'ideas':        IdeaStep,
  'hooks':        HookStep,
  'script-split': ScriptSplitStep,
  'veo-clip':     VeoClipStep,
  'slides':       SlidesStep,
  'storyboard':   StoryboardStep,
  'upload-copy':  UploadCopyStep,
  'export':       ExportStep,
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
      <WizardTopBar currentStep={currentStep} completedSteps={completed} />

      {settings.useMockMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <Alert variant="warning">
            <span className="font-medium">데모 모드</span>로 실행 중입니다. 실제 AI 생성을 원하면{' '}
            <button onClick={() => navigate('/settings')} className="underline font-semibold">
              설정에서 Gemini API 키를 입력하세요
            </button>.
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          <WizardSidebar
            currentStep={currentStep}
            completedSteps={completed}
            onStepClick={(step) => setStep(step)}
          />
          <div className="flex-1 min-w-0 max-w-3xl">
            <StepComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
