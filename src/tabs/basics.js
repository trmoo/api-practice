/*! ==========================================================================
 * basics.js — 탭① 「요청과 응답」 네 화면
 *
 *   1 first  첫 요청      — 주소를 부르면 JSON이 온다
 *   2 url    주소 해부기  — 주소가 곧 요청이다
 *   3 param  파라미터 실험실 — 값을 바꾸면 답이 바뀐다
 *   4 json   JSON 탐험기  — 깊이 들어간 값을 꺼내는 길
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import {
  h, add, clear, card, pageHead, note, button, mono, details,
} from '../lib/ui.js';
import {
  주소보이기, 파라미터표, 요청상자, 고르기문제, 코드빈칸문제, 코드보기, 연습알림,
} from '../lib/req.js';
import { 주소분해, 인코딩낱낱이 } from '../lib/url.js';
import { 나무그리기, 경로표시줄, 예쁘게, 값꺼내기 } from '../lib/json.js';
import * as api from '../lib/api.js';
import { 주소퀴즈, 코드빈칸 } from '../data/quiz.js';

const 빈칸찾기 = (키) => 코드빈칸.find((q) => q.키 === 키);

/* ══════════════════════ 화면 1 — 첫 요청 ══════════════════════════════ */

export function first(host) {
  add(host, [
    pageHead('첫 요청 — 주소를 부르면 JSON이 온다',
      '단추를 한 번 누르는 것으로 시작합니다. 무슨 일이 일어나는지 먼저 눈으로 보세요.'),
    연습알림(api.받은날),
  ]);

  let 고른것 = 'dog';
  const 고르는칸 = h('div', { class: 'cards' });
  const 요청자리 = h('div', {});

  const 거리들 = [
    { 키: 'dog', 이름: '🐕 강아지 사진', 설명: 'dog.ceo — 가장 단순한 API' },
    { 키: 'weather', 이름: '🌤 서울 날씨', 설명: 'open-meteo — 지금 기온' },
    { 키: 'wiki', 이름: '📖 위키백과 요약', 설명: 'ko.wikipedia.org — 「인공지능」' },
  ];

  거리들.forEach((it) => {
    const 카드 = h('button', {
      class: `pickcard ${it.키 === 고른것 ? 'on' : ''}`.trim(), type: 'button',
      onclick: () => {
        고른것 = it.키;
        [...고르는칸.children].forEach((c) => c.classList.remove('on'));
        카드.classList.add('on');
      },
    }, h('b', {}, it.이름), h('small', {}, it.설명));
    고르는칸.append(카드);
  });

  const 틀 = 요청상자(
    () => {
      if (고른것 === 'dog') return api.강아지();
      if (고른것 === 'weather') return api.날씨('서울', ['temperature_2m'], true);
      return api.위키('인공지능');
    },
    (결과, 담을곳) => {
      if (!결과.본문) return;
      담을곳.append(결과보이기(고른것, 결과.본문));
      담을곳.append(details('받은 JSON 원문 보기',
        h('pre', { class: 'code' }, 예쁘게(결과.본문))));
    },
    { 단추말: '요청 보내기', 큰단추: true, 단계보이기: true },
  );
  요청자리.append(틀.상자);

  add(host, [
    card('① 무엇을 물어볼지 고르세요', 고르는칸),
    card('② 요청을 보내세요', 요청자리),
    card('여기서 알아 둘 것',
      note('info',
        h('p', {}, h('b', {}, 'API 는 「프로그램이 부를 수 있는 주소」다.')),
        h('p', {}, '사람이 보는 웹페이지는 꾸밈(글꼴·색·그림)이 잔뜩 붙어 있다. '
          + 'API 는 꾸밈 없이 자료만 JSON 이라는 형식으로 돌려준다. '
          + '그래서 프로그램이 바로 꺼내 쓸 수 있다.')),
      note('warn',
        h('p', {}, h('b', {}, '⚠ 응답이 오는 데 시간이 걸린다.')),
        h('p', {}, '내 컴퓨터 안의 계산과 달리, 요청은 인터넷을 건너 남의 서버까지 갔다 온다. '
          + '위의 「걸린 시간」을 보라. 그래서 코드에 await 가 붙는다.')),
      details('🔬 더 깊이 — JSON 은 무엇인가',
        h('p', {}, 'JSON(제이슨)은 자료를 글로 적는 약속이다. 중괄호 { } 는 「이름표가 붙은 묶음」, '
          + '대괄호 [ ] 는 「차례가 있는 목록」이다.'),
        코드보기('같은 자료를 파이썬으로 적으면', [
          '{ "이름": "와우고등학교", "학년수": 3, "공학": true }',
          '',
          '# 파이썬의 딕셔너리와 모양이 거의 같다.',
          '# 다른 점 — JSON 은 참/거짓을 true/false 로 쓴다 (파이썬은 True/False).',
        ].join('\n')))),
  ]);
}

