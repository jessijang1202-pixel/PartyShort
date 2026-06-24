import { useRef, useState } from 'react';
import { Upload, Video, Image, X, ChevronRight, SkipForward } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import Button from '../ui/Button';

export default function SimpleUploadStep() {
  const { session, setSimpleUploads } = useApp();
  const hasVideos = session.planning?.hasVideos ?? false;
  const hasPhotos = session.planning?.hasPhotos ?? false;

  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [videoName, setVideoName] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoNames, setPhotoNames] = useState<string[]>([]);

  const videoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  function handleVideoUpload(file: File) {
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
  }

  function handlePhotosUpload(files: FileList) {
    const newUrls: string[] = [];
    const newNames: string[] = [];
    Array.from(files).forEach(f => {
      newUrls.push(URL.createObjectURL(f));
      newNames.push(f.name);
    });
    setPhotoUrls(prev => [...prev, ...newUrls]);
    setPhotoNames(prev => [...prev, ...newNames]);
  }

  function removePhoto(idx: number) {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
    setPhotoNames(prev => prev.filter((_, i) => i !== idx));
  }

  function handleStart() {
    setSimpleUploads({ videoUrl, photoUrls });
  }

  function handleSkip() {
    setSimpleUploads({ photoUrls: [] });
  }

  return (
    <div className="slide-up space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">미디어 업로드</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          보유하신 동영상·사진을 업로드하면 영상에 자동으로 활용됩니다.
        </p>
      </div>

      {/* Video upload */}
      {hasVideos && (
        <div className="wizard-card space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">핵심 동영상 (초반부 8–10초)</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            영상의 첫 8–10초에 사용될 핵심 클립을 업로드해주세요.
          </p>

          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }}
          />

          {videoUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-40">
              <video src={videoUrl} controls className="w-full h-full object-contain" />
              <button
                onClick={() => { setVideoUrl(undefined); setVideoName(''); if (videoRef.current) videoRef.current.value = ''; }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
            >
              <Upload className="w-6 h-6 text-purple-400" />
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">동영상 파일 선택</p>
              <p className="text-xs text-slate-400">MP4, MOV, AVI 등</p>
            </button>
          )}

          {videoName && (
            <p className="text-xs text-slate-500 truncate">📎 {videoName}</p>
          )}
        </div>
      )}

      {/* Photo upload */}
      {hasPhotos && (
        <div className="wizard-card space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              사진 ({photoUrls.length}장)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            슬라이드 씬에 사용될 사진을 업로드해주세요. 여러 장 선택 가능합니다.
          </p>

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handlePhotosUpload(e.target.files); if (photoRef.current) photoRef.current.value = ''; }}
          />

          {/* Photo grid */}
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photoUrls.map((url, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
                  <img src={url} alt={photoNames[idx]} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{photoNames[idx]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="w-full border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 flex items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {photoUrls.length > 0 ? '사진 추가하기' : '사진 파일 선택'}
            </p>
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="secondary"
          leftIcon={<SkipForward className="w-4 h-4" />}
          onClick={handleSkip}
        >
          건너뛰기
        </Button>
        <Button
          rightIcon={<ChevronRight className="w-4 h-4" />}
          onClick={handleStart}
          disabled={!videoUrl && photoUrls.length === 0}
        >
          업로드 완료 · 자동 처리 시작
        </Button>
      </div>
    </div>
  );
}
