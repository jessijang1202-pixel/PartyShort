import { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw, Video, Image } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import type { StoryboardSegment } from '../../types';
import Button from '../ui/Button';
import StoryboardTimeline from '../storyboard/StoryboardTimeline';

function buildSegments(scriptSplit: NonNullable<ReturnType<typeof useApp>['session']['scriptSplit']>): StoryboardSegment[] {
  const segs: StoryboardSegment[] = [];
  let t = 0;

  const veo = scriptSplit.veo_core_clip;
  segs.push({
    id: 'veo_core',
    type: 'veo',
    label: 'Veo 클립',
    startTime: t,
    endTime: t + veo.duration,
    videoUrl: veo.videoUrl,
    narration: veo.text,
  });
  t += veo.duration;

  for (const scene of scriptSplit.slide_scenes) {
    segs.push({
      id: scene.scene_id,
      type: 'slide',
      label: scene.scene_title,
      startTime: t,
      endTime: t + scene.duration_seconds,
      imageUrl: scene.imageUrl,
      on_screen_text: scene.on_screen_text,
      narration: scene.narration_text,
    });
    t += scene.duration_seconds;
  }

  return segs;
}

export default function StoryboardStep() {
  const { session, setStep } = useApp();
  const split = session.scriptSplit;
  const segments = split ? buildSegments(split) : [];
  const totalDuration = segments.length > 0 ? segments[segments.length - 1].endTime : 0;

  const [activeId, setActiveId] = useState<string | null>(segments[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSeg = segments.find(s => s.id === activeId) ?? null;

  useEffect(() => {
    if (segments.length) setActiveId(segments[0].id);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          // update active segment
          const seg = segments.find(s => s.startTime <= next && s.endTime > next);
          if (seg) setActiveId(seg.id);
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, totalDuration]);

  function handleSelect(id: string) {
    const seg = segments.find(s => s.id === id);
    if (!seg) return;
    setActiveId(id);
    setCurrentTime(seg.startTime);
    setIsPlaying(false);
  }

  function handleReset() {
    setIsPlaying(false);
    setCurrentTime(0);
    if (segments.length) setActiveId(segments[0].id);
  }

  function togglePlay() {
    if (currentTime >= totalDuration) { handleReset(); return; }
    setIsPlaying(p => !p);
  }

  if (!split) return null;

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">30초 스토리보드</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {segments.length}개 구간 · 총 {totalDuration}초
        </p>
      </div>

      {/* Phone frame preview */}
      <div className="flex justify-center">
        <div className="relative w-48 rounded-3xl border-4 border-slate-800 dark:border-slate-600 bg-black overflow-hidden shadow-2xl"
          style={{ aspectRatio: '9/16' }}>
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black/60 flex items-center justify-center z-10">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
          </div>

          {/* Content area */}
          {activeSeg ? (
            <>
              {activeSeg.type === 'veo' ? (
                activeSeg.videoUrl ? (
                  <video src={activeSeg.videoUrl} className="w-full h-full object-cover" autoPlay={isPlaying} loop muted playsInline />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-blue-950">
                    <Video className="w-10 h-10 text-blue-400 mb-3" />
                    <p className="text-xs text-blue-300 text-center px-3">Veo 클립 ({split.veo_core_clip.duration}초)</p>
                  </div>
                )
              ) : (
                activeSeg.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img src={activeSeg.imageUrl} alt={activeSeg.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-8">
                      <p className="text-white text-center font-bold text-sm leading-snug whitespace-pre-line">
                        {activeSeg.on_screen_text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950 relative">
                    <Image className="w-8 h-8 text-amber-400 mb-3" />
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-4">
                      <p className="text-white text-center font-bold text-xs leading-snug whitespace-pre-line">
                        {activeSeg.on_screen_text}
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* Segment type badge */}
              <div className={`absolute top-8 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold
                ${activeSeg.type === 'veo'
                  ? 'bg-blue-600/80 text-white'
                  : 'bg-amber-500/80 text-white'
                }`}>
                {activeSeg.type === 'veo' ? 'VEO' : `슬라이드 ${segments.filter(s => s.type === 'slide').findIndex(s => s.id === activeSeg.id) + 1}`}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <p className="text-slate-500 text-xs">세그먼트 없음</p>
            </div>
          )}

          {/* Time overlay */}
          <div className="absolute bottom-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-mono">
            {currentTime.toFixed(1)}s / {totalDuration}s
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleReset}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors">
          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
        </button>
        <div className="w-9 h-9" /> {/* spacer */}
      </div>

      {/* Timeline */}
      <div className="wizard-card">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">타임라인</h3>
        <StoryboardTimeline
          segments={segments}
          activeId={activeId}
          currentTime={currentTime}
          totalDuration={totalDuration}
          onSelect={handleSelect}
        />
      </div>

      {/* Active segment info */}
      {activeSeg && (
        <div className={`rounded-xl px-4 py-3 text-sm border-2 ${
          activeSeg.type === 'veo'
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        }`}>
          <p className={`font-semibold mb-1 ${activeSeg.type === 'veo' ? 'text-blue-700 dark:text-blue-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {activeSeg.label} ({activeSeg.endTime - activeSeg.startTime}초)
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">{activeSeg.narration}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Veo AI 클립</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span>슬라이드 씬</span>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="secondary" leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setStep('slides')}>이전</Button>
        <Button rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setStep('upload-copy')}>업로드 카피 생성</Button>
      </div>
    </div>
  );
}
