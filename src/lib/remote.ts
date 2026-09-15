import { emptySave, mergeSave, type UniverseSave } from '@/lib/save';
import { getRemote, ROW_ID } from '@/lib/supabase';

type Row = { id: string; data: UniverseSave };

export async function fetchSave(): Promise<UniverseSave> {
  const db = getRemote();
  if (!db) return emptySave();

  const { data, error } = await db.from('state').select('data').eq('id', ROW_ID).maybeSingle();
  if (error) throw error;
  if (!data) return emptySave();
  return mergeSave(emptySave(), (data as Row).data);
}

export async function persistSave(save: UniverseSave) {
  const db = getRemote();
  if (!db) throw new Error('remote missing');

  const { error } = await db.from('state').upsert({
    id: ROW_ID,
    data: save,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
