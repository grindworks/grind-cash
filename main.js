window.isSystemModalOpen = false;
let db = null;
let SQL = null;
let fileHandle = null;
let isDirty = false;
let pendingCSVData = [];
let lastUsedDates = {};
let lastUsedAccounts = {};
let pendingCSVBuffer = null;
let currentDisplayedTotal = 0;
let collapsedBlocks = new Set();
let draftTimer = null;
let statusTimeoutId = null;
let isSaving = false;
let lastSavedPasswordHash = '';

const isMac =
  typeof navigator.userAgentData !== 'undefined'
    ? navigator.userAgentData.platform.toUpperCase().indexOf('MAC') >= 0
    : navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const _t = (key, ...params) => (window.I18n ? window.I18n.get(key, params) : key);

function renderDataWithTransition() {
  if (document.startViewTransition) {
    try {
      document.startViewTransition(() => renderData());
      return;
    } catch (e) {
      /* ignore and fallback */
    }
  }
  renderData();
}
function triggerHaptic() {
  if ('vibrate' in navigator) navigator.vibrate(15);
}

let customAccountDict = [];

let currencySymbol = '$';

const symbolMap = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'CA$', AUD: 'AU$' };

const formatterCache = {};

function getCachedFormatter(lang, minDigits, maxDigits) {
  const key = `${lang}-${minDigits}-${maxDigits}`;
  if (!formatterCache[key]) {
    try {
      formatterCache[key] = new Intl.NumberFormat(lang, {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      });
    } catch (e) {
      console.warn(`Invalid locale tag detected: ${lang}. Falling back to en-US.`);
      formatterCache[key] = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      });
    }
  }
  return formatterCache[key];
}

function formatCurrencyAmount(amount, currency) {
  const sym = symbolMap[currency] || '$';
  const minDigits = currency === 'JPY' ? 0 : 2;
  const maxDigits = currency === 'JPY' ? 0 : 2;
  const formatter = getCachedFormatter(undefined, minDigits, maxDigits);
  return `${amount < 0 ? '-' : ''}${sym}${formatter.format(Math.abs(amount))}`;
}

function getCurrencySymbol(currency) {
  return symbolMap[currency] || '$';
}

function formatCurrency(amount, currency) {
  const isZeroDecimal = currency === 'JPY';
  const maxDigits = isZeroDecimal ? 0 : 2;
  const formatter = getCachedFormatter(undefined, 0, maxDigits);
  return formatter.format(amount);
}

function updateCurrencySymbolAndFormatter() {
  const baseCurrency =
    typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
  currencySymbol = symbolMap[baseCurrency] || '$';

  const selectEl = document.getElementById('base-currency-select');
  if (selectEl) {
    selectEl.value = baseCurrency;
  }
}

const dictOptions = {
  en: [
    { value: 'custom', label: 'Dict: Custom' },
    { value: 'none', label: 'Suggest: Off' },
    { value: 'marketer', label: 'Dict: Digital Marketer' },
    { value: 'general', label: 'Dict: General Business' },
  ],
  ja: [
    { value: 'custom', label: '辞書: カスタム' },
    { value: 'none', label: '科目サジェスト: オフ' },
    { value: 'marketer', label: '辞書: デジタルマーケター' },
    { value: 'general', label: '辞書: 一般ビジネス' },
  ],
  de: [
    { value: 'custom', label: 'Wb: Benutzerdefiniert' },
    { value: 'none', label: 'Vorschlag: Aus' },
    { value: 'marketer', label: 'Wb: Digital Marketer' },
    { value: 'general', label: 'Wb: Allgemeine Geschäfte' },
  ],
  fr: [
    { value: 'custom', label: 'Dict : Personnalisé' },
    { value: 'none', label: 'Suggestions : Désactivées' },
    { value: 'marketer', label: 'Dict : Digital Marketer' },
    { value: 'general', label: 'Dict : Affaires générales' },
  ],
  es: [
    { value: 'custom', label: 'Dict: Personalizado' },
    { value: 'none', label: 'Sugerencias: Apagado' },
    { value: 'marketer', label: 'Dict: Digital Marketer' },
    { value: 'general', label: 'Dict: Negocios generales' },
  ],
  it: [
    { value: 'custom', label: 'Diz: Personalizzato' },
    { value: 'none', label: 'Suggerimenti: Disattivati' },
    { value: 'marketer', label: 'Diz: Digital Marketer' },
    { value: 'general', label: 'Diz: Affari generali' },
  ],
};

function rebuildDictSelectOptions() {
  const select = document.getElementById('dict-select');
  if (!select) return;
  const lang = (window.I18n && window.I18n.getLang()) || 'en';
  const options = dictOptions[lang] || dictOptions.en;

  const savedValue = select.value;
  select.innerHTML = '';
  options.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  });

  if (options.some((opt) => opt.value === savedValue)) {
    select.value = savedValue;
  } else {
    select.value = 'custom';
  }
}

async function changeAppLanguage(lang) {
  if (!window.I18n) return;
  await window.I18n.init(lang);

  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  updateCurrencySymbolAndFormatter();

  // Switch dictionary object based on language
  accountDictionaries.marketer = lang === 'ja' ? marketerDictJa : marketerDictEn;
  accountDictionaries.general = lang === 'ja' ? generalDictJa : generalDictEn;

  rebuildDictSelectOptions();

  document.title = window._t('app.title') + ' - Serverless Edition';

  loadCustomDict();

  const select = document.getElementById('dict-select');
  if (select) {
    const savedDict = getDbSetting('accountDict', 'custom');
    if (dictOptions[lang] && dictOptions[lang].some((opt) => opt.value === savedDict)) {
      select.value = savedDict;
    } else {
      select.value = 'custom';
    }
    renderAccountSuggestions(select.value);
  }

  renderData();
}

// --- SQLite Settings Utility ---
function getDbSetting(key, defaultValue = null) {
  if (!db) return defaultValue;
  let stmt;
  try {
    stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    stmt.bind([key]);
    if (stmt.step()) {
      return stmt.get()[0];
    }
  } catch (e) {
    console.error('Setting read error:', e);
  } finally {
    if (stmt) stmt.free();
  }
  return defaultValue;
}

function setDbSetting(key, value) {
  if (!db) return;
  try {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    setDirty(true);
  } catch (e) {
    console.error('Setting write error:', e);
  }
}

async function getPasswordHash(password) {
  if (!password) return '';
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);

  // セキュリティ強化 (Zeroization): メモリ上の平文パスワードのバイト配列をランダム値で上書きして破棄
  // ※JSの仕様上、TextEncoderのコピーやGCにより完全な消去は保証されないベストエフォート処理
  crypto.getRandomValues(msgUint8);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// --- IndexedDB Auto Backup Logic ---
const DB_NAME = 'GrindCashDB';
const STORE_NAME = 'drafts';

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const idb = e.target.result;
        if (!idb.objectStoreNames.contains(STORE_NAME)) {
          idb.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      console.warn('IndexedDB is blocked. Auto-save is disabled.');
      reject(e);
    }
  });
}

async function saveDraft(uints) {
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(uints, 'latest_draft');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Draft save failed', e);
  }
}

async function loadDraft() {
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get('latest_draft');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function clearDraft() {
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete('latest_draft');
  } catch (e) {
    console.error('Draft clear failed', e);
  }
}

function setDirty(state) {
  if (state && db) {
    if (!draftTimer) {
      draftTimer = setTimeout(async () => {
        try {
          if (!isDirty) return;
          if (!db) return;
          const password = document.getElementById('file-password').value;

          if (lastSavedPasswordHash !== '' && password === '') {
            console.warn('Draft save aborted: Password removed from an encrypted session.');
            return;
          }

          let data = db.export();
          if (password) {
            data = await encryptData(data, password);
          }
          if (!isDirty) return;
          await saveDraft(data);
        } catch (e) {
          console.error('Draft save failed', e);
        } finally {
          draftTimer = null;
        }
      }, 15000);
    }
  } else if (!state) {
    if (draftTimer) {
      clearTimeout(draftTimer);
      draftTimer = null;
    }
    clearDraft();
  }

  if (isDirty === state) return;

  isDirty = state;
  const badge = document.getElementById('dirty-badge');
  if (badge) {
    if (state) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }

  const floatingSave = document.getElementById('floating-save-btn');
  if (floatingSave) {
    if (state) {
      floatingSave.classList.remove('opacity-0', 'pointer-events-none');
      floatingSave.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      floatingSave.classList.add('opacity-0', 'pointer-events-none');
      floatingSave.classList.remove('opacity-100', 'pointer-events-auto');
    }
  }

  const fileName = fileHandle && fileHandle.name ? fileHandle.name : 'Unsaved.cash';
  const titleBase = `${fileName} - GrindCash`;
  document.title = state ? `* ${titleBase}` : titleBase;
  const filenameBadge = document.getElementById('current-filename');
  if (filenameBadge) {
    filenameBadge.textContent = fileName;
    filenameBadge.classList.remove('hidden');
  }
}

function escapeHtml(unsafe) {
  return (unsafe ?? '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setAppInert(state) {
  const appUi = document.getElementById('app-ui');
  const tocContainer = document.getElementById('toc-container');
  const header = document.querySelector('header');
  const footer = document.getElementById('grind-global-footer');
  if (appUi) appUi.inert = state;
  if (tocContainer) tocContainer.inert = state;
  if (header) header.inert = state;
  if (footer) footer.inert = state;
}

function requestPasswordPrompt(message) {
  return new Promise((resolve) => {
    window.isSystemModalOpen = true;
    const modal = document.getElementById('password-prompt-modal');
    const msgEl = document.getElementById('password-prompt-message');
    const input = document.getElementById('password-prompt-input');
    const btnSubmit = document.getElementById('password-prompt-submit');
    const btnCancel = document.getElementById('password-prompt-cancel');

    msgEl.textContent = message;
    input.value = '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setAppInert(true);
    setTimeout(() => input.focus(), 100);

    const cleanup = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (!document.querySelector('.flex[role="dialog"]')) {
        window.isSystemModalOpen = false;
        document.body.style.overflow = '';
        setAppInert(false);
      }
      btnSubmit.removeEventListener('click', onSubmit);
      btnCancel.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeyDown);
    };
    const onSubmit = () => {
      cleanup();
      resolve(input.value);
    };
    const onCancel = () => {
      cleanup();
      resolve(null);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Enter') onSubmit();
      if (e.key === 'Escape') onCancel();
    };

    btnSubmit.addEventListener('click', onSubmit);
    btnCancel.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeyDown);
  });
}

function handlePlainTextPaste(event) {
  event.preventDefault();
  const clipboard = event.clipboardData || window.clipboardData;
  if (!clipboard) return;

  const text = clipboard.getData('text/plain');
  const cleanText = text.replace(/[\r\n\t]+/g, ' ').trim();
  const target = event.target;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;
    target.value = target.value.slice(0, start) + cleanText + target.value.slice(end);
    target.selectionStart = target.selectionEnd = start + cleanText.length;
    target.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: 'custom-paste' }));
    return;
  }

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const textNode = document.createTextNode(cleanText);
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);

  event.target.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: 'custom-paste' }));
}

const cryptoWorker = new Worker('./crypto-worker.js');
let workerMsgId = 0;

function execCryptoWorker(type, payload, transferables = []) {
  return new Promise((resolve, reject) => {
    const id = ++workerMsgId;
    const handler = (e) => {
      if (e.data.id === id) {
        cryptoWorker.removeEventListener('message', handler);
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      }
    };
    cryptoWorker.addEventListener('message', handler);
    cryptoWorker.postMessage({ id, type, ...payload }, transferables);
  });
}

async function encryptData(data, password) {
  showToast(
    window._t('status.encrypting') || 'Encrypting...',
    '<span class="animate-spin text-blue-400">⏳</span>',
    { duration: 0 },
  );
  let passwordBuffer = password;
  const transferables = [data.buffer];
  if (typeof password === 'string') {
    passwordBuffer = new TextEncoder().encode(password);
    transferables.push(passwordBuffer.buffer);
  }
  return await execCryptoWorker('encrypt', { data, password: passwordBuffer }, transferables);
}

async function decryptData(data, password) {
  showToast(
    window._t('status.decrypting') || 'Decrypting...',
    '<span class="animate-spin text-blue-400">⏳</span>',
    { duration: 0 },
  );
  let passwordBuffer = password;
  const transferables = [data.buffer];
  if (typeof password === 'string') {
    passwordBuffer = new TextEncoder().encode(password);
    transferables.push(passwordBuffer.buffer);
  }
  return await execCryptoWorker('decrypt', { data, password: passwordBuffer }, transferables);
}

function migrateDatabase() {
  if (!db) return;
  try {
    const res = db.exec('PRAGMA table_info(records)');
    if (res.length > 0) {
      const columns = res[0].values.map((col) => col[1]);
      if (!columns.includes('account')) {
        db.run('ALTER TABLE records ADD COLUMN account TEXT');
        setDirty(true);
      }
      if (!columns.includes('sort_order')) {
        db.run('ALTER TABLE records ADD COLUMN sort_order INTEGER DEFAULT 0');
        setDirty(true);
      }
      if (!columns.includes('is_exported')) {
        db.run('ALTER TABLE records ADD COLUMN is_exported INTEGER DEFAULT 0');
        setDirty(true);
      }
      if (!columns.includes('tax_rate')) {
        db.run('ALTER TABLE records ADD COLUMN tax_rate TEXT DEFAULT ""');
        setDirty(true);
      }
      if (!columns.includes('currency')) {
        db.run("ALTER TABLE records ADD COLUMN currency TEXT DEFAULT 'USD'");
        setDirty(true);
      }
    }
    db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        data TEXT
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    try {
      const keysToMigrate = ['customAccountDict', 'fiscalMonth', 'accountDict'];
      let checkStmt, insertStmt;
      try {
        checkStmt = db.prepare('SELECT 1 FROM settings WHERE key = ?');
        insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

        for (const key of keysToMigrate) {
          const oldVal = localStorage.getItem(key);
          if (oldVal !== null && oldVal !== undefined) {
            checkStmt.bind([key]);
            const exists = checkStmt.step();
            checkStmt.reset();

            if (!exists) {
              insertStmt.run([key, oldVal]);
              localStorage.removeItem(key);
              setDirty(true);
            }
          }
        }
      } finally {
        if (checkStmt) checkStmt.free();
        if (insertStmt) insertStmt.free();
      }
    } catch (e) {
      console.warn('Migration skipped', e);
    }
  } catch (e) {
    console.error('Migration error:', e);
  }
}

