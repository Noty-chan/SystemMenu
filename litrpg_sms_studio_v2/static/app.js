/* System Message Studio v2
 * - 7 window types
 * - themes + custom css
 * - FX (lag/glitch/scanlines) + text corruption with seed
 * - extended markup + block tokens
 * - presets + import/export + JSON editor
 */

const BUILTIN_THEMES = {
  "Parchment Dusk": {
    vars: {
      "--page-bg": "#14110F",
      "--panel-bg": "rgba(235, 220, 190, 0.93)",
      "--panel-ink": "#1B140A",
      "--panel-muted": "rgba(27, 20, 10, 0.70)",
      "--border": "rgba(90, 65, 32, 0.55)",
      "--border-w": "1px",
      "--accent": "#2E6F9E",
      "--accent-2": "#7A2E2E",
      "--radius": "16px",
      "--shadow-alpha": "0.40",
      "--glow-size": "0px",
      "--glow-alpha": "0.00"
    }
  },
  "Manhwa Blue": {
    vars: {
      "--page-bg": "#090B12",
      "--panel-bg": "rgba(6, 18, 32, 0.92)",
      "--panel-ink": "#EAF2FF",
      "--panel-muted": "rgba(234, 242, 255, 0.70)",
      "--border": "rgba(70, 170, 255, 0.42)",
      "--border-w": "1px",
      "--accent": "#46AAFF",
      "--accent-2": "#20E3C2",
      "--radius": "14px",
      "--shadow-alpha": "0.46",
      "--glow-size": "16px",
      "--glow-alpha": "0.16"
    }
  },
  "HUD Slate": {
    vars: {
      "--page-bg": "#0C0F14",
      "--panel-bg": "rgba(20, 24, 32, 0.92)",
      "--panel-ink": "#E9EEF5",
      "--panel-muted": "rgba(233, 238, 245, 0.68)",
      "--border": "rgba(140, 160, 200, 0.22)",
      "--border-w": "1px",
      "--accent": "#9AD1FF",
      "--accent-2": "#FF7A90",
      "--radius": "16px",
      "--shadow-alpha": "0.40",
      "--glow-size": "0px",
      "--glow-alpha": "0.00"
    }
  },
  "Holo Amber": {
    vars: {
      "--page-bg": "#0B0B0C",
      "--panel-bg": "rgba(18, 16, 12, 0.92)",
      "--panel-ink": "#F5E7D0",
      "--panel-muted": "rgba(245, 231, 208, 0.68)",
      "--border": "rgba(255, 186, 107, 0.35)",
      "--border-w": "1px",
      "--accent": "#F7B267",
      "--accent-2": "#FF6B6B",
      "--radius": "18px",
      "--shadow-alpha": "0.50",
      "--glow-size": "14px",
      "--glow-alpha": "0.12"
    }
  },
  "Retro Jade": {
    vars: {
      "--page-bg": "#050807",
      "--panel-bg": "rgba(7, 18, 14, 0.92)",
      "--panel-ink": "#D2FFDE",
      "--panel-muted": "rgba(210, 255, 222, 0.70)",
      "--border": "rgba(90, 255, 170, 0.30)",
      "--border-w": "1px",
      "--accent": "#63E6BE",
      "--accent-2": "#A6F750",
      "--radius": "14px",
      "--shadow-alpha": "0.42",
      "--glow-size": "10px",
      "--glow-alpha": "0.10"
    }
  }
};

const MARKERS = [
  "⟦ИМЯ⟧","⟦КЛАСС⟧","⟦ТИТУЛ⟧","⟦УРОВЕНЬ⟧",
  "⟦HP⟧","⟦HP_MAX⟧","⟦MP⟧","⟦MP_MAX⟧","⟦STAM⟧","⟦STAM_MAX⟧",
  "⟦XP⟧","⟦XP_MAX⟧",
  "⟦ЗОЛОТО⟧","⟦КРЕДИТЫ⟧",
  "⟦ЛОКАЦИЯ⟧","⟦ВРЕМЯ⟧",
  "⟦ЦЕЛЬ⟧","⟦НАГРАДА⟧"
];

const BLOCKS = [
  {label:"[[pill:accent:...]]", value:"[[pill:accent:Текст]]"},
  {label:"[[pill:warn:...]]", value:"[[pill:warn:Текст]]"},
  {label:"[[pill:plain:...]]", value:"[[pill:plain:Текст]]"},
  {label:"[[tag:...]]", value:"[[tag:Тег]]"},
  {label:"• пункт", value:"\n- пункт\n"}
];

function makeBlockValue(kind, body){
  const text = body || "Текст";
  if(kind.startsWith("pill:")){
    const t = kind.split(":")[1] || "accent";
    return `[[pill:${t}:${text}]]`;
  }
  if(kind === "tag") return `[[tag:${text}]]`;
  if(kind === "bullet") return `\n- ${text}\n`;
  return text;
}

const TYPE_META = {
  character: {
    title: "Статус/персонаж",
    desc: "Большое окно со ресурсами, атрибутами, эффектами и валютой. Подходит для сцен с подробным разбором состояния героя.",
    chips: ["профиль", "ресурсы", "эффекты", "валюта"]
  },
  system_toast: {
    title: "Системное уведомление",
    desc: "Компактный toast с уровнем важности. Хорош для быстрых событий, начислений опыта или предупреждений.",
    chips: ["алерт", "короткое сообщение", "иконки"]
  },
  quest_card: {
    title: "Квест",
    desc: "Карточка с названием, целями, наградами и, при желании, предупреждением. Помогает быстро сверстать задания.",
    chips: ["цели", "чеклист", "награды"]
  },
  log_panel: {
    title: "Логи",
    desc: "Список событий в формате log feed. Можно выводить хронику боя, подключения или действий системы.",
    chips: ["время", "статус", "скролл"]
  },
  global_banner: {
    title: "Глобальный баннер",
    desc: "Широкое уведомление для анонсов, открытия зон, глобальных событий.",
    chips: ["центрирование", "крупный текст"]
  },
  ability_window: {
    title: "Способность/класс",
    desc: "Описание с редкостью, стоимостью и эффектами. Формат для навыков, классов или предметов с активным действием.",
    chips: ["эффекты", "стоимость", "кд"]
  },
  loot_window: {
    title: "Лут/награда",
    desc: "Слот под предметы и их свойства. Добавь flavour-текст и редкость для атмосферы.",
    chips: ["дроп", "редкость", "описание"]
  }
};

const QUICK_STARTS = [
  {
    name: "Статус: рейд",
    type: "character",
    theme: "HUD Slate",
    fxMode: "scanlines",
    fxIntensity: 1.1,
    canvas: "2560x1440",
    pos: {x:140, y:80, w:620, h:0},
    data: {
      title: "STATUS",
      subtitle: "РАЙД • СОСТОЯНИЕ",
      name: "Бриз",
      klass: "Сталкер",
      level: "54",
      title2: "Кромка Ночи",
      resources: "HP: 412/520\nMP: 170/220\nSTAM: 230/280\nXP: 1210/3200",
      attributes: "Сила: 22\nЛовкость: 28\nИнтеллект: 18\nВыносливость: 24\nВоля: 16\nУдача: 14",
      effects: "- баф: ==«Точность +12%»== (3:20)\n- дебаф: ~~Слабость к огню~~ (1:05)",
      achievements: "- «Драка под куполом»\n- «Испытание ветром»",
      quests: "- [[tag:RAID]] Сердце Механизма\n- [[tag:SIDE]] Сбор сигналов",
      currencies: "Золото: 742\nКредиты: 128"
    }
  },
  {
    name: "Тревога системы",
    type: "system_toast",
    theme: "Retro Jade",
    fxMode: "glitch",
    fxIntensity: 1.2,
    pos: {x:90, y:70, w:420, h:0},
    data: {
      title: "SYSTEM",
      subtitle: "CRITICAL ALERT",
      severity: "danger",
      message: "Зафиксировано проникновение\n[[pill:warn:Код: 0xAF12]]\n==Изолируй сектор== и обнули соединения."
    }
  },
  {
    name: "Дневной квест",
    type: "quest_card",
    theme: "Parchment Dusk",
    fxMode: "lag",
    fxIntensity: 0.9,
    pos: {x:120, y:90, w:560, h:0},
    data: {
      title: "QUEST",
      subtitle: "КАЖДЫЙ ДЕНЬ",
      questName: "«Утренний ритуал»",
      questDesc: "Перед рассветом проведи серию разминок, чтобы поймать темп дня.",
      objectives: "[x] Контрастный душ\n[x] 30 минут чтения\n[ ] Силовая: 3×12\n[ ] Кардио: 15 минут",
      rewards: "- +50 XP\n- +Настрой: ==Сосредоточенность== (1 час)\n- [[pill:accent:Малая удача]]",
      warning: "Пропуск лишает бонуса «Сосредоточенность»."
    }
  },
  {
    name: "Дроп: редкий",
    type: "loot_window",
    theme: "Holo Amber",
    fxMode: "none",
    pos: {x:160, y:110, w:520, h:0},
    data: {
      title: "LOOT",
      subtitle: "НАГРАДА",
      item: "Клинок Памяти",
      rarity: "Редкий",
      props: "- +8 к ловкости\n- [[pill:accent:Актив]] Отпечаток: повтори последнюю атаку\n- [[pill:plain:Особое]] Остывает 30 секунд",
      flavor: "Клинок дрожит, будто помнит прошлые битвы. Чем больше воспоминаний, тем ярче сияет кромка."
    }
  }
];

