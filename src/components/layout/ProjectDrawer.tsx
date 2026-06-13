import { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, DownloadCloud, Plus, Loader2, AlertCircle, Clock } from 'lucide-react';
import { listProjects, deleteProject, type SavedProject } from '../../services/db.service';
import type { AppSession } from '../../types';

interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  onLoad: (session: Partial<AppSession>, projectId: string) => void;
  onNew: () => void;
  currentProjectId: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ProjectDrawer({ open, onClose, onLoad, onNew, currentProjectId }: ProjectDrawerProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    listProjects()
      .then(setProjects)
      .catch(() => setError('프로젝트 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm('이 프로젝트를 삭제할까요?')) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects(ps => ps.filter(p => p.id !== id));
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  }

  function handleLoad(project: SavedProject) {
    if (currentProjectId && currentProjectId !== project.id) {
      if (!window.confirm('현재 작업 중인 내용이 사라집니다. 불러올까요?')) return;
    }
    onLoad(project.session_data, project.id);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">내 프로젝트</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* New project button */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트 시작
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">저장된 프로젝트가 없습니다.</p>
              <p className="text-xs mt-1">영상 제작 후 저장 버튼을 눌러주세요.</p>
            </div>
          )}

          {projects.map(project => (
            <div
              key={project.id}
              className={`rounded-xl border p-4 space-y-3 transition-colors cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 ${
                currentProjectId === project.id
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
              }`}
              onClick={() => handleLoad(project)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {project.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </div>
                </div>
                {currentProjectId === project.id && (
                  <span className="shrink-0 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">현재</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLoad(project); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  불러오기
                </button>
                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  disabled={deleting === project.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                >
                  {deleting === project.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
