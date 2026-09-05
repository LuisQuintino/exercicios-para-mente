let currentSession = null;
let authReady = false;

async function initAuth(onChange) {
  const { data } = await supabaseClient.auth.getSession();
  currentSession = data.session;
  authReady = true;
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    onChange();
  });
  onChange();
}

function getUser() {
  return currentSession ? currentSession.user : null;
}

async function signUp(email, password) {
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
}

async function signIn(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function signOut() {
  await supabaseClient.auth.signOut();
}