// LocalStorage keys
const LS_STATE  = "sms_v2_state";
const LS_THEMES = "sms_v2_themes";
const LS_PRESETS= "sms_v2_presets";
const LS_CSS    = "sms_v2_custom_css";
const LS_BLOCKS = "sms_v2_blocks";

// UI
const ui = {
  type: document.getElementById("uiType"),
  theme: document.getElementById("uiTheme"),
  themeToggle: document.getElementById("uiThemeToggle"),

  fxMode: document.getElementById("uiFxMode"),
  fxIntensity: document.getElementById("uiFxIntensity"),
  fxIntVal: document.getElementById("uiFxIntVal"),
  corrupt: document.getElementById("uiCorrupt"),
  corruptVal: document.getElementById("uiCorruptVal"),
  newSeed: document.getElementById("uiNewSeed"),
  freezeSeed: document.getElementById("uiFreezeSeed"),

  snap: document.getElementById("uiSnap"),
  grid: document.getElementById("uiGrid"),
  freezeFx: document.getElementById("uiFreezeFx"),

  canvas: document.getElementById("uiCanvas"),
  exportTarget: document.getElementById("uiExportTarget"),
  exportScale: document.getElementById("uiExportScale"),
  exportBtn: document.getElementById("uiExport"),

  undo: document.getElementById("uiUndo"),
  redo: document.getElementById("uiRedo"),

  fields: document.getElementById("uiFields"),
  markers: document.getElementById("uiMarkers"),
  blocks: document.getElementById("uiBlocks"),
  presets: document.getElementById("uiPresets"),
  customBlocks: document.getElementById("uiCustomBlocks"),
  blockLabel: document.getElementById("uiBlockLabel"),
  blockType: document.getElementById("uiBlockType"),
  blockText: document.getElementById("uiBlockText"),
  addBlock: document.getElementById("uiAddBlock"),

  savePreset: document.getElementById("uiSavePreset"),
  exportJson: document.getElementById("uiExportJson"),
  importJson: document.getElementById("uiImportJson"),

  showJson: document.getElementById("uiShowJson"),
  applyJson: document.getElementById("uiApplyJson"),
  jsonBox: document.getElementById("uiJson"),

  reset: document.getElementById("uiReset"),

  artboard: document.getElementById("artboard"),
  gridOverlay: document.getElementById("gridOverlay"),
  sysWindow: document.getElementById("sysWindow"),

  // Meta / quick start
  metaType: document.getElementById("uiMetaType"),
  metaTheme: document.getElementById("uiMetaTheme"),
  metaCanvas: document.getElementById("uiMetaCanvas"),
  metaWindow: document.getElementById("uiMetaWindow"),
  quickStarts: document.getElementById("uiQuickStarts"),
  typeTitle: document.getElementById("uiTypeTitle"),
  typeDesc: document.getElementById("uiTypeDesc"),
  typeChips: document.getElementById("uiTypeChips"),
  layoutStats: document.getElementById("uiLayoutStats"),
  centerWindow: document.getElementById("uiCenterWindow"),
  fitWindow: document.getElementById("uiFitWindow"),
  wideWindow: document.getElementById("uiWideWindow"),

  // Theme editor
  themeEditor: document.getElementById("themeEditor"),
  tName: document.getElementById("tName"),
  tPanelBg: document.getElementById("tPanelBg"),
  tInk: document.getElementById("tInk"),
  tBorder: document.getElementById("tBorder"),
  tAccent: document.getElementById("tAccent"),
  tAccent2: document.getElementById("tAccent2"),
  tPageBg: document.getElementById("tPageBg"),
  tRadius: document.getElementById("tRadius"),
  tRadiusVal: document.getElementById("tRadiusVal"),
  tBorderW: document.getElementById("tBorderW"),
  tBorderWVal: document.getElementById("tBorderWVal"),
  tShadow: document.getElementById("tShadow"),
  tShadowVal: document.getElementById("tShadowVal"),
  tGlow: document.getElementById("tGlow"),
  tGlowVal: document.getElementById("tGlowVal"),
  tCustomCss: document.getElementById("tCustomCss"),
  tSave: document.getElementById("tSave"),
  tClose: document.getElementById("tClose"),
  customCssSlot: document.getElementById("customCssSlot")
};

function isTextInput(el){
  if(!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  return tag === "textarea" || (tag === "input" && (el.type || "").toLowerCase() === "text");
}
let lastTextInput = null;
document.addEventListener("focusin", (e) => {
  if(isTextInput(e.target)){
    lastTextInput = e.target;
  }
});

// Formatting buttons
document.getElementById("fmtBold").addEventListener("click", () => wrapSelection("**","**"));
document.getElementById("fmtItal").addEventListener("click", () => wrapSelection("_","_"));
document.getElementById("fmtAccent").addEventListener("click", () => wrapSelection("==","=="));
document.getElementById("fmtUnder").addEventListener("click", () => wrapSelection("++","++"));
document.getElementById("fmtStrike").addEventListener("click", () => wrapSelection("~~","~~"));
document.getElementById("fmtCode").addEventListener("click", () => wrapSelection("`","`"));

// Window types
function parseKV(text){
  return (text || "")
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(":");
      if(parts.length >= 2){
        const k = parts.shift().trim();
        const v = parts.join(":").trim();
        return [k,v];
      }
      return [line, ""];
    });
}

function parseChecklist(text){
  return (text || "")
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean)
    .map(line => {
      const checked = /^\[(x|X)\]/.test(line);
      const cleaned = line.replace(/^\[(x|X|\s)\]\s*/,"");
      return {checked, text: cleaned};
    });
}

