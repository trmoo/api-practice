/*! ==========================================================================
 * onevalue.js — 화면 2 「값 하나만 바꿔 보기」
 *
 * ★ 파라미터 개념의 도입부. 이 앱에서 가장 쉬운 화면이다.
 *   에듀넷 주제별 학습자료 API 는 요청 변수가 clss_id 하나뿐이라,
 *   「숫자 하나를 바꾸면 결과가 통째로 바뀐다」를 가장 선명하게 보여 준다.
 *
 * ⚠ 이 API 는 브라우저에서 직접 못 부른다 (2026-08-30 확인)
 *   ① Access-Control-Allow-Origin 헤더가 오지 않는다 → 브라우저가 막는다
 *   ② 파일이 1.1~6.0MB 라 한 반이 동시에 받으면 학교망이 버티지 못한다
 *   그래서 화면은 담아 둔 자료로 돌리되, [진짜로 불러 보기] 단추로
 *   막히는 것을 직접 보여 주고 그 까닭을 가르친다. 감추지 않는다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import {
  h, add, clear, card, pageHead, note, button, mono, details,
} from '../lib/ui.js';
import { 고르기문제, 코드보기 } from '../lib/req.js';
import * as api from '../lib/api.js';
import { 에듀넷퀴즈 } from '../data/quiz.js';

export function onevalue(host) {
  add(host, [
    pageHead('값 하나만 바꿔 보기 — 파라미터란 무엇인가',
      '주소 속 숫자 하나를 바꾸면 무엇이 달라지는지 눈으로 확인합니다.'),
  ]);

  let 지금 = '75543';          // 체육으로 시작 (자료가 작고 제목이 재미있다)
  const 주소자리 = h('div', {});
  const 결과자리 = h('div', {});
  const 고르는칸 = h('div', { class: 'row tight' });

  api.과목들.forEach((과목) => {
    const 단추 = h('button', {
      class: `pill ${과목.clss_id === 지금 ? 'on' : ''}`.trim(), type: 'button',
      onclick: () => {
        지금 = 과목.clss_id;
        [...고르는칸.children].forEach((c) => c.classList.remove('on'));
        단추.classList.add('on');
        다시();
      },
    }, `${과목.clss_id} · ${과목.이름}`);
    고르는칸.append(단추);
  });

  /** 주소를 조각내어 보여 준다 — 바뀌는 숫자만 도드라지게 */
  function 주소보이기() {
    const 앞 = 'https://kr.object.gov-ncloudstorage.com/edunet-data'
      + '/KEDNCM/OPENAPI/CNEDU/WKSTCONT/cnedu_wkst_cont_';
    return h('div', { class: 'urlbox' },
      h('span', { class: 'u-host' }, 앞),
      h('span', { class: 'jval picked', style: { fontSize: '18px' } }, 지금),
      h('span', { class: 'u-path' }, '.xml'));
  }

  async function 다시() {
    clear(주소자리); clear(결과자리);
    주소자리.append(주소보이기());

    const spec = api.에듀넷(지금);
    const 결과 = await api.부르기(spec, { 뜸: 120 });
    const 몸 = 결과.본문;
    if (!몸) {
      결과자리.append(note('bad', '자료를 찾지 못했습니다.'));
      return;
    }

    결과자리.append(h('div', { class: 'statusbar' },
      h('span', { class: 'chip warn' }, '📦 담아 둔 자료'),
      h('span', {}, h('b', {}, `${몸.이름}`), ` — 전체 ${몸.total}건 중 ${몸.rows.length}건`),
      h('span', { class: 'dim' }, `만든 날 ${몸.create_date}`)));

    const 표 = h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, h('th', {}, '#'), h('th', {}, '제목'), h('th', {}, '키워드'))));
    const 속 = h('tbody', {});
    몸.rows.forEach((줄, i) => {
      속.append(h('tr', {},
        h('td', { class: 'num' }, String(i)),
        h('td', {}, 줄.ttl),
        h('td', { class: 'dim' }, 줄.kywd)));
    });
    표.append(속);
    결과자리.append(h('div', { class: 'scroll-x' }, 표));
  }

  /* ── 진짜로 불러 보기 — 브라우저가 막는 것을 직접 본다 ── */
  const 실험자리 = h('div', {});
  const 실험단추 = button('진짜로 불러 보면 어떻게 될까?', async () => {
    실험단추.disabled = true;
    clear(실험자리);
    실험자리.append(h('div', { class: 'statusbar' },
      h('span', { class: 'spin' }, '⏳'), h('span', {}, '요청을 보내는 중입니다…')));
    const 주소 = api.에듀넷(지금).주소;
    const 잰시각 = Date.now();
    let 결과글; let 좋았나 = false;
    try {
      const res = await fetch(주소, { signal: AbortSignal.timeout(12000) });
      좋았나 = true;
      결과글 = `뜻밖에 성공했습니다 (HTTP ${res.status}). 브라우저나 망 환경이 바뀐 듯합니다.`;
    } catch (e) {
      결과글 = e.message;
    }
    const 걸린 = Date.now() - 잰시각;
    clear(실험자리);
    실험단추.disabled = false;
    실험자리.append(note(좋았나 ? 'ok' : 'bad',
      h('p', {}, h('b', {}, 좋았나 ? '⭕ 성공' : '❌ 실패'), ` — ${걸린}ms`),
      h('p', {}, 결과글),
      h('p', { class: 'dim' }, '개발자 도구(F12) 콘솔을 열어 두면 브라우저가 남긴 '
        + '빨간 글씨를 볼 수 있습니다.')));
    if (!좋았나) {
      실험자리.append(note('info',
        h('p', {}, h('b', {}, '왜 막혔을까?')),
        h('p', {}, '이 서버는 응답에 ', mono('Access-Control-Allow-Origin'),
          ' 이라는 표시를 붙이지 않습니다. 그 표시가 없으면 브라우저는 '
          + '「다른 집 자료를 함부로 가져다 쓰지 못하게」 요청을 막습니다. 이것을 ',
        h('b', {}, 'CORS'), ' 라고 합니다.'),
        h('p', {}, '서버가 막은 것이 아니라 ', h('b', {}, '내 브라우저가 막은 것'),
          '입니다. 그래서 주소를 그냥 브라우저 주소창에 넣으면 열립니다.')));
    }
  }, { kind: 'ghost' });

  /* ── 화면 짜기 ── */
  add(host, [
    card('① 값을 골라 보세요 — 바뀌는 것은 숫자 하나뿐입니다',
      note('info', '에듀넷 「주제별 학습자료」 API 는 조건이 ', mono('clss_id'),
        ' 하나뿐입니다. 아래 일곱 값 가운데 하나를 넣으면 그 과목 자료가 옵니다.'),
      고르는칸),

    card('② 주소가 이렇게 만들어집니다', 주소자리,
      note('info',
        h('p', {}, h('b', {}, '이 API 는 조건을 주소의 「파일 이름」에 넣습니다.')),
        h('p', {}, '보통은 ', mono('?clss_id=363'), ' 처럼 물음표 뒤에 붙이는데, '
          + '여기서는 파일 이름 자체가 바뀝니다. 방식은 달라도 뜻은 같습니다 — ',
        h('b', {}, '주소에 조건을 실어 보낸다'), '는 것입니다.'))),

    card('③ 결과가 이렇게 바뀝니다', 결과자리),

    card('여기서 알아 둘 것',
      note('info',
        h('p', {}, h('b', {}, '파라미터(parameter) = 요청에 실어 보내는 「조건」')),
        h('p', {}, '· ', h('b', {}, '이름'), ' — 무엇을 정하는 조건인가 (여기서는 ',
          mono('clss_id'), ')'),
        h('p', {}, '· ', h('b', {}, '값'), ' — 그 조건을 어떻게 정할 것인가 (여기서는 ',
          mono('362'), ' · ', mono('363'), ' … 일곱 가지)'),
        h('p', {}, '값을 바꾸면 서버가 다른 것을 찾아 줍니다. '
          + '주소를 바꾸는 것이 곧 「다른 것을 물어보는 것」입니다.')),
      details('🔬 더 깊이 — 아무 숫자나 넣으면?',
        h('p', {}, '매뉴얼에 적힌 일곱 값만 자료가 있습니다. 다른 숫자를 넣으면 '
          + '그런 파일이 없으므로 서버가 「없다」고 답합니다.'),
        h('p', {}, '파라미터에는 이렇게 ', h('b', {}, '쓸 수 있는 값이 정해져 있는 것'),
          '과, 날짜·좌표처럼 ', h('b', {}, '범위 안에서 자유로운 것'), '이 있습니다. '
          + '무엇을 넣을 수 있는지는 그 API 의 매뉴얼(명세서)에 적혀 있습니다.'))),

    card('★ 그런데 이 자료는 미리 받아 둔 것입니다',
      note('warn',
        h('p', {}, h('b', {}, '이 API 는 브라우저에서 직접 부를 수 없습니다.')),
        h('p', {}, '① 서버가 ', mono('Access-Control-Allow-Origin'),
          ' 표시를 안 붙여 브라우저가 막습니다 (CORS).'),
        h('p', {}, '② 파일이 1.1MB~6.0MB 로 너무 큽니다. 한 반이 동시에 받으면 '
          + '학교 인터넷이 느려집니다.'),
        h('p', {}, '그래서 위 목록은 미리 받아 다듬어 둔 것입니다. 직접 확인해 보세요.')),
      h('div', { class: 'row' }, 실험단추),
      실험자리),

    card('확인 문제', ...에듀넷퀴즈.map((문제) => h('div', { style: { marginBottom: '18px' } },
      고르기문제(문제)))),

    card('코드로 쓰면',
      코드보기('파이썬 — 값 하나만 갈아 끼운다', [
        'import requests',
        '',
        "틀 = 'https://kr.object.gov-ncloudstorage.com/edunet-data' \\",
        "     '/KEDNCM/OPENAPI/CNEDU/WKSTCONT/cnedu_wkst_cont_{}.xml'",
        '',
        "for 값 in ['362', '363', '75543']:      # 사회 · 과학 · 체육",
        '    응답 = requests.get(틀.format(값))',
        "    print(값, 응답.status_code, len(응답.text), '자')",
        '',
        '# 값 하나만 바뀌는데 돌아오는 자료는 통째로 달라진다.',
      ].join('\n')),
      note('info', '이 API 는 JSON 이 아니라 ', h('b', {}, 'XML'),
        ' 로 답합니다. 모양은 달라도 「주소를 부르면 자료가 온다」는 것은 같습니다. '
        + '다음 화면부터는 JSON 으로 답하는 API 를 다룹니다.')),
  ]);

  다시();
}
