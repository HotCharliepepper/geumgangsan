(() => {
  'use strict';
  const d = document;
  const C = window.GEUM_CONFIG;
  if (!C) return;
  const $ = s => d.querySelector(s);
  const $$ = s => Array.from(d.querySelectorAll(s));
  const put = (id, value) => { d.getElementById(id).textContent = value; };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = $$('[data-scene]');
  const storageKey = 'geumgangsan:r3.1:' + new URL('.', location.href).pathname;
  const state = {scene: 0, perspective: 'guest', persona: 'trip', step: 0, goal: 'visit', story: 'arrival'};
  const calcIDs = ['calcTicket', 'calcOrders', 'calcDays'];
  let restored;
  try { restored = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch (_) { /* private/file mode */ }
  if (restored && typeof restored === 'object') {
    for (const [key, options] of Object.entries({perspective: C.perspectives, persona: C.personas, goal: C.goals, story: C.stories})) {
      if (Object.hasOwn(options, restored[key])) state[key] = restored[key];
    }
    if (Number.isInteger(restored.step) && restored.step >= 0 && restored.step < 4) state.step = restored.step;
    calcIDs.forEach(id => { if (typeof restored.calc?.[id] === 'string' && restored.calc[id].length < 30) $('#' + id).value = restored.calc[id]; });
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({...state, calc: Object.fromEntries(calcIDs.map(id => [id, $('#' + id).value]))})); } catch (_) { /* interactions still work without storage */ }
  }
  let channel;
  try { channel = new BroadcastChannel('geumgangsan-weplace-seasonexperience-r3-1'); } catch (_) { /* optional presenter sync */ }
  const send = value => { try { channel?.postMessage(value); } catch (_) {} };
  function select(group, key) {
    $$('[data-' + group + ']').forEach(button => {
      const on = button.dataset[group] === String(key);
      button.classList.toggle('selected', on);
      button.setAttribute('aria-pressed', String(on));
    });
  }
  function demoLinks() {
    $$('[data-demo-link]').forEach(a => {
      const query = new URLSearchParams({persona: state.persona, return: a.dataset.return});
      a.href = 'experience.html?' + query.toString();
    });
  }
  function choosePerspective(key) {
    const value = C.perspectives[key];
    if (!value) return;
    state.perspective = key;
    select('perspective', key);
    put('perspectiveMeta', value.meta); put('perspectiveQuote', value.quote); put('perspectiveAfter', value.after);
    send({type: 'perspective', value: key}); save();
  }
  function renderStep() {
    const value = C.personas[state.persona].steps[state.step];
    select('step', state.step);
    put('stepHeadline', value.title); put('stepDescription', value.body);
    put('stepNext', state.step === 3 ? '첫 단계 다시 보기 ↻' : '다음 단계 보기 →');
    send({type: 'step', value: state.step}); save();
  }
  function choosePersona(key, keepStep = false) {
    const value = C.personas[key];
    if (!value) return;
    state.persona = key;
    if (!keepStep) state.step = 0;
    select('persona', key);
    put('personaEyebrow', value.eyebrow); put('personaTitle', value.title); put('personaSub', value.subtitle);
    $('#journeyImage').src = value.image;
    $('#journeyImage').alt = value.label + ' 상황을 위한 AI 음식 콘셉트 · 실제 매장 사진 아님';
    put('closingPersona', value.label);
    demoLinks(); renderStep(); send({type: 'persona', value: key});
  }
  function chooseGoal(key) {
    const value = C.goals[key];
    if (!value) return;
    state.goal = key; select('goal', key);
    put('chosenGoalName', value.name); put('chosenGoalAction', value.action); put('chosenGoalMetric', value.metric); put('closingGoal', value.name);
    send({type: 'goal', value: key}); save();
  }
  function chooseStory(key) {
    const value = C.stories[key];
    if (!value) return;
    state.story = key; select('story', key);
    put('studioTag', value.tag); put('studioTitle', value.title); put('studioSubtitle', value.subtitle); put('shotList', value.shots);
    $('#studioImage').src = value.image;
    $('#studioImage').alt = value.title.replace('\n', ' ') + ' · AI 콘티 이미지, 실제 영상 아님';
    send({type: 'story', value: key}); save();
  }
  $$('[data-perspective]').forEach(b => b.addEventListener('click', () => choosePerspective(b.dataset.perspective)));
  $$('[data-persona]').forEach(b => b.addEventListener('click', () => choosePersona(b.dataset.persona)));
  $$('[data-goal]').forEach(b => b.addEventListener('click', () => chooseGoal(b.dataset.goal)));
  $$('[data-story]').forEach(b => b.addEventListener('click', () => chooseStory(b.dataset.story)));
  $$('[data-step]').forEach(b => b.addEventListener('click', () => { state.step = Number(b.dataset.step); renderStep(); }));
  $('#stepNext').addEventListener('click', () => { state.step = (state.step + 1) % 4; renderStep(); });
  const won = n => n.toLocaleString('ko-KR') + '원';
  let calculationValid = true;
  function calculate() {
    const names = ['평균 주문 금액', '하루 추가 주문 수', '한 달 영업일'];
    const invalid = [];
    const values = calcIDs.map((id, i) => {
      const el = $('#' + id), n = el.valueAsNumber;
      const valid = el.value.trim() !== '' && Number.isFinite(n) && Number.isInteger(n) && n >= Number(el.min) && n <= Number(el.max);
      el.setAttribute('aria-invalid', String(!valid));
      if (!valid) invalid.push(names[i]);
      return n;
    });
    calculationValid = invalid.length === 0;
    $('#calcError').hidden = calculationValid;
    put('calcError', calculationValid ? '' : invalid.join(' · ') + ': 안내된 범위의 정수를 입력해주세요.');
    if (calculationValid) {
      const [avg, orders, days] = values, gross = avg * orders * days;
      put('calcTotal', won(gross)); put('calcFormula', won(avg) + ' × ' + orders + '건 × ' + days + '일');
      send({type: 'scenario', value: {avg, orders, days, gross}});
    } else {
      put('calcTotal', '입력을 확인해주세요'); put('calcFormula', '유효한 가정값을 입력하면 계산합니다.');
      send({type: 'scenario', value: null});
    }
    save();
  }
  calcIDs.forEach(id => $('#' + id).addEventListener('input', calculate));
  let toastTimer;
  function toast(text) { put('toast', text); $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500); }
  function summary() {
    const goal = C.goals[state.goal];
    return [
      '금강산대게횟집 × WEPLACE | 다음 90일 · R3.1',
      '미팅용 협의안 · 계약 및 매장 승인 전 / 2026-11-23', '',
      '선택한 우선 목표: ' + goal.name,
      '중점 고객 상황: ' + C.personas[state.persona].label,
      '시즌 가설: ' + goal.action,
      '확인할 반응: ' + goal.metric,
      '첫 실행: ' + goal.next,
      '선택한 콘티: ' + C.stories[state.story].title.replace('\n', ' '), '',
      '가격 방향: 기존 월 계약 금액 유지 제안 (금액·기존 잔여 의무 확인 전)',
      '운영 방식: 90일 단위 운영, 주간 공유, 월간 리뷰 제안 (계약 기간·담당자·주기 협의 전)',
      '협의할 범위: 기존 블로그 의무·대체 합의, 월 제작량, 홈페이지/GEO, 광고비·촬영·도메인·실물비',
      calculationValid ? '가정 계산: ' + $('#calcFormula').textContent + ' = ' + $('#calcTotal').textContent + ' (비용 차감 전, 예측·보장 아님)' : '가정 계산: 입력 미완료 또는 범위 오류로 계산하지 않음',
      '확인할 자료: 원본 계약서, 이행 실적, 실제 메뉴·가격, 촬영 동의, 실제 주문 자료', '',
      '※ 선택은 이 탭의 임시 메모이며, 주문·계약·외부 전송이 발생하지 않습니다.'
    ].join('\n');
  }
  async function copyBrief() {
    const value = summary();
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(value); copied = true; } catch (_) { /* try legacy local file copy */ }
    }
    if (!copied) {
      const field = d.createElement('textarea');
      field.value = value; field.setAttribute('aria-label', '논의 요약 복사');
      field.style.cssText = 'position:fixed;top:0;left:-9999px';
      d.body.append(field);
      try { field.select(); copied = d.execCommand('copy'); } catch (_) {} finally { field.remove(); $('#copyBrief').focus({preventScroll: true}); }
    }
    if (copied) toast('선택 요약을 복사했습니다.');
    else { $('#briefText').value = value; $('#briefDialog').showModal(); $('#briefText').focus(); $('#briefText').select(); }
  }
  $('#copyBrief').addEventListener('click', copyBrief);
  $('#selectBrief').addEventListener('click', () => { $('#briefText').focus(); $('#briefText').select(); });
  $$('[data-close-dialog]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  }));
  // Scene navigation never intercepts a form, link, dialog or native control.
  let scrollFrame = 0, scrollTimer, targetScene = null;
  function setCurrent(index) {
    state.scene = index;
    put('sceneNum', String(index + 1).padStart(2, '0')); put('sceneName', scenes[index].dataset.label);
    $('#prevScene').disabled = index === 0;
    const last = index === scenes.length - 1;
    put('nextScene', last ? '처음으로 ↑' : '다음 →');
    $('#nextScene').setAttribute('aria-label', last ? '첫 장면으로' : '다음 장면');
    $('#scenePicker').setAttribute('aria-label', `${index + 1} / ${scenes.length} · ${scenes[index].dataset.label} · 장면 목록 열기`);
    $$('[data-goto]').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.goto) === index)));
    send({type: 'scene', index});
  }
  function progress() {
    scrollFrame = 0;
    const root = d.documentElement, max = Math.max(1, root.scrollHeight - root.clientHeight);
    $('#readProgress').style.width = Math.max(0, Math.min(100, window.scrollY / max * 100)) + '%';
    if (targetScene !== null) return;
    const marker = $('.topbar').getBoundingClientRect().bottom + (window.innerHeight - 140) * .27;
    let index = 0;
    scenes.forEach((scene, i) => { if (scene.getBoundingClientRect().top <= marker) index = i; });
    if (index !== state.scene) setCurrent(index);
  }
  function finishScroll() { targetScene = null; progress(); }
  function go(index, instant = false) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    targetScene = index; setCurrent(index);
    try { history.replaceState(null, '', '#' + scenes[index].id); } catch (_) {}
    scenes[index].scrollIntoView({block: 'start', behavior: instant || motion.matches ? 'instant' : 'smooth'});
    clearTimeout(scrollTimer); scrollTimer = setTimeout(finishScroll, 700);
  }
  scenes.forEach((scene, index) => {
    const b = d.createElement('button'), n = d.createElement('span');
    b.type = 'button'; b.dataset.goto = index; n.textContent = String(index + 1).padStart(2, '0');
    b.append(n, d.createTextNode(scene.dataset.label));
    b.addEventListener('click', () => { $('#sceneDialog').close(); go(index); });
    $('#sceneLinks').append(b);
  });
  $('#scenePicker').addEventListener('click', () => { $('#sceneDialog').showModal(); $(`[data-goto="${state.scene}"]`).focus(); });
  $('#prevScene').addEventListener('click', () => go(state.scene - 1));
  $('#nextScene').addEventListener('click', () => go(state.scene === scenes.length - 1 ? 0 : state.scene + 1));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const index = scenes.findIndex(s => '#' + s.id === a.getAttribute('href'));
    if (index < 0) return;
    e.preventDefault(); go(index);
    if (a.classList.contains('skip')) { scenes[index].tabIndex = -1; scenes[index].focus({preventScroll: true}); }
  }));
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(progress); clearTimeout(scrollTimer); scrollTimer = setTimeout(finishScroll, 140); }, {passive: true});
  window.addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(progress); });
  window.addEventListener('wheel', () => { targetScene = null; }, {passive: true});
  window.addEventListener('touchstart', () => { targetScene = null; }, {passive: true});
  window.addEventListener('hashchange', () => { const i = scenes.findIndex(s => '#' + s.id === location.hash); if (i >= 0) go(i); });
  d.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || d.querySelector('dialog[open]') || e.target?.isContentEditable || e.target?.closest('input,textarea,select,button,a,[role="slider"]')) return;
    const moves = {ArrowRight: state.scene + 1, PageDown: state.scene + 1, ArrowLeft: state.scene - 1, PageUp: state.scene - 1, Home: 0, End: scenes.length - 1};
    if (Object.hasOwn(moves, e.key)) { e.preventDefault(); go(moves[e.key]); }
  });
  if (channel) channel.addEventListener('message', event => {
    const m = event.data || {};
    if (m.type === 'goto' && Number.isInteger(m.index)) go(m.index);
    if (m.type === 'request') ['scene', 'goal', 'persona', 'story'].forEach(type => send(type === 'scene' ? {type, index: state.scene} : {type, value: state[type]}));
  });
  choosePerspective(state.perspective); choosePersona(state.persona, true); chooseGoal(state.goal); chooseStory(state.story); calculate();
  const initial = scenes.findIndex(s => '#' + s.id === location.hash);
  setCurrent(initial >= 0 ? initial : 0);
  window.addEventListener('load', () => { if (initial >= 0) go(initial, true); else progress(); }, {once: true});
  window.addEventListener('pageshow', progress);
})();