function escapeHtml(s){
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

/* Markup:
   **bold**
   _italic_
   ==accent==
   ~~strike~~
   ++underline++
   `code`
   Blocks:
   [[pill:accent:Text]]
   [[pill:warn:Text]]
   [[pill:plain:Text]]
   [[tag:Text]]
*/
function renderMarkup(text){
  let t = escapeHtml(text || "");

  // blocks first (so that inner markup can still apply later)
  t = t.replace(/\[\[pill:(accent|warn|plain):(.+?)\]\]/g, (m, kind, body) => {
    const cls = kind === "plain" ? "" : ` ${kind === "accent" ? "accent" : "warn"}`;
    const icon = kind === "warn" ? "▲" : "◆";
    return `<span class="pill inline-pill${cls}">${icon} ${escapeHtml(body)}</span>`;
  });
  t = t.replace(/\[\[tag:(.+?)\]\]/g, (m, body) => {
    return `<span class="tag inline-tag">${escapeHtml(body)}</span>`;
  });

  // inline formatting
  t = t.replace(/\*\*(.+?)\*\*/g, '<span class="t-bold">$1</span>');
  t = t.replace(/_(.+?)_/g, '<span class="t-ital">$1</span>');
  t = t.replace(/==(.+?)==/g, '<span class="t-accent">$1</span>');
  t = t.replace(/\+\+(.+?)\+\+/g, '<span class="t-under">$1</span>');
  t = t.replace(/~~(.+?)~~/g, '<span class="t-strike">$1</span>');
  t = t.replace(/`(.+?)`/g, '<span class="t-code">$1</span>');

  // bullets: lines that start with "- "
  // (simple transform to list; keep it minimal)
  const lines = t.split("\n");
  const hasBullets = lines.some(l => l.trim().startsWith("- "));
  if(hasBullets){
    const items = [];
    let normal = [];
    for(const line of lines){
      const trimmed = line.trim();
      if(trimmed.startsWith("- ")){
        if(normal.length){
          // flush normal paragraph as <div>
          items.push({type:"p", html: normal.join("<br>")});
          normal = [];
        }
        items.push({type:"li", html: trimmed.slice(2)});
      }else{
        normal.push(line);
      }
    }
    if(normal.length) items.push({type:"p", html: normal.join("<br>")});

    // build html: paragraphs + list
    let out = "";
    let currentList = [];
    function flushList(){
      if(!currentList.length) return;
      out += `<ul class="list">` + currentList.map(x => `<li>${x}</li>`).join("") + `</ul>`;
      currentList = [];
    }
    for(const it of items){
      if(it.type === "li"){
        currentList.push(it.html);
      }else{
        flushList();
        out += `<div>` + it.html + `</div>`;
      }
    }
    flushList();
    return out;
  }

  // default: newlines
  t = t.replace(/\n/g, "<br>");
  return t;
}

// Deterministic RNG (mulberry32)
function makeRng(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function corruptString(s, amount, rng){
  const repl = ["█","▓","▒","░","?","/","\\","|","⟂","⟊","⟟"];
  let out = "";
  for(const ch of s){
    // keep digits and whitespace mostly intact
    if(/\d/.test(ch) || /\s/.test(ch)){
      out += ch;
      continue;
    }
    if(rng() < amount){
      out += repl[Math.floor(rng() * repl.length)];
    }else{
      out += ch;
    }
  }
  return out;
}

function applyCorruptionTo(el, amount, seed){
  if(amount <= 0) return;
  const rng = makeRng(seed);

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node;
  while((node = walker.nextNode())){
    node.nodeValue = corruptString(node.nodeValue, amount, rng);
  }
}

// Window templates
const WINDOW_TYPES = {
  character: {
    label: "1) Окно персонажа",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Подзаголовок", type:"text"},
      {id:"name", label:"Имя", type:"text"},
      {id:"klass", label:"Класс", type:"text"},
      {id:"level", label:"Уровень", type:"text"},
      {id:"title2", label:"Титул", type:"text"},
      {id:"resources", label:"Ресурсы (ключ: значение)", type:"textarea"},
      {id:"attributes", label:"Атрибуты (ключ: значение)", type:"textarea"},
      {id:"effects", label:"Эффекты/состояния (список)", type:"textarea"},
      {id:"achievements", label:"Достижения (список, опц.)", type:"textarea"},
      {id:"quests", label:"Активные задания (список, опц.)", type:"textarea"},
      {id:"currencies", label:"Валюта (ключ: значение)", type:"textarea"}
    ],
    defaults: {
      title: "STATUS",
      subtitle: "СИСТЕМА • ЛИЧНЫЙ ПРОФИЛЬ",
      name: "⟦ИМЯ⟧",
      klass: "⟦КЛАСС⟧",
      level: "⟦УРОВЕНЬ⟧",
      title2: "⟦ТИТУЛ⟧",
      resources: "HP: 72/100\nMP: 18/40\nSTAM: 55/70\nXP: 420/900",
      attributes: "Сила: 12\nЛовкость: 9\nИнтеллект: 14\nВыносливость: 11\nВоля: 8\nУдача: 6",
      effects: "- Порог боли: снижен\n- Сонливость: +1\n- Благословение: ==малая удача==",
      achievements: "- ==«Порог преодолён»==\n- «Везение на грани»",
      quests: "- [[tag:ACTIVE]] Утренняя тренировка\n- [[tag:MAIN]] Доступ к Нижнему Ярусу",
      currencies: "Золото: 143\nКредиты: 0"
    },
    render(d){
      const res = parseKV(d.resources);
      const attrs = parseKV(d.attributes);
      const eff = (d.effects || "").split("\n").map(x=>x.trim()).filter(Boolean);
      const ach = (d.achievements || "").split("\n").map(x=>x.trim()).filter(Boolean);
      const qst = (d.quests || "").split("\n").map(x=>x.trim()).filter(Boolean);
      const cur = parseKV(d.currencies);

      const bars = res.map(([k,v]) => {
        const m = v.match(/(\d+)\s*\/\s*(\d+)/);
        let pct = 50;
        if(m){
          const a = parseFloat(m[1]), b = Math.max(1, parseFloat(m[2]));
          pct = Math.max(0, Math.min(100, (a/b)*100));
        }
        return `
          <div class="barbox">
            <div class="bar-top"><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>
            <div class="track"><div class="fill" style="width:${pct.toFixed(1)}%"></div></div>
          </div>
        `;
      }).join("");

      const attrsHtml = attrs.slice(0, 10).map(([k,v]) => `
        <div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div>
      `).join("");

      const curHtml = cur.map(([k,v]) => `<span class="pill">${escapeHtml(k)}: ${escapeHtml(v)}</span>`).join("");

      const effHtml = eff.length ? `<div class="fx-text">${renderMarkup(eff.join("\n"))}</div>` : `<div class="k">Нет активных эффектов</div>`;
      const achHtml = ach.length ? `<div class="fx-text">${renderMarkup(ach.join("\n"))}</div>` : "";
      const qstHtml = qst.length ? `<div class="fx-text">${renderMarkup(qst.join("\n"))}</div>` : "";

      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <div class="status-grid">
            <div>
              <div class="kv">
                <div class="k">Имя</div><div class="v">${escapeHtml(d.name)}</div>
                <div class="k">Класс</div><div class="v">${escapeHtml(d.klass)}</div>
                <div class="k">Уровень</div><div class="v">${escapeHtml(d.level)}</div>
                <div class="k">Титул</div><div class="v">${escapeHtml(d.title2)}</div>
              </div>

              <div class="sep"></div>
              <div class="k">Атрибуты</div>
              <div class="stats2">${attrsHtml}</div>

              <div class="sep"></div>
              <div class="k">Валюта</div>
              <div style="margin-top:8px;">${curHtml}</div>
            </div>

            <div>
              <div class="k">Ресурсы</div>
              ${bars}

              <div class="sep"></div>
              <div class="k">Эффекты</div>
              ${effHtml}

              ${ach.length ? `<div class="sep"></div><div class="k">Достижения</div>${achHtml}` : ""}
              ${qst.length ? `<div class="sep"></div><div class="k">Задания</div>${qstHtml}` : ""}
            </div>
          </div>
        </div>
      `;
    }
  },

  system_toast: {
    label: "2) Уведомление системы",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Подзаголовок", type:"text"},
      {id:"severity", label:"Уровень (info/warn/danger)", type:"text"},
      {id:"message", label:"Текст", type:"textarea"}
    ],
    defaults: {
      title: "SYSTEM",
      subtitle: "УВЕДОМЛЕНИЕ",
      severity: "info",
      message: "Получено: **+120 XP**\nДостижение: ==«Порог преодолён»==\n[[pill:accent:Новая запись]]"
    },
    render(d){
      const sev = String(d.severity || "info").toLowerCase().trim();
      const cls = sev === "danger" ? "warn" : "accent";
      const icon = sev === "danger" ? "▲" : (sev === "warn" ? "!" : "◆");
      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <span class="pill ${cls}">${icon} ${escapeHtml(sev.toUpperCase())}</span>
          <div class="fx-text" style="margin-top:10px;">${renderMarkup(d.message || "")}</div>
        </div>
      `;
    }
  },

  quest_card: {
    label: "3) Квест",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Тип/категория", type:"text"},
      {id:"questName", label:"Название квеста", type:"text"},
      {id:"questDesc", label:"Описание", type:"textarea"},
      {id:"objectives", label:"Цели ([x]/[ ] строка)", type:"textarea"},
      {id:"rewards", label:"Награды (список)", type:"textarea"},
      {id:"warning", label:"Предупреждение (опц.)", type:"text"}
    ],
    defaults: {
      title: "QUEST",
      subtitle: "ЕЖЕДНЕВНОЕ",
      questName: "⟦ЦЕЛЬ⟧",
      questDesc: "Тренировка назначена. Заверши цели до конца дня.",
      objectives: "[x] Отжимания: 100/100\n[x] Пресс: 100/100\n[ ] Бег: 0/5км",
      rewards: "- +⟦НАГРАДА⟧\n- +50 XP\n- +3 к выносливости (1 час)",
      warning: "Провал: штраф к характеристикам"
    },
    render(d){
      const goals = parseChecklist(d.objectives);
      const rewards = (d.rewards||"").split("\n").map(x=>x.trim()).filter(Boolean);
      const goalsHtml = goals.map(g => `
        <div style="display:flex; gap:10px; align-items:flex-start; margin:6px 0;">
          <span class="tag">${g.checked ? "■" : "□"}</span>
          <div class="fx-text" style="flex:1;">${renderMarkup(g.text)}</div>
        </div>
      `).join("");
      const rewHtml = rewards.length
        ? `<div class="fx-text">${renderMarkup(rewards.join("\n"))}</div>`
        : `<div class="k">Нет наград</div>`;
      const warn = (d.warning||"").trim();

      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <span class="pill accent">◆ ${escapeHtml(d.questName || "")}</span>
          <div class="fx-text" style="margin-top:8px;">${renderMarkup(d.questDesc || "")}</div>

          <div class="sep"></div>
          <div class="k">Цели</div>
          <div style="margin-top:8px;">${goalsHtml}</div>

          <div class="sep"></div>
          <div class="k">Награда</div>
          ${rewHtml}

          ${warn ? `<div class="sep"></div><span class="pill warn">▲ ${escapeHtml(warn)}</span>` : ""}
        </div>
      `;
    }
  },

  log_panel: {
    label: "4) Логи",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Подзаголовок", type:"text"},
      {id:"tag", label:"Тег", type:"text"},
      {id:"lines", label:"Строки (каждая строка — запись)", type:"textarea"}
    ],
    defaults: {
      title: "LOG",
      subtitle: "ПОТОК СОБЫТИЙ",
      tag: "SYSTEM",
      lines: "[00:02] Получено: +10 XP\n[00:04] Урон: 12 (режущ.)\n[00:06] Критический удар\n[00:08] Лут: 1× «Осколок»"
    },
    render(d){
      const tag = (d.tag || "SYSTEM").trim().toUpperCase();
      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <span class="pill accent">◆ ${escapeHtml(tag)}</span>
          <div class="logbox fx-text" style="margin-top:10px;">${escapeHtml(d.lines || "")}</div>
        </div>
      `;
    }
  },

  global_banner: {
    label: "5) Глобальное уведомление",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Подзаголовок", type:"text"},
      {id:"message", label:"Сообщение", type:"textarea"}
    ],
    defaults: {
      title: "ANNOUNCEMENT",
      subtitle: "СИСТЕМНОЕ СОБЫТИЕ",
      message: "Открыта новая зона: ==«Нижний Ярус»==\nДоступ: уровень ⟦УРОВЕНЬ⟧ и выше.\n[[pill:plain:Соблюдай осторожность]]"
    },
    render(d){
      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body" style="text-align:center;">
          <div class="fx-text" style="font-size:14px;">${renderMarkup(d.message||"")}</div>
        </div>
      `;
    }
  },

  ability_window: {
    label: "6) Способность/класс",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Класс/тип", type:"text"},
      {id:"name", label:"Название", type:"text"},
      {id:"rarity", label:"Редкость", type:"text"},
      {id:"cost", label:"Стоимость", type:"text"},
      {id:"cooldown", label:"КД", type:"text"},
      {id:"desc", label:"Описание", type:"textarea"},
      {id:"effects", label:"Эффекты (список)", type:"textarea"}
    ],
    defaults: {
      title: "SKILL",
      subtitle: "Класс: ⟦КЛАСС⟧ • Активная",
      name: "Рывок Тени",
      rarity: "Редкая",
      cost: "Мана: 18",
      cooldown: "КД: 14с",
      desc: "Мгновенно перемещает к цели или в точку.\nЕсли цель в тени — ==120%== урона оружия.",
      effects: "- После рывка: +25% уклонения (3 сек)\n- Эхо: -10% точности врагов (2 сек)\n- [[tag:NOTE]] Срыв при оглушении"
    },
    render(d){
      const effects = (d.effects||"").split("\n").map(x=>x.trim()).filter(Boolean);
      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <div class="row">
            <span class="pill accent">◆ ${escapeHtml(d.name || "")}</span>
            <span class="pill">${escapeHtml(d.rarity || "")}</span>
            <span class="pill">${escapeHtml(d.cost || "")}</span>
            <span class="pill">${escapeHtml(d.cooldown || "")}</span>
          </div>
          <div class="fx-text" style="margin-top:10px;">${renderMarkup(d.desc || "")}</div>
          ${effects.length ? `<div class="fx-text">${renderMarkup(effects.join("\n"))}</div>` : ""}
        </div>
      `;
    }
  },

  loot_window: {
    label: "7) Лут/награда",
    fields: [
      {id:"title", label:"Заголовок", type:"text"},
      {id:"subtitle", label:"Источник", type:"text"},
      {id:"item", label:"Предмет", type:"text"},
      {id:"rarity", label:"Редкость", type:"text"},
      {id:"props", label:"Свойства (список)", type:"textarea"},
      {id:"flavor", label:"Описание (опц.)", type:"textarea"}
    ],
    defaults: {
      title: "LOOT",
      subtitle: "Получено",
      item: "Осколок Эха",
      rarity: "Необычный",
      props: "- +1 к Воле\n- +3% к сопротивлению страху\n- [[pill:accent:Уникально]]",
      flavor: "Тусклый фрагмент, внутри которого иногда слышен чужой шёпот."
    },
    render(d){
      const props = (d.props||"").split("\n").map(x=>x.trim()).filter(Boolean);
      return `
        <div class="w-head draggable">
          <div class="w-title" data-text="${escapeHtml(d.title)}">${escapeHtml(d.title)}</div>
          <div class="w-sub">${escapeHtml(d.subtitle)}</div>
        </div>
        <div class="w-body">
          <div class="row">
            <span class="pill accent">◆ ${escapeHtml(d.item || "")}</span>
            <span class="pill">${escapeHtml(d.rarity || "")}</span>
          </div>
          ${props.length ? `<div class="fx-text">${renderMarkup(props.join("\n"))}</div>` : ""}
          ${d.flavor ? `<div class="sep"></div><div class="k">Описание</div><div class="fx-text" style="margin-top:6px;">${renderMarkup(d.flavor)}</div>` : ""}
        </div>
      `;
    }
  }
};

