(()=>{'use strict';
const chapters=[...document.querySelectorAll('[data-chapter]')];
const prevBtn=document.getElementById('prevBtn'),nextBtn=document.getElementById('nextBtn');
const indexEl=document.getElementById('currentNumber'),labelEl=document.getElementById('chapterLabel'),bar=document.getElementById('topProgress');
const toastNode=document.getElementById('toast');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const copyText=async text=>{
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}
    else{const tmp=document.createElement('textarea');tmp.value=text;tmp.setAttribute('readonly','');tmp.style.position='fixed';tmp.style.top='-1000px';document.body.append(tmp);tmp.select();const success=document.execCommand('copy');tmp.remove();if(!success)throw Error('Copy blocked')}
    toast('복사했습니다.');return true;
  }catch(e){toast('브라우저에서 복사가 제한되었습니다. 브라우저의 복사 기능을 이용해 주세요.');return false;}
};
function toast(msg){toastNode.textContent=msg;toastNode.classList.add('show');clearTimeout(toastNode.hideTimer);toastNode.hideTimer=setTimeout(()=>toastNode.classList.remove('show'),2800)}
let current=0,activeGoal='visit',activeStory='arrival',activeGuest='two',channel;
try{channel=new BroadcastChannel('geumgangsan-weplace-season90-r2')}catch(e){}
function publish(d){if(channel)channel.postMessage(d)}
function goChapter(index,behavior=reduced?'auto':'smooth'){
  const i=Math.max(0,Math.min(index,chapters.length-1));
  chapters[i].scrollIntoView({block:'start',behavior});
  setCurrent(i);
}
function setCurrent(i){if(i===current&&indexEl.dataset.ready)return;current=i;indexEl.dataset.ready='true';indexEl.textContent=String(i+1).padStart(2,'0');labelEl.textContent=chapters[i].dataset.label;bar.style.width=((i+1)/chapters.length*100)+'%';prevBtn.disabled=i===0;nextBtn.innerHTML=i===chapters.length-1?'처음으로 <span aria-hidden="true">↑</span>':'다음 <span aria-hidden="true">→</span>';publish({type:'chapter',index:i});}
prevBtn.addEventListener('click',()=>goChapter(current-1));nextBtn.addEventListener('click',()=>goChapter(current+1>=chapters.length?0:current+1));
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>goChapter(1)));
const io=new IntersectionObserver(entries=>{
  const candidates=entries.filter(e=>e.isIntersecting).map(e=>({i:chapters.indexOf(e.target),dist:Math.abs(e.boundingClientRect.top-96)})).sort((a,b)=>a.dist-b.dist);
  if(candidates.length)setCurrent(candidates[0].i);
},{rootMargin:'-15% 0px -57% 0px',threshold:0});
chapters.forEach(c=>io.observe(c));
const goals={
visit:{name:'매장 방문',desc:'첫 사진과 메뉴, 위치 안내를 정리해 검색 후 방문을 선택하는 과정을 점검합니다.',experiment:'플레이스 첫 화면·클립 장소 태그·길찾기 반응'},
takeout:{name:'포장 주문',desc:'인원별 구성과 가격, 주문 마감·픽업 안내를 명확히 하여 포장 선택을 쉽게 만듭니다.',experiment:'실제 판매 구성·주문 문의·픽업 안내의 망설임'},
basket:{name:'객단가 실험',desc:'매장 승인 메뉴를 바탕으로 구성 비교와 추가 옵션 제안을 시험하고 주문 반응을 봅니다.',experiment:'구성 비교·추가 메뉴 문의·실제 판매 기록 확인'}
};
function chooseGoal(key,broadcast=true){if(!goals[key])return;activeGoal=key;document.querySelectorAll('[data-goal]').forEach(btn=>{let active=btn.dataset.goal===key;btn.classList.toggle('is-selected',active);btn.setAttribute('aria-pressed',String(active))});document.getElementById('goalName').textContent=goals[key].name;document.getElementById('goalDesc').textContent=goals[key].desc;document.getElementById('finalGoal').textContent=goals[key].name;if(broadcast)publish({type:'goal',goal:key});}
document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>chooseGoal(b.dataset.goal)));
const stories={
 arrival:{tag:'YANGYANG / FIRST BITE',title:'양양에 왔는데,<br>오늘 뭐 먹지?',body:'첫 2초: 대게 클로즈업 → 매장 메뉴 → 방문 안내'},
 takeout:{tag:'TAKEOUT / EASY CHOICE',title:'두 명이 먹을<br>포장을 고른다면?',body:'인원별 구성 확인 → 주문 가능 여부 → 픽업 안내'},
 menu:{tag:'MENU / MADE CLEAR',title:'대게와 회,<br>어떤 조합이 좋을까?',body:'메뉴 실물 비교 → 구성·가격 확인 → 문의 행동'}
};
function chooseStory(key){if(!stories[key])return;activeStory=key;document.querySelectorAll('[data-story]').forEach(b=>{const a=b.dataset.story===key;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a))});document.getElementById('storyTag').textContent=stories[key].tag;document.getElementById('storyTitle').innerHTML=stories[key].title;document.getElementById('storyBody').textContent=stories[key].body;publish({type:'story',story:key});}
document.querySelectorAll('[data-story]').forEach(b=>b.addEventListener('click',()=>chooseStory(b.dataset.story)));
const guests={
 two:{title:'2인 기준 메뉴를 비교하기',desc:'가격·양·구성을 한눈에 확인하고 전화 문의로 연결하는 화면을 설계합니다.'},
 family:{title:'가족 인원에 맞춰 비교하기',desc:'매장에서 가능한 인원별 구성과 추가 메뉴 선택 기준을 함께 안내합니다.'},
 pack:{title:'픽업까지 한눈에 확인하기',desc:'실제 포장 가능 상품, 주문 마감, 준비 시간과 픽업 위치를 확인하도록 설계합니다.'}
};
function chooseGuest(key){if(!guests[key])return;activeGuest=key;document.querySelectorAll('[data-guest]').forEach(b=>{const a=b.dataset.guest===key;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a))});document.getElementById('guestTitle').textContent=guests[key].title;document.getElementById('guestDesc').textContent=guests[key].desc;publish({type:'guest',guest:key});}
document.querySelectorAll('[data-guest]').forEach(b=>b.addEventListener('click',()=>chooseGuest(b.dataset.guest)));
function summary(){return [
 '금강산대게횟집 × WEPLACE | SEASON 90 (R2)',
 '제안 일자: 2026.11 / 계약 체결 또는 동의 기록 아님','',
 '통화 중 선택한 우선 목표: '+goals[activeGoal].name,
 '이번 시즌 가설: '+goals[activeGoal].desc,
 '우선 점검 항목: '+goals[activeGoal].experiment,
 '콘텐츠 운영 재배치: 기존 블로그 양적 발행 일부를, 선별 검색형 콘텐츠·숏폼(릴스/클립)·매장 정보 정비와 연결하는 방향 검토',
 '계약비 방향: 기존 월 계약 금액 유지 제안 (정확한 금액은 기존 계약서 확인 전 미확정)',
 '진행 방식: 90일 단위 목표 설정 / 주간 실행 공유 / 월간 지표 점검 / 시즌 말 평가','',
 '합의 전 확인: 기존 계약·남은 이행 의무 / 채널별 월 제작량·업무 대체 / 촬영·광고·인쇄·실물 비용 / 메뉴·가격·포장 승인 / 담당자·보고일',
 '유의: 화면 선택은 통화용 임시 표시이며, 실제 성과 또는 계약 합의를 의미하지 않습니다.'
 ].join('\n')}
document.getElementById('copySummary').addEventListener('click',()=>copyText(summary()));
document.getElementById('copyShare').addEventListener('click',()=>{
 if(location.protocol==='file:'){toast('공유 주소는 Netlify에 배포한 다음 복사해 주세요.');return;}
 copyText(location.origin+location.pathname+'#intro');
});
document.addEventListener('keydown',e=>{
 const t=e.target;if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(t?.tagName)||t?.isContentEditable||e.altKey||e.ctrlKey||e.metaKey)return;
 if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();goChapter(current+1)}
 if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();goChapter(current-1)}
 if(e.key==='Home'){e.preventDefault();goChapter(0)}
 if(e.key==='End'){e.preventDefault();goChapter(chapters.length-1)}
});
if(channel)channel.addEventListener('message',e=>{const d=e.data||{};if(d.type==='goto'&&Number.isInteger(d.index))goChapter(d.index);if(d.type==='request'){publish({type:'chapter',index:current});publish({type:'goal',goal:activeGoal});}});
const initial=chapters.findIndex(c=>('#'+c.id)===location.hash);
if(initial>0){window.addEventListener('load',()=>goChapter(initial,'auto'),{once:true})}
setCurrent(initial>=0?initial:0);chooseGoal('visit',false);
})();