async function initSQLite() {
  try {
    if (typeof initSqlJs === 'undefined') {
      throw new Error(window._t('error.fatal_desc') || 'sql.js is not loaded.');
    }

    // Suppress 'wasm streaming compile failed' warning
    // Fetch WASM explicitly as ArrayBuffer
    const wasmResponse = await fetch('./assets/sql-wasm.wasm');
    const wasmBinary = await wasmResponse.arrayBuffer();

    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const isWasmSupported = await WebAssembly.validate(new Uint8Array(wasmBinary));
      if (!isWasmSupported) throw new Error('WASM_INVALID');
    } else {
      throw new Error('WASM_BLOCKED');
    }

    const config = {
      wasmBinary: new Uint8Array(wasmBinary),
    };
    SQL = await initSqlJs(config);

    let initialData = null;
    const draft = await loadDraft();
    if (draft) {
      if (await requestConfirm(window._t('confirm.restore_draft'))) {
        initialData = draft;
        let Uints = draft;
        const magic = Uints.slice(0, 8);
        const magicStr = new TextDecoder().decode(magic);
        const isEncrypted =
          magicStr === 'GRINDENC' || magicStr === 'GRINDEN2' || magicStr !== 'SQLite f';

        if (isEncrypted) {
          let password = document.getElementById('file-password').value;
          let success = false;
          let attemptCount = 0;

          while (!success) {
            try {
              let copy = new Uint8Array(Uints);
              Uints = await decryptData(copy, password);
              success = true;
              if (password) {
                document.getElementById('file-password').value = password;
                lastSavedPasswordHash = await getPasswordHash(password);
              }
            } catch (err) {
              let promptMsg = window._t('prompt.pw_backup');
              if (attemptCount > 0 || password) {
                promptMsg = '❌ Incorrect password. Please try again:\n\n' + promptMsg;
              }
              password = await requestPasswordPrompt(promptMsg);
              if (password === null) {
                await showAlert(window._t('alert.cancel_startup_desc'));
                document.body.innerHTML = `<h1 style='text-align:center; margin-top:20vh;'>${window._t('error.security_stop_desc')}</h1>`;
                return;
              }
              attemptCount++;
            }
          }
        }
        initialData = Uints;
      } else {
        await clearDraft();
      }
    }

    if (initialData) {
      try {
        db = new SQL.Database(initialData);
        migrateDatabase();
        setDirty(true);
        showToast(window._t('toast.restored'), '<span class="text-orange-400">↺</span>');
      } catch (dbError) {
        console.error('Draft restore failed', dbError);
        await showAlert(window._t('alert.restore_fail'));
        await clearDraft();
        db = new SQL.Database();
        db.run(`
          CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            memo TEXT,
            amount INTEGER,
            account TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sort_order INTEGER DEFAULT 0,
            is_exported INTEGER DEFAULT 0,
            tax_rate TEXT DEFAULT "",
            currency TEXT DEFAULT 'USD'
          );
        `);
        migrateDatabase();
      }
    } else {
      db = new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_id INTEGER,
          memo TEXT,
          amount INTEGER,
          account TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sort_order INTEGER DEFAULT 0,
          is_exported INTEGER DEFAULT 0,
          tax_rate TEXT DEFAULT "",
          currency TEXT DEFAULT 'USD'
        );
      `);
      migrateDatabase();
      showToast(window._t('toast.sqlite_loaded'), '<span class="text-green-400">●</span>');
    }

    loadSettingsFromDb();

    const countRes = db.exec('SELECT COUNT(*) FROM records');
    const recordCount = countRes.length > 0 ? countRes[0].values[0][0] : 0;
    if (recordCount > 50 && !window.currentActiveMonths) {
      setFiscalYearFilter();
    } else {
      renderData();
    }

    const appUi = document.getElementById('app-ui');
    if (appUi) {
      appUi.classList.remove('hidden');
      appUi.classList.add('animate-fade-in');
    }

    handleLaunchFiles();
  } catch (err) {
    let errMsg = window._t('error.fatal_desc');
    if (
      err.message === 'WASM_BLOCKED' ||
      err.message.includes('WebAssembly') ||
      err.message === 'WASM_INVALID'
    ) {
      errMsg =
        'WebAssembly is disabled or blocked by your browser/OS.<br>If you are using iOS Lockdown Mode, please exclude this site.';
    }

    showToast(window._t('toast.sqlite_load_fail'), '<span>⚠️</span>');
    console.error(err);

    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.style.display = 'none';

    const errorScreen = document.getElementById('fatal-error-screen');
    if (errorScreen) {
      const errorDesc = errorScreen.querySelector('p');
      if (errorDesc) errorDesc.innerHTML = errMsg;
      errorScreen.classList.remove('hidden');
      errorScreen.classList.add('flex');
    }
  }
}

function handleLaunchFiles() {
  if ('launchQueue' in window) {
    window.launchQueue.setConsumer(async (launchParams) => {
      if (!launchParams.files || launchParams.files.length === 0) return;
      if (isDirty) {
        if (!(await requestConfirm(window._t('confirm.discard_changes')))) return;
      }
      await processFileHandle(launchParams.files[0]);
    });
  }
}

function showToast(message, iconHtml = '✅', options = {}) {
  const { duration = 3000, rawHtml = false } = options;
  const statusEl = document.getElementById('status');
  if (!statusEl) return;

  if (statusTimeoutId) clearTimeout(statusTimeoutId);

  const bgClass = 'bg-slate-900/95 border-slate-800/50';
  const messageHtml = rawHtml ? message : `<span>${escapeHtml(message)}</span>`;
  statusEl.innerHTML = `${iconHtml} ${messageHtml}`;

  statusEl.className = `fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 max-w-[90vw] backdrop-blur-sm text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-xl border transition-all duration-500 z-[9999] flex items-center gap-2 translate-y-0 opacity-100 ${bgClass}`;
  statusEl.style.pointerEvents = 'auto';

  if (duration > 0 && duration !== Infinity) {
    statusTimeoutId = setTimeout(() => {
      if (statusEl) {
        statusEl.classList.remove('opacity-100', 'translate-y-0');
        statusEl.classList.add('opacity-0', '-translate-y-4');
        statusEl.style.pointerEvents = 'none';
      }
    }, duration);
  }
}

function addBlock() {
  const memoInput = document.getElementById('new-block-memo');
  const trimmedMemo = memoInput.value.trim();
  if (!trimmedMemo) return;

  const baseCurrency =
    typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
  db.run('INSERT INTO records (memo, amount, currency) VALUES (?, ?, ?)', [
    trimmedMemo,
    null,
    baseCurrency,
  ]);
  const res = db.exec('SELECT last_insert_rowid()');
  const newId = res[0].values[0][0];

  memoInput.value = '';
  setDirty(true);
  renderData(newId);
  triggerHaptic();
}

function roundAmount(amount, currency = 'USD') {
  if (amount === null || isNaN(amount)) return null;
  const isZeroDecimal = currency === 'JPY';
  const sign = Math.sign(amount);
  const absAmount = Math.abs(amount);
  let rounded;

  if (isZeroDecimal) {
    rounded = sign * Math.round(absAmount);
  } else {
    rounded = sign * (Math.round((absAmount + Number.EPSILON) * 100) / 100);
  }

  // 💎 最後の仕上げ (Gold-Rank Polish):
  // Javascript特有の「マイナスゼロ(-0)」を検知し、純粋な「0」に正規化してノイズを排除する
  return rounded === -0 ? 0 : rounded;
}

function evaluateMath(expr) {
  if (expr === null || expr === '') return null;
  if (String(expr).length > 50) return null;

  try {
    const trimmedExpr = String(expr).trim();
    let normalized = trimmedExpr.replace(/[０-９＋－＊／．（）]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
    normalized = normalized
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[ー−△]/g, '-');

    normalized = normalized.replace(/(?:\d+[.,])+\d+/g, (match) => {
      const lastComma = match.lastIndexOf(',');
      const lastDot = match.lastIndexOf('.');
      if (lastComma > lastDot && lastDot !== -1) return match.replace(/\./g, '').replace(/,/g, '.');
      else if (lastDot > lastComma && lastComma !== -1) return match.replace(/,/g, '');
      else if (lastComma !== -1) {
        if (/,\d{3}$/.test(match)) return match.replace(/,/g, '');
        else return match.replace(/,/g, '.');
      } else {
        if (match.match(/\./g) && match.match(/\./g).length > 1) return match.replace(/\./g, '');
        return match;
      }
    });

    if (/^\([\d,.]+\)$/.test(normalized)) {
      normalized = '-' + normalized.replace(/[()]/g, '');
    }
    if (normalized.endsWith('-') && !normalized.startsWith('-')) {
      normalized = '-' + normalized.slice(0, -1);
    }

    const sanitized = normalized.replace(/[^0-9+\-*/().]/g, '');
    if (!sanitized) return null;
    if (sanitized.includes('**')) return null;

    let tokens = [];
    let numStr = '';
    for (let i = 0; i < sanitized.length; i++) {
      const c = sanitized[i];
      if (/[0-9.]/.test(c)) {
        numStr += c;
      } else {
        if (c === '-' && (i === 0 || /[+\-*/(]/.test(sanitized[i - 1]))) {
          numStr += c;
        } else {
          if (numStr) {
            if (numStr === '-') {
              tokens.push('-1', '*');
            } else {
              tokens.push(numStr);
            }
            numStr = '';
          }
          tokens.push(c);
        }
      }
    }
    if (numStr) {
      if (numStr === '-') tokens.push('-1', '*');
      else tokens.push(numStr);
    }

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const outputQueue = [];
    const operatorStack = [];

    for (const token of tokens) {
      if (!isNaN(parseFloat(token))) {
        const tokenStr = String(token);
        if (tokenStr.includes('.') && tokenStr.split('.').length - 1 > 1) {
          return null;
        }
        outputQueue.push(parseFloat(token));
      } else if ('+-*/'.includes(token)) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(')
          outputQueue.push(operatorStack.pop());
        if (operatorStack.length === 0) return null;
        operatorStack.pop();
      }
    }
    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (op === '(' || op === ')') return null;
      outputQueue.push(op);
    }

    const evalStack = [];
    for (const token of outputQueue) {
      if (typeof token === 'number') evalStack.push(token);
      else {
        const b = evalStack.pop();
        const a = evalStack.pop();
        if (a === undefined || b === undefined) return null;
        if (token === '+') evalStack.push(a + b);
        else if (token === '-') evalStack.push(a - b);
        else if (token === '*') evalStack.push(a * b);
        else if (token === '/') evalStack.push(a / b);
      }
    }

    if (evalStack.length !== 1) return null;
    const result = evalStack[0];

    if (!isFinite(result) || isNaN(result)) return null;
    // 負の数でも正確に四捨五入する
    const rounded =
      Math.sign(result) * (Math.round((Math.abs(result) + Number.EPSILON) * 100) / 100);
    if (rounded > 10000000000000 || rounded < -10000000000000) return null;
    return rounded;
  } catch (e) {
    return null;
  }
}

async function addItem(
  parentId,
  memo,
  amount,
  dateStr,
  accountStr,
  taxRate = '',
  currency = 'USD',
) {
  const safeMemo = (memo || '').trim();
  if (!safeMemo || amount === '' || amount === null) return;
  if (parentId) {
    if (dateStr) lastUsedDates[parentId] = dateStr;
    if (accountStr) lastUsedAccounts[parentId] = accountStr;

    // Form inputs must be cleared manually because renderData no longer recreates the form
    const form = document.getElementById(`block-form-${parentId}`);
    if (form) {
      const memoEl = form.querySelector('.item-memo');
      const amountEl = form.querySelector('.item-amount');
      if (memoEl) memoEl.value = '';
      if (amountEl) amountEl.value = '';
    }
  }

  await insertRecord(parentId, safeMemo, amount, dateStr, accountStr, taxRate, currency);

  const filterVal = document.getElementById('period-filter')?.value;
  let isOutsideFilter = false;

  if (window.currentActiveMonths) {
    if (dateStr) {
      const match = window.currentActiveMonths.some((m) => dateStr.startsWith(m));
      if (!match) isOutsideFilter = true;
    }
  } else if (filterVal && filterVal !== 'all') {
    if (dateStr && !dateStr.startsWith(filterVal)) isOutsideFilter = true;
  }

  if (isOutsideFilter) {
    window.currentActiveMonths = null;
    setActiveQuickPeriodButton(null);
    if (document.getElementById('period-filter')) {
      document.getElementById('period-filter').value = 'all';
    }
    showToast(window._t('toast.filter_outside'), '<span class="text-blue-400">👀</span>');
  }

  renderData(parentId);
}

async function insertRecord(
  parentId,
  memo,
  amountExpr,
  dateStr = null,
  accountStr = null,
  taxRate = '',
  currency = 'USD',
) {
  // Strip currency symbols for math evaluation
  let safeAmountExpr = amountExpr;
  if (typeof amountExpr === 'string') {
    safeAmountExpr = amountExpr.replace(/,/g, '');
  }

  const parsedAmount = evaluateMath(safeAmountExpr);
  if (amountExpr !== null && amountExpr !== '' && parsedAmount === null) {
    await showAlert(window._t('alert.invalid_amount_or_formula'));
    return;
  }

  let finalAmount = roundAmount(parsedAmount, currency);

  let maxSort = -1;
  if (parentId) {
    let checkStmt;
    try {
      checkStmt = db.prepare('SELECT MAX(sort_order) FROM records WHERE parent_id = ?');
      checkStmt.bind([parentId]);
      if (checkStmt.step()) {
        const val = checkStmt.get()[0];
        if (val !== null) maxSort = val;
      }
    } catch (e) {
      console.warn(e);
    } finally {
      if (checkStmt) checkStmt.free();
    }
  }
  const newSortOrder = maxSort + 1;

  let query =
    'INSERT INTO records (parent_id, memo, amount, account, sort_order, tax_rate, currency) VALUES (?, ?, ?, ?, ?, ?, ?)';
  let params = [parentId, memo, finalAmount, accountStr, newSortOrder, taxRate, currency];

  if (dateStr) {
    query =
      'INSERT INTO records (parent_id, memo, amount, account, sort_order, tax_rate, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    params.push(dateStr + ' 00:00:00');
  }

  let stmt;
  try {
    stmt = db.prepare(query);
    stmt.run(params);
  } finally {
    if (stmt) stmt.free();
  }
  setDirty(true);
}

let renderMemoSuggestionsTimeout = null;
function renderMemoSuggestions() {
  if (renderMemoSuggestionsTimeout) clearTimeout(renderMemoSuggestionsTimeout);
  renderMemoSuggestionsTimeout = setTimeout(() => {
    if (!db) return;
    const datalist = document.getElementById('memo-suggestions');
    if (!datalist) return;

    try {
      const res = db.exec(
        "SELECT memo FROM records WHERE parent_id IS NOT NULL AND memo != '' GROUP BY memo ORDER BY MAX(id) DESC LIMIT 100",
      );
      datalist.innerHTML = '';
      if (res.length > 0) {
        res[0].values.forEach(([memo]) => {
          const option = document.createElement('option');
          option.value = memo;
          datalist.appendChild(option);
        });
      }
    } catch (e) {
      console.error('Failed to render memo suggestions:', e);
    }
  }, 500);
}

async function autoSuggestAccount(memoInput) {
  if (!db) return;
  const memo = memoInput.value.trim();
  if (!memo) return;

  const form = memoInput.closest('form');
  const accountInput = form.querySelector('.item-account');

  if (accountInput.value.trim() !== '') return;

  let stmt;
  try {
    stmt = db.prepare(
      "SELECT account FROM records WHERE parent_id IS NOT NULL AND memo = ? AND account IS NOT NULL AND account != '' ORDER BY id DESC LIMIT 1",
    );
    stmt.bind([memo]);

    if (stmt.step()) {
      const account = stmt.get()[0];
      if (account) {
        accountInput.value = account;
        accountInput.classList.add('!bg-purple-100', '!text-purple-700', 'transition-colors');
        setTimeout(() => accountInput.classList.remove('!bg-purple-100', '!text-purple-700'), 1000);
      }
    }
  } catch (e) {
    console.error('Auto suggest account failed:', e);
  } finally {
    if (stmt) stmt.free();
  }
}

window.createCollectionRecord = function (id) {
  if (!db) return;
  let stmt;
  let insertStmt = null;
  try {
    stmt = db.prepare(
      'SELECT parent_id, memo, amount, account, created_at, currency FROM records WHERE id = ?',
    );
    stmt.bind([id]);
    if (stmt.step()) {
      const [parent_id, memo, amount, account, parent_created_at, currency] = stmt.get();
      const safeCurrency = currency || 'USD';

      let dateStr = parent_created_at;
      if (!dateStr) {
        const today = new Date();
        dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
      }

      const safeAmount = amount ? parseFloat(amount) : 0;
      let isIncome = safeAmount >= 0;

      // Guess simple expense accounts
      const isDebitAccount = ![
        'Revenue',
        'Sales',
        'Accounts Receivable',
        '売上',
        '売上高',
        '売掛金',
      ].includes(account);

      if (isDebitAccount) {
        isIncome = !isIncome;
      }

      const tag = isIncome ? '#Receipt' : '#Payment';
      const newAccount = 'Bank';

      const cleanMemo = memo ? memo.replace(/(#Receipt|#Payment)(?=\s|$)/gi, '').trim() : '';
      const newMemo = `${cleanMemo} (Reconciliation) ${tag}`;

      let maxSort = -1;
      let sortStmt = null;
      try {
        sortStmt = db.prepare('SELECT MAX(sort_order) FROM records WHERE parent_id = ?');
        sortStmt.bind([parent_id]);
        if (sortStmt.step()) {
          const val = sortStmt.get()[0];
          if (val !== null) maxSort = val;
        }
      } catch (e) {
        console.warn('Sort order error', e);
      } finally {
        if (sortStmt) sortStmt.free();
      }

      insertStmt = db.prepare(
        'INSERT INTO records (parent_id, memo, amount, account, created_at, sort_order, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
      );
      insertStmt.run([parent_id, newMemo, amount, newAccount, dateStr, maxSort + 1, safeCurrency]);

      const res = db.exec('SELECT last_insert_rowid()');
      const newId = res[0].values[0][0];

      setDirty(true);
      renderData();

      showToast(
        window._t('toast.settlement_created') || 'Settlement record created.',
        '<span class="text-emerald-400">✅</span>',
      );

      requestAnimationFrame(() => {
        const newDateEl = document.querySelector(
          `span[data-id="${newId}"][data-field="created_at"]`,
        );
        if (newDateEl) {
          newDateEl.focus();
          window.getSelection().selectAllChildren(newDateEl);
        }
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (stmt) stmt.free();
    if (insertStmt) insertStmt.free();
  }
};

async function updateRecord(id, field, newValue, element) {
  if (!db) return;

  let checkExportStmt;
  try {
    // 自身のid、または自身を親(parent_id)に持つ子明細のどれか1つでもロックされていればブロックする
    checkExportStmt = db.prepare(
      'SELECT COUNT(*) FROM records WHERE (id = ? OR parent_id = ?) AND is_exported = 1',
    );
    checkExportStmt.bind([id, id]);
    if (checkExportStmt.step() && checkExportStmt.get()[0] > 0) {
      await showAlert(
        window._t('error.record_locked') ||
          'Cannot modify. This block contains exported and locked records.',
      );
      renderData();
      return;
    }
  } catch (e) {
    console.error('Lock check error', e);
  } finally {
    if (checkExportStmt) checkExportStmt.free();
  }

  const allowedFields = ['amount', 'memo', 'account', 'created_at', 'tax_rate', 'currency'];
  if (!allowedFields.includes(field)) {
    console.error('Invalid field name');
    return;
  }

  // Prevent crash if newValue is null/undefined
  let val = (newValue || '')
    .toString()
    .replace(/\u00A0/g, ' ')
    .trim();
  let formattedAmountStr = '';

  if (field === 'amount') {
    if (val === '') {
      val = null;
    } else {
      let mathExpr = val;

      mathExpr = mathExpr.replace(/(?:\d+[.,])+\d+/g, (match) => {
        const lastComma = match.lastIndexOf(',');
        const lastDot = match.lastIndexOf('.');

        if (lastComma > lastDot && lastDot !== -1) {
          // Convert EU format (1.000,50) to 1000.50
          return match.replace(/\./g, '').replace(/,/g, '.');
        } else if (lastDot > lastComma && lastComma !== -1) {
          // Convert US/JP format (1,000.50) to 1000.50
          return match.replace(/,/g, '');
        } else if (lastComma !== -1) {
          // If only comma is found
          if (/,\d{3}$/.test(match)) {
            // Treat as thousands separator if trailing 3 digits (1,000 -> 1000)
            return match.replace(/,/g, '');
          } else {
            // Otherwise treat as EU decimal (1,50 -> 1.50)
            return match.replace(/,/g, '.');
          }
        } else {
          // If only dot is found
          const dotMatches = match.match(/\./g);
          if (dotMatches && dotMatches.length > 1) {
            // Treat as EU thousands separator if multiple dots (1.000.000 -> 1000000)
            return match.replace(/\./g, '');
          }
          // Single dot is treated as standard decimal
          return match;
        }
      });
      val = evaluateMath(mathExpr);
      if (val === null) {
        if (element) {
          element.classList.add('!bg-red-100', '!text-red-600');
        }
        await showAlert(window._t('alert.invalid_amount_or_formula'));
        return;
      }

      if (element) {
        element.classList.remove('!bg-red-100', '!text-red-600');
      }
    }

    let recordCurrency = 'USD';
    try {
      const curStmt = db.prepare('SELECT currency FROM records WHERE id = ?');
      curStmt.bind([id]);
      if (curStmt.step()) {
        recordCurrency = curStmt.get()[0] || 'USD';
      }
      curStmt.free();
    } catch (e) {}

    if (val !== null) {
      val = roundAmount(val, recordCurrency);
      formattedAmountStr = formatCurrency(val, recordCurrency);
    }
  } else if (field === 'created_at') {
    val = val.replace(/[０-９／－]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
    val = val.replace(/[ー−]/g, '-');

    let match = val.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      let year = new Date().getFullYear();
      if (element && element.hasAttribute('data-year')) {
        year = parseInt(element.getAttribute('data-year'), 10);
      }

      const currentAppLang = (window.I18n && window.I18n.getLang()) || 'en';
      const isMonthFirst = currentAppLang === 'en' || currentAppLang === 'ja';

      let firstNum = parseInt(match[1], 10);
      let secondNum = parseInt(match[2], 10);
      let m, d;

      if (firstNum > 12 && secondNum <= 12) {
        d = firstNum;
        m = secondNum;
      } else if (secondNum > 12 && firstNum <= 12) {
        m = firstNum;
        d = secondNum;
      } else {
        if (isMonthFirst) {
          m = firstNum;
          d = secondNum;
        } else {
          d = firstNum;
          m = secondNum;
        }
      }

      const dateObj = new Date(year, m - 1, d);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== m - 1 ||
        dateObj.getDate() !== d
      ) {
        await showAlert(
          window._t('alert.invalid_date') +
            ` (Detected format: ${isMonthFirst ? 'MM/DD' : 'DD/MM'})`,
        );
        renderData();
        return;
      }
      val = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} 00:00:00`;
    } else {
      let matchFull = val.match(/^(\d{2}|\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
      if (matchFull) {
        let y = parseInt(matchFull[1], 10);
        if (y < 100) y += 2000;
        const m = parseInt(matchFull[2], 10);
        const d = parseInt(matchFull[3], 10);
        const dateObj = new Date(y, m - 1, d);
        if (
          dateObj.getFullYear() !== y ||
          dateObj.getMonth() !== m - 1 ||
          dateObj.getDate() !== d
        ) {
          await showAlert(window._t('alert.invalid_date'));
          renderData();
          return;
        }
        val = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} 00:00:00`;
      } else {
        await showAlert(window._t('alert.invalid_date_format'));
        renderData();
        return;
      }
    }
  }

  const checkQuery = `SELECT ${field} FROM records WHERE id = ?`;

  let checkStmt;
  try {
    checkStmt = db.prepare(checkQuery);
    checkStmt.bind([id]);
    if (checkStmt.step()) {
      const currentVal = checkStmt.get()[0];
      if (currentVal == val) {
        if (element && field === 'amount') {
          if (element.tagName === 'INPUT') {
            element.value = val !== null ? formattedAmountStr : '';
          } else {
            element.innerText = val !== null ? formattedAmountStr : '';
          }
        }
        return;
      }
    }
  } finally {
    if (checkStmt) checkStmt.free();
  }

  const query = `UPDATE records SET ${field} = ? WHERE id = ?`;

  let stmt;
  try {
    stmt = db.prepare(query);
    stmt.run([val, id]);
  } finally {
    if (stmt) stmt.free();
  }

  setDirty(true);

  if (field === 'amount') {
    if (element) {
      if (element.tagName === 'INPUT') {
        element.value = val !== null ? formattedAmountStr : '';
      } else {
        element.innerText = val !== null ? formattedAmountStr : '';
      }
    }
    updateTotalsOnly();
  } else if (field === 'tax_rate' || field === 'currency') {
    updateTotalsOnly();
  } else if (field === 'created_at') {
    const filterVal = document.getElementById('period-filter')?.value;
    let isOutsideFilter = false;

    if (window.currentActiveMonths) {
      const match = window.currentActiveMonths.some((m) => val.startsWith(m));
      if (!match) isOutsideFilter = true;
    } else if (filterVal && filterVal !== 'all') {
      if (!val.startsWith(filterVal)) isOutsideFilter = true;
    }

    if (isOutsideFilter) {
      window.currentActiveMonths = null;
      setActiveQuickPeriodButton(null);
      if (document.getElementById('period-filter')) {
        document.getElementById('period-filter').value = 'all';
      }
      renderData();
    } else {
      if (element && element.tagName !== 'INPUT') {
        const d = val.split(' ')[0].split('-');
        // Verify array length is 3 (YYYY, MM, DD) before updating UI
        if (d.length === 3) {
          const currentAppLang = (window.I18n && window.I18n.getLang()) || 'en';
          if (currentAppLang === 'en' || currentAppLang === 'ja') {
            element.innerText = `${d[1]}/${d[2]}`;
          } else {
            element.innerText = `${d[2]}/${d[1]}`;
          }
        }
      }
    }
  } else {
    if (field === 'memo') {
      if (element && element.tagName !== 'INPUT') {
        element.innerHTML = formatMemoHtml(val);
      }

      if (element && element.tagName === 'H2') {
        const tocItem = document.querySelector(`.toc-item[data-block-id="${id}"]`);
        if (tocItem) {
          tocItem.textContent = val || window._t('label.unnamed');
          tocItem.title = val || window._t('label.unnamed');
        }
      }

      renderMemoSuggestions();
    }
  }
}

function updateTotalsOnly() {
  if (!db) return;
  const filterVal = document.getElementById('period-filter')?.value || 'all';
  let whereClause = '';
  let params = [];

  if (window.currentActiveMonths) {
    const orConditions = window.currentActiveMonths
      .map((m) => {
        params.push(`${m}%`);
        return 'c.created_at LIKE ?'; // テーブルエイリアス 'c.' を付ける
      })
      .join(' OR ');
    whereClause = ` AND (${orConditions})`;
  } else if (filterVal !== 'all') {
    whereClause = ` AND c.created_at LIKE ?`;
    params.push(`${filterVal}%`);
  }

  let stmtTotal;
  let stmtBlock;
  try {
    const queryTotal = `
      SELECT p.currency, SUM(c.amount)
      FROM records c
      JOIN records p ON c.parent_id = p.id
      WHERE c.parent_id IS NOT NULL
        AND COALESCE(c.memo, '') NOT LIKE '%#Payment%'
        AND COALESCE(c.memo, '') NOT LIKE '%#Receipt%'
        ${whereClause}
      GROUP BY p.currency
    `;
    stmtTotal = db.prepare(queryTotal);
    stmtTotal.bind(params);

    let currencyTotals = Object.create(null); // プロトタイプを持たない純粋な辞書として初期化
    while (stmtTotal.step()) {
      const [curr, total] = stmtTotal.get();
      // __proto__ などの文字列が来ても prototype を汚染しない
      const safeCurr = curr || 'USD';
      currencyTotals[safeCurr] = (currencyTotals[safeCurr] || 0) + (total || 0);
    }

    if (Object.keys(currencyTotals).length === 0) {
      const baseCurr =
        typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
      currencyTotals[baseCurr] = 0;
    }

    renderMultiTotals(currencyTotals);

    stmtBlock = db.prepare(
      `SELECT SUM(amount) FROM records WHERE parent_id = ? AND COALESCE(memo, '') NOT LIKE '%#Payment%' AND COALESCE(memo, '') NOT LIKE '%#Receipt%' ${whereClause.replace(/c\./g, '')}`,
    );
    const blocksRes = db.exec('SELECT id, currency FROM records WHERE parent_id IS NULL');
    if (blocksRes.length > 0) {
      blocksRes[0].values.forEach(([blockId, blockCurrency]) => {
        stmtBlock.bind([blockId, ...params]);
        let blockTotal = 0;
        if (stmtBlock.step()) blockTotal = stmtBlock.get()[0] || 0;
        stmtBlock.reset();

        const el = document.getElementById(`block-total-${blockId}`);
        if (el) {
          const safeCurr = blockCurrency || 'USD';
          el.textContent = formatCurrency(Math.abs(blockTotal), safeCurr);
          const unitEl = el.previousElementSibling;
          if (unitEl && unitEl.tagName === 'SPAN') {
            unitEl.textContent = `${blockTotal < 0 ? '-' : ''}${getCurrencySymbol(safeCurr)}`;
          }
        }
      });
    }
  } catch (e) {
    console.error('Totals update failed:', e);
  } finally {
    if (stmtTotal) stmtTotal.free();
    if (stmtBlock) stmtBlock.free();
  }

  updateTagsOnly();
}

function updateTagsOnly() {
  if (!db) return;
  const filterVal = document.getElementById('period-filter')?.value || 'all';
  let whereClause = '';
  let params = [];

  if (window.currentActiveMonths) {
    const orConditions = window.currentActiveMonths
      .map((m) => {
        params.push(`${m}%`);
        return 'c.created_at LIKE ?';
      })
      .join(' OR ');
    whereClause = ` AND (${orConditions})`;
  } else if (filterVal !== 'all') {
    whereClause = ` AND c.created_at LIKE ?`;
    params.push(`${filterVal}%`);
  }

  const query = `
    SELECT p.memo AS p_memo, c.created_at, c.memo, c.amount, c.currency
    FROM records c
    JOIN records p ON c.parent_id = p.id
    WHERE c.parent_id IS NOT NULL
      AND (c.memo LIKE '%#%' OR c.memo LIKE '%＃%' OR p.memo LIKE '%#%' OR p.memo LIKE '%＃%')
      ${whereClause}
  `;

  let tagTotals = Object.create(null);
  let stmt;
  try {
    stmt = db.prepare(query);
    stmt.bind(params);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const safeAmount = parseFloat(row.amount || 0);
      const isCollection = (row.memo || '').match(/(#Receipt|#Payment)(?=\s|$)/i);

      const safeMemoStr = (row.memo || '').slice(0, 1000);
      const safeBlockMemoStr = (row.p_memo || '').slice(0, 1000);
      const tags = safeMemoStr.match(/[#＃][\p{L}\p{N}_\-ー]+/gu) || [];
      const blockTags = safeBlockMemoStr.match(/[#＃][\p{L}\p{N}_\-ー]+/gu) || [];
      const rawTags = [...tags, ...blockTags].map((t) => t.replace('＃', '#'));
      const allTags = [...new Set(rawTags)];

      allTags.forEach((tag) => {
        if (!tagTotals[tag]) tagTotals[tag] = { totals: {}, items: [] };
        const c = row.currency || 'USD';
        tagTotals[tag].totals[c] = (tagTotals[tag].totals[c] || 0) + safeAmount;
        tagTotals[tag].items.push({
          date: row.created_at,
          memo: row.memo,
          amount: safeAmount,
          currency: c,
        });
      });
    }
  } catch (e) {
    console.error('Tags update failed', e);
  } finally {
    if (stmt) stmt.free();
  }

  const tocContainer = document.getElementById('toc-container');
  const tocList = document.getElementById('toc-list');
  if (tocContainer) {
    const existingDivider = document.getElementById('toc-tag-divider');
    if (existingDivider) existingDivider.remove();
    const existingTags = tocList ? tocList.querySelectorAll('.toc-tag-item') : [];
    existingTags.forEach((el) => el.remove());

    if (Object.keys(tagTotals).length > 0) {
      const tagDivider = document.createElement('div');
      tagDivider.id = 'toc-tag-divider';
      tagDivider.className =
        'mt-8 font-bold text-slate-400 mb-2 px-2 uppercase text-[10px] tracking-widest flex items-center gap-1';
      tagDivider.innerHTML = `<svg aria-hidden="true" class="w-3 h-3"><use href="#icon-folder"></use></svg> PROJECTS`;
      tocContainer.appendChild(tagDivider);

      Object.entries(tagTotals)
        .sort((a, b) => {
          const sumA = Object.values(a[1].totals).reduce((acc, v) => acc + (Math.abs(v) || 0), 0);
          const sumB = Object.values(b[1].totals).reduce((acc, v) => acc + (Math.abs(v) || 0), 0);
          return (sumB || 0) - (sumA || 0);
        })
        .slice(0, 10)
        .forEach(([tag, data]) => {
          const amountHtml = Object.entries(data.totals)
            .map(([cur, amt]) => formatCurrencyAmount(amt, cur))
            .join(' / ');
          const a = document.createElement('a');
          a.className =
            'toc-tag-item group block px-2 py-1.5 hover:bg-slate-100 rounded transition-colors cursor-pointer flex justify-between items-center';
          a.innerHTML = `<span class="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors truncate">${escapeHtml(tag)}</span><span class="text-[10px] tabular-nums tracking-tight font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-white transition-colors">${amountHtml}</span>`;
          a.onclick = (e) => {
            e.preventDefault();
            showTagModal(tag, data);
          };
          if (tocList) tocList.appendChild(a);
        });
    }
  }

  const blocksContainer = document.getElementById('blocks-container');
  let mobileTagContainer = document.getElementById('mobile-tag-container');
  if (mobileTagContainer) mobileTagContainer.remove();

  if (Object.keys(tagTotals).length > 0 && blocksContainer) {
    mobileTagContainer = document.createElement('div');
    mobileTagContainer.id = 'mobile-tag-container';
    mobileTagContainer.className =
      'xl:hidden mt-12 mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm';
    mobileTagContainer.innerHTML = `<h3 class="text-xs font-bold text-slate-400 mb-4 tracking-widest flex items-center gap-1"><svg aria-hidden="true" class="w-4 h-4"><use href="#icon-folder"></use></svg> PROJECTS (TAGS)</h3>`;
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-3';

    Object.entries(tagTotals)
      .sort((a, b) => {
        const sumA = Object.values(a[1].totals).reduce((acc, v) => acc + (Math.abs(v) || 0), 0);
        const sumB = Object.values(b[1].totals).reduce((acc, v) => acc + (Math.abs(v) || 0), 0);
        return (sumB || 0) - (sumA || 0);
      })
      .forEach(([tag, data]) => {
        const amountHtml = Object.entries(data.totals)
          .map(([cur, amt]) => formatCurrencyAmount(amt, cur))
          .join(' / ');
        const card = document.createElement('div');
        card.className =
          'bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100';
        card.innerHTML = `<div class="text-sm font-bold text-blue-950 truncate mb-1">${escapeHtml(tag)}</div><div class="text-[11px] font-bold text-slate-500 tabular-nums">${amountHtml}</div>`;
        card.onclick = () => showTagModal(tag, data);
        grid.appendChild(card);
      });
    mobileTagContainer.appendChild(grid);
    blocksContainer.parentNode.insertBefore(mobileTagContainer, blocksContainer.nextSibling);
  }
}

function adjustDate(btn, days) {
  const form = btn.closest('form');
  const dateInput = form.querySelector('.item-date');
  if (!dateInput.value) {
    const today = new Date();
    dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  let d;
  const parts = dateInput.value.split('-');
  if (parts.length === 3) {
    d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    d = new Date(dateInput.value);
  }
  if (isNaN(d.getTime())) d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;
  checkFutureDate(dateInput);
}

function checkFutureDate(input) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (input.value > todayStr) {
    if (!input.classList.contains('text-red-600')) {
      showToast(window._t('toast.future_date') || 'A future date has been entered.', '⚠️');
    }
    input.classList.add('text-red-600', 'font-bold', 'bg-red-50', 'rounded');
    input.classList.remove('text-slate-600', 'bg-transparent');
  } else {
    input.classList.add('text-slate-600', 'bg-transparent');
    input.classList.remove('text-red-600', 'font-bold', 'bg-red-50', 'rounded');
  }
}

function renderMultiTotals(totalsMap) {
  const container = document.getElementById('multi-totals-container');
  if (!container) return;

  container.innerHTML = '';

  const entries = Object.entries(totalsMap).sort((a, b) => b[1] - a[1]);

  entries.forEach(([currency, amount]) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-baseline gap-2 justify-end w-full animate-fade-in';

    const flagMap = { USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺' };
    const flag = flagMap[currency] || '';

    const badge = document.createElement('span');
    badge.className =
      'text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1';
    badge.textContent = flag ? `${flag} ${currency}` : currency;

    const amountEl = document.createElement('p');
    amountEl.className =
      'text-3xl font-black tracking-tight text-blue-950 tabular-nums sm:text-4xl md:text-5xl';

    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'mr-1 align-baseline font-sans text-lg font-bold text-slate-400';
    symbolSpan.textContent = isNegative
      ? `-${getCurrencySymbol(currency)}`
      : getCurrencySymbol(currency);

    const numSpan = document.createElement('span');
    numSpan.textContent = formatCurrency(absAmount, currency);

    amountEl.appendChild(symbolSpan);
    amountEl.appendChild(numSpan);

    wrapper.appendChild(badge);
    wrapper.appendChild(amountEl);
    container.appendChild(wrapper);
  });
}

function toggleBlock(id) {
  if (collapsedBlocks.has(id)) collapsedBlocks.delete(id);
  else collapsedBlocks.add(id);
  const bodyEl = document.getElementById(`block-body-${id}`);
  const iconEl = document.getElementById(`block-icon-${id}`);
  if (bodyEl && iconEl) {
    if (collapsedBlocks.has(id)) {
      bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
      bodyEl.offsetHeight;
      bodyEl.style.maxHeight = '0px';
      bodyEl.style.opacity = '0';
      iconEl.style.transform = 'rotate(-90deg)';
    } else {
      bodyEl.style.maxHeight = bodyEl.scrollHeight + 500 + 'px';
      bodyEl.style.opacity = '1';
      iconEl.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        if (!collapsedBlocks.has(id)) bodyEl.style.maxHeight = '99999px';
      }, 300);
    }
  }
}

function toggleAllBlocks(collapse) {
  if (!db) return;
  if (collapse) {
    document.querySelectorAll('.group\\/block').forEach((el) => {
      const id = parseInt(el.id.replace('block-', ''), 10);
      if (!isNaN(id)) collapsedBlocks.add(id);
    });
  } else {
    collapsedBlocks.clear();
  }
  renderDataWithTransition();
}

function getFormattedPeriodText(activeMonths) {
  if (!activeMonths || activeMonths.length === 0) return null;
  const sorted = [...activeMonths].sort();
  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${y}/${parseInt(m, 10)}`;
  };
  if (sorted.length === 1) return formatMonth(sorted[0]);
  if (sorted.length === 12) {
    let isContinuous = true;
    let [currentY, currentM] = sorted[0].split('-').map(Number);
    for (let i = 1; i < 12; i++) {
      currentM++;
      if (currentM > 12) {
        currentM = 1;
        currentY++;
      }
      const expectedYm = `${currentY}-${String(currentM).padStart(2, '0')}`;
      if (sorted[i] !== expectedYm) {
        isContinuous = false;
        break;
      }
    }
    if (isContinuous) {
      const [y, m] = sorted[0].split('-').map(Number);
      return m === 1 ? `${y} (Jan-Dec)` : `FY ${y} (from M${m})`;
    }
  }
  return `${formatMonth(sorted[0])} ~ ${formatMonth(sorted[sorted.length - 1])}`;
}

function updatePeriodDropdown() {
  if (!db) return;
  const select = document.getElementById('period-filter');
  if (!select) return;

  const currentVal = select.value;
  const res = db.exec(
    'SELECT DISTINCT substr(created_at, 1, 7) FROM records WHERE parent_id IS NOT NULL AND created_at IS NOT NULL ORDER BY substr(created_at, 1, 7) DESC',
  );

  let years = new Set();
  let months = [];
  if (res.length > 0) {
    res[0].values.forEach((row) => {
      if (row[0]) {
        months.push(row[0]);
        years.add(row[0].split('-')[0]);
      }
    });
  }

  const lang = (window.I18n && window.I18n.getLang()) || 'en';
  const isJapanese = lang === 'ja';
  const monthNames = isJapanese
    ? ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : [''];
  if (!isJapanese) {
    for (let m = 1; m <= 12; m++) {
      const date = new Date(2000, m - 1, 15);
      monthNames.push(date.toLocaleDateString(lang, { month: 'short' }));
    }
  }

  let html = `<option value="all">${window._t('filter.all')}</option>`;
  if (years.size > 0) {
    html += `<optgroup label="${window._t('label.filter_by_year')}">`;
    [...years].forEach((y) => {
      html += `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`;
    });
    html += `</optgroup><optgroup label="${window._t('label.filter_by_month')}">`;
    months.forEach((ym) => {
      const [y, m] = ym.split('-');
      const monthNum = parseInt(m, 10);
      const monthLabel = isJapanese
        ? `${escapeHtml(y)}年${monthNames[monthNum]}`
        : `${monthNames[monthNum]} ${escapeHtml(y)}`;
      html += `<option value="${escapeHtml(ym)}">${monthLabel}</option>`;
    });
    html += `</optgroup>`;
  }

  if (select.innerHTML !== html) select.innerHTML = html;

  if (window.currentActiveMonths && window.currentActiveMonths.length > 0) {
    const existingCustom = select.querySelector('option[value="custom"]');
    if (existingCustom) existingCustom.remove();
    const customPeriodText = getFormattedPeriodText(window.currentActiveMonths) || 'Custom Period';
    const customOpt = new Option(customPeriodText, 'custom', true, true);
    customOpt.disabled = true;
    select.insertBefore(customOpt, select.firstChild);
    select.value = 'custom';
    select.classList.add('!text-blue-600');
  } else {
    select.classList.remove('!text-blue-600');
    if (select.querySelector(`option[value="${currentVal}"]`)) {
      select.value = currentVal;
    } else {
      select.value = 'all';
    }
  }
}

function handleDropdownChange() {
  window.currentActiveMonths = null;
  setActiveQuickPeriodButton(null);
  renderDataWithTransition();
}

function setActiveQuickPeriodButton(btn, keepYear = false) {
  const container = document.getElementById('quick-period-selectors');
  if (!container) return;
  const btns = container.querySelectorAll('button');
  btns.forEach((b) => {
    if (keepYear) {
      const actionAttr = b.getAttribute('data-action') || '';
      if (actionAttr.includes('YearFilter')) return;
    }
    b.classList.remove(
      'ring-2',
      'ring-blue-600',
      'ring-offset-1',
      '!bg-blue-600',
      '!text-white',
      '!border-blue-600',
    );
    const activeClasses = b.getAttribute('data-active-classes');
    if (activeClasses) b.classList.remove(...activeClasses.split(' ').filter(Boolean));
  });
  if (btn) {
    const activeClasses = btn.getAttribute('data-active-classes');
    if (activeClasses) btn.classList.add(...activeClasses.split(' ').filter(Boolean));
  }
}

function setPeriodFilter(val, btn = null) {
  window.currentActiveMonths = null;
  setActiveQuickPeriodButton(btn);
  const select = document.getElementById('period-filter');
  if (select) {
    select.value = val;
    renderDataWithTransition();
  }
}

function setMultiMonthFilter(monthArray, btn = null) {
  let baseYear = new Date().getFullYear();
  const select = document.getElementById('period-filter');
  const currentFilter = select ? select.value : 'all';

  const isFiscalYearActive = document
    .getElementById('fiscal-year-btn')
    ?.classList.contains('!bg-purple-600');
  const isPrevFiscalYearActive = document
    .getElementById('prev-fiscal-year-btn')
    ?.classList.contains('!bg-purple-600');
  const startMonth = parseInt(getDbSetting('fiscalMonth', '1'), 10);
  let targetMonths = [];

  if (isFiscalYearActive || isPrevFiscalYearActive) {
    const today = new Date();
    let startYear = today.getFullYear();
    if (today.getMonth() + 1 < startMonth) startYear--;
    if (isPrevFiscalYearActive) startYear--;

    targetMonths = monthArray.map((m) => {
      let y = startYear;
      if (m < startMonth) y++;
      return `${y}-${String(m).padStart(2, '0')}`;
    });
  } else {
    if (window.currentActiveMonths && window.currentActiveMonths.length > 0) {
      baseYear = parseInt(window.currentActiveMonths[0].split('-')[0], 10);
    } else if (currentFilter !== 'all' && currentFilter.includes('-')) {
      baseYear = parseInt(currentFilter.split('-')[0], 10);
    } else if (currentFilter !== 'all' && currentFilter.length === 4) {
      baseYear = parseInt(currentFilter, 10);
    }
    targetMonths = monthArray.map((m) => `${baseYear}-${String(m).padStart(2, '0')}`);
  }

  window.currentActiveMonths = targetMonths;
  setActiveQuickPeriodButton(btn, true);

  renderDataWithTransition();
}

function setCalendarYearFilter(btn = null) {
  const today = new Date();
  const year = today.getFullYear();
  let months = [];
  for (let m = 1; m <= 12; m++) months.push(`${year}-${String(m).padStart(2, '0')}`);
  window.currentActiveMonths = months;
  setActiveQuickPeriodButton(btn);
  renderDataWithTransition();
}

function updateFiscalYearButton() {
  const m = parseInt(getDbSetting('fiscalMonth', '1'), 10);
  const gearBtn = document.getElementById('fiscal-month-gear-btn');
  if (gearBtn) gearBtn.title = window._t('title.change_fiscal_start_month_format', m);
}

async function changeFiscalMonth() {
  const current = getDbSetting('fiscalMonth', '1');
  const input = prompt(window._t('prompt.fiscal_month'), current);
  if (input !== null) {
    const month = parseInt(input, 10);
    if (month >= 1 && month <= 12) {
      setDbSetting('fiscalMonth', month.toString());
      updateFiscalYearButton();
      const isFiscalActive = document
        .getElementById('fiscal-year-btn')
        ?.classList.contains('!bg-purple-600');
      const isPrevFiscalActive = document
        .getElementById('prev-fiscal-year-btn')
        ?.classList.contains('!bg-purple-600');
      if (isFiscalActive) {
        setFiscalYearFilter();
      } else if (isPrevFiscalActive) {
        setPreviousFiscalYearFilter();
      } else {
        renderDataWithTransition();
      }
    } else {
      await showAlert(window._t('alert.invalid_fiscal_month'));
    }
  }
}

function setPreviousFiscalYearFilter(btn = null) {
  const today = new Date();
  const startMonth = parseInt(getDbSetting('fiscalMonth', '1'), 10);
  let startYear = today.getFullYear();
  if (today.getMonth() + 1 < startMonth) startYear--;
  startYear--;
  let months = [];
  for (let i = 0; i < 12; i++) {
    let m = startMonth + i;
    let y = startYear;
    if (m > 12) {
      m -= 12;
      y++;
    }
    months.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  window.currentActiveMonths = months;
  setActiveQuickPeriodButton(btn || document.getElementById('prev-fiscal-year-btn'));
  renderDataWithTransition();
}

function setFiscalYearFilter(btn = null) {
  const today = new Date();
  const startMonth = parseInt(getDbSetting('fiscalMonth', '1'), 10);
  let startYear = today.getFullYear();
  if (today.getMonth() + 1 < startMonth) startYear--;
  let months = [];
  for (let i = 0; i < 12; i++) {
    let m = startMonth + i;
    let y = startYear;
    if (m > 12) {
      m -= 12;
      y++;
    }
    months.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  window.currentActiveMonths = months;
  setActiveQuickPeriodButton(btn || document.getElementById('fiscal-year-btn'));
  renderDataWithTransition();
}

function renderData(focusBlockId = null) {
  if (!db) return;
  const activeEl = document.activeElement;
  const activeId = activeEl ? activeEl.getAttribute('data-id') : null;
  const activeField = activeEl ? activeEl.getAttribute('data-field') : null;
  const container = document.getElementById('blocks-container');

  const res = db.exec(
    'SELECT id, parent_id, memo, amount, created_at, account, is_exported, tax_rate, currency FROM records ORDER BY sort_order ASC, id ASC',
  );
  const records =
    res.length > 0
      ? res[0].values.map(
          ([
            id,
            parent_id,
            memo,
            rawAmount,
            created_at,
            account,
            is_exported,
            tax_rate,
            currency,
          ]) => {
            let safeAmount = null;
            if (rawAmount !== null && rawAmount !== '') {
              const num = Number(rawAmount);
              safeAmount = Number.isFinite(num) ? num : null;
            }
            return {
              id,
              parent_id,
              memo,
              amount: safeAmount,
              created_at,
              account,
              is_exported: is_exported || 0,
              tax_rate: tax_rate || '',
              currency: currency || 'USD',
              children: [],
            };
          },
        )
      : [];

  const recordMap = records.reduce((acc, record) => {
    acc[record.id] = record;
    return acc;
  }, {});
  const tree = [];
  records.forEach((record) => {
    if (record.parent_id && recordMap[record.parent_id])
      recordMap[record.parent_id].children.push(record);
    else tree.push(record);
  });

  updatePeriodDropdown();
  const periodFilter = document.getElementById('period-filter')?.value || 'all';
  const activeMonths =
    window.currentActiveMonths || (periodFilter !== 'all' ? [periodFilter] : null);

  const filteredTree = [];
  tree.forEach((block) => {
    if (!activeMonths) {
      filteredTree.push(block);
    } else {
      const filteredChildren = block.children.filter((item) => {
        if (!item.created_at) return false;
        return activeMonths.some((m) => item.created_at.startsWith(m));
      });
      if (filteredChildren.length > 0 || block.children.length === 0) {
        filteredTree.push({ ...block, children: filteredChildren });
      }
    }
  });

  filteredTree.sort((a, b) => b.id - a.id);

  const tocContainer = document.getElementById('toc-container');
  const tocList = document.getElementById('toc-list');
  if (tocContainer && tocList) {
    const prevScrollTop = tocContainer.scrollTop;
    tocList.innerHTML = '';
    filteredTree.forEach((block) => {
      const a = document.createElement('a');
      a.href = `#block-${block.id}`;
      a.setAttribute('data-block-id', block.id);
      a.className =
        'toc-item block px-2 py-1 hover:text-blue-950 hover:bg-slate-100 rounded truncate transition-colors text-slate-500 cursor-pointer text-sm font-medium';
      a.textContent = block.memo;
      a.title = block.memo;
      a.onclick = (e) => {
        e.preventDefault();
        document
          .getElementById(`block-${block.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      tocList.appendChild(a);
    });
    requestAnimationFrame(() => {
      tocContainer.scrollTop = prevScrollTop;
      const tocFilter = document.getElementById('toc-filter');
      if (tocFilter && tocFilter.value) applyTocFilter(tocFilter.value);
    });
  }

  const existingBlocks = Array.from(container.children);
  const existingBlockMap = new Map();
  existingBlocks.forEach((el) => {
    if (el.id.startsWith('block-')) {
      const id = parseInt(el.id.replace('block-', ''), 10);
      existingBlockMap.set(id, el);
    } else if (el.id === 'empty-state') {
      el.remove();
    }
  });

  const blockControls = document.getElementById('block-controls');

  if (filteredTree.length === 0) {
    if (blockControls) {
      blockControls.classList.add('hidden');
      blockControls.classList.remove('flex');
    }
    const isFilterActive = periodFilter !== 'all' || window.currentActiveMonths;
    let emptyHtml = '';
    if (isFilterActive) {
      emptyHtml = `
        <div id="empty-state" class="flex flex-col items-center justify-center py-20 px-6 text-center border border-slate-200 rounded-3xl bg-slate-50 relative overflow-hidden transition-colors">
           <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 24px 24px; opacity: 0.6;"></div>
           <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-50 via-transparent to-slate-50 opacity-80"></div>
           <div class="relative z-10 flex flex-col items-center">
              <div class="relative flex items-center justify-center mb-6">
                <div class="relative w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center border border-slate-300">
                  <svg aria-hidden="true" class="w-8 h-8 text-slate-500"><use href="#icon-search"></use></svg>
                </div>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-blue-950 mb-3 tracking-tight">${_t('filter_empty.title')}</h2>
              <p class="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-8">${_t('filter_empty.desc')}</p>
              <button data-action="setPeriodFilter" data-period="all" class="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95">${_t('filter_empty.show_all')}</button>
           </div>
        </div>
      `;
    } else {
      const isFsaSupported = 'showSaveFilePicker' in window;
      const browserNoticeHtml = isFsaSupported
        ? `<div class="mt-8 flex flex-col items-center gap-1 text-[11px] text-slate-400">
             <p class="font-bold flex items-center gap-1"><svg aria-hidden="true" class="w-3.5 h-3.5"><use href="#icon-sparkles"></use></svg> ${_t('welcome.browser_ok')}</p>
             <p class="opacity-80">${_t('welcome.fsa_enabled')}</p>
           </div>`
        : `<div class="mt-8 flex flex-col items-center gap-1.5 text-[11px] text-orange-600 bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-200">
             <p class="font-bold flex items-center gap-1 text-xs">${_t('welcome.browser_warn')}</p>
             <p class="opacity-90 max-w-[260px] leading-relaxed">${_t('welcome.fsa_disabled')}</p>
           </div>`;
      emptyHtml = `
        <div id="empty-state" class="flex flex-col items-center justify-center py-20 px-6 text-center border border-slate-200 rounded-3xl bg-slate-50 relative overflow-hidden transition-colors">
           <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px); background-size: 24px 24px; opacity: 0.6;"></div>
           <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-50 via-transparent to-slate-50 opacity-80"></div>
           <div class="relative z-10 flex flex-col items-center">
              <div class="relative flex items-center justify-center mb-6">
                <div class="relative w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                  <svg aria-hidden="true" class="w-8 h-8 text-blue-600"><use href="#icon-cash"></use></svg>
                </div>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-blue-950 mb-3 tracking-tight">${_t('welcome.title')}</h2>
              <p class="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-8">${_t('welcome.desc')}</p>
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <button data-action="focusNewBlockMemo" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                  <span class="text-lg font-light leading-none mb-0.5">+</span> ${_t('welcome.new_block')}
                </button>
                <button data-action="triggerCsvInputClick" class="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                  <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-import"></use></svg> ${_t('welcome.import_csv')}
                </button>
              </div>
              ${browserNoticeHtml}
           </div>
        </div>
      `;
    }
    container.innerHTML = emptyHtml;
    existingBlockMap.forEach((el) => el.remove());
    let mobileTagContainer = document.getElementById('mobile-tag-container');
    if (mobileTagContainer) mobileTagContainer.remove();
    updateTotalsOnly();
    renderMemoSuggestions();
    return;
  }

  if (blockControls) {
    blockControls.classList.remove('hidden');
    blockControls.classList.add('flex');
  }

  let currentDomIndex = 0;

  filteredTree.forEach((block) => {
    let blockEl = existingBlockMap.get(block.id);
    blockEl = updateOrCreateBlockElement(block, blockEl);
    existingBlockMap.delete(block.id);

    if (container.children[currentDomIndex] !== blockEl) {
      container.insertBefore(blockEl, container.children[currentDomIndex] || null);
    }
    currentDomIndex++;
  });

  existingBlockMap.forEach((el) => el.remove());

  updateTotalsOnly();
  renderMemoSuggestions();

  if (focusBlockId) {
    const targetInput = document.querySelector(`#block-form-${focusBlockId} .item-memo`);
    if (targetInput) {
      targetInput.focus({ preventScroll: true });
      setTimeout(() => {
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  if (!window.tocObserver) {
    window.tocObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.toc-item').forEach((el) => {
              el.classList.remove('text-blue-600', 'bg-blue-50', 'font-bold');
              el.classList.add('text-slate-500', 'font-medium');
            });
            const activeToc = document.querySelector(`.toc-item[href="#${entry.target.id}"]`);
            if (activeToc) {
              activeToc.classList.remove('text-slate-500', 'font-medium');
              activeToc.classList.add('text-blue-600', 'bg-blue-50', 'font-bold');
              const tocContainer = document.getElementById('toc-container');
              if (tocContainer && !tocContainer.matches(':hover')) {
                const scrollPos =
                  activeToc.offsetTop - tocContainer.clientHeight / 2 + activeToc.clientHeight / 2;
                tocContainer.scrollTo({ top: scrollPos, behavior: 'smooth' });
              }
            }
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
  } else {
    window.tocObserver.disconnect();
  }
  document.querySelectorAll('.group\\/block').forEach((block) => window.tocObserver.observe(block));

  if (activeId && activeField) {
    const target = document.querySelector(`[data-id="${activeId}"][data-field="${activeField}"]`);
    if (target) {
      target.focus({ preventScroll: true });
      if (target.hasAttribute('contenteditable')) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}

function generateBlockFormHtml(blockId, defaultDate, defaultAccount) {
  let dateInputClass =
    'item-date appearance-none bg-transparent border-0 focus:ring-0 p-0 text-xs w-[110px] text-center outline-none cursor-pointer transition-colors';
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (defaultDate > todayStr) dateInputClass += ' text-red-600 font-bold bg-red-50 rounded';
  else dateInputClass += ' text-slate-600 bg-transparent';
  const baseCurrency =
    typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
  return `
    <form id="block-form-${blockId}" data-action="addItem" data-id="${blockId}" class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 py-2 -mx-3 rounded-md transition-all focus-within:bg-slate-50 focus-within:ring-1 focus-within:ring-slate-200">
      <span class="text-blue-600 text-xl leading-none font-light hidden sm:inline">+</span>
      <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <button type="submit" class="text-blue-600 bg-blue-600/10 hover:bg-blue-600/20 rounded-full w-8 h-8 flex items-center justify-center text-xl leading-none font-light sm:hidden transition-colors outline-none focus:ring-2 focus:ring-blue-600/50 shrink-0">+</button>
        <div class="flex items-center bg-slate-50 rounded-md px-1 py-1 border border-slate-200 transition-colors">
          <button type="button" data-action="adjustDate" data-delta="-1" class="text-slate-400 hover:text-slate-800 w-8 h-8 hidden sm:flex items-center justify-center font-bold cursor-pointer outline-none transition-colors touch-manipulation">-</button>
          <input type="date" class="${dateInputClass}" value="${defaultDate}" data-action-input="setDirtyAndCheckFutureDate">
          <button type="button" data-action="adjustDate" data-delta="1" class="text-slate-400 hover:text-slate-800 w-8 h-8 hidden sm:flex items-center justify-center font-bold cursor-pointer outline-none transition-colors touch-manipulation">+</button>
        </div>
        <input type="text" placeholder="Account" value="${escapeHtml(defaultAccount)}" spellcheck="false" autocomplete="off" list="account-suggestions" data-action-input="setDirty" data-action-focus="select" data-action-keydown="focusNextMemo" class="item-account bg-transparent border-0 focus:ring-2 focus:ring-blue-100 focus:bg-blue-50/50 p-0 text-slate-600 placeholder-slate-400 w-20 shrink-0 text-sm outline-none text-center" style="min-width: 60px;">
      </div>
      <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 pl-6 sm:pl-0 mt-2 sm:mt-0">
        <input type="text" placeholder="Add entry..." list="memo-suggestions" data-action-input="setDirty" data-action-blur="autoSuggestAccount" data-action-focus="scrollIntoView" data-action-keydown="focusNextAmount" class="item-memo bg-transparent border-0 focus:ring-2 focus:ring-blue-100 focus:bg-blue-50/50 px-1 rounded-sm p-0 text-blue-950 placeholder-slate-400 flex-1 text-sm font-medium outline-none min-w-[100px]">
        <input type="text" inputmode="decimal" placeholder="Amount (e.g. 150*1.08)" spellcheck="false" autocomplete="off" title="Supports math: + - * / (e.g. 150 EUR * 1.08)" class="item-amount bg-transparent border-0 focus:ring-2 focus:ring-blue-100 focus:bg-blue-50/50 px-1 rounded-sm p-0 text-right tabular-nums tracking-tight text-blue-950 placeholder-slate-400 w-24 sm:w-32 shrink-0 text-sm outline-none" style="min-width: 104px;" data-action-input="setDirty" data-action-focus="scrollIntoView" data-action-keydown="submitOnTab">
      </div>
      <button type="submit" class="hidden">Add</button>
    </form>
  `;
}

function updateOrCreateBlockElement(block, existingEl = null) {
  const isNew = !existingEl;
  const blockEl = existingEl || document.createElement('div');
  if (isNew) {
    blockEl.id = `block-${block.id}`;
    blockEl.className = 'group/block relative scroll-mt-[220px] sm:scroll-mt-[240px]';
  }

  const blockTotal = block.children.reduce((sum, item) => {
    const isCollection = (item.memo || '').match(/(#Receipt|#Payment)(?=\s|$)/i);
    return isCollection ? sum : sum + parseFloat(item.amount || 0);
  }, 0);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  let defaultDate = lastUsedDates[block.id] || todayStr;
  const defaultAccount = lastUsedAccounts[block.id] || '';

  const startMonth = parseInt(getDbSetting('fiscalMonth', '1'), 10);
  let currentFiscalYear = yyyy;
  if (today.getMonth() + 1 < startMonth) currentFiscalYear--;

  if (window.currentActiveMonths && window.currentActiveMonths.length > 0) {
    const isInside = window.currentActiveMonths.some((m) => defaultDate.startsWith(m));
    if (!isInside) {
      const sortedMonths = [...window.currentActiveMonths].sort();
      const targetMonth = sortedMonths[sortedMonths.length - 1];
      if (targetMonth === `${yyyy}-${mm}`) defaultDate = todayStr;
      else {
        const [tYear, tMonth] = targetMonth.split('-');
        const lastDay = new Date(parseInt(tYear, 10), parseInt(tMonth, 10), 0).getDate();
        defaultDate = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
      }
    }
  }

  // 1. Build header info
  const isCollapsed = collapsedBlocks.has(block.id);
  const maxH = isCollapsed ? '0px' : '99999px';
  const op = isCollapsed ? '0' : '1';
  const iconRotation = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

  let blockBadgeHtml = '';
  if (block.children.length > 0) {
    let diffs = block.children.map((item) => {
      if (!item.created_at) return null;
      const parts = item.created_at.split(' ')[0].split('-');
      if (parts.length !== 3) return null;
      const itemYear = parseInt(parts[0], 10);
      const itemMonth = parseInt(parts[1], 10);
      let itemFiscalYear = itemYear;
      if (itemMonth < startMonth) itemFiscalYear--;
      return currentFiscalYear - itemFiscalYear;
    });
    const validDiffs = diffs.filter((d) => d !== null && !isNaN(d));
    if (validDiffs.length > 0) {
      const minDiff = validDiffs.reduce((min, curr) => Math.min(min, curr), Infinity);
      if (minDiff === 1) {
        blockBadgeHtml = `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 ml-2 shrink-0 select-none" title="Prior year data">Prior</span>`;
      } else if (minDiff >= 2) {
        blockBadgeHtml = `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 ml-2 shrink-0 select-none" title="Older years data">Older</span>`;
      }
    }
  }

  // Tailwindの content-[attr(data-xxx)] を使用して動的にテキストを差し込む
  const blockTitleEmptyClass = 'empty:before:content-[attr(data-empty)]';
  const untitledText = window._t('label.unnamed') || 'Untitled';

  const headerHtml = `
    <div data-action="toggleBlock" data-id="${block.id}" class="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center transition-colors cursor-pointer select-none group/header hover:bg-slate-100">
      <div class="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        <svg aria-hidden="true" id="block-icon-${block.id}" class="w-5 h-5 text-slate-400 transition-transform duration-200" style="transform: ${iconRotation};"><use href="#icon-chevron-down"></use></svg>
        <h2 data-id="${block.id}" data-empty="✎ ${escapeHtml(untitledText)}" data-field="memo" contenteditable="true" data-action-input="setDirtyContentEditable" data-action-paste="handlePlainTextPaste" data-stop-propagation="true" data-action-keydown="blurOnEnter" data-action-blur="updateRecord" class="select-text text-xl font-extrabold text-blue-950 tracking-tight outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/30 px-1 rounded cursor-text truncate transition-colors empty:inline-block empty:min-w-20 empty:bg-slate-100 empty:before:text-slate-400 empty:before:text-sm empty:before:font-normal empty:before:pointer-events-none empty:focus:before:opacity-50 ${blockTitleEmptyClass}">${formatMemoHtml(block.memo)}</h2>

        <select data-id="${block.id}" data-field="currency" data-action-change="updateRecord" data-stop-propagation="true" class="text-xs px-2 py-1 rounded bg-white border border-slate-200 text-slate-500 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ml-2 shadow-sm font-bold">
          ${getCurrencyOptionsHtml(block.currency)}
        </select>

        ${blockBadgeHtml}
      </div>
      <div class="flex items-center shrink-0">
        <div class="font-bold tabular-nums tracking-tight text-blue-950 text-lg flex flex-wrap justify-end items-baseline gap-x-2">
          <span class="text-slate-400 text-sm font-sans mr-0.5">${blockTotal < 0 ? '-' : ''}${getCurrencySymbol(block.currency || 'USD')}</span>
          <span id="block-total-${block.id}" class="flex flex-wrap justify-end gap-x-3">${formatCurrency(Math.abs(blockTotal), block.currency || 'USD')}</span>
        </div>
        <div class="flex items-center pl-4 border-l border-slate-200/50 ml-4 shrink-0 h-8">
          <button data-stop-propagation="true" data-action="sortBlockByDate" data-id="${block.id}" aria-label="Sort by date" class="w-8 h-8 flex items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-600 md:opacity-0 md:group-hover/block:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer mr-1 ${block.children.length < 2 ? 'opacity-30 pointer-events-none md:!opacity-30' : ''}" title="Sort by oldest date first">
            <svg aria-hidden="true" class="w-5 h-5"><use href="#icon-sort"></use></svg>
          </button>
          <button data-stop-propagation="true" data-action="deleteRecord" data-id="${block.id}" aria-label="Delete block" class="w-8 h-8 flex items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500 md:opacity-0 md:group-hover/block:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all cursor-pointer" title="Delete entire block">
            <svg aria-hidden="true" class="w-5 h-5"><use href="#icon-trash"></use></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // 2. Build item list
  const memoEmptyClass = 'empty:before:content-[attr(data-empty)]';
  const emptyMemoText = window._t('csv.memo') || 'Memo'; // "✎ Memo" のような表示にする
  const newItemsHtml = block.children
    .map((item) => {
      const isCollection = (item.memo || '').match(/(#Receipt|#Payment)(?=\s|$)/i);
      const isLocked = item.is_exported === 1;

      let dateDisp = '';
      let badgeHtml = '';
      let itemYyyy = yyyy;

      if (item.created_at) {
        const dStr = item.created_at.split(' ')[0];
        const parts = dStr.split('-');
        if (parts.length === 3) {
          itemYyyy = escapeHtml(parts[0]);
          const imm = escapeHtml(parts[1]);
          const idd = escapeHtml(parts[2]);
          const itemYear = parseInt(itemYyyy, 10);
          const itemMonth = parseInt(imm, 10);
          let itemFiscalYear = itemYear;
          if (itemMonth < startMonth) itemFiscalYear--;

          const diff = currentFiscalYear - itemFiscalYear;
          if (diff === 1) {
            badgeHtml = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 mr-1.5 shrink-0 select-none" title="Record from prior year">Prior</span>`;
          } else if (diff >= 2) {
            badgeHtml = `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 mr-1.5 shrink-0 select-none" title="Record from older years">Older</span>`;
          }

          const dateEditable = isLocked ? 'false' : 'true';
          let dateClasses =
            'text-xs font-mono mr-2 sm:mr-3 border px-1.5 py-0.5 rounded outline-none focus:ring-2 cursor-text transition-colors';

          if (isLocked) {
            dateClasses +=
              ' text-slate-400 bg-slate-100 border-slate-100 cursor-not-allowed opacity-70';
          } else if (dStr > todayStr) {
            dateClasses +=
              ' text-red-600 bg-red-50 border-red-200 focus:ring-red-300 hover:bg-red-100 font-bold';
          } else {
            dateClasses += isCollection
              ? ' text-slate-400 bg-transparent border-transparent hover:bg-slate-100'
              : ' text-slate-500 bg-slate-100 border-slate-200 focus:ring-blue-200 hover:bg-slate-200';
          }

          const currentAppLang = (window.I18n && window.I18n.getLang()) || 'en';
          const isMonthFirst = currentAppLang === 'en' || currentAppLang === 'ja';
          const dateText = isMonthFirst ? `${imm}/${idd}` : `${idd}/${imm}`;
          const editDateTooltip =
            window._t('tooltip.edit_date') || 'Click to edit date (Supports YYYY/MM/DD)';
          const tooltipText = isLocked ? 'Exported & Locked' : editDateTooltip;
          dateDisp = `${badgeHtml}<span data-id="${item.id}" data-field="created_at" data-year="${itemYyyy}" contenteditable="${dateEditable}" data-action-input="setDirtyContentEditable" data-action-paste="handlePlainTextPaste" data-action-keydown="blurOnEnter" data-action-blur="updateRecord" class="${dateClasses}" title="${tooltipText}">${dateText}</span>`;
        }
      }

      const accStr = item.account || '';
      let accClasses = '';
      if (isLocked) {
        accClasses = 'text-slate-400 bg-slate-50 border-slate-100 cursor-not-allowed opacity-70';
      } else {
        accClasses = isCollection
          ? 'text-slate-400 bg-transparent border-transparent hover:bg-slate-100 focus:bg-slate-100'
          : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 focus:bg-blue-100';
      }

      const accDisabled = isLocked ? 'disabled' : '';
      const taxStr = item.tax_rate || '';
      const taxDisabled = isLocked ? 'disabled' : '';
      const taxClasses = isLocked
        ? 'text-slate-400 bg-slate-50 border-slate-100 cursor-not-allowed opacity-70'
        : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 focus:bg-emerald-100';

      const taxDisp = `<select data-id="${item.id}" data-field="tax_rate" ${taxDisabled} data-action-change="updateRecord" class="text-xs px-1 py-0.5 rounded mr-2 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer transition-colors w-[70px] sm:w-[85px] shrink-0 text-left border ${taxClasses}">${getTaxOptionsHtml(taxStr)}</select>`;

      const accPlaceholder = window._t('placeholder.account');
      let accountDisp = `<input type="text" data-id="${item.id}" data-field="account" list="account-suggestions" value="${escapeHtml(accStr)}" placeholder="${accPlaceholder}" ${accDisabled} data-action-focus="select" data-action-input="setDirty" data-action-keydown="blurOnEnter" data-action-blur="updateRecord" class="text-xs px-1.5 py-0.5 rounded mr-2 outline-none focus:ring-2 focus:ring-blue-400 cursor-text transition-colors w-[84px] sm:w-[100px] shrink-0 text-left placeholder-blue-300 border ${accClasses}">`;

      let actionButtonsHtml = '';
      if (isLocked) {
        actionButtonsHtml = `
        <span class="text-slate-400 p-1.5" title="Exported & Locked">
          <svg aria-hidden="true" class="w-4 h-4"><use href="#icon-lock"></use></svg>
        </span>
      `;
      } else {
        let checkBtnHtml = '';
        if (!isCollection) {
          checkBtnHtml = `<button data-action="createCollectionRecord" data-id="${item.id}" aria-label="Create settlement" class="text-slate-300 hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded p-1.5 sm:p-2 -m-1 transition-colors cursor-pointer" title="Auto-generate settlement record"><svg aria-hidden="true" class="w-4 h-4 pointer-events-none"><use href="#icon-check-circle"></use></svg></button>`;
        }
        actionButtonsHtml = `
        <div class="flex items-center space-x-0.5 sm:space-x-1 md:opacity-0 md:group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity">
          ${checkBtnHtml}
          <button data-action="duplicateRecord" data-id="${item.id}" aria-label="Duplicate" class="text-slate-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 rounded p-1.5 sm:p-2 -m-1 transition-colors cursor-pointer" title="Duplicate"><svg aria-hidden="true" class="w-4 h-4 pointer-events-none"><use href="#icon-copy"></use></svg></button>
          <button data-action="deleteRecord" data-id="${item.id}" aria-label="Delete" class="text-slate-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 rounded transition-colors text-xl sm:text-2xl leading-none p-1.5 sm:p-2 -m-1 cursor-pointer" title="Delete">&times;</button>
        </div>
      `;
      }

      const memoEditable = isLocked ? 'false' : 'true';
      const amountDisabled = isLocked ? 'disabled' : '';

      return `
      <div class="flex justify-between items-center px-4 sm:px-8 py-3 sm:py-3.5 border-b border-slate-50 group/item transition-colors ${isLocked ? 'bg-slate-100/30 opacity-75' : isCollection ? 'bg-slate-50/60' : 'hover:bg-slate-50/80'}">
        <div class="flex items-center flex-1 min-w-0">
          ${dateDisp}
          ${accountDisp}
          ${taxDisp}
          <span data-id="${item.id}" data-empty="✎ ${escapeHtml(emptyMemoText)}" data-field="memo" contenteditable="${memoEditable}" data-action-input="setDirtyContentEditable" data-action-paste="handlePlainTextPaste" data-action-keydown="blurOnEnter" data-action-blur="updateRecord" class="${isLocked ? 'text-slate-400 cursor-not-allowed' : isCollection ? 'text-slate-500' : 'text-blue-950'} font-medium truncate outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 px-1 rounded cursor-text transition-colors empty:inline-block empty:min-w-12 empty:bg-slate-100 empty:before:text-slate-400 empty:before:text-xs empty:before:font-normal empty:before:pointer-events-none empty:focus:before:opacity-50 ${memoEmptyClass}">${formatMemoHtml(item.memo)}</span>
        </div>
        <div class="flex items-center space-x-1.5 sm:space-x-4 ml-2 sm:ml-auto shrink-0">
          <input type="text" data-id="${item.id}" data-field="amount" inputmode="decimal" placeholder="0" title="${isLocked ? 'Exported & Locked' : 'Supports math (e.g. 150 EUR * 1.08)'}" value="${item.amount !== null && item.amount !== '' && item.amount !== undefined ? formatCurrency(item.amount, block.currency || 'USD') : ''}" ${amountDisabled} data-action-input="setDirty" data-action-focus="select" data-action-paste="handlePlainTextPaste" data-action-keydown="blurOnEnter" data-action-blur="updateRecord" class="bg-transparent border-0 p-0 font-medium tabular-nums tracking-tight ${isLocked ? 'text-slate-400 cursor-not-allowed' : isCollection ? 'text-slate-400' : 'text-blue-950'} text-right outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 px-1 rounded cursor-text transition-colors w-[50px] sm:w-[80px]">
          ${actionButtonsHtml}
        </div>
      </div>
    `;
    })
    .join('');

  if (isNew) {
    blockEl.innerHTML = `
      <button data-stop-propagation="true" data-action="saveTemplate" data-id="${block.id}" class="absolute -top-3 -left-3 opacity-100 md:opacity-0 group-hover/block:opacity-100 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600/50 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-110 p-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center z-10" title="Save this block as a template">
        <svg aria-hidden="true" class="w-5 h-5"><use href="#icon-squares-plus"></use></svg>
      </button>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:border-slate-300 hover:shadow-md">
        <div class="block-header-container">
          ${headerHtml}
        </div>
        <div id="block-body-${block.id}" class="transition-all duration-300 ease-in-out overflow-hidden" style="max-height: ${maxH}; opacity: ${op};">
          <div class="items-container">${newItemsHtml}</div>
          <div class="form-container px-8 py-4 bg-white transition-colors">
            ${generateBlockFormHtml(block.id, defaultDate, defaultAccount)}
          </div>
        </div>
      </div>
    `;
  } else {
    const headerContainer = blockEl.querySelector('.block-header-container');
    if (headerContainer && headerContainer.innerHTML !== headerHtml) {
      headerContainer.innerHTML = headerHtml;
    }

    const itemsContainer = blockEl.querySelector('.items-container');
    if (itemsContainer && itemsContainer.innerHTML !== newItemsHtml) {
      itemsContainer.innerHTML = newItemsHtml;
    }

    const bodyEl = blockEl.querySelector(`#block-body-${block.id}`);
    if (bodyEl) {
      bodyEl.style.maxHeight = maxH;
      bodyEl.style.opacity = op;
    }
  }

  return blockEl;
}

async function saveTemplate(blockId) {
  if (!db) return;
  let blockMemo = window._t('label.unnamed') || 'Unnamed';
  let blockStmt;
  try {
    blockStmt = db.prepare('SELECT memo FROM records WHERE id = ?');
    blockStmt.bind([blockId]);
    if (blockStmt.step()) blockMemo = blockStmt.get()[0] || 'Unnamed';
    else return;
  } finally {
    if (blockStmt) blockStmt.free();
  }

  let items = [];
  let itemsStmt;
  try {
    itemsStmt = db.prepare(
      'SELECT memo, account, amount, tax_rate, currency FROM records WHERE parent_id = ? ORDER BY sort_order ASC, id ASC',
    );
    itemsStmt.bind([blockId]);
    while (itemsStmt.step()) {
      const row = itemsStmt.get();
      items.push({
        memo: row[0],
        account: row[1],
        amount: row[2],
        tax_rate: row[3],
        currency: row[4],
      });
    }
  } finally {
    if (itemsStmt) itemsStmt.free();
  }

  let tplName = prompt(window._t('prompt.save_tpl_title'), blockMemo + ' (Template)');
  if (!tplName) return;
  tplName = tplName.trim().slice(0, 50);
  if (!tplName) return;

  let stmt;
  try {
    stmt = db.prepare('INSERT INTO templates (name, data) VALUES (?, ?)');
    stmt.run([tplName, JSON.stringify(items)]);
  } finally {
    if (stmt) stmt.free();
  }
  setDirty(true);
  await showAlert(window._t('toast.tpl_saved', tplName));
}

async function insertTemplate(templateId) {
  if (!db) return;
  let tplName = '';
  let rawData = '[]';
  let stmt;
  try {
    stmt = db.prepare('SELECT name, data FROM templates WHERE id = ?');
    stmt.bind([templateId]);
    if (!stmt.step()) return;
    const row = stmt.get();
    tplName = row[0];
    rawData = row[1];
  } finally {
    if (stmt) stmt.free();
  }

  let tplData = [];
  try {
    tplData = JSON.parse(rawData || '[]');
  } catch (e) {
    await showAlert(window._t('error.tpl_load'));
    return;
  }
  if (!Array.isArray(tplData)) {
    await showAlert(window._t('error.tpl_corrupted'));
    return;
  }

  const baseCurrency =
    typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
  db.run('INSERT INTO records (memo, amount, currency) VALUES (?, ?, ?)', [
    tplName,
    null,
    baseCurrency,
  ]);
  const parentRes = db.exec('SELECT last_insert_rowid()');
  const parentId = parentRes[0].values[0][0];

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;

  let insertStmt = null;
  try {
    insertStmt = db.prepare(
      'INSERT INTO records (parent_id, memo, amount, account, created_at, tax_rate, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    for (let item of tplData) {
      const safeAmount = item.amount === '' || item.amount === undefined ? null : item.amount;
      const safeTax = item.tax_rate || '';
      const safeCur = item.currency || 'USD';
      insertStmt.run([parentId, item.memo, safeAmount, item.account, dateStr, safeTax, safeCur]);
    }
  } finally {
    if (insertStmt) insertStmt.free();
  }

  const filterVal = document.getElementById('period-filter')?.value;
  let isOutsideFilter = false;
  if (window.currentActiveMonths) {
    const match = window.currentActiveMonths.some((m) => dateStr.startsWith(m));
    if (!match) isOutsideFilter = true;
  } else if (filterVal && filterVal !== 'all') {
    if (!dateStr.startsWith(filterVal)) isOutsideFilter = true;
  }

  if (isOutsideFilter) {
    window.currentActiveMonths = null;
    setActiveQuickPeriodButton(null);
    if (document.getElementById('period-filter'))
      document.getElementById('period-filter').value = 'all';
    showToast(window._t('toast.filter_outside'), '<span class="text-blue-400">👀</span>');
  }

  setDirty(true);
  renderData(parentId);
}

async function deleteRecord(id) {
  if (!(await requestConfirm(window._t('confirm.delete_record')))) return;

  let checkStmt;
  try {
    checkStmt = db.prepare(
      'SELECT COUNT(*) FROM records WHERE (id = ? OR parent_id = ?) AND is_exported = 1',
    );
    checkStmt.bind([id, id]);
    if (checkStmt.step() && checkStmt.get()[0] > 0) {
      await showAlert(
        window._t('alert.cannot_delete_locked') ||
          'Cannot delete. This block contains records that have already been exported and locked.',
      );
      return;
    }
  } finally {
    if (checkStmt) checkStmt.free();
  }

  let stmt;
  try {
    stmt = db.prepare('DELETE FROM records WHERE id = ? OR parent_id = ?');
    stmt.run([id, id]);
  } finally {
    if (stmt) stmt.free();
  }
  collapsedBlocks.delete(id);
  delete lastUsedDates[id];
  setDirty(true);
  renderData();
}

async function sortBlockByDate(blockId) {
  if (!db) return;
  if (!(await requestConfirm(window._t('confirm.sort_by_date')))) return;
  let stmt;
  let items = [];
  try {
    stmt = db.prepare('SELECT id, created_at FROM records WHERE parent_id = ?');
    stmt.bind([blockId]);
    while (stmt.step()) {
      const [id, created_at] = stmt.get();
      items.push({ id, created_at: created_at || '' });
    }
  } finally {
    if (stmt) stmt.free();
  }

  items.sort((a, b) => {
    if (a.created_at < b.created_at) return -1;
    if (a.created_at > b.created_at) return 1;
    return a.id - b.id;
  });

  let updateStmt;
  try {
    updateStmt = db.prepare('UPDATE records SET sort_order = ? WHERE id = ?');
    items.forEach((item, index) => {
      updateStmt.run([index, item.id]);
    });
    setDirty(true);
    renderData();
    showToast(window._t('toast.sorted') || 'Sorted by date', '🧹');
  } catch (e) {
    console.error('Sort failed', e);
  } finally {
    if (updateStmt) updateStmt.free();
  }
}

function duplicateRecord(id) {
  if (!db) return;
  let stmt;
  let insertStmt;
  try {
    stmt = db.prepare(
      'SELECT parent_id, memo, amount, account, created_at, sort_order, tax_rate, currency FROM records WHERE id = ?',
    );
    stmt.bind([id]);
    if (stmt.step()) {
      const [parent_id, memo, amount, account, created_at, sort_order, tax_rate, currency] =
        stmt.get();
      insertStmt = db.prepare(
        'INSERT INTO records (parent_id, memo, amount, account, created_at, sort_order, tax_rate, currency, is_exported) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      );
      insertStmt.run([
        parent_id,
        memo,
        amount,
        account,
        created_at,
        sort_order,
        tax_rate,
        currency,
      ]);
      const res = db.exec('SELECT last_insert_rowid()');
      const newId = res[0].values[0][0];

      setDirty(true);
      renderData();
      showToast(
        window._t('toast.copied') || 'Record duplicated',
        '<span class="text-green-400">📋</span>',
      );

      requestAnimationFrame(() => {
        const newDateEl = document.querySelector(
          `span[data-id="${newId}"][data-field="created_at"]`,
        );
        if (newDateEl) {
          newDateEl.focus();
          window.getSelection().selectAllChildren(newDateEl);
        }
      });
    }
  } catch (e) {
    console.error('Duplicate failed:', e);
  } finally {
    if (stmt) stmt.free();
    if (insertStmt) insertStmt.free();
  }
}

async function saveGrindFile(isSaveAs = false) {
  if (!db) return;
  if (isSaving) return;
  isSaving = true;

  let targetFileHandle = fileHandle;

  let activeSelector = null;
  const activeEl = document.activeElement;
  if (
    activeEl &&
    typeof activeEl.blur === 'function' &&
    activeEl.tagName !== 'BODY' &&
    activeEl.id !== 'cmd-input'
  ) {
    if (
      typeof activeEl.hasAttribute === 'function' &&
      activeEl.hasAttribute('data-id') &&
      activeEl.hasAttribute('data-field')
    ) {
      activeSelector = `[data-id="${activeEl.getAttribute('data-id')}"][data-field="${activeEl.getAttribute('data-field')}"]`;
    } else if (activeEl.classList.contains('item-memo')) {
      const form = activeEl.closest('form');
      if (form) activeSelector = `#${form.id} .item-memo`;
    } else if (activeEl.classList.contains('item-amount')) {
      const form = activeEl.closest('form');
      if (form) activeSelector = `#${form.id} .item-amount`;
    } else if (activeEl.classList.contains('item-account')) {
      const form = activeEl.closest('form');
      if (form) activeSelector = `#${form.id} .item-account`;
    } else if (activeEl.classList.contains('item-date')) {
      const form = activeEl.closest('form');
      if (form) activeSelector = `#${form.id} .item-date`;
    } else if (activeEl.id) {
      activeSelector = `#${activeEl.id}`;
    }
    activeEl.blur();
    // Wait briefly for synchronous events to process
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  try {
    try {
      db.run('VACUUM');
    } catch (vacuumError) {
      console.warn('SQLite VACUUM skipped due to active statements:', vacuumError);
    }
    let data = db.export();
    const currentPassword = document.getElementById('file-password').value;
    const currentPasswordHash = await getPasswordHash(currentPassword);

    if (lastSavedPasswordHash !== '' && currentPassword === '') {
      if (!(await requestConfirm(window._t('confirm.pw_empty')))) {
        await showAlert(window._t('alert.pw_empty_canceled'));
        return;
      }
    }

    if (currentPassword !== '' && currentPasswordHash !== lastSavedPasswordHash) {
      const confirmPw = await requestPasswordPrompt(window._t('prompt.pw_new'));
      if (confirmPw === null) {
        return;
      }
      if (confirmPw !== currentPassword) {
        await showAlert(window._t('alert.pw_mismatch'));
        return;
      }
    }

    if (currentPassword) {
      data = await encryptData(data, currentPassword);
    }

    const showSaveSuccessFeedback = () => {
      const saveBtn = document.getElementById('btn-save');
      const floatingSaveBtn = document.getElementById('floating-save-btn');

      const animateBtn = (btn) => {
        if (!btn) return;
        const iconSvg = btn.querySelector('svg');
        if (iconSvg && !iconSvg.hasAttribute('data-animating')) {
          iconSvg.setAttribute('data-animating', 'true');
          const originalUse = `<use href="#icon-save"></use>`;
          iconSvg.innerHTML = `<use href="#icon-check"></use>`;
          iconSvg.classList.add('text-green-500', 'scale-125');
          btn.classList.add('ring-2', 'ring-green-500/20', 'bg-green-50');

          if (btn.id === 'floating-save-btn') {
            btn.classList.remove('opacity-0', 'pointer-events-none');
            btn.classList.add('opacity-100', 'pointer-events-auto');
          }

          setTimeout(() => {
            iconSvg.innerHTML = originalUse;
            iconSvg.classList.remove('text-green-500', 'scale-125');
            btn.classList.remove('ring-2', 'ring-green-500/20', 'bg-green-50');
            iconSvg.removeAttribute('data-animating');

            if (btn.id === 'floating-save-btn' && !isDirty) {
              btn.classList.add('opacity-0', 'pointer-events-none');
              btn.classList.remove('opacity-100', 'pointer-events-auto');
            }
          }, 1500);
        }
      };

      animateBtn(saveBtn);
      animateBtn(floatingSaveBtn);
      triggerHaptic();
    };

    if (isSaveAs || !targetFileHandle || targetFileHandle.isDummy) {
      if ('showSaveFilePicker' in window) {
        try {
          const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          targetFileHandle = await window.showSaveFilePicker({
            suggestedName: `GrindCash_${todayStr}.cash`,
            types: [
              { description: 'GrindCash Database', accept: { 'application/x-sqlite3': ['.cash'] } },
            ],
          });
          fileHandle = targetFileHandle;
        } catch (err) {
          return;
        }
      } else {
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
          targetFileHandle && targetFileHandle.name ? targetFileHandle.name : 'database.cash';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDirty(false);
        showToast(
          window._t('toast.downloaded', a.download),
          '<span class="text-green-400">💾</span>',
        );
        showSaveSuccessFeedback();
        lastSavedPasswordHash = currentPasswordHash;
        return;
      }
    }

    if (targetFileHandle && !targetFileHandle.isDummy) {
      try {
        const permission = await targetFileHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const request = await targetFileHandle.requestPermission({ mode: 'readwrite' });
          if (request !== 'granted') throw new Error('Write permission denied');
        }
      } catch (e) {
        await showAlert(window._t('alert.write_permission_fail'));
        return;
      }
    }

    const writable = await targetFileHandle.createWritable();
    await writable.write(data);
    await writable.close();
    setDirty(false);

    showToast(
      window._t('toast.saved_to', targetFileHandle.name),
      '<span class="text-green-400">💾</span>',
    );
    showSaveSuccessFeedback();
    triggerHaptic();
    lastSavedPasswordHash = currentPasswordHash;
  } catch (err) {
    console.error('Save failed:', err);
    showToast(window._t('toast.save_error'), '<span class="text-red-400">❌</span>');
  } finally {
    isSaving = false;
    if (activeSelector) {
      requestAnimationFrame(() => {
        try {
          const currentFocus = document.activeElement;
          if (currentFocus === document.body || currentFocus.tagName === 'BUTTON') {
            const el = document.querySelector(activeSelector);
            if (el) {
              el.focus({ preventScroll: true });
              if (el.hasAttribute('contenteditable')) {
                const range = document.createRange();
                const sel = window.getSelection();
                sel.selectAllChildren(el);
                sel.collapseToEnd();
              }
            }
          }
        } catch (e) {}
      });
    }
  }
}

async function processFileHandle(handle, isDummy = false) {
  if (!SQL) {
    await showAlert(window._t('alert.db_engine_starting'));
    return;
  }

  try {
    const file = await handle.getFile();
    if (file.size > 50 * 1024 * 1024) {
      await showAlert(window._t('alert.file_too_large'));
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    let Uints = new Uint8Array(arrayBuffer);

    const magic = Uints.slice(0, 8);
    const magicStr = new TextDecoder().decode(magic);
    const isEncrypted =
      magicStr === 'GRINDENC' || magicStr === 'GRINDEN2' || magicStr !== 'SQLite f';

    if (isEncrypted) {
      let password = document.getElementById('file-password').value;
      let success = false;
      let attemptCount = 0;
      while (!success) {
        try {
          let copy = new Uint8Array(Uints);
          Uints = await decryptData(copy, password);
          success = true;
          if (password) {
            document.getElementById('file-password').value = password;
            lastSavedPasswordHash = await getPasswordHash(password);
          }
        } catch (err) {
          let promptMsg =
            window._t('prompt.pw_backup') || 'File is encrypted. Enter decryption password:';
          if (attemptCount > 0 || password) {
            promptMsg =
              '❌ ' +
              (window._t('alert.pw_incorrect') || 'Incorrect password. Please try again:\n\n') +
              promptMsg;
          }
          password = await requestPasswordPrompt(promptMsg);
          if (password === null) return;
          attemptCount++;
        }
      }
    }

    if (!isEncrypted) {
      lastSavedPasswordHash = '';
      const pwInput = document.getElementById('file-password');
      if (pwInput) pwInput.value = '';
    }

    let newDb;
    try {
      newDb = new SQL.Database(Uints);
    } catch (e) {
      throw new Error('Invalid SQLite database file.');
    }

    if (db) {
      try {
        db.close();
      } catch (e) {}
      db = null;
    }
    db = newDb;
    migrateDatabase();
    loadSettingsFromDb();

    lastUsedDates = {};
    collapsedBlocks.clear();
    window.currentActiveMonths = null;
    currentDisplayedTotal = 0;

    const filterEl = document.getElementById('period-filter');
    if (filterEl) filterEl.value = 'all';
    setActiveQuickPeriodButton(null);

    fileHandle = handle;
    setDirty(false);

    showToast(`Loaded "${file.name}"`, '<span class="text-blue-400">📂</span>');

    const countRes = db.exec('SELECT COUNT(*) FROM records');
    const recordCount = countRes.length > 0 ? countRes[0].values[0][0] : 0;
    if (recordCount > 50) setFiscalYearFilter();
    else renderData();
  } catch (err) {
    console.error('processFileHandle error:', err);
    await showAlert(window._t('alert.file_load_fail'));
  }
}

async function loadGrindFile() {
  if (isDirty) {
    if (!(await requestConfirm(window._t('confirm.discard_changes')))) return;
  }

  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'GrindCash Database',
            accept: { 'application/x-sqlite3': ['.cash', '.grind', '.sqlite'] },
          },
        ],
        multiple: false,
      });
      await processFileHandle(handle);
    } catch (err) {}
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cash,.grind,.sqlite';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const dummyHandle = { getFile: async () => file, name: file.name, isDummy: true };
      await processFileHandle(dummyHandle, true);
    };
    input.click();
  }
}

function showExportModal() {
  window.isSystemModalOpen = true;
  const modal = document.getElementById('export-modal');
  const infoEl = document.getElementById('export-period-info');
  if (infoEl) {
    const filterEl = document.getElementById('period-filter');
    let periodText = 'All Periods';
    if (window.currentActiveMonths && window.currentActiveMonths.length > 0) {
      const sorted = [...window.currentActiveMonths].sort();
      const formatMonth = (ym) => {
        const [y, m] = ym.split('-');
        return `${y}/${parseInt(m, 10)}`;
      };
      periodText = `${formatMonth(sorted[0])} ~ ${formatMonth(sorted[sorted.length - 1])}`;
    } else if (filterEl && filterEl.value !== 'all') {
      periodText = filterEl.options[filterEl.selectedIndex].text;
    }
    const isAll =
      periodText === 'All Periods' ||
      periodText === window._t('period.all') ||
      periodText === 'すべての期間';
    infoEl.innerHTML = isAll
      ? window._t('label.period_info_all')
      : window._t('label.period_info_filtered', escapeHtml(periodText));
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  setAppInert(true);
}

function closeExportModal() {
  const modal = document.getElementById('export-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (!document.querySelector('.flex[role="dialog"]')) {
    window.isSystemModalOpen = false;
    document.body.style.overflow = '';
    setAppInert(false);
  }
}

async function executeExport() {
  const format = document.getElementById('export-format')?.value || 'generic';
  closeExportModal();
  exportCSV(format);
}

// Export CSV matching Xero/QuickBooks spec
async function exportCSV(format = 'generic') {
  if (!db) return;

  const filterVal = document.getElementById('period-filter')?.value || 'all';
  const unexportedOnly = document.getElementById('export-unexported-only')?.checked || false;

  let whereClause = '';
  let params = [];

  if (unexportedOnly) {
    whereClause += ' AND c.is_exported = 0';
  }

  if (window.currentActiveMonths) {
    const orConditions = window.currentActiveMonths
      .map((m) => {
        params.push(`${m}%`);
        return 'c.created_at LIKE ?';
      })
      .join(' OR ');
    whereClause += ` AND (${orConditions})`;
  } else if (filterVal !== 'all') {
    whereClause += ` AND c.created_at LIKE ?`;
    params.push(`${filterVal.replace(/[^0-9-]/g, '')}%`);
  }

  let query = `SELECT c.id, c.created_at, c.account, c.amount, c.memo, p.memo AS parent_memo, c.is_exported, c.tax_rate, c.currency
               FROM records c JOIN records p ON c.parent_id = p.id
               WHERE c.parent_id IS NOT NULL ${whereClause} ORDER BY c.created_at ASC, c.id ASC`;

  const values = [];
  let exportStmt;
  try {
    exportStmt = db.prepare(query);
    exportStmt.bind(params);
    while (exportStmt.step()) {
      values.push(exportStmt.get());
    }
  } finally {
    if (exportStmt) exportStmt.free();
  }

  if (values.length === 0) {
    await showAlert(window._t('alert.no_export_data'));
    return;
  }

  let csvRows = [];

  // 1. Output header based on format
  if (format === 'xero') {
    // Xero standard Bank Statement header
    csvRows.push('"Date","Amount","Payee","Description","Reference","TaxType"');
  } else if (format === 'qb') {
    // QuickBooks Online standard Bank Feed header
    csvRows.push('"Date","Description","Amount"');
  } else {
    // Generic format
    const genericHeaders =
      window._t('export.generic_headers') ||
      '"ID","Date","Account","Amount","Currency","Tax Rate","Memo","Block Name"';
    csvRows.push(genericHeaders);
  }

  // 2. Map data
  values.forEach((row) => {
    const id = row[0];
    const dateStr = row[1] ? row[1].split(' ')[0] : '';
    const account = row[2] || 'Uncategorized';
    const amount = parseFloat(row[3] || 0);
    const memo = row[4] ? row[4].toString() : '';
    const parentMemo = row[5] ? row[5].toString() : '';
    const taxRate = row[7] || '';
    const currency = row[8] || 'USD';

    const sanitizeCSV = (str) => {
      // Prepend single quote if string starts with =, -, +, or @
      if (/^[ \t\r\n]*[=\-@+]/.test(str)) {
        return "'" + str;
      }
      return str;
    };

    const safeAccount = sanitizeCSV(account).replace(/"/g, '""');
    const safeMemo = sanitizeCSV(memo).replace(/"/g, '""');
    const safeParentMemo = sanitizeCSV(parentMemo).replace(/"/g, '""');
    const safeTaxRate = sanitizeCSV(taxRate).replace(/"/g, '""');
    const safeCurrency = sanitizeCSV(currency).replace(/"/g, '""');

    if (format === 'xero') {
      // Xero: Put Account in Payee and block name in Reference
      csvRows.push(
        [
          `"${dateStr}"`,
          amount.toString(),
          `"${safeAccount}"`,
          `"${safeMemo}"`,
          `"${safeParentMemo}"`,
          `"${safeTaxRate}"`,
        ].join(','),
      );
    } else if (format === 'qb') {
      // QuickBooks: Concatenate info into Description (reads only 3 columns)
      const qbDescription = sanitizeCSV(`[${account}] ${memo} (${parentMemo})`.trim()).replace(
        /"/g,
        '""',
      );
      csvRows.push([`"${dateStr}"`, `"${qbDescription}"`, amount.toString()].join(','));
    } else {
      // Generic
      csvRows.push(
        [
          `"${id}"`,
          `"${dateStr}"`,
          `"${safeAccount}"`,
          amount.toString(),
          `"${safeCurrency}"`,
          `"${safeTaxRate}"`,
          `"${safeMemo}"`,
          `"${safeParentMemo}"`,
        ].join(','),
      );
    }
  });

  const csvContent = csvRows.join('\r\n') + '\r\n';

  // 2. Mark records as exported after successful CSV export
  if (unexportedOnly) {
    const exportedIds = values.map((row) => row[0]); // Array of c.id
    if (exportedIds.length > 0) {
      db.run('BEGIN TRANSACTION;');
      let updateStmt;
      try {
        updateStmt = db.prepare('UPDATE records SET is_exported = 1 WHERE id = ?');
        exportedIds.forEach((id) => {
          updateStmt.run([id]);
        });
        db.run('COMMIT;');
        setDirty(true);

        // Update UI to lock state
        renderData();
        showToast(
          `Exported ${exportedIds.length} items & Locked.`,
          '<span class="text-green-400">🔒</span>',
        );
      } catch (e) {
        db.run('ROLLBACK;');
        console.error('Failed to update export status:', e);
      } finally {
        if (updateStmt) updateStmt.free();
      }
    }
  }

  let blob;
  if (format === 'xero' || format === 'qb') {
    // Output without BOM for Xero/QuickBooks
    blob = new Blob([csvContent], { type: 'text/csv' });
  } else {
    // Output with BOM for Generic
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    blob = new Blob([bom, csvContent], { type: 'text/csv' });
  }

  const url = URL.createObjectURL(blob);

  const today = new Date();
  const dateSuffix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  // Change filename based on format
  const formatName = format === 'xero' ? 'Xero' : format === 'qb' ? 'QuickBooks' : 'Generic';

  const a = document.createElement('a');
  a.href = url;
  a.download = `GrindCash_${formatName}_${dateSuffix}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5242880) {
    await showAlert(window._t('alert.csv_too_large'));
    event.target.value = '';
    return;
  }

  const inputEl = event.target;
  const reader = new FileReader();
  reader.onload = function (e) {
    pendingCSVBuffer = e.target.result;
    showCSVModal();
    inputEl.value = '';
  };
  reader.onerror = async function () {
    await showAlert(window._t('alert.file_load_fail_memory'));
    inputEl.value = '';
  };
  reader.readAsArrayBuffer(file);
}

function showCSVModal() {
  window.isSystemModalOpen = true;
  const modal = document.getElementById('csv-mapping-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  setAppInert(true);

  loadCSVPresets();
  updateCSVPreview();
}

function updateCSVPreview() {
  if (!pendingCSVBuffer) return;
  let encoding = document.getElementById('csv-encoding').value;
  const previewBody = document.getElementById('csv-preview-body');

  try {
    let text;
    try {
      const decoder = new TextDecoder(encoding, { fatal: true });
      text = decoder.decode(pendingCSVBuffer);
    } catch (e) {
      if (encoding === 'utf-8') {
        try {
          const sjisDecoder = new TextDecoder('sjis', { fatal: true });
          text = sjisDecoder.decode(pendingCSVBuffer);
          encoding = 'sjis';
          document.getElementById('csv-encoding').value = 'sjis';
        } catch (sjisErr) {
          throw e;
        }
      } else {
        throw e;
      }
    }
    pendingCSVData = [];
    let currentLine = [];
    let currentCellStr = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (i === 0 && char.charCodeAt(0) === 0xfeff) continue;
      if (char === '"' && nextChar === '"') {
        currentCellStr += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentCellStr);
        currentCellStr = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentLine.push(currentCellStr);
        pendingCSVData.push(currentLine);
        currentLine = [];
        currentCellStr = '';
      } else {
        if (currentCellStr.length > 10000) throw new Error(window._t('alert.cell_too_long'));
        currentCellStr += char;
      }
    }
    if (currentLine.length > 0 || currentCellStr.length > 0) {
      currentLine.push(currentCellStr);
      pendingCSVData.push(currentLine);
    }
    if (
      pendingCSVData.length > 0 &&
      pendingCSVData[pendingCSVData.length - 1].length === 1 &&
      pendingCSVData[pendingCSVData.length - 1][0].trim() === ''
    ) {
      pendingCSVData.pop();
    }
    if (inQuotes) throw new Error(window._t('alert.unclosed_quote'));
  } catch (e) {
    pendingCSVData = [];
    document.getElementById('map-date').innerHTML =
      `<option value="-1">${window._t('label.do_not_select')}</option>`;
    if (document.getElementById('map-account'))
      document.getElementById('map-account').innerHTML =
        `<option value="-1">${window._t('label.do_not_select')}</option>`;
    document.getElementById('map-memo').innerHTML =
      `<option value="-1">${window._t('label.do_not_select')}</option>`;
    document.getElementById('map-amount').innerHTML =
      `<option value="-1">${window._t('label.do_not_select')}</option>`;
    const previewHead = document.getElementById('csv-preview-head');
    if (previewHead) previewHead.innerHTML = '';
    const errMsg = e.message || window._t('csv.decode_fail', encoding);
    previewBody.innerHTML = `<tr><td colspan="99" class="p-4 text-center text-red-500">${escapeHtml(errMsg)}</td></tr>`;
    return;
  }

  const mapDate = document.getElementById('map-date');
  const mapAccount = document.getElementById('map-account');
  const mapMemo = document.getElementById('map-memo');
  const mapAmount = document.getElementById('map-amount');

  const maxCols = Math.min(
    200,
    pendingCSVData.reduce((max, row) => Math.max(max, row.length), 0),
  );
  const skipRowsInput = document.getElementById('csv-skip-rows');
  const skipRows = skipRowsInput ? Math.max(0, parseInt(skipRowsInput.value, 10) || 0) : 0;
  const firstRow = pendingCSVData.length > skipRows ? pendingCSVData[skipRows] : [];

  const presetSelect = document.getElementById('csv-preset-select');
  const selectedPreset = presetSelect ? presetSelect.value : 'default';

  let defaultDate = '-1';
  let defaultAccount = '-1';
  let defaultMemo = '-1';
  let defaultAmount = '-1';
  let defaultSkip = 1;

  if (selectedPreset === 'default') {
    // Default: Run column auto-guess logic
    if (maxCols >= 1) {
      const dateIdx = firstRow.findIndex((c) => c && c.match(/日|date/i));
      defaultDate = dateIdx !== -1 ? dateIdx.toString() : '0';
    }
    if (mapAccount && maxCols >= 4) {
      const accIdx = firstRow.findIndex((c) => c && c.match(/科目|account|category/i));
      defaultAccount = accIdx !== -1 ? accIdx.toString() : '3';
    }
    if (maxCols >= 2) {
      const memoIdx = firstRow.findIndex(
        (c) => c && c.match(/摘要|メモ|内容|店名|利用先|memo|description/i),
      );
      defaultMemo = memoIdx !== -1 ? memoIdx.toString() : '1';
    }
    if (maxCols >= 3) {
      const amountIdx = firstRow.findIndex(
        (c) => c && c.match(/金額|支払|出金|入金|利用額|amount/i),
      );
      defaultAmount = amountIdx !== -1 ? amountIdx.toString() : '2';
    }
    document.getElementById('csv-preset-delete-btn').disabled = true;
  } else {
    // Apply preset values from DB
    const savedJson = getDbSetting('csv_presets', '[]');
    let presets = JSON.parse(savedJson);
    const preset = presets[parseInt(selectedPreset, 10)];
    if (preset) {
      defaultDate = preset.date;
      defaultAccount = preset.account;
      defaultMemo = preset.memo;
      defaultAmount = preset.amount;
      defaultSkip = preset.skipRows;
      document.getElementById('csv-encoding').value = preset.encoding || 'utf-8';
      document.getElementById('csv-preset-delete-btn').disabled = false;
    }
  }

  // Generate select box options
  let optionsHtml = `<option value="-1">${window._t('label.do_not_select')}</option>`;
  for (let i = 0; i < maxCols; i++) {
    const sample = firstRow[i] !== undefined ? firstRow[i].substring(0, 15) : '';
    optionsHtml += `<option value="${i}">${window._t('label.column_num', i + 1)} (${escapeHtml(sample)})</option>`;
  }

  mapDate.innerHTML = optionsHtml;
  if (mapAccount) mapAccount.innerHTML = optionsHtml;
  mapMemo.innerHTML = optionsHtml;
  mapAmount.innerHTML = optionsHtml;

  // Apply initial values to elements
  mapDate.value = defaultDate;
  if (mapAccount) mapAccount.value = defaultAccount;
  mapMemo.value = defaultMemo;
  mapAmount.value = defaultAmount;
  document.getElementById('csv-skip-rows').value = defaultSkip;

  renderCSVPreview();
}

function renderCSVPreview() {
  const previewHead = document.getElementById('csv-preview-head');
  const previewBody = document.getElementById('csv-preview-body');
  if (!previewHead || !previewBody || pendingCSVData.length === 0) return;

  const mapDate = parseInt(document.getElementById('map-date').value, 10);
  const mapAccount = document.getElementById('map-account')
    ? parseInt(document.getElementById('map-account').value, 10)
    : -1;
  const mapMemo = parseInt(document.getElementById('map-memo').value, 10);
  const mapAmount = parseInt(document.getElementById('map-amount').value, 10);

  const maxCols = Math.min(
    200,
    pendingCSVData.reduce((max, row) => Math.max(max, row.length), 0),
  );

  let thHtml = `<th class="px-3 py-2 w-8 text-center border-r border-gray-200">Row</th>`;
  for (let i = 0; i < maxCols; i++) {
    let label = '';
    let badgeClass = 'bg-slate-200 text-slate-500';
    if (i === mapDate) {
      label = 'Date';
      badgeClass = 'bg-blue-100 text-blue-700';
    } else if (i === mapAccount) {
      label = 'Account';
      badgeClass = 'bg-purple-100 text-purple-700';
    } else if (i === mapMemo) {
      label = 'Memo';
      badgeClass = 'bg-green-100 text-green-700';
    } else if (i === mapAmount) {
      label = 'Amount';
      badgeClass = 'bg-orange-100 text-orange-700';
    }

    if (label)
      thHtml += `<th class="px-3 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${label}</span></th>`;
    else
      thHtml += `<th class="px-3 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-medium ${badgeClass}">Col ${i + 1}</span></th>`;
  }
  previewHead.innerHTML = `<tr>${thHtml}</tr>`;

  previewBody.innerHTML = '';
  const skipRowsInput = document.getElementById('csv-skip-rows');
  const skipRows = skipRowsInput ? Math.max(0, parseInt(skipRowsInput.value, 10) || 0) : 0;
  const previewRows = pendingCSVData.slice(skipRows, skipRows + 4);
  previewRows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.className = rowIndex === 0 ? 'bg-slate-50' : 'bg-white';
    let tdHtml = `<td class="px-3 py-2 font-bold text-slate-400 border-r border-slate-200 w-8 text-center">${skipRows + rowIndex + 1}</td>`;
    for (let i = 0; i < maxCols; i++) {
      const val = row[i] !== undefined ? row[i] : '';
      const displayVal = val.length > 20 ? val.substring(0, 20) + '...' : val;
      let highlightClass = '';
      if (i === mapDate || i === mapAccount || i === mapMemo || i === mapAmount) {
        highlightClass = 'text-blue-950 font-medium bg-slate-50/50';
      }
      tdHtml += `<td class="px-3 py-2 truncate max-w-[150px] ${highlightClass}" title="${escapeHtml(val)}">${escapeHtml(displayVal)}</td>`;
    }
    tr.innerHTML = tdHtml;
    previewBody.appendChild(tr);
  });
}

function closeCSVModal() {
  const modal = document.getElementById('csv-mapping-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (!document.querySelector('.flex[role="dialog"]')) {
    window.isSystemModalOpen = false;
    document.body.style.overflow = '';
    setAppInert(false);
  }
  pendingCSVData = [];
  pendingCSVBuffer = null;
}

async function executeCSVImport() {
  const currentAppLang = (window.I18n && window.I18n.getLang()) || 'en';
  const isMonthFirst = currentAppLang === 'en' || currentAppLang === 'ja';
  const mapDate = parseInt(document.getElementById('map-date').value, 10);
  const mapAccount = parseInt(document.getElementById('map-account').value, 10);
  const mapMemo = parseInt(document.getElementById('map-memo').value, 10);
  const mapAmount = parseInt(document.getElementById('map-amount').value, 10);
  const skipRows = parseInt(document.getElementById('csv-skip-rows').value, 10) || 0;

  if (mapMemo === -1 || mapAmount === -1) {
    await showAlert(window._t('alert.memo_and_amount_required'));
    return;
  }

  const selectedCols = [mapDate, mapAccount, mapMemo, mapAmount].filter((val) => val !== -1);
  const uniqueCols = new Set(selectedCols);
  if (selectedCols.length !== uniqueCols.size) {
    await showAlert(window._t('alert.duplicate_columns_mapped'));
    return;
  }

  const dataToImport = [...pendingCSVData];
  closeCSVModal();

  let successCount = 0;
  let skipCount = 0;
  let suggestStmt = null;
  let insertStmt = null;

  db.run('BEGIN TRANSACTION;');
  try {
    const baseCurrency =
      typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
    db.run('INSERT INTO records (memo, amount, currency) VALUES (?, ?, ?)', [
      'CSV Import',
      null,
      baseCurrency,
    ]);
    const parentRes = db.exec('SELECT last_insert_rowid()');
    const parentId = parentRes[0].values[0][0];
    const startIndex = Math.max(0, skipRows);
    const MAX_IMPORT_ROWS = 3000;
    const rowsToProcess = dataToImport.length - startIndex;
    if (rowsToProcess > MAX_IMPORT_ROWS) {
      await showAlert(window._t('alert.too_many_import_rows', rowsToProcess, MAX_IMPORT_ROWS));
    }
    const endIndex = Math.min(dataToImport.length, startIndex + MAX_IMPORT_ROWS);

    try {
      suggestStmt = db.prepare(
        "SELECT account FROM records WHERE parent_id IS NOT NULL AND memo = ? AND account IS NOT NULL AND account != '' ORDER BY id DESC LIMIT 1",
      );
    } catch (e) {}

    try {
      insertStmt = db.prepare(
        'INSERT INTO records (parent_id, memo, amount, created_at, account, currency) VALUES (?, ?, ?, ?, ?, ?)',
      );
    } catch (e) {}

    for (let i = startIndex; i < endIndex; i++) {
      const cols = dataToImport[i];
      if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

      const dateStr = mapDate !== -1 && cols[mapDate] !== undefined ? cols[mapDate].trim() : '';
      let accountStr =
        mapAccount !== -1 && cols[mapAccount] !== undefined ? cols[mapAccount].trim() : '';
      if (accountStr.startsWith("'") && accountStr.length > 1) {
        const nextChar = accountStr.charAt(1);
        if (nextChar === '=' || nextChar === '@' || nextChar === '+' || nextChar === '-') {
          accountStr = accountStr.substring(1);
        }
      }
      let memo = mapMemo !== -1 && cols[mapMemo] !== undefined ? cols[mapMemo].trim() : '';
      if (memo.startsWith("'") && memo.length > 1) {
        const nextChar = memo.charAt(1);
        if (nextChar === '=' || nextChar === '@' || nextChar === '+' || nextChar === '-') {
          memo = memo.substring(1);
        }
      }
      // Fix: Force truncate amount field to max 50 chars before evaluation to prevent ReDoS (browser freeze)
      const rawAmount =
        mapAmount !== -1 && cols[mapAmount] !== undefined
          ? String(cols[mapAmount]).substring(0, 50)
          : '';

      let normalizedAmount = rawAmount
        .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
        .replace(/[ー−△]/g, '-');
      const trimmedAmount = normalizedAmount.trim();
      if (/^\([\d,.]+\)$/.test(trimmedAmount))
        normalizedAmount = '-' + trimmedAmount.replace(/[()]/g, '');
      let amountStr = normalizedAmount;
      amountStr = amountStr
        .replace(/(?:\d+[.,])+\d+/g, (match) => {
          const lastComma = match.lastIndexOf(',');
          const lastDot = match.lastIndexOf('.');
          if (lastComma > lastDot && lastDot !== -1)
            return match.replace(/\./g, '').replace(/,/g, '.');
          else if (lastDot > lastComma && lastComma !== -1) return match.replace(/,/g, '');
          else if (lastComma !== -1) {
            if (/,\d{3}$/.test(match)) return match.replace(/,/g, '');
            else return match.replace(/,/g, '.');
          } else {
            if (match.match(/\./g) && match.match(/\./g).length > 1)
              return match.replace(/\./g, '');
            return match;
          }
        })
        .replace(/[^\d.\-]/g, '');
      const isInvalidHyphen =
        (amountStr.match(/-/g) || []).length > 1 ||
        (amountStr.includes('-') && !amountStr.startsWith('-') && !amountStr.endsWith('-'));

      let amount = NaN;
      if (!isInvalidHyphen && amountStr !== '') {
        amount = Math.round((parseFloat(amountStr) + Number.EPSILON) * 100) / 100;
        if (amountStr.endsWith('-') && !amountStr.startsWith('-')) amount = -Math.abs(amount);
        if (amount > 10000000000000 || amount < -10000000000000) amount = NaN;
      }

      if (!isNaN(amount)) {
        let parsedDate = new Date(dateStr);
        const trimmedDate = dateStr ? dateStr.trim() : '';

        if (trimmedDate) {
          if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(trimmedDate)) {
            const parts = trimmedDate.split(/[\/\-]/);
            parsedDate = new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10),
            );
          } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmedDate)) {
            const parts = trimmedDate.split(/[\/\-]/);
            let m, d;
            let firstNum = parseInt(parts[0], 10);
            let secondNum = parseInt(parts[1], 10);

            if (firstNum > 12 && secondNum <= 12) {
              d = firstNum;
              m = secondNum;
            } else if (secondNum > 12 && firstNum <= 12) {
              m = firstNum;
              d = secondNum;
            } else {
              if (isMonthFirst) {
                m = firstNum;
                d = secondNum;
              } else {
                d = firstNum;
                m = secondNum;
              }
            }
            parsedDate = new Date(parseInt(parts[2], 10), m - 1, d);
          } else if (/^\d{1,2}[\/\-]\d{1,2}$/.test(trimmedDate)) {
            // "MM/DD" or "DD/MM" format handling with current year fallback
            const parts = trimmedDate.split(/[\/\-]/);
            const currentYear = new Date().getFullYear();
            let firstNum = parseInt(parts[0], 10);
            let secondNum = parseInt(parts[1], 10);
            let m, d;
            if (firstNum > 12 && secondNum <= 12) {
              d = firstNum;
              m = secondNum;
            } else if (secondNum > 12 && firstNum <= 12) {
              m = firstNum;
              d = secondNum;
            } else {
              if (isMonthFirst) {
                m = firstNum;
                d = secondNum;
              } else {
                d = firstNum;
                m = secondNum;
              }
            }
            parsedDate = new Date(currentYear, m - 1, d);
          }
        }

        let finalAccountStr = accountStr;
        if (!finalAccountStr && memo && suggestStmt) {
          try {
            suggestStmt.bind([memo]);
            if (suggestStmt.step()) finalAccountStr = suggestStmt.get()[0];
          } catch (e) {
          } finally {
            suggestStmt.reset();
          }
        }

        let finalDateStr = '';
        if (dateStr && !isNaN(parsedDate.getTime())) {
          const yyyy = parsedDate.getFullYear();
          const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(parsedDate.getDate()).padStart(2, '0');
          finalDateStr = `${yyyy}-${mm}-${dd} 00:00:00`;
        } else {
          if (dateStr.trim() !== '') {
            db.run('ROLLBACK;');
            const errMsg =
              window._t('error.csv_invalid_date', i + 1, dateStr) ||
              `Invalid date format at Row ${i + 1}: "${dateStr}".`;
            await showAlert(
              `${errMsg}\n` +
                (window._t('error.csv_abort') || 'Import aborted to prevent data corruption.'),
            );
            return;
          }
          const today = new Date();
          finalDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`;
        }

        if (insertStmt) {
          try {
            insertStmt.run([parentId, memo, amount, finalDateStr, finalAccountStr, baseCurrency]);
            successCount++;
          } catch (e) {}
        }
      } else {
        skipCount++;
      }
    }

    if (successCount === 0) db.run('DELETE FROM records WHERE id = ?', [parentId]);
    db.run('COMMIT;');
    setDirty(true);
    collapsedBlocks.add(parentId);
    if (document.getElementById('period-filter'))
      document.getElementById('period-filter').value = 'all';
    window.currentActiveMonths = null;
    setActiveQuickPeriodButton(null);
    let msg = window._t('toast.import_success', successCount) || `Imported ${successCount} items`;
    if (skipCount > 0) {
      msg +=
        window._t('toast.import_skip', skipCount) ||
        ` (${skipCount} skipped due to invalid amount)`;
    }
    showToast(msg, '<span class="text-green-400">✨</span>');
    triggerHaptic();
  } catch (err) {
    db.run('ROLLBACK;');
    await showAlert(window._t('error.import_fail'));
    console.error(err);
  } finally {
    if (suggestStmt) suggestStmt.free();
    if (insertStmt) insertStmt.free();
  }
  renderData();
}

function copyAIPrompt() {
  const promptText = window._t('prompt.ai_template');

  navigator.clipboard
    .writeText(promptText)
    .then(() => {
      showToast(window._t('toast.prompt_copied') || 'Copied AI prompt to clipboard', '📋');
    })
    .catch((err) => {
      console.error('Copy failed', err);
    });
}

async function copyAsMarkdown() {
  if (!db) return;
  const res = db.exec(
    'SELECT created_at, account, memo, amount, currency FROM records WHERE parent_id IS NOT NULL ORDER BY created_at DESC',
  );
  if (res.length === 0) {
    await showAlert(window._t('toast.no_copy_data') || 'No data to copy.');
    return;
  }
  let markdown = '## Exported Data (Markdown)\n\n';
  res[0].values.forEach((row) => {
    const date = row[0] ? row[0].split(' ')[0] : 'No date';
    const account = row[1] || 'Uncategorized';
    const memo = row[2] || 'Unnamed';
    const c = row[4] || 'USD';
    const amountStr = row[3] !== null ? formatCurrencyAmount(parseFloat(row[3]), c) : 'Unknown';
    markdown += `- **${date}** [${account}] ${memo} : **${amountStr}**\n`;
  });
  navigator.clipboard
    .writeText(markdown)
    .then(() => {
      showToast(window._t('toast.md_copied') || 'Copied data as Markdown', '📋');
    })
    .catch((err) => console.error('Copy failed', err));
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('install-button');
  if (installBtn) {
    const grandTotalContainer = document.getElementById('grand-total-label')?.parentElement;
    if (grandTotalContainer) grandTotalContainer.classList.add('shrink-0');
    installBtn.classList.remove('hidden');
    installBtn.onclick = async () => {
      installBtn.classList.add('hidden');
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
    };
  }
});
window.addEventListener('appinstalled', () => {
  const installBtn = document.getElementById('install-button');
  if (installBtn) installBtn.classList.add('hidden');
});

// iOS Fallback for PWA Installation
document.addEventListener('DOMContentLoaded', () => {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIos && !window.navigator.standalone) {
    const installBtn = document.getElementById('install-button');
    if (installBtn) {
      const grandTotalContainer = document.getElementById('grand-total-label')?.parentElement;
      if (grandTotalContainer) grandTotalContainer.classList.add('shrink-0');
      installBtn.classList.remove('hidden');
      // Override default text to show iOS specific message
      installBtn.removeAttribute('data-i18n');
      installBtn.textContent = window._t('prompt.ios_install_btn') || 'Add to Home Screen';
      installBtn.onclick = () => {
        showAlert(
          window._t('prompt.ios_install') ||
            "To install this app, tap the Share icon at the bottom of Safari and select 'Add to Home Screen'.",
        );
      };
    }
  }
});

let isCommandPaletteOpen = false;
let selectedCommandIndex = 0;
let prePaletteActiveElement = null;

function getCommandsList() {
  return [
    {
      id: 'split_stripe',
      icon: '<svg aria-hidden="true" class="w-5 h-5 text-indigo-500"><use href="#icon-cash"></use></svg>',
      title: window._t('cmd.split_stripe') || 'Split Stripe Fee (2.9% + $0.30) on Active Row',
      action: () => applyFeeSplit(0.029, 0.3, 'Stripe Fee'),
    },
    {
      id: 'split_paypal',
      icon: '<svg aria-hidden="true" class="w-5 h-5 text-blue-500"><use href="#icon-cash"></use></svg>',
      title: window._t('cmd.split_paypal') || 'Split PayPal Fee (3.49% + $0.49) on Active Row',
      action: () => applyFeeSplit(0.0349, 0.49, 'PayPal Fee'),
    },
    {
      id: 'privacy',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-eye-slash"></use></svg>',
      title: window._t('cmd.privacy_mode') || 'Toggle Privacy Mode (Hide Numbers)',
      action: () => {
        document.body.classList.toggle('privacy-mode');
        showToast(window._t('toast.privacy_toggled') || 'Privacy Mode Toggled', '👀');
      },
    },
    {
      id: 'save',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-save"></use></svg>',
      title: _t('cmd.save_title'),
      shortcut: isMac ? '⌘S' : 'Ctrl+S',
      action: () => saveGrindFile(),
    },
    {
      id: 'open',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-folder"></use></svg>',
      title: _t('cmd.open_title'),
      shortcut: isMac ? '⌘O' : 'Ctrl+O',
      action: () => loadGrindFile(),
    },
    {
      id: 'saveas',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-copy"></use></svg>',
      title: _t('cmd.saveas_title'),
      shortcut: isMac ? '⇧⌘S' : 'Ctrl+Shift+S',
      action: () => saveGrindFile(true),
    },
    {
      id: 'new',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-sparkles"></use></svg>',
      title: _t('cmd.new_title'),
      shortcut: isMac ? '⌥N' : 'Alt+N',
      action: () => document.getElementById('new-block-memo').focus(),
    },
    {
      id: 'import',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-import"></use></svg>',
      title: _t('cmd.import_title'),
      action: () => document.getElementById('csv-input').click(),
    },
    {
      id: 'export',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-export"></use></svg>',
      title: _t('cmd.export_title'),
      action: showExportModal,
    },
    {
      id: 'editdict',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-pencil"></use></svg>',
      title: _t('cmd.editdict_title'),
      action: () => showAccountDictEditor(),
    },
    {
      id: 'ai',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-bot"></use></svg>',
      title: _t('cmd.ai_title'),
      action: copyAIPrompt,
    },
    {
      id: 'markdown',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-copy"></use></svg>',
      title: _t('cmd.markdown_title'),
      action: copyAsMarkdown,
    },
    {
      id: 'expandall',
      icon: '<svg aria-hidden="true" class="w-5 h-5"><use href="#icon-chevron-down"></use></svg>',
      title: _t('cmd.expandall_title'),
      action: () => toggleAllBlocks(false),
    },
    {
      id: 'collapseall',
      icon: '<svg aria-hidden="true" class="w-5 h-5" style="transform: rotate(-90deg)"><use href="#icon-chevron-down"></use></svg>',
      title: _t('cmd.collapseall_title'),
      action: () => toggleAllBlocks(true),
    },
  ];
}

function toggleCommandPalette() {
  const palette = document.getElementById('cmd-palette');
  const input = document.getElementById('cmd-input');
  if (!isCommandPaletteOpen) prePaletteActiveElement = document.activeElement;
  isCommandPaletteOpen = !isCommandPaletteOpen;
  if (isCommandPaletteOpen) {
    palette.classList.remove('hidden');
    palette.classList.add('flex');
    document.body.style.overflow = 'hidden';
    setAppInert(true);
    input.value = '';
    selectedCommandIndex = 0;
    renderCommandList();
    if (window.innerWidth > 768) setTimeout(() => input.focus(), 50);
    else input.blur();
  } else {
    palette.classList.add('hidden');
    palette.classList.remove('flex');
    if (!document.querySelector('.flex[role="dialog"]')) {
      document.body.style.overflow = '';
      setAppInert(false);
    }
  }
}

function getDynamicCommands() {
  let dynamicCommands = [...getCommandsList()];
  if (db) {
    try {
      const res = db.exec('SELECT id, name FROM templates ORDER BY id DESC');
      if (res.length > 0) {
        res[0].values.forEach((row) => {
          dynamicCommands.push({
            id: `tpl_insert_${row[0]}`,
            icon: '<svg aria-hidden="true" class="w-5 h-5 text-amber-500"><use href="#icon-sparkles"></use></svg>',
            rawSearchText: window._t('cmd.insert', row[1]),
            title: window._t('cmd.insert', escapeHtml(row[1])),
            action: () => insertTemplate(row[0]),
          });
          dynamicCommands.push({
            id: `tpl_delete_${row[0]}`,
            icon: '<svg aria-hidden="true" class="w-5 h-5 text-red-400"><use href="#icon-trash"></use></svg>',
            rawSearchText: window._t('cmd.delete', row[1]),
            title: `<span class="text-slate-400">${window._t('cmd.delete', escapeHtml(row[1]))}</span>`,
            keepOpen: true,
            action: async () => {
              if (await requestConfirm(window._t('confirm.delete_tpl', row[1]))) {
                db.run('DELETE FROM templates WHERE id = ?', [row[0]]);
                setDirty(true);
                renderCommandList(document.getElementById('cmd-input').value);
              }
            },
          });
        });
      }
    } catch (e) {}
  }
  return dynamicCommands;
}

function getFilteredCommands(query) {
  const q = query.toLowerCase();
  const dynamicCommands = getDynamicCommands();
  let filtered = dynamicCommands.filter((c) => {
    const searchTarget = c.rawSearchText ? c.rawSearchText.toLowerCase() : c.title.toLowerCase();
    return searchTarget.includes(q) || c.id.includes(q);
  });

  if (q.match(/[0-9]/) && q.match(/[+\-*/×÷ー−]/)) {
    try {
      const calcResult = evaluateMath(q);
      if (calcResult !== null) {
        const baseCurrency =
          typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
        filtered.unshift({
          id: 'calculator',
          icon: '<svg aria-hidden="true" class="w-5 h-5 text-green-500"><use href="#icon-sparkles"></use></svg>',
          title: `= ${formatCurrencyAmount(calcResult, baseCurrency)} <span class="text-xs text-slate-400 ml-2">(Rate calculation / Enter to apply)</span>`,
          action: () => {
            const resultStr = calcResult.toString();
            navigator.clipboard.writeText(resultStr);
            if (prePaletteActiveElement) {
              if (
                prePaletteActiveElement.tagName === 'INPUT' &&
                (prePaletteActiveElement.getAttribute('data-field') === 'amount' ||
                  prePaletteActiveElement.id.includes('amount'))
              ) {
                prePaletteActiveElement.value = resultStr;
                prePaletteActiveElement.focus();
                setDirty(true);

                const id = prePaletteActiveElement.getAttribute('data-id');
                if (id) {
                  updateRecord(id, 'amount', resultStr, prePaletteActiveElement);
                } else {
                  prePaletteActiveElement.dispatchEvent(
                    new CustomEvent('input', { bubbles: true, detail: 'custom-paste' }),
                  );
                }

                showToast(`Applied ${resultStr}`, '<span class="text-green-400">✨</span>');
                return;
              }
            }
            showToast(
              `Copied ${formatCurrencyAmount(calcResult, baseCurrency)}`,
              '<span class="text-green-400">📋</span>',
            );
          },
        });
      }
    } catch (e) {}
  }
  return filtered;
}

function renderCommandList(query = '') {
  const list = document.getElementById('cmd-list');
  list.innerHTML = '';
  const filtered = getFilteredCommands(query);
  if (selectedCommandIndex >= filtered.length) selectedCommandIndex = 0;
  filtered.forEach((cmd, i) => {
    const div = document.createElement('div');
    const isSelected = i === selectedCommandIndex;
    div.className = `px-4 py-3 my-1 flex justify-between items-center rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'}`;
    let innerHtml = `<div class="flex items-center gap-3"><span class="text-xl">${cmd.icon}</span><span class="font-medium tracking-wide">${cmd.title}</span></div>`;
    if (cmd.shortcut)
      innerHtml += `<kbd class="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm ${isSelected ? 'text-blue-600 border-blue-600/20' : 'text-slate-400'}">${cmd.shortcut}</kbd>`;
    div.innerHTML = innerHtml;
    div.onclick = () => {
      if (!cmd.keepOpen) toggleCommandPalette();
      cmd.action();
    };
    list.appendChild(div);
    if (isSelected) setTimeout(() => div.scrollIntoView({ block: 'nearest' }), 0);
  });
}

document.addEventListener('keydown', (e) => {
  if (window.isSystemModalOpen) return;
  if (e.isComposing || e.keyCode === 229) return;
  const key = e.key?.toLowerCase();
  if (!key) return;
  if ((e.metaKey || e.ctrlKey) && (key === 'k' || key === 'ｋ' || e.code === 'KeyK')) {
    e.preventDefault();
    toggleCommandPalette();
    return;
  }
  if (
    (e.metaKey || e.ctrlKey) &&
    e.shiftKey &&
    (key === 'n' || key === 'ｎ' || e.code === 'KeyN')
  ) {
    e.preventDefault();
    document.getElementById('new-block-memo').focus();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && (key === 's' || key === 'ｓ' || e.code === 'KeyS')) {
    e.preventDefault();
    if (e.shiftKey) saveGrindFile(true);
    else saveGrindFile();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && (key === 'o' || key === 'ｏ' || e.code === 'KeyO')) {
    e.preventDefault();
    loadGrindFile();
    return;
  }

  if (e.key === 'Escape') {
    const dropOverlay = document.getElementById('drop-overlay');
    if (dropOverlay && !dropOverlay.classList.contains('hidden')) {
      dropOverlay.classList.add('hidden');
      dropOverlay.classList.remove('flex');
      dragCounter = 0;
      return;
    }
    if (isCommandPaletteOpen) {
      const input = document.getElementById('cmd-input');
      if (input.value !== '') {
        input.value = '';
        selectedCommandIndex = 0;
        renderCommandList('');
      } else toggleCommandPalette();
      return;
    }
    if (!document.getElementById('csv-mapping-modal').classList.contains('hidden')) {
      closeCSVModal();
      return;
    }
    if (!document.getElementById('export-modal').classList.contains('hidden')) {
      closeExportModal();
      return;
    }
    if (!document.getElementById('tag-modal').classList.contains('hidden')) {
      closeTagModal();
      return;
    }
    if (!document.getElementById('account-dict-editor-modal').classList.contains('hidden')) {
      closeAccountDictEditor();
      return;
    }
  }

  if (isCommandPaletteOpen) {
    const input = document.getElementById('cmd-input');
    const filtered = getFilteredCommands(input.value);
    if (
      filtered.length === 0 &&
      (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')
    )
      return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedCommandIndex = (selectedCommandIndex + 1) % filtered.length;
      renderCommandList(input.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedCommandIndex = (selectedCommandIndex - 1 + filtered.length) % filtered.length;
      renderCommandList(input.value);
    } else if (e.key === 'Enter' && !e.isComposing && filtered[selectedCommandIndex]) {
      e.preventDefault();
      const cmd = filtered[selectedCommandIndex];
      if (!cmd.keepOpen) toggleCommandPalette();
      cmd.action();
    }
  }
});

function applyTocFilter(query) {
  const q = query.toLowerCase();
  const tocItems = document.querySelectorAll('#toc-list a.toc-item');
  tocItems.forEach((item) => {
    if (item.textContent.toLowerCase().includes(q)) item.style.display = 'block';
    else item.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const tocFilter = document.getElementById('toc-filter');
  if (tocFilter) tocFilter.addEventListener('input', (e) => applyTocFilter(e.target.value));
});

if (typeof BroadcastChannel !== 'undefined') {
  try {
    const bc = new BroadcastChannel('grindcash_app_channel');
    let hasAlerted = false;
    bc.onmessage = async (e) => {
      if (e.data === 'ping') {
        if (!hasAlerted) bc.postMessage('pong');
      } else if (e.data === 'pong') {
        if (!hasAlerted) {
          hasAlerted = true;
          await showAlert(
            '⚠️ GrindCash is already open in another tab or window.\n\nTo prevent data conflicts, please do not edit in this tab.',
          );
          document.body.style.opacity = '0.5';
          document.body.style.pointerEvents = 'none';
        }
      }
    };
    bc.postMessage('ping');
  } catch (e) {
    console.warn('BroadcastChannel initialization failed:', e);
  }
}

document.getElementById('cmd-input')?.addEventListener('input', (e) => {
  selectedCommandIndex = 0;
  renderCommandList(e.target.value);
});

function togglePasswordVisibility(btn) {
  let container = btn ? btn.closest('form, .relative') : null;
  let pwInput, iconOpen, iconClosed;

  if (container) {
    pwInput = container.querySelector('input[type="password"], input[type="text"]');
    iconOpen = btn.querySelector('.icon-eye-open') || btn.querySelector('#icon-eye-open');
    iconClosed = btn.querySelector('.icon-eye-closed') || btn.querySelector('#icon-eye-closed');
  } else {
    pwInput = document.getElementById('file-password');
    iconOpen = document.getElementById('icon-eye-open');
    iconClosed = document.getElementById('icon-eye-closed');
  }

  if (!pwInput) return;

  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClosed) iconClosed.classList.add('hidden');
  } else {
    pwInput.type = 'password';
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClosed) iconClosed.classList.remove('hidden');
  }
}

// Define marketer dictionary
const marketerDictEn = [
  'Revenue - Affiliate',
  'Revenue - Services',
  'Revenue - Products',
  'Ad Spend - Facebook',
  'Ad Spend - Google',
  'Ad Spend - TikTok',
  'Software Subscriptions',
  'Hosting & Servers',
  'Freelancers',
  'Transaction Fees',
  'Bank Charges',
  'Travel & Meals',
  'Office Supplies',
  "Owner's Draw",
];

const marketerDictJa = [
  '売上 - アフィリエイト',
  '売上 - サービス',
  '売上 - プロダクト',
  '広告費 - Facebook',
  '広告費 - Google',
  '広告費 - TikTok',
  'ソフトウェア・SaaS代',
  'サーバー・ドメイン代',
  '外注費・フリーランス',
  '決済手数料',
  '支払手数料',
  '交通費・交際費',
  '消耗品費',
  '事業主貸',
];

const generalDictEn = [
  'Revenue',
  'Cash',
  'Accounts Receivable',
  'Accounts Payable',
  'Cost of Goods Sold',
  'Salaries & Wages',
  'Rent Expense',
  'Utilities',
  'Taxes',
  'Miscellaneous',
];

const generalDictJa = [
  '売上高',
  '現金',
  '売掛金',
  '買掛金',
  '仕入高',
  '給料手当',
  '地代家賃',
  '水道光熱費',
  '租税公課',
  '雑費',
];

const accountDictionaries = {
  custom: [],
  none: [],
  marketer: marketerDictEn,
  general: generalDictEn,
};

function changeAccountDict() {
  const select = document.getElementById('dict-select');
  const dictKey = select.value;
  setDbSetting('accountDict', dictKey);
  renderAccountSuggestions(dictKey);
}

function renderAccountSuggestions(dictKey) {
  const datalist = document.getElementById('account-suggestions');
  if (!datalist) return;
  datalist.innerHTML = '';
  const dict = accountDictionaries[dictKey] || [];
  const fragment = document.createDocumentFragment();
  dict.forEach((account) => {
    const option = document.createElement('option');
    option.value = account;
    fragment.appendChild(option);
  });
  datalist.appendChild(fragment);
}

function loadCustomDict() {
  const savedDict = getDbSetting('customAccountDict');
  const lang = (window.I18n && window.I18n.getLang()) || 'en';
  const defaultBase = lang === 'ja' ? marketerDictJa : marketerDictEn;
  if (savedDict) {
    try {
      const parsed = JSON.parse(savedDict);
      if (Array.isArray(parsed)) {
        customAccountDict = parsed
          .map((item) => {
            if (typeof item === 'string') {
              return { name: item, hidden: false };
            }
            if (item && typeof item === 'object' && item.name) {
              return { name: String(item.name), hidden: !!item.hidden };
            }
            return null;
          })
          .filter(Boolean);
      } else throw new Error('Invalid format');
    } catch (e) {
      customAccountDict = defaultBase.map((name) => ({ name, hidden: false }));
    }
  } else {
    customAccountDict = defaultBase.map((name) => ({ name, hidden: false }));
  }
  accountDictionaries.custom = customAccountDict.filter((i) => !i.hidden).map((i) => i.name);
}

function saveCustomDict() {
  setDbSetting('customAccountDict', JSON.stringify(customAccountDict));
  accountDictionaries.custom = customAccountDict.filter((i) => !i.hidden).map((i) => i.name);
  if (document.getElementById('dict-select').value === 'custom') renderAccountSuggestions('custom');
  return true;
}

let draggedItemIndex = null;
function showAccountDictEditor() {
  window.isSystemModalOpen = true;
  const modal = document.getElementById('account-dict-editor-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  setAppInert(true);
  renderCustomDictEditor();

  document.getElementById('add-custom-dict-form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('new-custom-account');
    const newAccountName = input.value.trim();
    if (newAccountName) {
      const existing = customAccountDict.find((item) => item.name === newAccountName);
      if (existing) existing.hidden = false;
      else customAccountDict.push({ name: newAccountName, hidden: false });
      renderCustomDictEditor();
    }
    input.value = '';
    input.focus();
  };
}

function closeAccountDictEditor() {
  const modal = document.getElementById('account-dict-editor-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (!document.querySelector('.flex[role="dialog"]')) {
    window.isSystemModalOpen = false;
    document.body.style.overflow = '';
    setAppInert(false);
  }
  loadCustomDict();
}

function saveCustomDictAndClose() {
  if (!saveCustomDict()) return;
  const modal = document.getElementById('account-dict-editor-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (!document.querySelector('.flex[role="dialog"]')) {
    window.isSystemModalOpen = false;
    document.body.style.overflow = '';
    setAppInert(false);
  }
}

function renderCustomDictEditor() {
  const list = document.getElementById('custom-dict-list');
  list.innerHTML = '';
  customAccountDict.forEach((item, index) => {
    const li = document.createElement('li');
    li.dataset.index = index;
    li.draggable = true;
    li.className = `flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md cursor-grab active:cursor-grabbing active:bg-slate-100 transition-opacity ${item.hidden ? 'opacity-50' : 'opacity-100'}`;
    const icon = item.hidden ? 'icon-eye-slash' : 'icon-eye';
    const textClass = item.hidden ? 'text-slate-400 line-through' : 'text-slate-700';
    li.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <svg aria-hidden="true" class="hidden sm:block w-5 h-5 text-slate-400 shrink-0"><use href="#icon-drag"></use></svg>
        <span class="font-medium ${textClass} truncate">${escapeHtml(item.name)}</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <div class="flex flex-col sm:hidden mr-2">
          <button type="button" data-stop-propagation="true" data-action="moveCustomDictItem" data-index="${index}" data-delta="-1" class="text-slate-400 hover:text-slate-700 px-1 py-0.5 leading-none ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" data-stop-propagation="true" data-action="moveCustomDictItem" data-index="${index}" data-delta="1" class="text-slate-400 hover:text-slate-700 px-1 py-0.5 leading-none ${index === customAccountDict.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === customAccountDict.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
        <button data-action="toggleCustomAccountHidden" data-index="${index}" class="text-slate-400 hover:text-slate-600 transition-colors shrink-0"><svg aria-hidden="true" class="w-5 h-5"><use href="#${icon}"></use></svg></button>
        <button data-action="deleteCustomDictItem" data-index="${index}" class="text-slate-300 hover:text-red-500 transition-colors shrink-0 ml-1"><svg aria-hidden="true" class="w-5 h-5"><use href="#icon-trash"></use></svg></button>
      </div>
    `;
    li.addEventListener('dragstart', (e) => {
      draggedItemIndex = index;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
      }
      setTimeout(() => e.target.classList.add('opacity-30'), 0);
    });
    li.addEventListener('dragover', (e) => e.preventDefault());
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      if (typeof draggedItemIndex !== 'number' || draggedItemIndex === null) return;
      if (draggedItemIndex === index) return;
      const [reorderedItem] = customAccountDict.splice(draggedItemIndex, 1);
      const insertIndex = index;
      customAccountDict.splice(insertIndex, 0, reorderedItem);
      draggedItemIndex = null;
      renderCustomDictEditor();
    });
    li.addEventListener('dragend', (e) => {
      e.target.classList.remove('opacity-30');
      draggedItemIndex = null;
    });
    list.appendChild(li);
  });
}

function moveCustomDictItem(index, direction) {
  if (index + direction < 0 || index + direction >= customAccountDict.length) return;
  const item = customAccountDict.splice(index, 1)[0];
  customAccountDict.splice(index + direction, 0, item);
  renderCustomDictEditor();
}

async function deleteCustomDictItem(index) {
  if (
    await requestConfirm(window._t('confirm.delete_custom_account', customAccountDict[index].name))
  ) {
    customAccountDict.splice(index, 1);
    renderCustomDictEditor();
  }
}

function toggleCustomAccountHidden(index) {
  if (customAccountDict[index]) {
    customAccountDict[index].hidden = !customAccountDict[index].hidden;
    renderCustomDictEditor();
  }
}

function setAllCustomAccountsHidden(isHidden) {
  customAccountDict.forEach((item) => {
    item.hidden = isHidden;
  });
  renderCustomDictEditor();
}
function formatMemoHtml(memo) {
  const escaped = escapeHtml(memo);
  if (!escaped.includes('#') && !escaped.includes('＃')) return escaped;
  // Fix: Use Unicode property escapes (\p{L}: letters, \p{N}: numbers)
  // to match worldwide languages flawlessly without noise (requires 'u' flag)
  return escaped.replace(
    /(#|＃)([\p{L}\p{N}_\-ー]+)/gu,
    '<span class="text-blue-500 bg-blue-50 px-1 rounded cursor-pointer hover:bg-blue-100 transition-colors" data-action="filterByTag" data-tag="$2">$1$2</span>',
  );
}

function filterByTag(tagName) {
  if (!db) return;
  let stmt;
  try {
    stmt = db.prepare(
      "SELECT created_at, memo, amount, currency FROM records WHERE parent_id IS NOT NULL AND memo LIKE ? ESCAPE '\\'",
    );
    // Fix: Add backslash itself to escape targets to prevent SQL crashes
    const escapedTag = tagName.replace(/([\\_%])/g, '\\$1');
    stmt.bind([`%#${escapedTag}%`]);

    let totals = Object.create(null); // 安全な辞書に置き換え
    let items = [];
    while (stmt.step()) {
      const [date, memo, amount, currency] = stmt.get();
      const safeAmount = parseFloat(amount || 0);
      const c = currency || 'USD';
      totals[c] = (totals[c] || 0) + safeAmount;
      items.push({ date, memo, amount: safeAmount, currency: c });
    }

    if (items.length > 0) {
      showTagModal('#' + tagName, { totals: totals, items: items });
    }
  } catch (e) {
    console.error('Filter failed:', e);
  } finally {
    if (stmt) stmt.free();
  }
}

function showTagModal(tag, data) {
  window.isSystemModalOpen = true;
  const modal = document.getElementById('tag-modal');
  document.getElementById('tag-modal-title').textContent = window._t(
    'label.tag_modal_title',
    tag,
    data.items.length,
  );

  const amountHtml = Object.entries(data.totals)
    .map(([cur, amt]) => formatCurrencyAmount(amt, cur))
    .join(' / ');
  document.getElementById('tag-modal-total').innerHTML = amountHtml;

  const tbody = document.getElementById('tag-modal-body');
  tbody.innerHTML = '';
  const sortedItems = [...data.items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  sortedItems.forEach((item) => {
    let dateDisp = window._t('label.no_date');
    if (item.date) {
      const parts = item.date.split(' ')[0].split('-');
      if (parts.length === 3) dateDisp = `${escapeHtml(parts[1])}/${escapeHtml(parts[2])}`;
    }
    const c = item.currency || 'USD';
    const amountStr = formatCurrencyAmount(item.amount, c);
    tbody.innerHTML += `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
        <td class="py-4 px-6 w-20 text-xs text-slate-400 font-mono">${dateDisp}</td>
        <td class="py-4 px-4 text-slate-700 font-medium">${escapeHtml(item.memo)}</td>
        <td class="py-4 px-6 text-right tabular-nums tracking-tight font-bold text-slate-600">${amountStr}</td>
      </tr>
    `;
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  setAppInert(true);
}

function closeTagModal() {
  const modal = document.getElementById('tag-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (!document.querySelector('.flex[role="dialog"]')) {
    window.isSystemModalOpen = false;
    document.body.style.overflow = '';
    setAppInert(false);
  }
}

async function initApp() {
  let savedLang = 'en';
  try {
    savedLang = localStorage.getItem('app_lang') || 'en';
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }
  await changeAppLanguage(savedLang);

  if (!window.isSecureContext) {
    await showAlert(window._t('alert.http_desc'));
    showToast(window._t('error.http_required'), '<span class="text-red-400">⚠️</span>');
  } else {
    await initSQLite();
  }
}

initApp();

function loadSettingsFromDb() {
  loadCustomDict();
  const savedDict = getDbSetting('accountDict', 'custom');
  const dictSelect = document.getElementById('dict-select');
  if (dictSelect) dictSelect.value = savedDict;
  renderAccountSuggestions(savedDict);
  updateFiscalYearButton();
}

window.addEventListener('beforeunload', (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

const dropOverlay = document.getElementById('drop-overlay');
let dragCounter = 0;
function hasFiles(e) {
  if (!e.dataTransfer || !e.dataTransfer.types) return false;
  for (let i = 0; i < e.dataTransfer.types.length; i++) {
    if (e.dataTransfer.types[i] === 'Files') return true;
  }
  return false;
}
document.addEventListener('dragover', (e) => {
  if (hasFiles(e)) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
});
document.addEventListener('drop', (e) => {
  if (hasFiles(e)) e.preventDefault();
});
document.addEventListener('dragenter', (e) => {
  if (!hasFiles(e)) return;
  if (window.isSystemModalOpen || isSaving) return;
  e.preventDefault();
  if (dragCounter === 0) {
    dropOverlay.classList.remove('hidden');
    dropOverlay.classList.add('flex');
  }
  dragCounter++;
});
document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    dropOverlay.classList.add('hidden');
    dropOverlay.classList.remove('flex');
  }
});
document.addEventListener('drop', async (e) => {
  if (!hasFiles(e)) return;
  if (window.isSystemModalOpen || isSaving) {
    e.preventDefault();
    if (isSaving)
      showToast(window._t('alert.drop_while_saving') || 'Cannot open file while saving.', '⚠️');
    return;
  }
  e.preventDefault();
  dragCounter = 0;
  dropOverlay.classList.add('hidden');
  dropOverlay.classList.remove('flex');

  let file = null;
  let handle = null;
  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];
      if (item.kind === 'file') {
        file = item.getAsFile();
        if (item.getAsFileSystemHandle) {
          try {
            handle = await item.getAsFileSystemHandle();
          } catch (err) {}
        }
        break;
      }
    }
  } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    file = e.dataTransfer.files[0];
  }

  if (!file) return;

  if (isCommandPaletteOpen) toggleCommandPalette();
  closeCSVModal();
  closeExportModal();
  closeTagModal();
  closeAccountDictEditor();

  const pwModal = document.getElementById('password-prompt-modal');
  if (pwModal && !pwModal.classList.contains('hidden')) {
    pwModal.classList.add('hidden');
    pwModal.classList.remove('flex');
  }

  const lowerName = file.name.toLowerCase();
  if (
    lowerName.endsWith('.cash') ||
    lowerName.endsWith('.grind') ||
    lowerName.endsWith('.sqlite')
  ) {
    if (isDirty) {
      if (!(await requestConfirm(window._t('confirm.discard_changes')))) return;
    }
    if (handle && handle.kind === 'file') await processFileHandle(handle);
    else {
      const dummyHandle = { getFile: async () => file, name: file.name, isDummy: true };
      await processFileHandle(dummyHandle, true);
    }
  } else if (lowerName.endsWith('.csv')) {
    const csvInput = document.getElementById('csv-input');
    if (csvInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      csvInput.files = dataTransfer.files;
      csvInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else await showAlert(window._t('alert.unsupported_file_type'));
});

const shortcutEl = document.getElementById('cmd-shortcut-key');
if (shortcutEl) shortcutEl.textContent = isMac ? '⌘K' : 'Ctrl+K';
const btnSaveTooltip = document.getElementById('btn-save');
if (btnSaveTooltip) btnSaveTooltip.title = `${window._t('btn.save')} (${isMac ? '⌘S' : 'Ctrl+S'})`;
const btnOpenTooltip = document.querySelector('button[data-action="loadGrindFile"]');
if (btnOpenTooltip) btnOpenTooltip.title = `${window._t('btn.open')} (${isMac ? '⌘O' : 'Ctrl+O'})`;

async function applyFeeSplit(rate, fixed, label) {
  if (!db) return;

  // Get focused element before opening palette
  const activeEl = prePaletteActiveElement;
  if (!activeEl) {
    await showAlert(
      window._t('error.split_no_focus') ||
        'Please click or focus on an Amount field first to apply the fee split.',
    );
    return;
  }

  let amountVal = '';
  let id = null;
  let isNewForm = false;
  let blockId = null;

  // Determine if input is new form or existing row
  if (activeEl.classList.contains('item-amount')) {
    amountVal = activeEl.value.trim();
    const form = activeEl.closest('form');
    if (form) {
      blockId = parseInt(form.id.replace('block-form-', ''), 10);
      isNewForm = true;
    }
  } else if (activeEl.getAttribute('data-field') === 'amount') {
    amountVal = activeEl.tagName === 'INPUT' ? activeEl.value.trim() : activeEl.innerText.trim();
    id = parseInt(activeEl.getAttribute('data-id'), 10);
  }

  if (!amountVal) {
    await showAlert(window._t('error.split_no_amount') || 'Please enter an amount first.');
    return;
  }

  // Strip commas and evaluate math expression
  const cleanVal = amountVal.replace(/[,$€£¥]/g, '').trim();
  const gross = evaluateMath(cleanVal);
  if (gross === null || isNaN(gross)) {
    await showAlert(window._t('error.split_invalid') || 'Invalid amount value.');
    return;
  }

  // Calculate fee
  let recordCurrency =
    typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
  if (db) {
    try {
      const targetId = id || blockId;
      const curStmt = db.prepare('SELECT currency FROM records WHERE id = ?');
      curStmt.bind([targetId]);
      if (curStmt.step()) recordCurrency = curStmt.get()[0] || recordCurrency;
      curStmt.free();
    } catch (e) {}
  }

  let fee = gross * rate + fixed;

  // Fix: Unify logic using the existing roundAmount helper (DRY principle)
  fee = roundAmount(fee, recordCurrency);
  const netFee = -Math.abs(fee);

  if (isNewForm && blockId) {
    // Pattern A: Execute in new addition form
    const form = activeEl.closest('form');
    const memoInput = form.querySelector('.item-memo');
    const accountInput = form.querySelector('.item-account');
    const dateInput = form.querySelector('.item-date');

    const grossMemo = memoInput.value.trim() || 'Sales';
    const grossAccount = accountInput.value.trim() || 'Revenue';
    const dateVal = dateInput.value;

    // 1. Insert Gross
    await insertRecord(
      blockId,
      grossMemo,
      gross.toString(),
      dateVal,
      grossAccount,
      '',
      recordCurrency,
    );
    // 2. Insert Fee
    await insertRecord(
      blockId,
      `${grossMemo} (${label})`,
      netFee.toString(),
      dateVal,
      'Transaction Fees',
      '',
      recordCurrency,
    );

    // Clean up form
    memoInput.value = '';
    activeEl.value = '';

    setDirty(true);
    renderData();
    let msg = (window._t('toast.split_added') || `Added Gross ({0}) & {1} ({2})`)
      .replace('{0}', `${formatCurrencyAmount(gross, recordCurrency)}`)
      .replace('{1}', label)
      .replace('{2}', `${formatCurrencyAmount(netFee, recordCurrency)}`);
    showToast(msg, '✨');
  } else if (id) {
    // Pattern B: Execute on existing row
    let isExported = 0;
    let stmtCheck;
    try {
      stmtCheck = db.prepare('SELECT is_exported FROM records WHERE id = ?');
      stmtCheck.bind([id]);
      if (stmtCheck.step()) isExported = stmtCheck.get()[0];
    } finally {
      if (stmtCheck) stmtCheck.free();
    }

    if (isExported === 1) {
      // Fix: Multilingual support
      await showAlert(
        window._t('error.split_locked') ||
          'Cannot apply split fees on a record that has already been exported and locked.',
      );
      return;
    }

    let parentId = null;
    let createdAt = null;
    let memo = '';
    let stmt;
    try {
      stmt = db.prepare('SELECT parent_id, created_at, memo FROM records WHERE id = ?');
      stmt.bind([id]);
      if (stmt.step()) {
        const row = stmt.get();
        parentId = row[0];
        createdAt = row[1];
        memo = row[2] || '';
      }
    } finally {
      if (stmt) stmt.free();
    }

    if (parentId) {
      // 1. Update original amount to Gross
      updateRecord(id, 'amount', gross.toString(), activeEl);
      // 2. Insert new fee row
      const dateStr = createdAt ? createdAt.split(' ')[0] : null;
      await insertRecord(
        parentId,
        `${memo} (${label})`,
        netFee.toString(),
        dateStr,
        'Transaction Fees',
        '',
        recordCurrency,
      );

      setDirty(true);
      renderData();
      let msg = (window._t('toast.split_applied') || `Split applied: Gross {0} & Fee {1}`)
        .replace('{0}', `${formatCurrencyAmount(gross, baseCurrency)}`)
        .replace('{1}', `${formatCurrencyAmount(netFee, baseCurrency)}`);
      showToast(msg, '✨');
    }
  }
}

// Preset management functions

// 1. Load saved presets into select box
function loadCSVPresets() {
  const select = document.getElementById('csv-preset-select');
  if (!select) return;

  select.innerHTML = '';

  // Add default auto-detect option
  const defaultOpt = document.createElement('option');
  defaultOpt.value = 'default';
  defaultOpt.textContent = window._t('csv.preset_default') || '-- Auto-detect --';
  select.appendChild(defaultOpt);

  const savedJson = getDbSetting('csv_presets', '[]');
  let presets = [];
  try {
    presets = JSON.parse(savedJson);
  } catch (e) {
    console.error('Failed to parse presets:', e);
  }

  if (Array.isArray(presets)) {
    presets.forEach((preset, idx) => {
      const opt = document.createElement('option');
      opt.value = idx.toString();
      opt.textContent = preset.name;
      select.appendChild(opt);
    });
  }
  document.getElementById('csv-preset-delete-btn').disabled = true;
}

// 2. Handle select change
function handlePresetChange() {
  updateCSVPreview();
}

// 3. Save current mapping settings
async function saveCurrentPreset() {
  const name = prompt(window._t('prompt.preset_name'));
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) {
    await showAlert(window._t('alert.preset_name_required'));
    return;
  }

  const mapDate = document.getElementById('map-date').value;
  const mapAccount = document.getElementById('map-account')
    ? document.getElementById('map-account').value
    : '-1';
  const mapMemo = document.getElementById('map-memo').value;
  const mapAmount = document.getElementById('map-amount').value;
  const skipRows = parseInt(document.getElementById('csv-skip-rows').value, 10) || 0;
  const encoding = document.getElementById('csv-encoding').value;

  const savedJson = getDbSetting('csv_presets', '[]');
  let presets = [];
  try {
    presets = JSON.parse(savedJson);
  } catch (e) {}

  const newPreset = {
    name: trimmed,
    date: mapDate,
    account: mapAccount,
    memo: mapMemo,
    amount: mapAmount,
    skipRows: skipRows,
    encoding: encoding,
  };

  // Overwrite if same name, else add new
  const existingIdx = presets.findIndex((p) => p.name === trimmed);
  if (existingIdx !== -1) {
    presets[existingIdx] = newPreset;
  } else {
    presets.push(newPreset);
  }

  setDbSetting('csv_presets', JSON.stringify(presets));
  showToast(window._t('toast.preset_saved', trimmed), '💾');

  loadCSVPresets();

  // Select saved preset
  const select = document.getElementById('csv-preset-select');
  const newIdx = presets.findIndex((p) => p.name === trimmed);
  if (select && newIdx !== -1) {
    select.value = newIdx.toString();
    document.getElementById('csv-preset-delete-btn').disabled = false;
  }
}

// 4. Delete current preset
async function deleteCurrentPreset() {
  const select = document.getElementById('csv-preset-select');
  const val = select.value;
  if (val === 'default') return;

  const savedJson = getDbSetting('csv_presets', '[]');
  let presets = [];
  try {
    presets = JSON.parse(savedJson);
  } catch (e) {}

  const idx = parseInt(val, 10);
  const target = presets[idx];
  if (!target) return;

  if (!(await requestConfirm(window._t('confirm.delete_preset', target.name)))) return;

  presets.splice(idx, 1);
  setDbSetting('csv_presets', JSON.stringify(presets));
  showToast(window._t('toast.preset_deleted', target.name), '🧹');

  loadCSVPresets();
  updateCSVPreview();
}

function getTaxOptionsHtml(selectedRate) {
  const rates = [
    { value: '', label: window._t('tax.none') || 'None' },
    { value: '10%', label: window._t('tax.standard_10') || '10%' },
    { value: '8%', label: window._t('tax.reduced_8') || '8%' },
    { value: '20%', label: window._t('tax.standard_20') || '20%' },
    { value: '5%', label: window._t('tax.vat_5') || '5%' },
    { value: 'Exempt', label: window._t('tax.exempt') || 'Exempt' },
  ];
  return rates
    .map(
      (r) =>
        `<option value="${r.value}" ${r.value === selectedRate ? 'selected' : ''}>${r.label}</option>`,
    )
    .join('');
}

function getCurrencyOptionsHtml(selected) {
  const currencies = [
    { value: 'USD', symbol: '$', flag: '🇺🇸' },
    { value: 'EUR', symbol: '€', flag: '🇪🇺' },
    { value: 'GBP', symbol: '£', flag: '🇬🇧' },
    { value: 'JPY', symbol: '¥', flag: '🇯🇵' },
    { value: 'CAD', symbol: 'CA$', flag: '🇨🇦' },
    { value: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  ];
  return currencies
    .map(
      (c) =>
        `<option value="${c.value}" ${c.value === selected ? 'selected' : ''}>${c.flag} ${c.value}</option>`,
    )
    .join('');
}

// ==========================================
// Global Event Delegation (CSP Hardening)
// ==========================================
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'toast-reload-btn') {
    e.preventDefault();
    location.reload();
  }
  const target = e.target.closest('[data-action]');

  if (target) {
    const stopProp = e.target.closest('[data-stop-propagation="true"]');
    if (stopProp && !stopProp.contains(target)) {
      return;
    }
    const action = target.getAttribute('data-action');

    // UI toggles & modals
    if (action === 'togglePasswordVisibility') togglePasswordVisibility(target);
    else if (action === 'loadGrindFile') loadGrindFile();
    else if (action === 'saveGrindFile') saveGrindFile();
    else if (action === 'toggleCommandPalette') toggleCommandPalette();
    else if (action === 'setPeriodFilter')
      setPeriodFilter(target.getAttribute('data-period'), target);
    else if (action === 'setMultiMonthFilter') {
      const months = target.getAttribute('data-months').split(',').map(Number);
      setMultiMonthFilter(months, target);
    } else if (action === 'setCalendarYearFilter') setCalendarYearFilter(target);
    else if (action === 'setPreviousFiscalYearFilter') setPreviousFiscalYearFilter(target);
    else if (action === 'setFiscalYearFilter') setFiscalYearFilter(target);
    else if (action === 'changeFiscalMonth') changeFiscalMonth();
    else if (action === 'toggleAllBlocks')
      toggleAllBlocks(target.getAttribute('data-collapse') === 'true');
    else if (action === 'reload') location.reload();
    else if (action === 'closeCSVModal') closeCSVModal();
    else if (action === 'saveCurrentPreset') saveCurrentPreset();
    else if (action === 'deleteCurrentPreset') deleteCurrentPreset();
    else if (action === 'executeCSVImport') executeCSVImport();
    else if (action === 'closeExportModal') closeExportModal();
    else if (action === 'executeExport') executeExport();
    else if (action === 'closeTagModal') closeTagModal();
    else if (action === 'closeAccountDictEditor') closeAccountDictEditor();
    else if (action === 'triggerCsvInputClick') document.getElementById('csv-input').click();
    else if (action === 'setAllCustomAccountsHidden')
      setAllCustomAccountsHidden(target.getAttribute('data-hidden') === 'true');
    else if (action === 'saveCustomDictAndClose') saveCustomDictAndClose();
    else if (action === 'focusCmdInput') document.getElementById('cmd-input').focus();
    else if (action === 'closeDropOverlay') {
      const overlay = document.getElementById('drop-overlay');
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      dragCounter = 0;
    }

    // Dynamic Record/Block actions
    else if (action === 'filterByTag') {
      if (target.closest('[contenteditable="true"]')) {
        if (!e.metaKey && !e.ctrlKey) {
          return;
        }
      }
      filterByTag(target.getAttribute('data-tag'));
    } else if (action === 'focusNewBlockMemo') {
      const el = document.getElementById('new-block-memo');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (action === 'createCollectionRecord')
      createCollectionRecord(target.getAttribute('data-id'));
    else if (action === 'duplicateRecord') duplicateRecord(target.getAttribute('data-id'));
    else if (action === 'deleteRecord') deleteRecord(target.getAttribute('data-id'));
    else if (action === 'saveTemplate') saveTemplate(target.getAttribute('data-id'));
    else if (action === 'toggleBlock') toggleBlock(target.getAttribute('data-id'));
    else if (action === 'sortBlockByDate') sortBlockByDate(target.getAttribute('data-id'));
    else if (action === 'adjustDate')
      adjustDate(target, parseInt(target.getAttribute('data-delta'), 10));
    else if (action === 'moveCustomDictItem')
      moveCustomDictItem(
        parseInt(target.getAttribute('data-index'), 10),
        parseInt(target.getAttribute('data-delta'), 10),
      );
    else if (action === 'toggleCustomAccountHidden')
      toggleCustomAccountHidden(parseInt(target.getAttribute('data-index'), 10));
    else if (action === 'deleteCustomDictItem')
      deleteCustomDictItem(parseInt(target.getAttribute('data-index'), 10));
  }
});

document.addEventListener('change', (e) => {
  const target = e.target.closest('[data-action], [data-action-change]');
  if (target) {
    const action = target.getAttribute('data-action') || target.getAttribute('data-action-change');

    if (action === 'changeAppLanguage') changeAppLanguage(target.value);
    else if (action === 'changeBaseCurrency') {
      setDbSetting('baseCurrency', target.value);
      updateCurrencySymbolAndFormatter();
      renderData();
    } else if (action === 'changeAccountDict') changeAccountDict();
    else if (action === 'importCSV') importCSV(e);
    else if (action === 'handleDropdownChange') handleDropdownChange();
    else if (action === 'handlePresetChange') handlePresetChange();
    else if (action === 'renderCSVPreview') renderCSVPreview();
    else if (action === 'updateCSVPreview') updateCSVPreview();
    else if (action === 'updateRecord') {
      updateRecord(
        target.getAttribute('data-id'),
        target.getAttribute('data-field'),
        target.value,
        target,
      );
    }
  }
});

document.addEventListener('submit', (e) => {
  const target = e.target.closest('[data-action], [data-action-submit]');
  if (target) {
    const action = target.getAttribute('data-action') || target.getAttribute('data-action-submit');

    if (action === 'submitSaveGrindFile') {
      e.preventDefault();
      saveGrindFile();
    } else if (action === 'submitAddBlock') {
      e.preventDefault();
      addBlock();
    } else if (action === 'preventDefaultSubmit') {
      e.preventDefault();
    } else if (action === 'addItem') {
      e.preventDefault();
      const blockId = parseInt(target.getAttribute('data-id'), 10);
      const memo = target.querySelector('.item-memo').value;
      const amount = target.querySelector('.item-amount').value;
      const date = target.querySelector('.item-date').value;
      const account = target.querySelector('.item-account').value;

      let blockCurrency =
        typeof getDbSetting === 'function' ? getDbSetting('baseCurrency', 'USD') : 'USD';
      if (db) {
        try {
          const stmt = db.prepare('SELECT currency FROM records WHERE id = ?');
          stmt.bind([blockId]);
          if (stmt.step()) {
            blockCurrency = stmt.get()[0] || blockCurrency;
          }
          stmt.free();
        } catch (e) {}
      }
      addItem(blockId, memo, amount, date, account, '', blockCurrency);
    }
  }
});

document.addEventListener('input', (e) => {
  if (!e.isTrusted && e.detail !== 'custom-paste') return;
  const target = e.target.closest('[data-action], [data-action-input]');
  if (target) {
    const action = target.getAttribute('data-action') || target.getAttribute('data-action-input');

    if (action === 'setDirty') setDirty(true);
    else if (action === 'renderCSVPreview') renderCSVPreview();
    else if (action === 'setDirtyContentEditable') {
      if (target.innerText.trim() === '') target.innerHTML = '';
      setDirty(true);
    } else if (action === 'setDirtyAndCheckFutureDate') {
      setDirty(true);
      checkFutureDate(target);
    }
  }
});

document.addEventListener('keydown', (e) => {
  const target = e.target.closest('[data-action], [data-action-keydown]');
  if (target) {
    const action = target.getAttribute('data-action') || target.getAttribute('data-action-keydown');

    if (action === 'keydownAddBlock') {
      if (e.key === 'Enter' && e.isComposing) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        addBlock();
      }
    } else if (action === 'blurOnEnter') {
      if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        target.blur();
      }
    } else if (action === 'focusNextMemo') {
      if (e.key === 'Enter') {
        if (e.isComposing) {
          e.preventDefault();
          return false;
        }
        e.preventDefault();
        const form = target.closest('form');
        if (form) form.querySelector('.item-memo').focus();
      }
    } else if (action === 'focusNextAmount') {
      if (e.key === 'Enter') {
        if (e.isComposing) {
          e.preventDefault();
          return false;
        }
        e.preventDefault();
        const form = target.closest('form');
        if (form) form.querySelector('.item-amount').focus();
      }
    } else if (action === 'submitOnTab') {
      if (e.key === 'Enter' && e.isComposing) {
        e.preventDefault();
        return false;
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const form = target.closest('form');
        if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
      }
    }
  }
});