// State + history
const DEFAULT_STATE = {
  type: "character",
  theme: "Parchment Dusk",
  canvas: "1920x1080",

  exportTarget: "window",
  exportScale: 2,

  fxMode: "none",
  fxIntensity: 0.8,
  corruptAmount: 0.0,
  corruptSeed: 123456,
  seedFrozen: true,

  snap: false,
  showGrid: false,
  freezeFxOnExport: true,

  pos: {x:120, y:90, w:540, h:0},
  pageIndex: 0,
  dataByType: {}
};

let state = deepClone(DEFAULT_STATE);

let history = [];
let historyIdx = -1;

function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem(LS_STATE) || "null");
    if(s && typeof s === "object"){
      state = {...deepClone(DEFAULT_STATE), ...s};
      // Ensure dataByType exists
      if(!state.dataByType || typeof state.dataByType !== "object") state.dataByType = {};
      if(typeof state.pageIndex !== "number") state.pageIndex = 0;
    }
  }catch(e){}
}

function saveState(){
  localStorage.setItem(LS_STATE, JSON.stringify(state));
}

function pushHistory(){
  // drop forward
  history = history.slice(0, historyIdx + 1);
  history.push(deepClone(state));
  historyIdx = history.length - 1;
  // cap
  if(history.length > 40){
    history.shift();
    historyIdx--;
  }
}

function undo(){
  if(historyIdx <= 0) return;
  historyIdx--;
  state = deepClone(history[historyIdx]);
  syncUIFromState();
  renderAll();
}

function redo(){
  if(historyIdx >= history.length - 1) return;
  historyIdx++;
  state = deepClone(history[historyIdx]);
  syncUIFromState();
  renderAll();
}

