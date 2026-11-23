(() => {
  'use strict';
  const data = {
    two: {label: '두 분이서', tag: 'FOR TWO', title: '두 분이 드실 메뉴부터.', desc: '선택할 수 있는 실제 메뉴와 가격을 한눈에 비교하도록 제안합니다.', image: 'assets/images/crab-table.webp', checks: ['메뉴·가격 확인', '구성·제공량 비교', '전화·길찾기 연결']},
    family: {label: '가족과', tag: 'FAMILY TABLE', title: '우리 가족이 고를 메뉴부터.', desc: '인원과 식사 목적에 맞는 실제 판매 구성을 비교하는 시안을 보여줍니다.', image: 'assets/images/seafood-selection.webp', checks: ['실제 인원·구성 확인', '운영 조건과 이용 안내', '매장 문의·길찾기 연결']},
    pack: {label: '포장으로', tag: 'PICKUP & GO', title: '포장까지 헷갈리지 않게.', desc: '포장 가능한 상품과 주문·픽업 안내를 매장에서 승인한 사실에 따라 정리합니다.', image: 'assets/images/crab-detail.webp', checks: ['포장 상품·가격 확인', '주문 마감·준비 시간', '실제 픽업·주문 채널']}
  };
  const $ = s => document.querySelector(s);
  const key = 'geumgangsan:r3.1:demo:' + new URL('.', location.href).pathname;
  const query = new URLSearchParams(location.search);
  let current = 'two', saved;
  try { saved = sessionStorage.getItem(key); } catch (_) {}
  function choose(id) {
    const value = data[id];
    if (!value) return;
    current = id;
    document.querySelectorAll('[data-demo]').forEach(b => { const active = b.dataset.demo === id; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    $('#demoTag').textContent = value.tag; $('#demoTitle').textContent = value.title; $('#demoDesc').textContent = value.desc;
    $('#demoPhoto').src = value.image; $('#demoPhoto').alt = value.label + ' 상황의 AI 음식 콘셉트 · 실제 매장 사진 아님';
    $('#demoChecklist').replaceChildren(...value.checks.map((text, i) => {
      const row = document.createElement('div'), label = document.createElement('span');
      label.textContent = text; row.append(String(i + 1).padStart(2, '0') + ' ', label); return row;
    }));
    try { sessionStorage.setItem(key, id); } catch (_) {}
  }
  document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => choose(b.dataset.demo)));
  const modal = $('#demoDialog');
  $('#demoAction').addEventListener('click', () => {
    const value = data[current];
    $('#modalTitle').textContent = value.label + ' · 선택 과정 시연';
    $('#modalSteps').replaceChildren(...value.checks.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    modal.showModal();
  });
  $('#modalClose').addEventListener('click', () => modal.close());
  $('#modalDone').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
    const r = modal.getBoundingClientRect();
    if (e.target === modal && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) modal.close();
  });
  const target = query.get('return') === 'closing' ? 'closing' : 'shift';
  document.querySelectorAll('[data-return-link]').forEach(a => { a.href = 'index.html#' + target; });
  const fromProposal = {trip: 'two', family: 'family', takeout: 'pack'}[query.get('persona')];
  choose(fromProposal || (Object.hasOwn(data, saved) ? saved : 'two'));
})();
