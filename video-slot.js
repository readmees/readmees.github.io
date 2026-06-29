// @ds-adherence-ignore -- companion to image-slot.js (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <video-slot> — user-fillable VIDEO placeholder. Mirrors <image-slot>:
 * drag a video file onto it (or click to browse) and it plays muted/looped.
 * The dropped clip persists across reloads via a .video-slots.state.json
 * sidecar (read-via-fetch / write-via-window.omelette.writeFile), same
 * pattern as image-slot. Outside the omelette runtime the slot is read-only.
 *
 * Because a video is stored inline as a data URL in the sidecar, large files
 * are impractical — drops over MAX_BYTES are rejected with a hint to
 * compress/trim. Aim for short, web-optimized MP4/WebM clips.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED to survive reload; must be unique.
 *   placeholder  Empty-state caption.            (default 'Drop a video')
 *   fit          object-fit: cover | contain.    (default 'cover')
 *   controls     Present => show native controls. (default: no controls)
 *   src          Optional initial/fallback video URL.
 *
 * Size/shape come from ordinary CSS on the element.
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.video-slots.state.json';
  // Inline data-URL storage — keep clips small. ~24MB raw ≈ ~32MB base64.
  const MAX_BYTES = 24 * 1024 * 1024;
  const ACCEPT = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

  const subs = new Set();
  let slots = {};
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;

  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j === 'object') {
          const merged = Object.assign({}, j, slots);
          for (const id of tombstones) delete merged[id];
          slots = merged;
        }
        tombstones.clear();
      })
      .catch(() => {})
      .then(() => { loaded = true; subs.forEach((fn) => fn()); });
    return loadP;
  }

  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) { saveDirty = true; return; }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots)))
      .catch(() => {})
      .then(() => { saving = false; if (saveDirty) { saveDirty = false; save(); } });
  }

  function setSlot(id, val) {
    if (!id) return;
    if (val) { slots[id] = val; tombstones.delete(id); }
    else { delete slots[id]; if (!loaded) tombstones.add(id); }
    subs.forEach((fn) => fn());
    if (loaded) save(); else load().then(save);
  }

  function readDataUrl(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr.error || new Error('read failed'));
      fr.readAsDataURL(file);
    });
  }

  const stylesheet =
    ':host{display:inline-block;position:relative;vertical-align:top;' +
    '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(255,255,255,.7);width:240px;height:160px}' +
    '.frame{position:absolute;inset:0;overflow:hidden;background:#0f0f12}' +
    '.frame video{position:absolute;inset:0;width:100%;height:100%;display:none;background:#0f0f12}' +
    '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' +
    '  cursor:pointer;user-select:none}' +
    '.empty svg{opacity:.5}' +
    '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' +
    '.empty .sub{font-size:11px;opacity:.8}' +
    '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(255,255,255,.35)}' +
    '.empty:hover .sub u{color:#fff;text-decoration-color:currentColor}' +
    '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(255,255,255,.28);}' +
    ':host([data-over]) .ring{border-color:#c96442}' +
    ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;background:rgba(201,100,66,.12)}' +
    ':host([data-filled]) .ring{display:none}' +
    '.ctl{position:absolute;top:8px;right:8px;display:flex;gap:6px;opacity:0;pointer-events:none;' +
    '  transition:opacity .12s;z-index:3}' +
    ':host([data-filled][data-editable]:hover) .ctl{opacity:1;pointer-events:auto}' +
    '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' +
    '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' +
    '  backdrop-filter:blur(6px)}' +
    '.ctl button:hover{background:rgba(0,0,0,.85)}' +
    '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#fff;font-size:11px;' +
    '  background:rgba(179,38,30,.92);padding:4px 6px;border-radius:5px;pointer-events:none}';

  const icon =
    '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="2" y="4" width="14" height="16" rx="2"/>' +
    '<path d="m16 9 6-3v12l-6-3"/></svg>';

  class VideoSlot extends HTMLElement {
    static get observedAttributes() {
      return ['placeholder', 'fit', 'controls', 'src', 'id'];
    }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>' + stylesheet + '</style>' +
        '<div class="frame" part="frame">' +
        '  <video part="video" muted loop autoplay playsinline></video>' +
        '  <div class="empty" part="empty">' + icon +
        '    <div class="cap"></div>' +
        '    <div class="sub">or <u>browse files</u></div></div>' +
        '  <div class="ring" part="ring"></div>' +
        '</div>' +
        '<div class="ctl"><button data-act="replace">Replace</button>' +
        '  <button data-act="clear">Remove</button></div>' +
        '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._video = root.querySelector('video');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._input = root.querySelector('input');
      this._err = null;
      this._depth = 0;
      this._gen = 0;
      this._local = null;
      this._subFn = () => this._render();

      this._empty.addEventListener('click', () => { if (this.hasAttribute('data-no-browse')) return; this._input.click(); });
      root.addEventListener('click', (e) => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') this._input.click();
        if (act === 'clear') {
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null); else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
    }

    connectedCallback() {
      if (!this.id && !VideoSlot._warned) {
        VideoSlot._warned = true;
        console.warn('<video-slot> without an id will not persist its dropped video.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      load();
      this._render();
    }

    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
    }

    attributeChangedCallback() { if (this.shadowRoot) this._render(); }

    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        if (--this._depth <= 0) { this._depth = 0; this.removeAttribute('data-over'); }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }

    async _ingest(file) {
      this._setError(null);
      const okType = ACCEPT.indexOf(file.type) >= 0 || /\.(mp4|webm|mov|ogv)$/i.test(file.name || '');
      if (!file || !okType) {
        this._setError('Drop an MP4, WebM, MOV, or OGG video.');
        return;
      }
      if (file.size > MAX_BYTES) {
        this._setError('Video is too large (max ~24 MB). Trim or compress it first.');
        return;
      }
      const gen = ++this._gen;
      try {
        const url = await readDataUrl(file);
        if (gen !== this._gen) return;
        const val = { u: url };
        setSlot(this.id || '', val);
        if (!this.id) { this._local = val; this._render(); }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that video.');
        console.warn('<video-slot> ingest failed:', err);
      }
    }

    _setError(msg) {
      if (this._err) { this._err.remove(); this._err = null; }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err'; d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => { if (this._err === d) { d.remove(); this._err = null; } }, 4000);
    }

    _render() {
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      let stored = this.id ? slots[this.id] : this._local;
      if (stored && typeof stored === 'string') stored = { u: stored };
      if (stored && stored.u && !/^data:video\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      const url = (stored && stored.u) || srcAttr;

      this._video.style.objectFit = this.getAttribute('fit') || 'cover';
      this._video.toggleAttribute('controls', this.hasAttribute('controls'));
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop a video';

      if (url) {
        if (this._video.getAttribute('src') !== url) {
          this._video.src = url;
          this._video.load();
          const p = this._video.play();
          if (p && p.catch) p.catch(() => {});
        }
        this._video.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
      } else {
        this._video.pause && this._video.pause();
        this._video.removeAttribute('src');
        this._video.style.display = 'none';
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }

  if (!customElements.get('video-slot')) {
    customElements.define('video-slot', VideoSlot);
  }
})();