function loadThemes(){
  const custom = JSON.parse(localStorage.getItem(LS_THEMES) || "{}");
  return {...BUILTIN_THEMES, ...custom};
}
function saveThemes(allThemes){
  const custom = {};
  Object.keys(allThemes).forEach(name => {
    if(!BUILTIN_THEMES[name]) custom[name] = allThemes[name];
  });
  localStorage.setItem(LS_THEMES, JSON.stringify(custom));
}

function loadPresets(){
  return JSON.parse(localStorage.getItem(LS_PRESETS) || "[]");
}
function savePresets(list){
  localStorage.setItem(LS_PRESETS, JSON.stringify(list));
}
function loadBlocks(){
  return JSON.parse(localStorage.getItem(LS_BLOCKS) || "[]");
}
function saveBlocks(list){
  localStorage.setItem(LS_BLOCKS, JSON.stringify(list));
}

function setCssVars(vars){
  for(const [k,v] of Object.entries(vars || {})){
    document.documentElement.style.setProperty(k, v);
  }
}

function rgbaToHex(v){
  if(!v) return null;
  v = String(v).trim();
  if(v.startsWith("#")){
    if(v.length===4){
      const r=v[1],g=v[2],b=v[3];
      return "#"+r+r+g+g+b+b;
    }
    return v;
  }
  const m = v.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if(!m) return null;
  const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
  const to2 = x => x.toString(16).padStart(2,"0");
  return "#"+to2(r)+to2(g)+to2(b);
}

function hexToRgba(hex, a){
  hex = String(hex || "").replace("#","").trim();
  if(hex.length===3) hex = hex.split("").map(x=>x+x).join("");
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyThemeByName(name){
  const themes = loadThemes();
  const t = themes[name] || themes["Parchment Dusk"];
  if(!t) return;
  setCssVars(t.vars || {});
  state.theme = name;
  saveState();
}

function applyCustomCss(){
  const css = localStorage.getItem(LS_CSS) || "";
  ui.customCssSlot.textContent = css;
}

// Canvas scaling
function setCanvas(sizeStr){
  const [w,h] = sizeStr.split("x").map(Number);
  state.canvas = sizeStr;

  const viewW = 960;
  const scale = viewW / w;
  const viewH = Math.round(h * scale);
  ui.artboard.style.width = viewW + "px";
  ui.artboard.style.height = viewH + "px";
  ui.artboard.dataset.scale = String(scale);

  applyWindowRectFromState();
  updateLayoutStats();
  saveState();
}

function scale(){ return parseFloat(ui.artboard.dataset.scale || "0.5"); }

function applyWindowRectFromState(){
  const s = scale();
  ui.sysWindow.style.left = (state.pos.x * s) + "px";
  ui.sysWindow.style.top  = (state.pos.y * s) + "px";
  ui.sysWindow.style.width= (state.pos.w * s) + "px";
  ui.sysWindow.style.height = (state.pos.h && state.pos.h > 0) ? (state.pos.h * s) + "px" : "auto";
  updateLayoutStats();
}

function captureWindowRectToState(){
  const s = scale();
  const r = ui.sysWindow.getBoundingClientRect();
  const a = ui.artboard.getBoundingClientRect();
  const x = (r.left - a.left) / s;
  const y = (r.top - a.top) / s;
  const w = r.width / s;
  const h = ui.sysWindow.style.height && ui.sysWindow.style.height !== "auto" ? (r.height / s) : 0;
  state.pos = {x,y,w,h};
  saveState();
  updateLayoutStats();
}

function snap8(v){ return Math.round(v / 8) * 8; }

// Drag
let drag = {on:false, dx:0, dy:0, pointerId:null};
function bindDrag(){
  const handle = ui.sysWindow.querySelector(".w-head.draggable") || ui.sysWindow;
  handle.onpointerdown = (e) => {
    e.preventDefault();
    drag.on = true;
    drag.pointerId = e.pointerId;
    const r = ui.sysWindow.getBoundingClientRect();
    drag.dx = e.clientX - r.left;
    drag.dy = e.clientY - r.top;
    handle.setPointerCapture(e.pointerId);
  };
  handle.onpointermove = (e) => {
    if(!drag.on) return;
    const a = ui.artboard.getBoundingClientRect();
    let x = e.clientX - a.left - drag.dx;
    let y = e.clientY - a.top - drag.dy;

    if(state.snap){
      x = snap8(x);
      y = snap8(y);
    }
    x = Math.max(0, Math.min(x, a.width - 40));
    y = Math.max(0, Math.min(y, a.height - 40));

    ui.sysWindow.style.left = x + "px";
    ui.sysWindow.style.top  = y + "px";
  };
  handle.onpointerup = () => {
    if(!drag.on) return;
    drag.on = false;
    captureWindowRectToState();
    pushHistory();
  };

  handle.ondblclick = () => {
    // center X
    const a = ui.artboard.getBoundingClientRect();
    const w = ui.sysWindow.getBoundingClientRect().width;
    ui.sysWindow.style.left = Math.max(0, (a.width - w) / 2) + "px";
    captureWindowRectToState();
    pushHistory();
  };

  ui.sysWindow.onmouseup = () => captureWindowRectToState();
}

function centerWindowOnCanvas(){
  const a = ui.artboard.getBoundingClientRect();
  const w = ui.sysWindow.getBoundingClientRect().width;
  const h = ui.sysWindow.getBoundingClientRect().height;
  ui.sysWindow.style.left = Math.max(0, (a.width - w) / 2) + "px";
  ui.sysWindow.style.top = Math.max(0, (a.height - h) / 2) + "px";
  captureWindowRectToState();
  pushHistory();
}

function autoHeightWindow(){
  ui.sysWindow.style.height = "auto";
  state.pos.h = 0;
  captureWindowRectToState();
  pushHistory();
}

function setWindowWidthRatio(ratio){
  const a = ui.artboard.getBoundingClientRect();
  const newW = Math.max(360, a.width * ratio);
  ui.sysWindow.style.width = newW + "px";
  ui.sysWindow.style.height = "auto";
  captureWindowRectToState();
  pushHistory();
}

function setFxClasses(){
  ui.sysWindow.classList.remove("fx-lag","fx-glitch","fx-scanlines");
  if(state.fxMode === "lag") ui.sysWindow.classList.add("fx-lag");
  if(state.fxMode === "glitch") ui.sysWindow.classList.add("fx-glitch");
  if(state.fxMode === "scanlines") ui.sysWindow.classList.add("fx-scanlines");
  document.documentElement.style.setProperty("--fx-i", String(state.fxIntensity));
}

function setTypeSizeClass(){
  ui.sysWindow.classList.remove("type-toast","type-global","type-logs");
  if(state.type === "system_toast") ui.sysWindow.classList.add("type-toast");
  if(state.type === "global_banner") ui.sysWindow.classList.add("type-global");
  if(state.type === "log_panel") ui.sysWindow.classList.add("type-logs");
}

function renderTypeMeta(){
  const meta = TYPE_META[state.type] || {};
  ui.typeTitle.textContent = meta.title || (WINDOW_TYPES[state.type]?.label || "Тип окна");
  ui.typeDesc.textContent = meta.desc || "Настрой поля и сохрани пресет.";
  ui.typeChips.innerHTML = "";
  (meta.chips || []).forEach(c => {
    const chip = document.createElement("div");
    chip.className = "chip ghost";
    chip.textContent = c;
    ui.typeChips.appendChild(chip);
  });
}

function updateMetaBar(){
  const typeLabel = WINDOW_TYPES[state.type]?.label || state.type;
  const [cw,ch] = String(state.canvas || "1920x1080").split("x").map(Number);
  const winW = state.pos.w || Math.round(ui.sysWindow.getBoundingClientRect().width / scale());
  const winH = state.pos.h ? state.pos.h : Math.round(ui.sysWindow.getBoundingClientRect().height / scale());

  ui.metaType.textContent = typeLabel;
  ui.metaTheme.textContent = `Тема: ${state.theme}`;
  ui.metaCanvas.textContent = `Холст: ${cw}×${ch}`;
  const pages = parseInt(ui.sysWindow.dataset.pages || "1", 10);
  const pageInfo = pages > 1 ? `страницы ${state.pageIndex+1}/${pages}` : "1 страница";
  ui.metaWindow.textContent = `Окно: ${Math.round(winW)}px × ${state.pos.h ? Math.round(winH)+"px" : "auto"} • X ${Math.round(state.pos.x)}, Y ${Math.round(state.pos.y)} • ${pageInfo}`;

  ui.layoutStats.textContent = [
    `pos: ${Math.round(state.pos.x)}×${Math.round(state.pos.y)}px`,
    `size: ${Math.round(winW)}px × ${state.pos.h ? Math.round(winH)+"px" : "auto"}`,
    state.snap ? "snap: on" : "snap: off",
    pages > 1 ? `pages: ${state.pageIndex+1}/${pages}` : "pages: 1"
  ].join(" • ");
}

function buildQuickStarts(){
  ui.quickStarts.innerHTML = "";
  QUICK_STARTS.forEach(q => {
    const card = document.createElement("div");
    card.className = "preset-card";
    const typeLabel = WINDOW_TYPES[q.type]?.label || q.type;
    card.innerHTML = `
      <div class="title">${escapeHtml(q.name)}</div>
      <div class="meta">
        <span>${escapeHtml(typeLabel)}</span>
        <span>Тема: ${escapeHtml(q.theme)}</span>
        <span>${q.fxMode !== "none" ? `FX: ${escapeHtml(q.fxMode)}` : "FX: off"}</span>
      </div>
    `;
    card.addEventListener("click", () => applyQuickStart(q));
    ui.quickStarts.appendChild(card);
  });
}

function applyQuickStart(preset){
  const def = WINDOW_TYPES[preset.type];
  if(!def) return;

  if(!state.dataByType[preset.type]) state.dataByType[preset.type] = deepClone(def.defaults);
  state.type = preset.type;
  state.theme = preset.theme || state.theme;
  state.fxMode = preset.fxMode ?? "none";
  state.fxIntensity = preset.fxIntensity ?? state.fxIntensity;
  state.canvas = preset.canvas || state.canvas;
  state.corruptAmount = preset.corruptAmount ?? state.corruptAmount;
  state.pageIndex = 0;

  state.dataByType[preset.type] = {...deepClone(def.defaults), ...(preset.data || {})};
  if(preset.pos) state.pos = deepClone(preset.pos);

  saveState();
  syncUIFromState();
  renderAll();
  pushHistory();
}

function updateLayoutStats(){
  updateMetaBar();
}

function setupPaging(){
  const viewport = ui.sysWindow.querySelector(".page-viewport");
  const track = ui.sysWindow.querySelector(".page-track");
  const nav = ui.sysWindow.querySelector(".page-nav");
  if(!viewport || !track || !nav) return 1;

  const maxAllowed = Math.max(320, ui.artboard.clientHeight - 60);
  const targetH = Math.min(track.scrollHeight, maxAllowed);
  viewport.style.height = targetH + "px";

  const pageHeight = viewport.clientHeight || targetH;
  const pages = Math.max(1, Math.ceil(track.scrollHeight / pageHeight));
  ui.sysWindow.dataset.pages = String(pages);
  ui.sysWindow.dataset.pageHeight = String(pageHeight);
  if(state.pageIndex >= pages) state.pageIndex = pages - 1;

  function applyPage(idx){
    state.pageIndex = Math.max(0, Math.min(idx, pages - 1));
    track.style.transform = `translateY(-${pageHeight * state.pageIndex}px)`;
    const dots = nav.querySelector(".page-dots");
    dots.innerHTML = "";
    for(let i=0;i<pages;i++){
      const d = document.createElement("div");
      d.className = "page-dot" + (i === state.pageIndex ? " active" : "");
      d.addEventListener("click", () => applyPage(i));
      dots.appendChild(d);
    }
    const label = nav.querySelector(".page-label");
    label.textContent = pages > 1 ? `Страница ${state.pageIndex+1}/${pages}` : "";
    nav.hidden = pages <= 1;
    saveState();
  }

  nav.querySelectorAll(".page-btn").forEach(btn => {
    btn.onclick = () => applyPage(state.pageIndex + Number(btn.dataset.dir || "0"));
  });

  applyPage(state.pageIndex);
  return pages;
}

// Build selectors
function buildTypeSelect(){
  ui.type.innerHTML = "";
  Object.entries(WINDOW_TYPES).forEach(([id, def]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = def.label;
    ui.type.appendChild(opt);
  });
}

function buildThemeSelect(){
  const themes = loadThemes();
  ui.theme.innerHTML = "";
  Object.keys(themes).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    ui.theme.appendChild(opt);
  });
}

