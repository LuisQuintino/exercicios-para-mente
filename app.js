const root = document.getElementById("app");

const CATEGORY_ACCENT_VAR = {
  "TCC": "--accent-tcc",
  "Psicanálise": "--accent-psi",
};

function categoryAccent(categoria) {
  return `var(${CATEGORY_ACCENT_VAR[categoria] || "--accent-tcc"})`;
}

function getExercise(id) {
  return EXERCISES.find((e) => e.id === id);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

async function router() {
  const hash = location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "conta") {
    renderAccount();
  } else if (parts[0] === "exercicio" && parts[1] && !parts[2]) {
    await renderExercise(parts[1]);
  } else if (parts[0] === "exercicio" && parts[1] && parts[2] === "novo") {
    renderForm(parts[1]);
  } else {
    await renderHome();
  }
}

function renderTopBar() {
  const user = getUser();

  if (user) {
    return el("div", { class: "topbar" }, [
      el("span", { class: "user-email" }, user.email),
      el("button", { class: "btn secondary", onclick: async () => { await signOut(); } }, "Sair"),
    ]);
  }

  return el("div", { class: "topbar" }, [
    el("a", { class: "btn secondary", href: "#/conta" }, "Criar conta / Entrar"),
  ]);
}

function renderAccount() {
  const user = getUser();

  if (user) {
    root.replaceChildren(
      renderTopBar(),
      el("header", {}, [
        el("a", { class: "back", href: "#/" }, "← Voltar"),
        el("p", { class: "eyebrow" }, "Ficha do usuário"),
        el("h1", {}, "Sua conta"),
        el(
          "p",
          { class: "subtitle" },
          `Conectado como ${user.email}. Seus novos registros são salvos na nuvem e sincronizados entre dispositivos.`
        ),
      ])
    );
    return;
  }

  let mode = "login";
  const emailInput = el("input", { type: "email", required: "true", placeholder: "voce@exemplo.com" });
  const passwordInput = el("input", { type: "password", required: "true", minlength: "6", placeholder: "••••••••" });
  const errorBox = el("p", { class: "auth-error" });
  const submitBtn = el("button", { type: "submit", class: "btn" }, "Entrar");
  const toggleBtn = el(
    "button",
    {
      type: "button",
      class: "btn secondary",
      onclick: () => {
        mode = mode === "login" ? "signup" : "login";
        submitBtn.textContent = mode === "login" ? "Entrar" : "Criar conta";
        toggleBtn.textContent = mode === "login" ? "Criar uma conta" : "Já tenho conta";
        errorBox.textContent = "";
      },
    },
    "Criar uma conta"
  );

  const form = el(
    "form",
    {
      class: "auth-form",
      onsubmit: async (evt) => {
        evt.preventDefault();
        errorBox.textContent = "";
        submitBtn.disabled = true;
        try {
          if (mode === "login") {
            await signIn(emailInput.value.trim(), passwordInput.value);
            location.hash = "#/";
          } else {
            await signUp(emailInput.value.trim(), passwordInput.value);
            errorBox.classList.add("info");
            errorBox.textContent = "Conta criada! Verifique seu e-mail para confirmar antes de entrar.";
          }
        } catch (err) {
          errorBox.classList.remove("info");
          errorBox.textContent = err.message || "Ocorreu um erro.";
        } finally {
          submitBtn.disabled = false;
        }
      },
    },
    [
      el("label", { class: "field-label" }, [el("span", {}, "E-mail"), emailInput]),
      el("label", { class: "field-label" }, [el("span", {}, "Senha"), passwordInput]),
      errorBox,
      el("div", { class: "form-actions" }, [submitBtn, toggleBtn]),
    ]
  );

  root.replaceChildren(
    renderTopBar(),
    el("header", {}, [
      el("a", { class: "back", href: "#/" }, "← Voltar"),
      el("p", { class: "eyebrow" }, "Registro opcional"),
      el("h1", {}, "Criar conta ou entrar"),
      el(
        "p",
        { class: "subtitle" },
        "Opcional: crie uma conta para sincronizar seus registros entre dispositivos. Sem conta, eles ficam salvos apenas neste navegador."
      ),
    ]),
    form
  );
}

