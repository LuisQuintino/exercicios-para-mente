// Persistência via Supabase, com Row Level Security garantindo que cada
// usuário só acesse seus próprios registros (ver supabase/schema.sql).

async function loadEntries(exerciseId) {
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
  const { data: inserted, error } = await supabaseClient
    .from("entries")
    .insert({ exercise_id: exerciseId, data, user_id: user.id })
    .select("id, data, created_at")
    .single();

  if (error) throw error;

  return { id: inserted.id, createdAt: inserted.created_at, data: inserted.data };
}

async function deleteEntry(_exerciseId, entryId) {
  const { error } = await supabaseClient.from("entries").delete().eq("id", entryId);
  if (error) throw error;
}