function buildMarkers(){
  ui.markers.innerHTML = "";
  for(const m of MARKERS){
    const b = document.createElement("div");
    b.className = "kbd";
    b.tabIndex = 0;
    b.textContent = m;
    b.addEventListener("mousedown", (e) => {
      e.preventDefault();
      insertToken(m);
    });
    b.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        insertToken(m);
      }
    });
    ui.markers.appendChild(b);
  }
}

function buildBlocks(){
  ui.blocks.innerHTML = "";
  const custom = loadBlocks();
  const combined = [...BLOCKS, ...custom];
  for(const blk of combined){
    const b = document.createElement("div");
    b.className = "kbd";
    b.tabIndex = 0;
    b.textContent = blk.label;
    b.addEventListener("mousedown", (e) => {
      e.preventDefault();
      insertToken(blk.value);
    });
    b.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        insertToken(blk.value);
      }
    });
    ui.blocks.appendChild(b);
  }
  renderCustomBlocks();
}

function renderCustomBlocks(){
  const list = loadBlocks();
  ui.customBlocks.innerHTML = "";
  list.forEach((blk, idx) => {
    const b = document.createElement("div");
    b.className = "kbd";
    b.tabIndex = 0;
    b.textContent = blk.label;
    b.title = blk.value;
    b.addEventListener("mousedown", (e) => {
      e.preventDefault();
      insertToken(blk.value);
    });
    b.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        insertToken(blk.value);
      }
    });
    b.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const rest = loadBlocks().filter((_, j) => j !== idx);
      saveBlocks(rest);
      buildBlocks();
    });
    ui.customBlocks.appendChild(b);
  });
}

function buildFields(){
  const def = WINDOW_TYPES[state.type];
  if(!def) return;

  if(!state.dataByType[state.type]){
    state.dataByType[state.type] = deepClone(def.defaults);
  }

  ui.fields.innerHTML = "";
  for(const f of def.fields){
    const wrap = document.createElement("div");
    wrap.className = "field";

    const lab = document.createElement("label");
    lab.textContent = f.label;
    wrap.appendChild(lab);

    let input;
    if(f.type === "textarea"){
      input = document.createElement("textarea");
      input.value = state.dataByType[state.type][f.id] ?? "";
      input.spellcheck = false;
    }else{
      input = document.createElement("input");
      input.type = "text";
      input.value = state.dataByType[state.type][f.id] ?? "";
    }
    input.dataset.fieldId = f.id;

    input.addEventListener("input", () => {
      state.dataByType[state.type][f.id] = input.value;
      saveState();
      renderWindow();
      // history (debounced)
      debouncedHistory();
    });

    wrap.appendChild(input);
    ui.fields.appendChild(wrap);
  }
}

let histTimer = null;
function debouncedHistory(){
  if(histTimer) clearTimeout(histTimer);
  histTimer = setTimeout(() => {
    pushHistory();
    histTimer = null;
  }, 450);
}

// Token insertion into active element
function insertToken(token){
  const active = document.activeElement;
  const target = isTextInput(active) ? active : (isTextInput(lastTextInput) && lastTextInput.isConnected ? lastTextInput : null);
  if(!target) return;

  const start = target.selectionStart ?? target.value.length;
  const end   = target.selectionEnd ?? target.value.length;
  const v = target.value;
  target.value = v.slice(0,start) + token + v.slice(end);
  const pos = start + token.length;
  target.setSelectionRange(pos,pos);
  target.dispatchEvent(new Event("input", {bubbles:true}));
  target.focus();
  lastTextInput = target;
}

