import { supabase } from '../lib/supabase';
import type { AppSession } from '../types';

// Strip blob/data URLs and reset media statuses before persisting
function stripSession(session: AppSession): object {
  return {
    ...session,
    scriptSplit: session.scriptSplit ? {
      ...session.scriptSplit,
      veo_core_clip: {
        text: session.scriptSplit.veo_core_clip.text,
        prompt: session.scriptSplit.veo_core_clip.prompt,
        duration: session.scriptSplit.veo_core_clip.duration,
        status: 'idle',
        textPosition: session.scriptSplit.veo_core_clip.textPosition,
        textSize: session.scriptSplit.veo_core_clip.textSize,
        // videoUrl intentionally omitted
      },
      slide_scenes: session.scriptSplit.slide_scenes.map(sc => ({
        scene_id: sc.scene_id,
        scene_title: sc.scene_title,
        on_screen_text: sc.on_screen_text,
        narration_text: sc.narration_text,
        visual_description: sc.visual_description,
        duration_seconds: sc.duration_seconds,
        imageStatus: 'idle',
        // imageUrl intentionally omitted
      })),
    } : null,
  };
}

// ─── User Profile (API key) ───────────────────────────────────────────────────

export async function loadUserProfile(uid: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('gemini_api_key, use_mock_mode')
    .eq('id', uid)
    .maybeSingle();
  return data as { gemini_api_key: string; use_mock_mode: boolean } | null;
}

export async function saveUserProfile(uid: string, geminiApiKey: string, useMockMode: boolean) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: uid, gemini_api_key: geminiApiKey, use_mock_mode: useMockMode });
  if (error) throw error;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface SavedProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  session_data: Partial<AppSession>;
}

export async function listProjects(): Promise<SavedProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, created_at, updated_at, session_data')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedProject[];
}

export async function saveProject(id: string | null, session: AppSession): Promise<string> {
  const title = session.planning?.topic ?? '제목 없음';
  const sessionData = stripSession(session);

  if (id) {
    const { error } = await supabase
      .from('projects')
      .update({ title, session_data: sessionData })
      .eq('id', id);
    if (error) throw error;
    return id;
  } else {
    const { data, error } = await supabase
      .from('projects')
      .insert({ title, session_data: sessionData })
      .select('id')
      .single();
    if (error) throw error;
    return data.id as string;
  }
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
