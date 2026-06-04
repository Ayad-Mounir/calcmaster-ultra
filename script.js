/* ============================
   CalcMaster Ultra — Main Script
   ============================ */

const Calc = (() => {
  'use strict';

  // ============ STATE ============
  const state = {
    mode: 'basic',
    theme: localStorage.getItem('ultraTheme') || 'midnight',
    display: '0',
    expression: '',
    memory: 0,
    hasMemory: false,
    history: JSON.parse(localStorage.getItem('ultraHistory') || '[]'),
    currentBase: 'DEC',
    newNumber: true,
    justEvaluated: false,
    voiceSupported: false,
    graphFunc: null,
  };

  // ============ DOM REFS ============
  const $ = (s) => document.querySelector(s), $$ = (s) => document.querySelectorAll(s);
  const el = {
    display: $('#display'),
    expression: $('#expression'),
    modeTabs: $$('.mode-tab'),
    modeLabels: $$('.mode-label'),
    panels: $$('.panel'),
    buttons: $('#buttons'),
    toast: $('#toast'),
    memIndicator: $('#memIndicator'),
    historyPanel: $('#historyPanel'),
    historyList: $('#historyList'),
    headerVer: $('#headerVer'),
    verDisplay: $('#verDisplay'),
    themeBtn: $('#themeBtn'),
    histBtn: $('#histBtn'),
    closeHist: $('#closeHist'),
    clearHist: $('#clearHist'),
    voiceToggle: $('#voiceToggleBtn'),
    // Prog
    baseSelector: $$('.base-btn'),
    progBin: $('#progBin'),
    progHex: $('#progHex'),
    // Graph
    graphInput: $('#graphInput'),
    graphPlotBtn: $('#graphPlotBtn'),
    graphCanvas: $('#graphCanvas'),
    // Age
    ageDay: $('#ageDay'), ageMonth: $('#ageMonth'), ageYear: $('#ageYear'),
    ageBtn: $('#ageBtn'),
    ageYearsVal: $('#ageYearsVal'), ageMonthsVal: $('#ageMonthsVal'),
    ageWeeksVal: $('#ageWeeksVal'), ageDaysVal: $('#ageDaysVal'),
    ageHoursVal: $('#ageHoursVal'), ageMinsVal: $('#ageMinsVal'),
    // Convert
    langBtns: $$('.lang-btn'),
    convCurrSelect: $('#convCurrSelect'),
    convInput: $('#convInput'),
    convertOutput: $('#convertOutput'),
    // Currency
    currAmount: $('#currAmount'), currFrom: $('#currFrom'), currTo: $('#currTo'),
    currResult: $('#currResult'), currRate: $('#currRate'), currSwap: $('#currSwap'),
    currRefresh: $('#currRefresh'),
    // Units
    unitsCategory: $('#unitsCategory'), unitsFromVal: $('#unitsFromVal'),
    unitsFromUnit: $('#unitsFromUnit'), unitsToUnit: $('#unitsToUnit'),
    unitsResult: $('#unitsResult'), unitsSwap: $('#unitsSwap'),
    // Voice
    voiceRecordBtn: $('#voiceRecordBtn'), voiceStatus: $('#voiceStatus'),
    voiceTranscript: $('#voiceTranscript'), voiceResult: $('#voiceResult'),
    // Commodity
    commodityGrid: $('#commodityGrid'), commodityStatus: $('#commodityStatus'),
    commodityRefresh: $('#commodityRefresh'),
    commModalOverlay: $('#commModalOverlay'), commModalTitle: $('#commModalTitle'),
    commModalBody: $('#commModalBody'), commModalRate: $('#commModalRate'),
    commModalTime: $('#commModalTime'), commModalClose: $('#commModalClose'),
  };

  // ============ UNIT DEFINITIONS ============
  const unitsDef = {
    length: {
      label: 'طول', units: [
        {id:'mm',name:'ملم',factor:0.001},{id:'cm',name:'سم',factor:0.01},
        {id:'m',name:'متر',factor:1},{id:'km',name:'كم',factor:1000},
        {id:'in',name:'بوصة',factor:0.0254},{id:'ft',name:'قدم',factor:0.3048},
        {id:'yd',name:'ياردة',factor:0.9144},{id:'mi',name:'ميل',factor:1609.344},
      ]
    },
    weight: {
      label: 'وزن', units: [
        {id:'mg',name:'ملغ',factor:0.000001},{id:'g',name:'غرام',factor:0.001},
        {id:'kg',name:'كغ',factor:1},{id:'ton',name:'طن',factor:1000},
        {id:'oz',name:'أونصة',factor:0.0283495},{id:'lb',name:'باوند',factor:0.453592},
      ]
    },
    temperature: {
      label: 'حرارة', units: [
        {id:'c',name:'°C',factor:1,convert:(v,to)=>
          to==='f'?v*9/5+32:to==='k'?v+273.15:v},
        {id:'f',name:'°F',factor:1,convert:(v,to)=>
          to==='c'?(v-32)*5/9:to==='k'?(v-32)*5/9+273.15:v},
        {id:'k',name:'K',factor:1,convert:(v,to)=>
          to==='c'?v-273.15:to==='f'?(v-273.15)*9/5+32:v},
      ]
    },
    area: {
      label: 'مساحة', units: [
        {id:'mm2',name:'ملم²',factor:0.000001},{id:'cm2',name:'سم²',factor:0.0001},
        {id:'m2',name:'م²',factor:1},{id:'km2',name:'كم²',factor:1000000},
        {id:'ha',name:'هكتار',factor:10000},{id:'acre',name:'فدان',factor:4046.86},
        {id:'ft2',name:'قدم²',factor:0.092903},
      ]
    },
    volume: {
      label: 'حجم', units: [
        {id:'ml',name:'مل',factor:0.001},{id:'l',name:'لتر',factor:1},
        {id:'m3',name:'م³',factor:1000},{id:'gal',name:'غالون',factor:3.78541},
        {id:'qt',name:'كوارت',factor:0.946353},{id:'cup',name:'كوب',factor:0.236588},
      ]
    },
    speed: {
      label: 'سرعة', units: [
        {id:'ms',name:'م/ث',factor:1},{id:'kmh',name:'كم/س',factor:0.277778},
        {id:'mph',name:'ميل/س',factor:0.44704},{id:'knot',name:'عقدة',factor:0.514444},
      ]
    },
  };

  // ============ THEMES ============
  const themes = ['midnight','emerald','rosegold','ocean','amber','amethyst'];
  const themeNames = {'midnight':'🌙 منتصف الليل','emerald':'🌿 زمرد','rosegold':'🌹 وردي ذهبي','ocean':'🌊 محيط','amber':'🔥 عنبر','amethyst':'💎 جمشت'};
  const themeIcons = {'midnight':'🌙','emerald':'🌿','rosegold':'🌹','ocean':'🌊','amber':'🔥','amethyst':'💎'};

  // ============ HELPER FUNCTIONS ============
  function formatNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    if (typeof n === 'string') n = parseFloat(n);
    let parts = n.toPrecision(12).replace(/\.?0+$/,'').split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function parseNum(s) { return parseFloat(String(s).replace(/,/g, '')) || 0; }

  function tokenize(expr) {
    // Simple math expression evaluator (safe)
    let sanitized = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
    sanitized = sanitized.replace(/π/g, Math.PI).replace(/e(?![xp])/g, Math.E);
    try { return Function('"use strict"; return (' + sanitized + ')')(); }
    catch(e) { return NaN; }
  }

  // ============ DISPLAY ============
  function setDisplay(val, animate) {
    if (val === undefined || val === null || isNaN(val)) val = '0';
    val = String(val);
    if (val.length > 15) {
      el.display.classList.add('shrink');
    } else {
      el.display.classList.remove('shrink');
    }
    el.display.textContent = val;
    if (animate) {
      el.display.classList.remove('count-pop');
      void el.display.offsetWidth;
      el.display.classList.add('count-pop');
    }
  }

  function getDisplay() { return el.display.textContent; }

  function setExpression(ex) {
    el.expression.textContent = ex || '';
  }

  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(el.toast._timer);
    el.toast._timer = setTimeout(() => el.toast.classList.remove('show'), 2000);
  }

  // ============ MODES ============
  function switchMode(mode) {
    state.mode = mode;
    // Update tabs & labels
    el.modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    el.modeLabels.forEach(l => l.classList.toggle('active', l.dataset.mode === mode));
    // Update panels
    el.panels.forEach(p => p.classList.remove('visible'));
    const panelMap = {
      sci: '#sciPanel', prog: '#progPanel', graph: '#graphPanel',
      age: '#agePanel', convert: '#convertPanel', currency: '#currencyPanel',
      units: '#unitsPanel', voice: '#voicePanel', commodity: '#commodityPanel'
    };
    if (panelMap[mode]) {
      document.querySelector(panelMap[mode]).classList.add('visible');
    }
    // Show/hide buttons grid
    const showButtons = ['basic','sci','prog'].includes(mode);
    document.querySelector('.buttons').style.display = showButtons ? 'grid' : 'none';
    // Reset for certain modes
    if (['basic','sci','prog'].includes(mode)) {
      // Do nothing, keep display
    } else if (mode === 'graph') {
      setDisplay('📊', false);
      setExpression('f(x) = ' + (el.graphInput.value || 'x²'));
    } else if (mode === 'age') {
      setDisplay('🎂', false);
      setExpression('');
    } else if (mode === 'convert') {
      setDisplay('✍️', false);
      setExpression('');
      if (el.convInput) {
        let cur = getDisplay();
        if (cur && cur !== '✍️' && cur !== '0') el.convInput.value = parseNum(cur);
        el.convInput.focus();
        el.convInput.select();
      }
      doConvert();
    } else if (mode === 'currency') {
      setDisplay('💰', false);
      setExpression('');
    } else if (mode === 'units') {
      setDisplay('📏', false);
      setExpression('');
      updateUnits();
    } else if (mode === 'voice') {
      setDisplay('🎤', false);
      setExpression('');
    } else if (mode === 'commodity') {
      setDisplay('💎', false);
      setExpression('');
      fetchCommodities();
    }
    // Update programmer display if needed
    if (mode === 'prog') updateProgDisplay();
    state.newNumber = true;
  }

  // ============ BUTTON HANDLING ============
  function initButtons() {
    el.buttons.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const val = btn.dataset.value;
      const action = btn.dataset.action;
      if (val !== undefined) handleValue(val);
      else if (action) handleAction(action);
    });

    // Scientific buttons
    document.querySelector('#sciPanel').addEventListener('click', function(e) {
      const btn = e.target.closest('.sci-btn');
      if (btn) doScientific(btn.textContent);
    });

    // Bitwise buttons
    document.querySelector('#progPanel').addEventListener('click', function(e) {
      const btn = e.target.closest('.bit-btn');
      if (btn) doBitwise(btn.dataset.op);
    });

    // Base selector
    document.querySelector('#progPanel').addEventListener('click', function(e) {
      const btn = e.target.closest('.base-btn');
      if (!btn) return;
      el.baseSelector.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentBase = btn.dataset.base;
      updateProgDisplay();
    });
  }

  function handleValue(val) {
    if (['currency','units','age','convert','graph','voice','commodity'].includes(state.mode)) return;
    if (state.justEvaluated && !state.newNumber) {
      state.display = '0';
      state.expression = '';
      state.newNumber = true;
      state.justEvaluated = false;
    }
    let cur = getDisplay();
    if (state.newNumber) {
      cur = (val === '.') ? '0.' : val;
      state.newNumber = false;
    } else {
      if (val === '.' && cur.includes('.')) return;
      if (cur.replace(/-/,'').length >= 15) return;
      cur += val;
    }
    setDisplay(cur, true);
  }

  function handleAction(action) {
    if (['currency','units','age','convert','graph','voice','commodity'].includes(state.mode)) return;
    switch (action) {
      case 'clear':
        setDisplay('0'); setExpression(''); state.newNumber = true; state.justEvaluated = false;
        break;
      case 'backspace':
        if (state.newNumber) return;
        let cur = getDisplay();
        cur = cur.length > 1 ? cur.slice(0, -1) : '0';
        if (cur === '-' || cur === '') cur = '0';
        setDisplay(cur);
        if (cur === '0') state.newNumber = true;
        break;
      case 'negate':
        if (getDisplay() !== '0') {
          setDisplay(getDisplay().startsWith('-') ? getDisplay().slice(1) : '-' + getDisplay());
        }
        break;
      case 'percent':
        state.expression = getDisplay() + '%';
        setDisplay(String(parseNum(getDisplay()) / 100));
        state.newNumber = true;
        break;
      case 'decimal':
        handleValue('.');
        break;
      case 'add': case 'subtract': case 'multiply': case 'divide':
        state.expression = getDisplay() + ' ' + {add:'+',subtract:'−',multiply:'×',divide:'÷'}[action] + ' ';
        setDisplay('0');
        state.newNumber = true;
        state.justEvaluated = false;
        break;
      case 'equals':
        evaluateExpression();
        break;
    }
  }

  function evaluateExpression() {
    let expr = state.expression + getDisplay();
    let result = tokenize(expr);
    if (result === undefined || result === null || isNaN(result) || !isFinite(result)) {
      el.display.classList.add('error');
      setDisplay('خطأ');
      setTimeout(() => el.display.classList.remove('error'), 1000);
      return;
    }
    state.expression = expr + ' =';
    let formatted = formatNum(result);
    setDisplay(formatted, true);
    addToHistory(expr + ' =', formatted);
    state.newNumber = true;
    state.justEvaluated = true;
  }

  // ============ SCIENTIFIC ============
  function doScientific(fn) {
    if (state.newNumber) { state.newNumber = false; }
    let val = parseNum(getDisplay());
    let result;
    switch (fn) {
      case 'sin': result = Math.sin(val * Math.PI / 180); break;
      case 'cos': result = Math.cos(val * Math.PI / 180); break;
      case 'tan': result = Math.tan(val * Math.PI / 180); break;
      case 'log': result = Math.log10(val); break;
      case 'ln': result = Math.log(val); break;
      case '√': result = Math.sqrt(val); break;
      case 'x²': result = val * val; break;
      case 'x³': result = val * val * val; break;
      case 'xʸ': state.expression = val + ' ^ '; setDisplay('0'); state.newNumber = true; return;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case '!': result = factorial(val); break;
      case '1/x': result = 1 / val; break;
      case '|x|': result = Math.abs(val); break;
      case '(': case ')': return;
      default: return;
    }
    if (isNaN(result) || !isFinite(result)) { setDisplay('خطأ'); return; }
    state.expression = fn + '(' + formatNum(val) + ')';
    setDisplay(formatNum(result), true);
    state.newNumber = true;
  }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    if (!Number.isInteger(n)) return gamma(n + 1);
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function gamma(x) {
    // Stirling's approximation
    return Math.sqrt(2 * Math.PI / x) * Math.pow((x / Math.E) * Math.sqrt(x * Math.sinh(1/x) + 1/(810 * Math.pow(x, 6))), x);
  }

  // ============ PROGRAMMER ============
  function doBitwise(op) {
    let a = parseInt(getDisplay().replace(/,/g,''), 10);
    if (isNaN(a)) a = 0;
    let b = 0, result = 0;
    switch (op) {
      case 'not': result = ~a; break;
      case 'lshift': state.expression = a + ' << '; setDisplay('0'); state.newNumber = true; return;
      case 'rshift': state.expression = a + ' >> '; setDisplay('0'); state.newNumber = true; return;
      case 'and': state.expression = a + ' AND '; setDisplay('0'); state.newNumber = true; return;
      case 'or': state.expression = a + ' OR '; setDisplay('0'); state.newNumber = true; return;
      case 'xor': state.expression = a + ' XOR '; setDisplay('0'); state.newNumber = true; return;
      default: return;
    }
    // For unary NOT
    result = result >>> 0; // convert to unsigned
    setDisplay(String(result));
    updateProgDisplay();
    state.newNumber = true;
  }

  function updateProgDisplay() {
    let val = parseInt(getDisplay().replace(/,/g,''), 10) || 0;
    el.progBin.textContent = (val >>> 0).toString(2);
    el.progHex.textContent = (val >>> 0).toString(16).toUpperCase();
  }

  // ============ GRAPHING ============
  let graphZoom = 10;
  function plotGraph() {
    const canvas = el.graphCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, w, h);

    let fnStr = el.graphInput.value.trim() || 'x*x';
    // Safe eval for math expressions
    let fn;
    try {
      fn = new Function('x', 'with (Math) { return (' + fnStr.replace(/²/g,'**2').replace(/³/g,'**3').replace(/\^/g,'**') + '); }');
      let testVal = fn(1);
      if (typeof testVal !== 'number' || isNaN(testVal)) throw new Error('invalid');
    } catch(e) {
      ctx.fillStyle = '#ff5757';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ دالة غير صالحة', w/2, h/2);
      return;
    }
    state.graphFunc = fn;
    setExpression('f(x) = ' + fnStr);

    // Grid
    const xRange = graphZoom;
    const yRange = xRange * h / w;
    const x0 = w / 2, y0 = h / 2;
    const scaleX = w / (2 * xRange);
    const scaleY = h / (2 * yRange);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = -xRange; x <= xRange; x += xRange / 5) {
      ctx.beginPath();
      ctx.moveTo(x0 + x * scaleX, 0);
      ctx.lineTo(x0 + x * scaleX, h);
      ctx.stroke();
    }
    for (let y = -yRange; y <= yRange; y += yRange / 5) {
      ctx.beginPath();
      ctx.moveTo(0, y0 - y * scaleY);
      ctx.lineTo(w, y0 - y * scaleY);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,y0); ctx.lineTo(w,y0); ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let x = -xRange + (xRange % 5 === 0 ? 0 : 0); x <= xRange; x += xRange / 5) {
      if (x !== 0) ctx.fillText(x, x0 + x * scaleX, y0 + 14);
    }
    ctx.textAlign = 'right';
    for (let y = -yRange + (yRange % 5 === 0 ? 0 : 0); y <= yRange; y += yRange / 5) {
      if (y !== 0) ctx.fillText(y, x0 - 6, y0 - y * scaleY + 4);
    }

    // Plot
    ctx.strokeStyle = 'url(#graphGradient)';
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#7c6aff');
    gradient.addColorStop(1, '#f472b6');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(124,106,255,0.3)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    let first = true;
    for (let px = 0; px < w; px++) {
      let x = (px - x0) / scaleX;
      let y = fn(x);
      let py = y0 - y * scaleY;
      if (!isFinite(y)) { first = true; continue; }
      if (py < -1000 || py > h + 1000) { first = true; continue; }
      if (first) { ctx.moveTo(px, py); first = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    state.expression = 'f(x) = ' + fnStr;
  }

  // ============ AGE ============
  function populateAgeSelects() {
    for (let d = 1; d <= 31; d++) {
      let opt = document.createElement('option');
      opt.value = d; opt.textContent = d; el.ageDay.appendChild(opt);
    }
    for (let m = 1; m <= 12; m++) {
      let opt = document.createElement('option');
      opt.value = m; opt.textContent = m; el.ageMonth.appendChild(opt);
    }
    let y = new Date().getFullYear();
    for (let yr = y; yr >= 1900; yr--) {
      let opt = document.createElement('option');
      opt.value = yr;
      opt.textContent = yr;
      if (yr === 2000) opt.selected = true;
      el.ageYear.appendChild(opt);
    }
  }

  function calculateAge() {
    let day = parseInt(el.ageDay.value), month = parseInt(el.ageMonth.value), year = parseInt(el.ageYear.value);
    if (!day || !month || !year) { showToast('⚠️ اختر تاريخ صحيح'); return; }
    let birth = new Date(year, month - 1, day);
    let now = new Date();
    let diff = now - birth;
    if (diff < 0) { showToast('⚠️ لم تولد بعد!'); return; }
    let totalDays = Math.floor(diff / (1000*60*60*24));
    let years = Math.floor(totalDays / 365.25);
    let months = Math.floor((totalDays % 365.25) / 30.44);
    let days = Math.floor(totalDays % 30.44);
    let hours = Math.floor(diff / (1000*60*60)) % 24;
    let mins = Math.floor(diff / (1000*60)) % 60;
    let weeks = Math.floor(totalDays / 7);

    el.ageYearsVal.textContent = years;
    el.ageMonthsVal.textContent = months;
    el.ageWeeksVal.textContent = weeks;
    el.ageDaysVal.textContent = totalDays;
    el.ageHoursVal.textContent = hours + totalDays * 24;
    el.ageMinsVal.textContent = mins + (hours + totalDays * 24) * 60;
  }

  // ============ NUMBER-TO-WORDS (Arabic, French, English) ============
  function numberToWords(num, lang) {
    num = Math.floor(parseFloat(num));
    if (isNaN(num)) return '';
    if (lang === 'ar') return numToAr(num);
    if (lang === 'fr') return numToFr(num);
    return numToEn(num);
  }

  // Arabic
  function numToAr(n) {
    if (n === 0) return 'صفر';
    const ones = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];
    const tens = ['','عشرة','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
    const teens = ['عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
    const scales = ['','ألف','مليون','مليار','بليون'];

    function under1000(n) {
      if (n === 0) return '';
      let s = '';
      let h = Math.floor(n / 100);
      let r = n % 100;
      if (h === 1) s += 'مئة';
      else if (h === 2) s += 'مئتان';
      else if (h > 2) s += ones[h] + 'مئة';
      if (r === 0) return s;
      if (s) s += ' و';
      if (r < 10) s += ones[r];
      else if (r < 20) s += teens[r - 10];
      else {
        let u = r % 10, t = Math.floor(r / 10);
        if (u) s += ones[u] + ' و';
        s += tens[t];
      }
      return s;
    }

    let result = '', scaleIdx = 0;
    while (n > 0) {
      let chunk = n % 1000;
      if (chunk) {
        let chunkStr = under1000(chunk);
        if (scaleIdx > 0) chunkStr += ' ' + scales[scaleIdx];
        if (chunk === 2 && scaleIdx > 0) chunkStr = scales[scaleIdx] + 'ان';
        else if (chunk === 1 && scaleIdx > 0) chunkStr = scales[scaleIdx];
        else if (chunk > 2 && scaleIdx > 0 && scales[scaleIdx]) chunkStr = under1000(chunk) + ' ' + scales[scaleIdx];
        result = chunkStr + (result ? ' و' + result : '');
      }
      n = Math.floor(n / 1000);
      scaleIdx++;
    }
    return result;
  }

  // French
  function numToFr(n) {
    if (n === 0) return 'zéro';
    const ones = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf'];
    const teens = ['dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
    const tens = ['','','vingt','trente','quarante','cinquante','soixante','soixante-dix','quatre-vingt','quatre-vingt-dix'];
    const scales = ['','mille','million','milliard'];

    function under1000(n) {
      if (n === 0) return '';
      let s = '';
      let h = Math.floor(n / 100);
      let r = n % 100;
      if (h === 1) s += 'cent';
      else if (h > 1) s += ones[h] + ' cent';
      if (r === 0) return s;
      if (s) s += ' ';
      if (r < 10) s += ones[r];
      else if (r < 20) s += teens[r - 10];
      else {
        let t = Math.floor(r / 10), u = r % 10;
        s += tens[t];
        if (t === 7 || t === 9) {
          if (u === 1) s += ' et onze';
          else s += '-' + (u > 0 ? teens[u] : '');
        } else {
          if (u === 1 && t !== 8) s += ' et un';
          else if (u > 0) s += '-' + ones[u];
        }
      }
      return s;
    }

    let result = '', scaleIdx = 0;
    while (n > 0) {
      let chunk = n % 1000;
      if (chunk) {
        let chunkStr = under1000(chunk);
        if (scaleIdx > 0) chunkStr += ' ' + scales[scaleIdx];
        if (chunk === 1 && scaleIdx === 1) chunkStr = 'mille';
        else if (chunk > 1 && scaleIdx > 0 && scales[scaleIdx]) chunkStr = under1000(chunk) + ' ' + scales[scaleIdx];
        result = chunkStr + (result ? ' ' + result : '');
      }
      n = Math.floor(n / 1000);
      scaleIdx++;
    }
    return result || 'zéro';
  }

  // English
  function numToEn(n) {
    if (n === 0) return 'zero';
    const ones = ['','one','two','three','four','five','six','seven','eight','nine'];
    const teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
    const scales = ['','thousand','million','billion'];

    function under1000(n) {
      if (n === 0) return '';
      let s = '';
      let h = Math.floor(n / 100);
      let r = n % 100;
      if (h > 0) s += ones[h] + ' hundred';
      if (r === 0) return s;
      if (s) s += ' ';
      if (r < 10) s += ones[r];
      else if (r < 20) s += teens[r - 10];
      else {
        let t = Math.floor(r / 10), u = r % 10;
        s += tens[t];
        if (u > 0) s += '-' + ones[u];
      }
      return s;
    }

    let result = '', scaleIdx = 0;
    while (n > 0) {
      let chunk = n % 1000;
      if (chunk) {
        let chunkStr = under1000(chunk);
        if (scaleIdx > 0) chunkStr += ' ' + scales[scaleIdx];
        result = chunkStr + (result ? ' ' + result : '');
      }
      n = Math.floor(n / 1000);
      scaleIdx++;
    }
    return result || 'zero';
  }

  function doConvert() {
    let num = el.convInput ? parseFloat(el.convInput.value) || 0 : parseNum(getDisplay());
    if (state.mode !== 'convert') return;
    let lang = document.querySelector('.lang-btn.active').dataset.lang;
    let curr = el.convCurrSelect.value;
    let words = numberToWords(num, lang);
    if (curr) {
      const currNames = {
        'MAD': {ar:'درهمًا',fr:'dirhams',en:'dirhams'},
        'USD': {ar:'دولارًا',fr:'dollars',en:'dollars'},
        'EUR': {ar:'يورو',fr:'euros',en:'euros'},
        'GBP': {ar:'جنيهًا إسترلينيًا',fr:'livres sterling',en:'pounds sterling'},
      };
      let cn = currNames[curr];
      if (cn) words += ' ' + cn[lang];
    }
    el.convertOutput.textContent = words || '⚠️ أدخل رقمًا صحيحًا';
  }

  // ============ CURRENCY (Live Rates) ============
  let cachedRates = JSON.parse(localStorage.getItem('ultraRates') || '{}');
  let ratesCacheTime = localStorage.getItem('ultraRatesTime') || 0;

  async function fetchRates() {
    el.currRate.textContent = 'جاري التحديث...';
    try {
      let res = await fetch('https://api.frankfurter.app/latest?from=MAD');
      let data = await res.json();
      if (data.rates) {
        cachedRates = data.rates;
        cachedRates.MAD = 1;
        localStorage.setItem('ultraRates', JSON.stringify(cachedRates));
        ratesCacheTime = Date.now();
        localStorage.setItem('ultraRatesTime', ratesCacheTime);
        el.currRate.textContent = '✅ تم التحديث — ' + new Date().toLocaleTimeString('ar');
        doCurrency();
      } else {
        throw new Error('Invalid response');
      }
    } catch(e) {
      // Fallback to cached or approximate
      if (Object.keys(cachedRates).length > 0) {
        el.currRate.textContent = '⚠️ باستخدام آخر الأسعار المخزنة';
        doCurrency();
      } else {
        // Approximate fallback rates
        cachedRates = { MAD: 1, USD: 0.10, EUR: 0.092, GBP: 0.079, JPY: 15.6, CAD: 0.137, AUD: 0.151, CHF: 0.089, CNY: 0.724 };
        el.currRate.textContent = '⚠️ أسعار تقريبية (آخر تحديث غير متاح)';
        doCurrency();
      }
    }
  }

  function doCurrency() {
    let amt = parseFloat(el.currAmount.value) || 1;
    let from = el.currFrom.value;
    let to = el.currTo.value;
    if (from === to) { el.currResult.textContent = amt + ' ' + from; el.currRate.textContent = 'نفس العملة'; return; }
    let rateFrom = cachedRates[from] || 1;
    let rateTo = cachedRates[to] || 1;
    let result = amt * (rateTo / rateFrom);
    el.currResult.textContent = formatNum(result) + ' ' + to;
    el.currRate.textContent = '1 ' + from + ' = ' + (rateTo / rateFrom).toFixed(6) + ' ' + to;
  }

  // ============ COMMODITIES ============
  const COMMODITY_DEFS = [
    { id:'gold',    icon:'🥇', name:'الذهب',     api:'https://api.gold-api.com/price/XAU', unit:'غ',      unitFactor: 31.1035 },
    { id:'silver',  icon:'🥈', name:'الفضة',     api:'https://api.gold-api.com/price/XAG', unit:'غ',      unitFactor: 31.1035 },
    { id:'platinum',icon:'🪙', name:'البلاتين',   api:'https://api.gold-api.com/price/XPT', unit:'غ',      unitFactor: 31.1035 },
    { id:'palladium',icon:'🔮', name:'البلاديوم',  api:'https://api.gold-api.com/price/XPD', unit:'غ',      unitFactor: 31.1035 },
    { id:'copper',  icon:'🔶', name:'النحاس',     api:'https://api.gold-api.com/price/HG',  unit:'غ',      unitFactor: 453.592 },
    { id:'brent',   icon:'🛢️', name:'برنت',       api:'oil',                                unit:'لتر',    unitFactor: 159 },
    { id:'wti',     icon:'🛢️', name:'WTI',         api:'oil',                                unit:'لتر',    unitFactor: 159 },
    { id:'gasoline',icon:'⛽', name:'البنزين',     api:'oil',                                unit:'لتر',    unitFactor: 3.785 },
    { id:'diesel',  icon:'⛽', name:'المازوت',     api:'oil',                                unit:'لتر',    unitFactor: 3.785 },
    { id:'gas',     icon:'🔥', name:'الغاز الطبيعي',api:'oil',                                unit:'MMBtu', unitFactor: 1 },
  ];

  let commoditiesCache = JSON.parse(localStorage.getItem('ultraCommodities') || '{}');
  let commoditiesCacheTime = parseInt(localStorage.getItem('ultraCommoditiesTime') || '0');
  let madRate = 0;

  async function fetchCommodities() {
    el.commodityGrid.innerHTML = '<div class="commodity-loading">⏳ جاري تحميل الأسعار...</div>';
    el.commodityStatus.textContent = 'جارٍ التحديث...';

    // 1. Fetch USD→MAD rate
    try {
      let res = await fetch('https://open.er-api.com/v6/latest/USD');
      let data = await res.json();
      if (data.rates && data.rates.MAD) {
        madRate = data.rates.MAD;
      } else {
        // Fallback to cached rate
        if (commoditiesCache._madRate) madRate = commoditiesCache._madRate;
        else madRate = 10; // approximate
      }
    } catch(e) {
      if (commoditiesCache._madRate) madRate = commoditiesCache._madRate;
      else madRate = 10;
    }

    const results = {};
    let oilPrices = null;
    let success = false;

    // 2. Fetch metals from gold-api
    const metalDefs = COMMODITY_DEFS.filter(d => d.api !== 'oil');
    const metalPromises = metalDefs.map(async (def) => {
      try {
        let res = await fetch(def.api);
        let data = await res.json();
        if (data && data.price) {
          results[def.id] = { priceUSD: data.price, time: data.updatedAt || data.updatedAtReadable || '' };
          return true;
        }
      } catch(e) {}
      return false;
    });
    await Promise.all(metalPromises);
    if (metalDefs.some(d => results[d.id])) success = true;

    // 3. Fetch oil prices from oilpriceapi demo
    try {
      let res = await fetch('https://api.oilpriceapi.com/v1/demo/prices?t=' + Date.now());
      let data = await res.json();
      if (data && data.data && data.data.prices) {
        oilPrices = {};
        data.data.prices.forEach(p => { oilPrices[p.code] = { price: p.price, time: p.updated_at }; });
      }
    } catch(e) {}

    // Map oil prices
    if (oilPrices) {
      const oilMap = {
        brent: { code: 'BRENT_CRUDE_USD', factor: 159 },
        wti: { code: 'WTI_USD', factor: 159 },
        gasoline: { code: 'GASOLINE_USD', factor: 3.785 },
        diesel: { code: 'DIESEL_USD', factor: 3.785 },
        gas: { code: 'NATURAL_GAS_USD', factor: 1 },
      };
      COMMODITY_DEFS.filter(d => d.api === 'oil').forEach(def => {
        const om = oilMap[def.id];
        if (om && oilPrices[om.code]) {
          results[def.id] = { priceUSD: oilPrices[om.code].price, time: oilPrices[om.code].time };
        }
      });
      if (COMMODITY_DEFS.some(d => d.api === 'oil' && results[d.id])) success = true;
    }

    // 4. Cache results
    if (success) {
      results._madRate = madRate;
      commoditiesCache = results;
      commoditiesCacheTime = Date.now();
      localStorage.setItem('ultraCommodities', JSON.stringify(results));
      localStorage.setItem('ultraCommoditiesTime', commoditiesCacheTime);
      el.commodityStatus.textContent = '✅ آخر تحديث: ' + new Date().toLocaleTimeString('ar');
    } else {
      // Try to use cache
      if (Object.keys(commoditiesCache).length > 1) {
        el.commodityStatus.textContent = '⚠️ باستخدام آخر الأسعار المخزنة';
      } else {
        el.commodityStatus.textContent = '❌ فشل التحميل';
      }
    }

    renderCommodities();
  }

  function renderCommodities() {
    const cache = Object.keys(commoditiesCache).length > 1 ? commoditiesCache : null;
    let html = '';

    COMMODITY_DEFS.forEach(def => {
      const data = cache ? cache[def.id] : null;
      if (!data) {
        html += '<div class="commodity-card" data-comm-id="' + def.id + '"><div class="commodity-card-header">' +
          '<span class="commodity-card-icon">' + def.icon + '</span>' +
          '<span class="commodity-card-name">' + def.name + '</span></div>' +
          '<div style="font-size:11px;color:var(--text-secondary)">—</div></div>';
        return;
      }
      let priceUSD = data.priceUSD;
      let priceMAD = priceUSD * madRate;
      let perUnit = def.unitFactor > 1 ? priceUSD / def.unitFactor : priceUSD;
      let perUnitMAD = perUnit * madRate;
      let timeStr = '';
      if (data.time) {
        try { timeStr = new Date(data.time).toLocaleTimeString('ar'); } catch(e) { timeStr = data.time; }
      }

      // Format prices
      let usdStr = priceUSD < 1 ? priceUSD.toFixed(4) : priceUSD.toLocaleString('ar', {maximumFractionDigits:2});
      let perUnitStr = perUnit < 0.01 ? perUnit.toFixed(4) : perUnit < 1 ? perUnit.toFixed(3) : perUnit.toFixed(2);
      let madStr = perUnitMAD < 0.01 ? perUnitMAD.toFixed(4) : perUnitMAD < 1 ? perUnitMAD.toFixed(3) : perUnitMAD.toFixed(2);

      html += '<div class="commodity-card" data-comm-id="' + def.id + '">' +
        '<div class="commodity-card-header">' +
          '<span class="commodity-card-icon">' + def.icon + '</span>' +
          '<span class="commodity-card-name">' + def.name + '</span>' +
        '</div>' +
        '<div class="commodity-card-price">' + madStr + '</div>' +
        '<div class="commodity-card-unit">د.م. / ' + def.unit + '</div>' +
        '<div class="commodity-card-usd">$' + perUnitStr + ' / ' + def.unit + '</div>' +
        (timeStr ? '<div class="commodity-card-time">🕐 ' + timeStr + '</div>' : '') +
      '</div>';
    });

    el.commodityGrid.innerHTML = html;

    // Click handler for cards
    el.commodityGrid.querySelectorAll('.commodity-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.commId;
        showCommodityDetail(id);
      });
    });
  }

  function showCommodityDetail(id) {
    const def = COMMODITY_DEFS.find(d => d.id === id);
    const data = commoditiesCache[id];
    if (!def || !data) return;

    const priceUSD = data.priceUSD;
    const priceMAD = priceUSD * madRate;
    const madPerUnit = (priceUSD / def.unitFactor) * madRate;
    const usdPerUnit = priceUSD / def.unitFactor;

    // Build detail table rows
    let rows = [];

    if (def.api === 'oil') {
      // Oil: show per liter, per 10L, per barrel
      const barrelL = 159;
      const units = [
        { label: '1 ' + def.unit,            factor: 1 },
        { label: '10 ' + def.unit,           factor: 10 },
        { label: '50 ' + def.unit,           factor: 50 },
        { label: '1 برميل (' + barrelL + ' لتر)', factor: barrelL },
      ];
      units.forEach(u => {
        const mad = ((priceUSD / def.unitFactor) * madRate * u.factor).toFixed(2);
        const usd = ((priceUSD / def.unitFactor) * u.factor).toFixed(2);
        rows.push('<tr><td class="comm-detail-unit">' + u.label + '</td>' +
          '<td class="comm-detail-mad">' + Number(mad).toLocaleString('ar', {minimumFractionDigits:2}) + ' د.م.</td>' +
          '<td class="comm-detail-usd">$' + Number(usd).toLocaleString('ar', {minimumFractionDigits:2}) + '</td></tr>');
      });
    } else if (def.id === 'gas') {
      // Natural gas
      const units = [
        { label: '1 MMBtu',       factor: 1 },
        { label: '10 MMBtu',      factor: 10 },
        { label: '1 kWh (~0.0034)', factor: 0.0034 },
        { label: '100 kWh',         factor: 0.34 },
      ];
      units.forEach(u => {
        const mad = (priceUSD * madRate * u.factor).toFixed(2);
        const usd = (priceUSD * u.factor).toFixed(2);
        rows.push('<tr><td class="comm-detail-unit">' + u.label + '</td>' +
          '<td class="comm-detail-mad">' + Number(mad).toLocaleString('ar', {minimumFractionDigits:2}) + ' د.م.</td>' +
          '<td class="comm-detail-usd">$' + Number(usd).toLocaleString('ar', {minimumFractionDigits:2}) + '</td></tr>');
      });
    } else {
      // Metals: show per gram, per 10g, per 100g, per kg, per oz
      const oz = 31.1035;
      const units = [
        { label: '1 غرام',  factor: 1 },
        { label: '10 غرام', factor: 10 },
        { label: '100 غرام', factor: 100 },
        { label: '1 كيلو',   factor: 1000 },
        { label: '1 أونصة (' + oz + ' غ)', factor: oz },
      ];
      units.forEach(u => {
        const mad = ((priceUSD / def.unitFactor) * madRate * u.factor).toFixed(2);
        const usd = ((priceUSD / def.unitFactor) * u.factor).toFixed(2);
        rows.push('<tr><td class="comm-detail-unit">' + u.label + '</td>' +
          '<td class="comm-detail-mad">' + Number(mad).toLocaleString('ar', {minimumFractionDigits:2}) + ' د.م.</td>' +
          '<td class="comm-detail-usd">$' + Number(usd).toLocaleString('ar', {minimumFractionDigits:2}) + '</td></tr>');
      });
    }

    el.commModalTitle.textContent = def.icon + ' ' + def.name;
    el.commModalBody.innerHTML =
      '<table class="comm-detail-table">' +
        '<tr><th>الوحدة</th><th>بالدرهم</th><th>بالدولار</th></tr>' +
        rows.join('') +
      '</table>';
    el.commModalRate.textContent = '💱 1 USD = ' + madRate.toFixed(4) + ' MAD';
    let timeStr = '';
    if (data.time) {
      try { timeStr = '🕐 ' + new Date(data.time).toLocaleTimeString('ar'); } catch(e) { timeStr = ''; }
    }
    el.commModalTime.textContent = timeStr;
    el.commModalOverlay.classList.add('open');
  }

  // ============ UNITS ============
  function updateUnits() {
    let cat = el.unitsCategory.value;
    let def = unitsDef[cat];
    if (!def) return;
    let uFrom = el.unitsFromUnit, uTo = el.unitsToUnit;
    // Populate selects
    uFrom.innerHTML = ''; uTo.innerHTML = '';
    def.units.forEach((u, i) => {
      let opt1 = document.createElement('option'); opt1.value = u.id; opt1.textContent = u.name;
      let opt2 = document.createElement('option'); opt2.value = u.id; opt2.textContent = u.name;
      if (i === 0) opt1.selected = true;
      if (i === 1) opt2.selected = true;
      uFrom.appendChild(opt1);
      uTo.appendChild(opt2);
    });
    doConvertUnits();
  }

  function doConvertUnits() {
    let cat = el.unitsCategory.value;
    let def = unitsDef[cat];
    if (!def) return;
    let fromId = el.unitsFromUnit.value;
    let toId = el.unitsToUnit.value;
    let val = parseFloat(el.unitsFromVal.value) || 0;
    
    let fromUnit = def.units.find(u => u.id === fromId);
    let toUnit = def.units.find(u => u.id === toId);
    if (!fromUnit || !toUnit) return;

    let result;
    if (cat === 'temperature') {
      // Convert via Celsius
      let inC = fromUnit.convert(val, 'c');
      result = inC !== undefined ? toUnit.convert(inC, toId) : val;
    } else {
      let baseVal = val * fromUnit.factor;
      result = baseVal / toUnit.factor;
    }
    el.unitsResult.textContent = formatNum(result);
  }

  // ============ VOICE ============
  let recognition = null;
  let isListening = false;

  function initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      el.voiceRecordBtn.textContent = '🎤 غير متوفر';
      el.voiceRecordBtn.disabled = true;
      el.voiceStatus.textContent = '❌ التعرف الصوتي غير مدعوم في هذا المتصفح';
      state.voiceSupported = false;
      return;
    }
    state.voiceSupported = true;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ar-SA';

    recognition.onstart = () => {
      isListening = true;
      el.voiceRecordBtn.classList.add('listening');
      el.voiceRecordBtn.textContent = '🔴 استماع...';
      el.voiceStatus.textContent = '🎤 تحدث الآن...';
      el.voiceTranscript.textContent = '';
      el.voiceResult.textContent = '';
    };

    recognition.onresult = (e) => {
      let transcript = e.results[0][0].transcript;
      el.voiceTranscript.textContent = transcript;
      el.voiceStatus.textContent = '✅ تم التعرف على الصوت';
      // Try to evaluate
      let num = parseFloat(transcript.replace(/[^0-9.\-,]/g, '').replace(',',''));
      if (!isNaN(num)) {
        el.voiceResult.textContent = '= ' + formatNum(num);
        showToast('🎤 ' + transcript + ' = ' + formatNum(num));
        // Switch to basic and show number
        switchMode('basic');
        setDisplay(formatNum(num)); state.newNumber = false;
      } else {
        el.voiceResult.textContent = '🔢 تعذر التعرف على رقم';
      }
    };

    recognition.onerror = (e) => {
      el.voiceStatus.textContent = '❌ خطأ: ' + e.error;
      stopVoice();
    };

    recognition.onend = () => { stopVoice(); };
  }

  function stopVoice() {
    isListening = false;
    el.voiceRecordBtn.classList.remove('listening');
    el.voiceRecordBtn.textContent = '🎤 اضغط لتتكلم';
    if (!el.voiceStatus.textContent.includes('✅')) {
      el.voiceStatus.textContent = '';
    }
  }

  function toggleVoice() {
    if (!state.voiceSupported || !recognition) { showToast('❌ التعرف الصوتي غير مدعوم'); return; }
    if (isListening) { recognition.stop(); stopVoice(); return; }
    try { recognition.start(); } catch(e) { showToast('❌ حدث خطأ'); }
  }

  // ============ THEMES ============
  function cycleTheme() {
    let idx = themes.indexOf(state.theme);
    idx = (idx + 1) % themes.length;
    setTheme(themes[idx]);
  }

  function setTheme(name) {
    state.theme = name;
    document.documentElement.dataset.theme = name === 'midnight' ? '' : name;
    localStorage.setItem('ultraTheme', name);
    el.themeBtn.textContent = themeIcons[name] || '🎨';
  }

  // ============ HISTORY ============
  function addToHistory(expr, result) {
    state.history.unshift({expr, result, time: Date.now()});
    if (state.history.length > 100) state.history.pop();
    localStorage.setItem('ultraHistory', JSON.stringify(state.history));
  }

  function renderHistory() {
    el.historyList.innerHTML = '';
    if (state.history.length === 0) {
      el.historyList.innerHTML = '<div class="empty-history">📭 لا يوجد سجل بعد</div>';
      return;
    }
    state.history.forEach((h) => {
      let div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = '<div class="h-expr">' + h.expr + '</div><div class="h-result">' + h.result + '</div>';
      div.onclick = () => {
        setDisplay(h.result); state.newNumber = false;
        el.historyPanel.classList.remove('open');
      };
      el.historyList.appendChild(div);
    });
  }

  // ============ INIT ============
  function init() {
    // Set theme
    setTheme(state.theme);

    // Populate age selects
    populateAgeSelects();

    // Init voice
    initVoice();

    // Event listeners
    // Mode tabs
    el.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Theme button
    el.themeBtn.addEventListener('click', cycleTheme);

    // History
    el.histBtn.addEventListener('click', () => { el.historyPanel.classList.add('open'); renderHistory(); });
    el.closeHist.addEventListener('click', () => el.historyPanel.classList.remove('open'));
    el.clearHist.addEventListener('click', () => { state.history = []; localStorage.removeItem('ultraHistory'); renderHistory(); });

    // Buttons
    initButtons();

    // Convert
    el.langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        doConvert();
      });
    });
    el.convCurrSelect.addEventListener('change', doConvert);
    if (el.convInput) {
      el.convInput.addEventListener('input', doConvert);
    }
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-num') && state.mode === 'convert') {
        setTimeout(doConvert, 50);
      }
    });

    // Currency
    el.currAmount.addEventListener('input', doCurrency);
    el.currFrom.addEventListener('change', doCurrency);
    el.currTo.addEventListener('change', doCurrency);
    el.currSwap.addEventListener('click', () => {
      let tmp = el.currFrom.value; el.currFrom.value = el.currTo.value; el.currTo.value = tmp;
      doCurrency();
    });
    el.currRefresh.addEventListener('click', fetchRates);

    // Units
    el.unitsCategory.addEventListener('change', updateUnits);
    el.unitsFromVal.addEventListener('input', doConvertUnits);
    el.unitsFromUnit.addEventListener('change', doConvertUnits);
    el.unitsToUnit.addEventListener('change', doConvertUnits);
    el.unitsSwap.addEventListener('click', () => {
      let tmp = el.unitsFromUnit.value; el.unitsFromUnit.value = el.unitsToUnit.value; el.unitsToUnit.value = tmp;
      doConvertUnits();
    });

    // Graph
    el.graphPlotBtn.addEventListener('click', plotGraph);
    el.graphInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') plotGraph(); });

    // Age
    el.ageBtn.addEventListener('click', calculateAge);

    // Voice
    el.voiceRecordBtn.addEventListener('click', toggleVoice);
    el.voiceToggle.addEventListener('click', () => { switchMode('voice'); });

    // Commodity
    el.commodityRefresh.addEventListener('click', fetchCommodities);

    // Commodity modal close
    el.commModalClose.addEventListener('click', () => el.commModalOverlay.classList.remove('open'));
    el.commModalOverlay.addEventListener('click', (e) => {
      if (e.target === el.commModalOverlay) el.commModalOverlay.classList.remove('open');
    });

    // Display click to copy
    el.display.addEventListener('click', () => {
      let txt = getDisplay();
      if (txt && txt !== '0' && !txt.startsWith('🔢') && !txt.startsWith('🎂') && !txt.startsWith('📊') && !txt.startsWith('💰') && !txt.startsWith('📏') && !txt.startsWith('🎤') && !txt.startsWith('💎')) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(parseNum(txt).toString()).then(() => showToast('📋 تم النسخ')).catch(() => {});
        } else {
          showToast('📋 ' + txt);
        }
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') { handleValue(e.key); return; }
      if (e.key === '.') { handleValue('.'); return; }
      if (e.key === 'Enter' || e.key === '=') { if (['basic','sci','prog'].includes(state.mode)) evaluateExpression(); return; }
      if (e.key === 'Backspace') { handleAction('backspace'); return; }
      if (e.key === 'Escape') { handleAction('clear'); return; }
      if (e.key === '+' || e.key === '-') {
        if (e.key === '+' && !e.shiftKey) return;
        handleAction({'+':'add','-':'subtract'}[e.key === '+' ? '+' : '-']);
        return;
      }
    });

    // Default mode
    switchMode('basic');
    setDisplay('0');

    // Show version
    el.headerVer.textContent = 'v2.2';
    if (el.verDisplay) el.verDisplay.textContent = '2.2';

    // Initial currency fetch
    if (Object.keys(cachedRates).length > 0) {
      let age = Date.now() - ratesCacheTime;
      if (age > 3600000) fetchRates(); else { el.currRate.textContent = 'آخر تحديث: ' + new Date(parseInt(ratesCacheTime)).toLocaleTimeString('ar'); }
    } else {
      fetchRates();
    }
  }

  // ============ PUBLIC API ============
  return { init, setDisplay, doConvert, doCurrency, calculateAge, plotGraph, toggleVoice };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => Calc.init());