// Wrap selection
function wrapSelection(prefix, suffix){
  const active = document.activeElement;
  const target = isTextInput(active) ? active : (isTextInput(lastTextInput) && lastTextInput.isConnected ? lastTextInput : null);
  if(!target) return;

  const start = target.selectionStart ?? 0;
  const end   = target.selectionEnd ?? 0;
  if(end <= start) return;
  const v = target.value;
  const sel = v.slice(start, end);
  target.value = v.slice(0,start) + prefix + sel + suffix + v.slice(end);
  const nStart = start + prefix.length;
  const nEnd = nStart + sel.length;
  target.setSelectionRange(nStart, nEnd);
  target.dispatchEvent(new Event("input", {bubbles:true}));
  target.focus();
  lastTextInput = target;
}

function renderWindow(){
  const def = WINDOW_TYPES[state.type];
  if(!def) return;

  setTypeSizeClass();
  setFxClasses();

  const data = state.dataByType[state.type] || def.defaults;
  const inner = def.render(data);
  ui.sysWindow.innerHTML = `
    <div class="page-viewport">
      <div class="page-track">${inner}</div>
    </div>
    <div class="page-nav" data-role="pager" hidden>
      <button class="page-btn" data-dir="-1">←</button>
      <div class="page-dots"></div>
      <button class="page-btn" data-dir="1">→</button>
      <div class="page-label"></div>
    </div>
  `;

  // re-apply rect after re-render
  applyWindowRectFromState();

  // corruption (only inside .fx-text blocks)
  const amt = state.corruptAmount;
  if(amt > 0){
    const seed = state.corruptSeed;
    const blocks = ui.sysWindow.querySelectorAll(".fx-text");
    let i = 0;
    blocks.forEach(b => applyCorruptionTo(b, amt, seed + i++ * 10007));
  }

  setupPaging();

  // ensure title has data-text for glitch overlay (already set in templates)
  bindDrag();
  updateLayoutStats();
}

function renderGrid(){
  ui.gridOverlay.classList.toggle("on", state.showGrid);
}

function renderAll(){
  applyThemeByName(state.theme);
  applyCustomCss();
  setCanvas(state.canvas);
  renderGrid();
  buildFields();
  refreshPresets();
  renderWindow();
  renderTypeMeta();
  updateLayoutStats();
  syncFxLabels();
}

function syncFxLabels(){
  ui.fxIntVal.textContent = `${Math.round(state.fxIntensity * 100)}%`;
  ui.corruptVal.textContent = `${Math.round(state.corruptAmount * 100)}%`;
}

function syncUIFromState(){
  ui.type.value = state.type;
  ui.theme.value = state.theme;
  ui.canvas.value = state.canvas;
  ui.exportTarget.value = state.exportTarget;
  ui.exportScale.value = String(state.exportScale);

  ui.fxMode.value = state.fxMode;
  ui.fxIntensity.value = String(Math.round(state.fxIntensity * 100));
  ui.corrupt.value = String(Math.round(state.corruptAmount * 100));
  ui.snap.checked = state.snap;
  ui.grid.checked = state.showGrid;
  ui.freezeFx.checked = state.freezeFxOnExport;

  syncFxLabels();
}

function refreshPresets(){
  const list = loadPresets();
  ui.presets.innerHTML = "";
  list.forEach((p, idx) => {
    const b = document.createElement("div");
    b.className = "kbd";
    b.textContent = p.name;
    b.title = "Загрузить";
    b.addEventListener("click", () => {
      state = deepClone(p.state);
      saveState();
      syncUIFromState();
      renderAll();
      pushHistory();
    });
    ui.presets.appendChild(b);

    // delete on right click
    b.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if(!confirm(`Удалить пресет «${p.name}»?`)) return;
      const n = loadPresets().filter((_, j) => j !== idx);
      savePresets(n);
      refreshPresets();
    });
  });
}

// Theme editor
function openThemeEditor(){
  ui.themeEditor.style.display = "block";
  const themes = loadThemes();
  const t = themes[state.theme] || themes["Parchment Dusk"];
  const vars = t.vars || {};

  ui.tName.value = "";
  ui.tPanelBg.value = rgbaToHex(vars["--panel-bg"]) || "#EBDCBC";
  ui.tInk.value = vars["--panel-ink"] || "#1B140A";
  ui.tBorder.value = rgbaToHex(vars["--border"]) || "#5A4120";
  ui.tAccent.value = vars["--accent"] || "#2E6F9E";
  ui.tAccent2.value = vars["--accent-2"] || "#7A2E2E";
  ui.tPageBg.value = vars["--page-bg"] || "#14110F";

  ui.tRadius.value = parseInt(String(vars["--radius"] || "16").replace("px",""), 10);
  ui.tBorderW.value = parseInt(String(vars["--border-w"] || "1").replace("px",""), 10);
  ui.tShadow.value = Math.round(parseFloat(vars["--shadow-alpha"] || "0.40") * 100);
  ui.tGlow.value = Math.round(parseFloat(vars["--glow-alpha"] || "0.00") * 100);
  ui.tCustomCss.value = localStorage.getItem(LS_CSS) || "";

  syncThemeSliders();
  // live apply while editing
  liveApplyThemeFromEditor();
}

function closeThemeEditor(){
  ui.themeEditor.style.display = "none";
}

function syncThemeSliders(){
  ui.tRadiusVal.textContent = `${ui.tRadius.value}px`;
  ui.tBorderWVal.textContent = `${ui.tBorderW.value}px`;
  ui.tShadowVal.textContent = `${ui.tShadow.value}%`;
  ui.tGlowVal.textContent = `${ui.tGlow.value}%`;
}

function liveApplyThemeFromEditor(){
  setCssVars({
    "--page-bg": ui.tPageBg.value,
    "--panel-bg": hexToRgba(ui.tPanelBg.value, 0.93),
    "--panel-ink": ui.tInk.value,
    "--border": hexToRgba(ui.tBorder.value, 0.55),
    "--accent": ui.tAccent.value,
    "--accent-2": ui.tAccent2.value,
    "--radius": `${ui.tRadius.value}px`,
    "--border-w": `${ui.tBorderW.value}px`,
    "--shadow-alpha": String((parseInt(ui.tShadow.value,10) / 100).toFixed(2)),
    "--glow-size": (parseInt(ui.tGlow.value,10) > 0) ? "16px" : "0px",
    "--glow-alpha": String((parseInt(ui.tGlow.value,10) / 100).toFixed(2))
  });
  ui.customCssSlot.textContent = ui.tCustomCss.value || "";
  renderWindow();
}

[ui.tPanelBg, ui.tInk, ui.tBorder, ui.tAccent, ui.tAccent2, ui.tPageBg,
 ui.tRadius, ui.tBorderW, ui.tShadow, ui.tGlow, ui.tCustomCss
].forEach(el => el.addEventListener("input", () => {
  syncThemeSliders();
  liveApplyThemeFromEditor();
}));

ui.tSave.addEventListener("click", () => {
  const name = (ui.tName.value || "").trim();
  if(!name){ alert("Укажи имя темы."); return; }

  const themes = loadThemes();
  themes[name] = {
    vars: {
      "--page-bg": ui.tPageBg.value,
      "--panel-bg": hexToRgba(ui.tPanelBg.value, 0.93),
      "--panel-ink": ui.tInk.value,
      "--panel-muted": themes[state.theme]?.vars?.["--panel-muted"] || "rgba(27, 20, 10, 0.70)",
      "--border": hexToRgba(ui.tBorder.value, 0.55),
      "--border-w": `${ui.tBorderW.value}px`,
      "--accent": ui.tAccent.value,
      "--accent-2": ui.tAccent2.value,
      "--radius": `${ui.tRadius.value}px`,
      "--shadow-alpha": String((parseInt(ui.tShadow.value,10) / 100).toFixed(2)),
      "--glow-size": (parseInt(ui.tGlow.value,10) > 0) ? "16px" : "0px",
      "--glow-alpha": String((parseInt(ui.tGlow.value,10) / 100).toFixed(2))
    }
  };
  saveThemes(themes);
  localStorage.setItem(LS_CSS, ui.tCustomCss.value || "");
  applyCustomCss();

  buildThemeSelect();
  ui.theme.value = name;
  applyThemeByName(name);
  saveState();

  closeThemeEditor();
  pushHistory();
});

ui.tClose.addEventListener("click", closeThemeEditor);
ui.themeToggle.addEventListener("click", () => {
  ui.themeEditor.style.display = (ui.themeEditor.style.display === "none" || !ui.themeEditor.style.display) ? "block" : "none";
  if(ui.themeEditor.style.display === "block") openThemeEditor();
});