document.addEventListener('focusout', (e) => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.scrollTo(document.documentElement.scrollLeft, document.documentElement.scrollTop);
  }
  const target = e.target.closest('[data-action-blur]');
  if (target) {
    const action = target.getAttribute('data-action-blur');
    if (action === 'updateRecord') {
      let val = target.value;
      if (target.hasAttribute('contenteditable')) {
        const cleanValue = target.innerText.trim();
        if (cleanValue === '') {
          target.innerHTML = '';
          val = '';
        } else {
          val = target.innerText;
        }
      }
      updateRecord(target.getAttribute('data-id'), target.getAttribute('data-field'), val, target);
    } else if (action === 'autoSuggestAccount') {
      autoSuggestAccount(target);
    }
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target.hasAttribute('contenteditable') && e.target.innerHTML.includes('<span')) {
    e.target.innerText = e.target.innerText;
  }
  if (
    e.target.classList.contains('item-amount') ||
    e.target.getAttribute('data-field') === 'amount'
  ) {
    if (e.target.value && e.target.value.includes(',')) {
      e.target.value = e.target.value.replace(/,/g, '');
    }
  }
  const target = e.target.closest('[data-action-focus]');
  if (target) {
    const action = target.getAttribute('data-action-focus');
    if (action === 'select') {
      target.select();
    } else if (action === 'scrollIntoView') {
      if (window.innerWidth < 640) {
        setTimeout(() => {
          const form = target.closest('form');
          if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }
});

document.addEventListener('paste', (e) => {
  const target = e.target.closest('[data-action-paste]');
  if (target) {
    const action = target.getAttribute('data-action-paste');
    if (action === 'handlePlainTextPaste') {
      handlePlainTextPaste(e);
    }
  }
});

// ==========================================
// Service Worker Registration
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(
      (registration) => console.log('ServiceWorker registered'),
      (err) => console.log('ServiceWorker registration failed: ', err),
    );

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        if (typeof showToast === 'function') {
          const message =
            window._t && window._t('toast.app_updated_reload') !== 'toast.app_updated_reload'
              ? window._t('toast.app_updated_reload')
              : 'App updated. <a href="#" id="toast-reload-btn" class="ml-2 font-bold underline cursor-pointer">Reload to apply</a>';
          showToast(message, '<span class="text-blue-400">✨</span>', {
            duration: Infinity,
            rawHtml: true,
          });
        }
      }
    });
  });
}

