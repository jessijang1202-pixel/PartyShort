import { supabase } from '../lib/supabase';

export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (m.includes('user already registered') || m.includes('already registered'))
    return '이미 가입된 이메일입니다.';
  if (m.includes('password should be at least'))
    return '비밀번호는 6자 이상이어야 합니다.';
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return '유효하지 않은 이메일 주소입니다.';
  if (m.includes('email not confirmed'))
    return '이메일 인증이 필요합니다. 받은 편지함을 확인하세요.';
  if (m.includes('too many requests'))
    return '요청이 너무 많습니다. 잠시 후 다시 시도하세요.';
  return message;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(translateAuthError(error.message));
}