// JSON editor
ui.showJson.addEventListener("click", () => {
  const show = ui.jsonBox.style.display === "none" || !ui.jsonBox.style.display;
  if(show){
    ui.jsonBox.style.display = "block";
    ui.jsonBox.value = JSON.stringify(state, null, 2);
  }else{
    ui.jsonBox.style.display = "none";
  }
});
ui.applyJson.addEventListener("click", () => {
  const txt = ui.jsonBox.value || "";
  try{
    const obj = JSON.parse(txt);
    if(!obj || typeof obj !== "object") throw new Error("bad json");
    state = {...deepClone(DEFAULT_STATE), ...obj};
    saveState();
    syncUIFromState();
    renderAll();
    pushHistory();
    alert("Применено.");
  }catch(e){
    alert("Ошибка JSON.");
  }
});

// Import/export JSON
ui.exportJson.addEventListener("click", () => {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    themes: JSON.parse(localStorage.getItem(LS_THEMES) || "{}"),
    customCss: localStorage.getItem(LS_CSS) || "",
    presets: loadPresets()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sms_v2_export.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

ui.importJson.addEventListener("change", async (e) => {
  const f = e.target.files?.[0];
  if(!f) return;
  const txt = await f.text();
  try{
    const obj = JSON.parse(txt);
    if(obj.themes) localStorage.setItem(LS_THEMES, JSON.stringify(obj.themes));
    if(typeof obj.customCss === "string") localStorage.setItem(LS_CSS, obj.customCss);
    if(obj.presets) savePresets(obj.presets);

    buildThemeSelect();
    applyCustomCss();
    refreshPresets();
    alert("Импорт завершён.");
  }catch(err){
    alert("Ошибка импорта.");
  }finally{
    e.target.value = "";
  }
});

ui.addBlock.addEventListener("click", () => {
  const label = (ui.blockLabel.value || ui.blockText.value || "").trim();
  const body = (ui.blockText.value || "").trim();
  const kind = ui.blockType.value || "pill:accent";
  if(!label && !body){
    alert("Заполни название или текст блока.");
    return;
  }
  const value = makeBlockValue(kind, body || label);
  const list = loadBlocks();
  list.push({label: label || value, value});
  saveBlocks(list);
  ui.blockLabel.value = "";
  ui.blockText.value = "";
  buildBlocks();
});

// Presets
ui.savePreset.addEventListener("click", () => {
  captureWindowRectToState();
  const name = prompt("Имя пресета:", `${state.type} / ${state.theme}`);
  if(!name) return;

  const list = loadPresets();
  list.push({
    name: name.trim().slice(0, 60),
    createdAt: new Date().toISOString(),
    state: deepClone(state)
  });
  savePresets(list);
  refreshPresets();
});

// Reset
ui.reset.addEventListener("click", () => {
  if(!confirm("Сбросить проект?")) return;
  localStorage.removeItem(LS_STATE);
  state = deepClone(DEFAULT_STATE);
  // keep themes/presets unless user explicitly deletes them
  saveState();
  syncUIFromState();
  renderAll();
  history = [];
  historyIdx = -1;
  pushHistory();
});

// Controls wiring
ui.type.addEventListener("change", () => {
  state.type = ui.type.value;
  state.pageIndex = 0;
  buildFields();
  renderWindow();
  renderTypeMeta();
  updateLayoutStats();
  saveState();
  pushHistory();
});

ui.theme.addEventListener("change", () => {
  applyThemeByName(ui.theme.value);
  buildThemeSelect();
  ui.theme.value = state.theme;
  renderAll();
  pushHistory();
});

ui.canvas.addEventListener("change", () => {
  setCanvas(ui.canvas.value);
  renderWindow();
  renderTypeMeta();
  updateLayoutStats();
  pushHistory();
});

ui.exportTarget.addEventListener("change", () => {
  state.exportTarget = ui.exportTarget.value;
  saveState();
});
ui.exportScale.addEventListener("change", () => {
  state.exportScale = parseFloat(ui.exportScale.value || "2");
  saveState();
});

ui.fxMode.addEventListener("change", () => {
  state.fxMode = ui.fxMode.value;
  renderWindow();
  saveState();
  pushHistory();
});

ui.fxIntensity.addEventListener("input", () => {
  const v = parseInt(ui.fxIntensity.value, 10);
  state.fxIntensity = Math.max(0, Math.min(2, v / 100));
  syncFxLabels();
  renderWindow();
  saveState();
});

ui.corrupt.addEventListener("input", () => {
  const v = parseInt(ui.corrupt.value, 10);
  state.corruptAmount = Math.max(0, Math.min(0.40, v / 100));
  syncFxLabels();
  renderWindow();
  saveState();
});

ui.newSeed.addEventListener("click", () => {
  state.corruptSeed = (Date.now() >>> 0);
  if(!state.seedFrozen){
    // if not frozen, also update on each click; (this is the click)
  }
  saveState();
  renderWindow();
  pushHistory();
});

ui.freezeSeed.addEventListener("click", () => {
  state.seedFrozen = !state.seedFrozen;
  ui.freezeSeed.textContent = state.seedFrozen ? "Фиксировать сид" : "Сид: свободный";
  saveState();
});

ui.snap.addEventListener("change", () => {
  state.snap = ui.snap.checked;
  saveState();
  updateLayoutStats();
});
ui.grid.addEventListener("change", () => {
  state.showGrid = ui.grid.checked;
  renderGrid();
  saveState();
});
ui.freezeFx.addEventListener("change", () => {
  state.freezeFxOnExport = ui.freezeFx.checked;
  saveState();
});

ui.centerWindow.addEventListener("click", centerWindowOnCanvas);
ui.fitWindow.addEventListener("click", autoHeightWindow);
ui.wideWindow.addEventListener("click", () => setWindowWidthRatio(0.6));

ui.undo.addEventListener("click", undo);
ui.redo.addEventListener("click", redo);

// html2canvas loader
function loadScript(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("load fail"));
    document.head.appendChild(s);
  });
}

async function ensureHtml2canvas(){
  if(window.html2canvas) return true;
  // try local vendor first
  try{ await loadScript("/static/vendor/html2canvas.min.js"); }catch(e){}
  if(window.html2canvas) return true;
  // CDN fallback
  try{ await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"); }catch(e){}
  return !!window.html2canvas;
}

ui.exportBtn.addEventListener("click", async () => {
  const ok = await ensureHtml2canvas();
  if(!ok){
    alert("Не удалось загрузить html2canvas. Проверь доступ к CDN или положи файл в static/vendor/.");
    return;
  }

  const target = (ui.exportTarget.value === "canvas") ? ui.artboard : ui.sysWindow;
  const scaleFactor = parseFloat(ui.exportScale.value || "2");

  // freeze animations if desired
  const freeze = state.freezeFxOnExport;
  if(freeze) target.classList.add("fx-paused");

  // hide grid overlay for export
  const gridWasOn = ui.gridOverlay.classList.contains("on");
  ui.gridOverlay.classList.remove("on");

  try{
    const canvas = await window.html2canvas(target, {
      backgroundColor: null,
      scale: scaleFactor
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const ts = new Date().toISOString().replaceAll(":","-").slice(0,19);
    a.download = `system_${state.type}_${ts}.png`;
    a.href = url;
    a.click();
  }catch(err){
    alert("Ошибка экспорта PNG.");
  }finally{
    if(gridWasOn && state.showGrid) ui.gridOverlay.classList.add("on");
    if(freeze) target.classList.remove("fx-paused");
  }
});

// Init
function init(){
  loadState();

  // ensure defaults for all types
  for(const [id, def] of Object.entries(WINDOW_TYPES)){
    if(!state.dataByType[id]) state.dataByType[id] = deepClone(def.defaults);
  }

  buildTypeSelect();
  buildThemeSelect();
  buildMarkers();
  buildBlocks();
  buildQuickStarts();

  // Apply state
  syncUIFromState();
  applyThemeByName(state.theme);
  applyCustomCss();
  setCanvas(state.canvas);
  renderGrid();
  buildFields();
  refreshPresets();
  renderWindow();

  // initial history snapshot
  history = [];
  historyIdx = -1;
  pushHistory();

  bindDrag();
}

init();