/** 고른 거리에 맞게 사람이 볼 모양으로 그린다 */
function 결과보이기(고른것, 본문) {
  if (고른것 === 'dog') {
    const 주소 = 본문?.message;
    if (!주소) return note('bad', '사진 주소를 찾지 못했습니다.');
    return h('div', {},
      h('div', { class: 'imgbox' }, h('img', { src: 주소, alt: '강아지 사진' })),
      note('info', '이 사진은 응답 안의 ', mono('message'), ' 값에 적힌 주소입니다. '
        + 'API 가 사진 자체를 준 것이 아니라 「사진이 있는 곳」을 알려 준 것입니다.'));
  }
  if (고른것 === 'weather') {
    const 값 = 본문?.current?.temperature_2m;
    const 단위 = 본문?.current_units?.temperature_2m || '';
    return h('div', {},
      h('p', { class: 'big' }, `${값 ?? '?'}${단위}`),
      note('info', '이 숫자는 ', mono('데이터.current.temperature_2m'), ' 에서 꺼냈습니다. '
        + `시각은 ${본문?.current?.time ?? '?'} (${본문?.timezone ?? '?'}) 기준입니다.`));
  }
  const 요약 = 본문?.extract;
  return h('div', {},
    h('p', {}, h('b', {}, 본문?.title || '(제목 없음)')),
    h('p', {}, 요약 || '(요약이 없습니다)'),
    note('info', '이 글은 응답 안의 ', mono('extract'), ' 값입니다.'),
    // ⚠ 위키백과 글은 남의 저작물이다(CC BY-SA 4.0). 출처를 화면에 밝힌다.
    note('warn', '📖 이 요약문은 한국어 위키백과 「', 본문?.title || '', '」 문서에서 온 것이며 '
      + '저희가 쓴 글이 아닙니다. CC BY-SA 4.0 으로 배포되는 자료입니다.'));
}

/* ══════════════════════ 화면 2 — 주소 해부기 ═════════════════════════ */