async function renderHome() {
  const categorias = [...new Set(EXERCISES.map((e) => e.categoria))];
  const counts = {};
  for (const exercise of EXERCISES) {
    counts[exercise.id] = (await loadEntries(exercise.id)).length;
  }

  const sections = categorias.map((categoria) => {
    const exercisesInCategory = EXERCISES.filter((e) => e.categoria === categoria);
    const cards = exercisesInCategory.map((exercise) =>
      el("a", { class: "card", href: `#/exercicio/${exercise.id}` }, [
        el("h3", {}, exercise.nome),
        el("p", {}, exercise.descricao),
        el("span", { class: "count" }, `${counts[exercise.id]} registro(s)`),
      ])
    );
    return el(
      "section",
      { class: "category", style: `--cat-accent: ${categoryAccent(categoria)}` },
      [
        el("div", { class: "tab" }, [
          el("h2", {}, categoria),
          el("span", { class: "tab-count" }, `${exercisesInCategory.length} exercício(s)`),
        ]),
        el("div", { class: "grid" }, cards),
      ]
    );
  });

  root.replaceChildren(
    renderTopBar(),
    el("header", {}, [
      el("p", { class: "eyebrow" }, "Caderno de prática"),
      el("h1", {}, "Exercícios para a Mente"),
      el("p", { class: "subtitle" }, "Registre seus exercícios de autoconhecimento e acompanhe sua evolução."),
    ]),
    ...sections
  );
}

async function renderExercise(exerciseId) {
  const exercise = getExercise(exerciseId);
  if (!exercise) return renderHome();

  const entries = await loadEntries(exerciseId);

  const list = entries.length
    ? entries.map((entry) => renderEntryCard(exercise, entry))
    : [el("p", { class: "empty" }, "Nenhum registro ainda. Comece agora.")];

  root.replaceChildren(
    renderTopBar(),
    el(
      "div",
      { class: "exercise-view", style: `--cat-accent: ${categoryAccent(exercise.categoria)}` },
      [
        el("header", {}, [
          el("a", { class: "back", href: "#/" }, "← Voltar"),
          el("p", { class: "eyebrow" }, exercise.categoria),
          el("h1", {}, exercise.nome),
          el("p", { class: "subtitle" }, exercise.descricao),
          el("a", { class: "btn", href: `#/exercicio/${exercise.id}/novo` }, "+ Novo registro"),
        ]),
        el("section", { class: "history" }, list),
      ]
    )
  );
}

function renderEntryCard(exercise, entry) {
  const date = new Date(entry.createdAt).toLocaleString("pt-BR");
  const fields = exercise.campos
    .filter((campo) => entry.data[campo.id])
    .map((campo) => el("div", { class: "field" }, [el("strong", {}, campo.label + ": "), el("span", {}, entry.data[campo.id])]));

  return el("article", { class: "entry" }, [
    el("div", { class: "entry-header" }, [
      el("time", {}, date),
      el("button", {
        class: "delete",
        onclick: async () => {
          if (confirm("Excluir este registro?")) {
            await deleteEntry(exercise.id, entry.id);
            await renderExercise(exercise.id);
          }
        },
      }, "Excluir"),
    ]),
    ...fields,
  ]);
}

function renderForm(exerciseId) {
  const exercise = getExercise(exerciseId);
  if (!exercise) return renderHome();

  const inputs = {};
  const fieldNodes = exercise.campos.map((campo) => {
    const inputAttrs = { id: campo.id, name: campo.id };
    if (campo.required) inputAttrs.required = "true";
    if (campo.type === "number") {
      if (campo.min != null) inputAttrs.min = campo.min;
      if (campo.max != null) inputAttrs.max = campo.max;
    }

    const input =
      campo.type === "textarea"
        ? el("textarea", { ...inputAttrs, rows: "3" })
        : el("input", { ...inputAttrs, type: campo.type });

    if (campo.type === "date") input.value = new Date().toISOString().slice(0, 10);

    inputs[campo.id] = input;

    return el("label", { class: "field-label" }, [el("span", {}, campo.label + (campo.required ? " *" : "")), input]);
  });

  const errorBox = el("p", { class: "auth-error" });
  const submitBtn = el("button", { type: "submit", class: "btn" }, "Salvar registro");

  const form = el(
    "form",
    {
      onsubmit: async (evt) => {
        evt.preventDefault();
        const data = {};
        for (const campo of exercise.campos) {
          data[campo.id] = inputs[campo.id].value.trim();
        }
        submitBtn.disabled = true;
        try {
          await addEntry(exercise.id, data);
          location.hash = `#/exercicio/${exercise.id}`;
        } catch (err) {
          errorBox.textContent = err.message || "Erro ao salvar registro.";
          submitBtn.disabled = false;
        }
      },
    },
    [...fieldNodes, errorBox, el("div", { class: "form-actions" }, [
      submitBtn,
      el("a", { class: "btn secondary", href: `#/exercicio/${exercise.id}` }, "Cancelar"),
    ])]
  );

  root.replaceChildren(
    renderTopBar(),
    el(
      "div",
      { class: "exercise-view", style: `--cat-accent: ${categoryAccent(exercise.categoria)}` },
      [
        el("header", {}, [
          el("a", { class: "back", href: `#/exercicio/${exercise.id}` }, "← Voltar"),
          el("p", { class: "eyebrow" }, exercise.categoria),
          el("h1", {}, `Novo registro: ${exercise.nome}`),
        ]),
        form,
      ]
    )
  );
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  router();
  initAuth(router);
});
