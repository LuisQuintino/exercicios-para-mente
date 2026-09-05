// Sem conta: registros ficam em cache no navegador (localStorage).
// Com conta: registros são salvos no Supabase, protegidos por RLS por usuário.

const LOCAL_PREFIX = "epm:";

function localKey(exerciseId) {
  return `${LOCAL_PREFIX}${exerciseId}`;
}

function loadLocalEntries(exerciseId) {
  const raw = localStorage.getItem(localKey(exerciseId));
  return raw ? JSON.parse(raw) : [];
}

function saveLocalEntries(exerciseId, entries) {
  localStorage.setItem(localKey(exerciseId), JSON.stringify(entries));
}

async function loadEntries(exerciseId) {
  const user = getUser();
  if (!user) return loadLocalEntries(exerciseId);

  const { data, error } = await supabaseClient
    .from("entries")
    .select("id, data, created_at")
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar registros:", error.message);
    return [];
  }

  return data.map((row) => ({ id: row.id, createdAt: row.created_at, data: row.data }));
}

async function addEntry(exerciseId, data) {
  const user = getUser();

  if (!user) {
    const entries = loadLocalEntries(exerciseId);
    const entry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), data };
    entries.unshift(entry);
    saveLocalEntries(exerciseId, entries);
    return entry;
  }

  const { data: inserted, error } = await supabaseClient
    .from("entries")
    .insert({ exercise_id: exerciseId, data, user_id: user.id })
    .select("id, data, created_at")
    .single();

  if (error) throw error;

  return { id: inserted.id, createdAt: inserted.created_at, data: inserted.data };
}

async function deleteEntry(exerciseId, entryId) {
  const user = getUser();

  if (!user) {
    const entries = loadLocalEntries(exerciseId).filter((e) => e.id !== entryId);
    saveLocalEntries(exerciseId, entries);
    return;
  }

  const { error } = await supabaseClient.from("entries").delete().eq("id", entryId);
  if (error) throw error;
}