export function url(host) {
  const 처음주소 = 'https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=5&SCHUL_NM=와우';

  add(host, [
    pageHead('주소 해부기 — 주소가 곧 요청이다',
      '주소를 고쳐 보세요. 조각마다 하는 일이 다릅니다.'),
  ]);

  const 입력 = h('input', {
    type: 'text', value: 처음주소, style: { width: '100%' },
    'aria-label': '살펴볼 주소',
  });
  const 보이는자리 = h('div', {});
  const 표자리 = h('div', {});

  function 다시() {
    clear(보이는자리); clear(표자리);
    const 주소글 = 입력.value;
    보이는자리.append(주소보이기(주소글));
    const 쪼갬 = 주소분해(주소글);
    if (!쪼갬.성공) {
      표자리.append(note('bad', '주소로 읽히지 않습니다. https:// 로 시작하는지 확인해 보세요.'));
      return;
    }
    표자리.append(h('table', { class: 'tbl' },
      h('tbody', {},
        줄('프로토콜', 쪼갬.프로토콜, '어떤 방식으로 말할지. https 는 암호를 걸어 주고받는다.'),
        줄('호스트', 쪼갬.호스트, '어느 컴퓨터에 물어볼지.'),
        줄('경로', 쪼갬.경로, '그 컴퓨터 안에서 어느 창구인지.'),
        줄('쿼리스트링', 쪼갬.쿼리글 || '(없음)', '창구에 건네는 조건. ? 뒤에 & 로 이어 붙인다.'))));
    표자리.append(h('h4', {}, '파라미터 하나하나'));
    표자리.append(파라미터표(주소글));
  }
  입력.addEventListener('input', 다시);

  const 인코딩자리 = h('div', {});
  const 인코딩입력 = h('input', { type: 'text', value: '와우', 'aria-label': '인코딩해 볼 글자' });
  function 인코딩다시() {
    clear(인코딩자리);
    const 글 = 인코딩입력.value;
    if (!글) { 인코딩자리.append(note('info', '글자를 넣어 보세요.')); return; }
    인코딩자리.append(h('div', { class: 'urlbox' },
      h('span', { class: 'u-key' }, 'SCHUL_NM='),
      h('span', { class: 'u-val' }, encodeURIComponent(글))));
    const 표 = h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {},
        h('th', {}, '글자'), h('th', {}, 'UTF-8 바이트'), h('th', {}, '주소에 적히는 모습'))));
    const 몸 = h('tbody', {});
    인코딩낱낱이(글).forEach((조각) => {
      몸.append(h('tr', {},
        h('td', {}, h('b', {}, 조각.글자)),
        h('td', {}, mono(조각.십육진.join(' '))),
        h('td', {}, 조각.바뀌었나 ? mono(조각.바뀐것) : h('span', { class: 'dim' }, '그대로'))));
    });
    표.append(몸);
    인코딩자리.append(h('div', { class: 'scroll-x' }, 표));
  }
  인코딩입력.addEventListener('input', 인코딩다시);

  add(host, [
    card('주소를 고쳐 보세요',
      입력,
      h('div', { style: { height: '10px' } }),
      보이는자리,
      표자리),
    card('한글은 왜 %EC%99%80 가 될까',
      h('p', {}, '주소에는 영문·숫자와 몇몇 기호만 쓸 수 있다고 약속되어 있습니다. '
        + '그래서 한글은 UTF-8 바이트로 바꾼 뒤 바이트마다 % 를 붙여 적습니다.'),
      h('div', { class: 'row' }, h('b', {}, '넣어 볼 글자:'), 인코딩입력),
      인코딩자리,
      note('info', '한글 한 글자는 UTF-8 에서 보통 3바이트라, ', mono('%XX'),
        ' 가 세 번 이어 붙습니다. 「와」 → ', mono('%EC%99%80'), ' 처럼요.')),
    card('확인 문제', ...주소퀴즈.map((문제) => h('div', { style: { marginBottom: '20px' } },
      고르기문제(문제, { 덧붙임: 주소보이기(문제.주소) })))),
  ]);
  다시();
  인코딩다시();

  function 줄(이름, 값, 설명) {
    return h('tr', {},
      h('th', { style: { width: '130px' } }, 이름),
      h('td', {}, mono(값)),
      h('td', { class: 'dim' }, 설명));
  }
}

/* ══════════════════════ 화면 3 — 파라미터 실험실 ═════════════════════ */