// ==========================================
// Custom Alert / Confirm Modals
// ==========================================
function showAlert(message, title = window._t('alert.title') || 'Alert') {
  return new Promise((resolve) => {
    window.isSystemModalOpen = true;
    document.body.style.overflow = 'hidden';

    const modal = document.getElementById('custom-alert-modal');
    document.getElementById('custom-alert-title').textContent = title;
    const escapedMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');
    document.getElementById('custom-alert-message').innerHTML = escapedMessage;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const okBtn = document.getElementById('custom-alert-ok-btn');

    const handleOk = () => {
      cleanup();
      resolve();
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleOk();
      }
    };

    const cleanup = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (!document.querySelector('.flex[role="dialog"]')) {
        window.isSystemModalOpen = false;
        document.body.style.overflow = '';
      }
      okBtn.removeEventListener('click', handleOk);
      document.removeEventListener('keydown', handleKeydown, true);
    };

    okBtn.addEventListener('click', handleOk);
    document.addEventListener('keydown', handleKeydown, true);
    setTimeout(() => okBtn.focus(), 10);
  });
}

function requestConfirm(message, title = window._t('confirm.title') || 'Confirm') {
  return new Promise((resolve) => {
    window.isSystemModalOpen = true;
    document.body.style.overflow = 'hidden';

    const modal = document.getElementById('custom-confirm-modal');
    document.getElementById('custom-confirm-title').textContent = title;
    const escapedMessage = escapeHtml(String(message)).replace(/\n/g, '<br>');
    document.getElementById('custom-confirm-message').innerHTML = escapedMessage;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const okBtn = document.getElementById('custom-confirm-ok-btn');
    const cancelBtn = document.getElementById('custom-confirm-cancel-btn');

    const handleOk = () => {
      cleanup();
      resolve(true);
    };
    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleOk();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    };

    const cleanup = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (!document.querySelector('.flex[role="dialog"]')) {
        window.isSystemModalOpen = false;
        document.body.style.overflow = '';
      }
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      document.removeEventListener('keydown', handleKeydown, true);
    };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    document.addEventListener('keydown', handleKeydown, true);
    setTimeout(() => cancelBtn.focus(), 10);
  });
}

// Handle events in JS to prevent CSP violations
document.addEventListener('mousedown', (e) => {
  const target = e.target.closest('[data-action]');
  if (target) {
    const action = target.getAttribute('data-action');
    // Prevent default to avoid focus loss
    if (action === 'toggleCommandPalette' || action === 'toggleAllBlocks') {
      e.preventDefault();
    }
  }
});

// The visibilitychange autosave has been removed because async Web Worker encryption
// gets killed by the browser before completion, leading to data loss.
// We rely on the 10-second draftTimer instead.
