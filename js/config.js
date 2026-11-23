/*
  WEPLACE × GEUMGANGSAN — Season Experience R3
  Client-specific copy is separated from the interaction layer.
  Source: WEPLACE internal operating outline dated 2026-11-19; illustrative designs from R2;
  interaction patterns inspired by supplied littleforestyangyang-main.zip.
  All unconfirmed menus/prices/results must be approved before customer-facing use.
*/
window.GEUM_CONFIG = {
  revision:'R3 / 2026-11-23',
  perspectives:{
    guest:{meta:"A GUEST'S FIRST THOUGHT",quote:'“이 집이 좋다는 건 알겠는데, 우리 인원에 맞는 메뉴와 가격은 어디서 확인하지?”',after:'많은 정보를 올리는 것보다, 필요한 답을 먼저 보여주는 구조를 제안합니다.'},
    owner:{meta:"FROM THE OWNER'S POINT OF VIEW",quote:'“우리는 꾸준히 관리했는데, 손님들이 무엇을 보고 찾아오는지 더 정확히 알 수 없을까?”',after:'주간 실행과 고객 행동을 함께 보고, 다음에 바꿀 한 가지를 합의하는 방식으로 바꿉니다.'}
  },
  personas:{
    trip:{label:'양양 여행객',eyebrow:'TRAVEL / ARRIVAL',title:'양양에 도착했다면,\n오늘 어디서 먹을까?',subtitle:'먼저 먹고 싶은 메뉴가 보이고, 위치와 이용 정보를 쉽게 찾게 합니다.',image:'assets/images/seafood-selection.webp',steps:[
      {title:'먹고 싶은 장면을 처음에 보여줍니다.',body:'첫 사진·클립·메뉴의 시각적 정합성을 점검합니다.'},
      {title:'메뉴와 가격을 비교할 근거를 보여줍니다.',body:'확정 메뉴·판매 조건·구성 사진을 한 화면에서 확인하도록 설계합니다.'},
      {title:'위치·영업·주차 정보를 다시 찾지 않도록.',body:'플레이스와 홈페이지 등 채널 간 영업 정보 일치 여부를 점검합니다.'},
      {title:'망설임이 끝나는 곳에 길찾기·전화를 둡니다.',body:'클릭 반응과 매장에 확인 가능한 방문 경로를 구분해 봅니다.'}
    ]},
    family:{label:'가족 식사',eyebrow:'FAMILY / TABLE',title:'가족이 함께라면,\n인원과 구성이 먼저.',subtitle:'원하는 인원이 편하게 먹을 수 있는 구성을 빠르게 비교하게 합니다.',image:'assets/images/crab-table.webp',steps:[
      {title:'가족 상차림의 전체 인상을 보여줍니다.',body:'메뉴명보다 먼저 먹는 장면과 실제 제공량을 이해하도록.'},
      {title:'인원별 메뉴·구성의 차이를 설명합니다.',body:'실제 가능한 구성·추가 옵션·가격은 매장 확인 후 반영합니다.'},
      {title:'아이 동반·주차 등 중요한 질문에 답합니다.',body:'가능한 서비스만 확인해 정확한 안내에 포함합니다.'},
      {title:'문의 전에 질문을 정리해 드립니다.',body:'방문 인원·원하는 메뉴·필요한 이용 조건을 확인하게 합니다.'}
    ]},
    takeout:{label:'포장 손님',eyebrow:'TAKEOUT / PICKUP',title:'포장이라면,\n고르는 것부터 픽업까지.',subtitle:'포장 가능 상품·준비 시간·주문 방법을 손쉽게 확인하는 흐름입니다.',image:'assets/images/crab-detail.webp',steps:[
      {title:'포장 가능한 실제 상품을 먼저 보여줍니다.',body:'제공 가능한 사진만 사용하고 구성은 매장 승인 후 공개합니다.'},
      {title:'인원·구성·가격을 빠르게 비교하게 합니다.',body:'미확정 가격이나 가상의 세트는 실제 판매 상품처럼 표시하지 않습니다.'},
      {title:'준비 시간과 포장 보관 안내를 명확히 합니다.',body:'주문 마감·픽업 위치·보관 조건을 현장 확인 후 기재합니다.'},
      {title:'실제 가능한 주문 채널로 연결합니다.',body:'매장 승인된 전화·주문 링크만 활성화하고 허위 주문 접수는 만들지 않습니다.'}
    ]}
  },
  goals:{
    visit:{name:'매장 방문',action:'첫 사진·메뉴·위치 안내를 한 흐름으로 연결합니다.',metric:'길찾기·전화 행동과 매장 방문 확인 가능 데이터를 구분합니다.',next:'플레이스 상단·클립 장소 정보·위치 안내 점검'},
    takeout:{name:'포장 주문',action:'포장 구성·주문 마감·픽업 정보를 찾아보기 쉽게 정비합니다.',metric:'주문 문의, 실제 접수, 확인 가능한 포장 매출을 구분합니다.',next:'포장 판매 품목·가격·주문 경로·픽업 조건 승인'},
    basket:{name:'객단가 실험',action:'실제 판매 메뉴의 구성 비교와 추가 옵션 안내를 실험합니다.',metric:'구성별 문의, 객단가·주문 수의 실제 기록을 비교합니다.',next:'POS·메뉴별 주문 기록과 상품 조합 가능성 확인'}
  },
  stories:{
    arrival:{tag:'DISCOVER / YANGYANG',title:'양양에 왔는데,\n오늘은 뭐 먹지?',subtitle:'메뉴 확인 → 길찾기',image:'assets/images/crab-table.webp',shots:'0–2초 · 대게 클로즈업\n2–6초 · 실제 메뉴 구성 확인\n6–10초 · 위치와 방문 정보'},
    takeout:{tag:'PICKUP / THE EASY WAY',title:'포장하려면,\n무엇부터 고르지?',subtitle:'상품 확인 → 주문 문의 → 픽업',image:'assets/images/seafood-selection.webp',shots:'0–2초 · 포장된 음식의 클로즈업\n2–6초 · 인원별 구성·주문 조건\n6–10초 · 주문 채널과 픽업 안내'},
    menu:{tag:'CHOOSE / TABLE FOR TWO',title:'대게와 회,\n어떻게 골라야 할까?',subtitle:'구성 비교 → 문의 행동',image:'assets/images/crab-detail.webp',shots:'0–2초 · 음식의 질감과 세부 장면\n2–6초 · 실제 메뉴·추가 선택 비교\n6–10초 · 가격·문의 경로 안내'}
  },
  confirmedBoundaries:{
    price:'기존 월 계약 금액 유지 방향의 재계약 제안. 실제 계약 금액과 기존 이행 의무는 계약서 확인 전 미확정.',
    blog:'기존 블로그 작업량 일부 재배치에 관해서는 양측의 변경 합의가 먼저 필요합니다.',
    assets:'제안 이미지 전부 AI 콘셉트. 실제 메뉴·매장 촬영본 및 권리 확인 후 교체.',
    performance:'매출 증가·검색 노출·주문 수 보장 없음. 실적 증빙은 별도.',
    display:'이 페이지에서의 선택은 통화 시연이며 주문·계약·개인정보 전송이 아닙니다.'
  }
};