export function param(host) {
  add(host, [
    pageHead('파라미터 실험실 — 값을 바꾸면 답이 바뀐다',
      '아래를 고를 때마다 주소가 다시 만들어집니다. 무엇이 달라지는지 보세요.'),
    연습알림(api.받은날),
  ]);

  const 항목목록 = [
    ['temperature_2m', '기온'],
    ['relative_humidity_2m', '습도'],
    ['wind_speed_10m', '풍속'],
    ['precipitation', '강수량'],
  ];

  let 도시 = '서울';
  const 고른항목 = new Set(['temperature_2m']);
  let 시간대붙이기 = true;

  const 주소자리 = h('div', {});
  const 요청자리 = h('div', {});

  const 도시고르기 = h('select', { 'aria-label': '도시', onchange: (e) => { 도시 = e.target.value; 주소다시(); } });
  Object.keys(api.도시좌표).forEach((이름) => {
    도시고르기.append(h('option', { value: 이름, selected: 이름 === 도시 }, 이름));
  });

  const 항목칸 = h('div', { class: 'row' });
  항목목록.forEach(([열쇠, 이름]) => {
    const 체크 = h('input', { type: 'checkbox', checked: 고른항목.has(열쇠) });
    체크.addEventListener('change', () => {
      if (체크.checked) 고른항목.add(열쇠); else 고른항목.delete(열쇠);
      주소다시();
    });
    항목칸.append(h('label', { class: 'check' }, 체크, `${이름} (${열쇠})`));
  });

  const 시간대체크 = h('input', { type: 'checkbox', checked: true });
  시간대체크.addEventListener('change', () => { 시간대붙이기 = 시간대체크.checked; 주소다시(); });

  const 틀 = 요청상자(
    () => api.날씨(도시, [...고른항목], 시간대붙이기),
    (결과, 담을곳) => {
      if (!결과.본문) return;
      const 지금 = 결과.본문.current || {};
      const 단위 = 결과.본문.current_units || {};
      const 표 = h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, h('th', {}, '항목'), h('th', {}, '값'), h('th', {}, '경로'))));
      const 몸 = h('tbody', {});
      Object.entries(지금).forEach(([열쇠, 값]) => {
        몸.append(h('tr', {},
          h('td', {}, 열쇠),
          h('td', {}, h('b', {}, `${값}${단위[열쇠] && 열쇠 !== 'time' ? ` ${단위[열쇠]}` : ''}`)),
          h('td', {}, mono(`데이터.current.${열쇠}`))));
      });
      표.append(몸);
      담을곳.append(h('div', { class: 'scroll-x' }, 표));
      담을곳.append(note('info', `시간대: ${결과.본문.timezone} — `
        + (결과.본문.timezone === 'GMT'
          ? '시간대를 안 붙였더니 세계 표준시로 왔습니다. 한국 시각보다 9시간 이릅니다.'
          : '시간대를 붙였더니 한국 시각으로 왔습니다.')));
      담을곳.append(details('받은 JSON 원문 보기', h('pre', { class: 'code' }, 예쁘게(결과.본문))));
    },
    { 단추말: '이 주소로 보내기' },
  );
  요청자리.append(틀.상자);

  function 주소다시() {
    clear(주소자리);
    if (!고른항목.size) {
      주소자리.append(note('warn', '항목을 하나도 안 골랐습니다. 서버는 무엇을 달라는지 알 수 없습니다.'));
      return;
    }
    const spec = api.날씨(도시, [...고른항목], 시간대붙이기);
    주소자리.append(주소보이기(spec.주소));
    주소자리.append(파라미터표(spec.주소));
  }

  add(host, [
    card('① 조건을 고르세요',
      h('div', { class: 'row' }, h('b', {}, '도시:'), 도시고르기),
      h('div', { style: { height: '8px' } }),
      h('div', {}, h('b', {}, '받을 항목:'), 항목칸),
      h('div', { style: { height: '8px' } }),
      h('label', { class: 'check' }, 시간대체크, '한국 시간대로 받기 (timezone=Asia/Seoul)')),
    card('② 이렇게 주소가 만들어집니다', 주소자리),
    card('③ 보내 보세요', 요청자리),
    card('코드로 쓰면',
      코드빈칸문제(빈칸찾기('blank-fetch-js')),
      h('hr', { style: { border: 0, borderTop: '1px solid var(--line)', margin: '22px 0' } }),
      코드빈칸문제(빈칸찾기('blank-requests-py'))),
  ]);
  주소다시();
}

/* ══════════════════════ 화면 4 — JSON 탐험기 ════════════════════════ */

export function json(host) {
  add(host, [
    pageHead('JSON 탐험기 — 값을 꺼내는 길 찾기',
      '받은 JSON 에서 값을 누르면, 그 값을 꺼내는 「경로」가 아래에 적힙니다.'),
    연습알림(api.받은날),
  ]);

  let 응답 = null;
  const 나무자리 = h('div', {});
  const 경로자리 = h('div', {});

  const 틀 = 요청상자(
    () => api.날씨('서울', ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m'], true),
    (결과, 담을곳) => {
      응답 = 결과.본문;
      담을곳.append(note('ok', '아래 나무에서 값을 눌러 보세요.'));
      나무다시();
    },
    { 단추말: '날씨를 받아 오기' },
  );

  function 나무다시(짚은경로 = null) {
    clear(나무자리); clear(경로자리);
    if (!응답) {
      나무자리.append(note('info', '먼저 위에서 [날씨를 받아 오기] 를 눌러 주세요.'));
      return;
    }
    나무자리.append(나무그리기(응답, {
      열림깊이: 2,
      짚은경로,
      눌리면: (경로) => 나무다시(경로),
    }));
    경로자리.append(경로표시줄(짚은경로, 짚은경로 ? 값꺼내기(응답, 짚은경로) : undefined));
  }

  add(host, [
    card('① 응답을 받아 오세요', 틀.상자),
    card('② 값을 눌러 경로를 찾으세요',
      나무자리,
      경로자리,
      note('info',
        h('p', {}, h('b', {}, '읽는 법 — 바깥에서 안으로 한 겹씩 들어간다.')),
        h('p', {}, mono('데이터.current.temperature_2m'), ' 는 '
          + '「데이터 안의 current 안의 temperature_2m」이라는 뜻입니다.'),
        h('p', {}, '목록(대괄호 [ ])은 이름 대신 번호로 들어갑니다. 번호는 ',
          h('b', {}, '0부터'), ' 셉니다.'))),
    card('한 걸음 더 — 깊이 들어간 값 꺼내기',
      코드빈칸문제(빈칸찾기('blank-path'))),
  ]);
  나무다시();
}
