/*! ==========================================================================
 * req.js — 화면마다 되풀이되는 조각들 (주소 색칠 · 상태 줄 · 퀴즈 위젯)
 *
 * 여덟 화면이 「주소를 보이고 → 보내고 → 결과를 보인다」를 되풀이하므로
 * 그 부분을 한곳에 모았다. 화면 파일은 무엇을 부를지만 정하면 된다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import { h, add, clear, note, button, mono } from './ui.js';
import { 주소분해, 안전하게풀기, 뜻찾기 } from './url.js';
import { 현재모드 } from './api.js';
import * as 저장 from './store.js';

/* ─────────────────────────── 주소를 색으로 보이기 ────────────────────── */

/**
 * 주소를 조각마다 다른 색으로 그린다.
 * 학생이 「주소가 곧 요청」임을 눈으로 알아채게 하려는 것.
 */
export function 주소보이기(주소, 옵션 = {}) {
  const 쪼갬 = 주소분해(주소);
  const 상자 = h('div', { class: 'urlbox' });
  if (!쪼갬.성공) {
    상자.append(h('span', {}, 주소 || '(주소가 비었습니다)'));
    return 상자;
  }
  add(상자, [
    h('span', { class: 'u-proto' }, `${쪼갬.프로토콜}://`),
    h('span', { class: 'u-host' }, 쪼갬.호스트),
    h('span', { class: 'u-path' }, 쪼갬.경로),
  ]);
  쪼갬.쿼리.forEach(([이름, 값], i) => {
    add(상자, [
      h('span', { class: 'u-mark' }, i === 0 ? '?' : '&'),
      h('span', { class: 'u-key' }, 이름),
      h('span', { class: 'u-mark' }, '='),
      h('span', {
        class: 'u-val',
        title: 옵션.풀어보이기 !== false && 안전하게풀기(값) !== 값
          ? `풀어 읽으면: ${안전하게풀기(값)}` : '',
      }, 값),
    ]);
  });
  return 상자;
}

/** 파라미터를 표로 — 이름 · 값 · 무슨 뜻인지 */
export function 파라미터표(주소) {
  const 쪼갬 = 주소분해(주소);
  if (!쪼갬.쿼리.length) return note('info', '이 주소에는 파라미터가 없습니다.');
  const 표 = h('table', { class: 'tbl' },
    h('thead', {}, h('tr', {},
      h('th', {}, '이름'), h('th', {}, '값'), h('th', {}, '풀어 읽으면'), h('th', {}, '무슨 뜻인가'))));
  const 몸 = h('tbody', {});
  쪼갬.쿼리.forEach(([이름, 값]) => {
    const 푼값 = 안전하게풀기(값);
    몸.append(h('tr', {},
      h('td', {}, mono(이름)),
      h('td', {}, mono(값)),
      h('td', {}, 푼값 !== 값 ? h('b', {}, 푼값) : h('span', { class: 'dim' }, '(그대로)')),
      h('td', { class: 'dim' }, 뜻찾기(이름) || '—')));
  });
  표.append(몸);
  return h('div', { class: 'scroll-x' }, 표);
}

/* ────────────────────────────── 상태 줄 ─────────────────────────────── */

/** 요청 결과를 한 줄로 — 모드 · 상태 코드 · 걸린 시간 */
export function 상태줄(결과) {
  if (!결과) return h('div', {});
  const 줄 = h('div', { class: 'statusbar' });
  add(줄, [
    h('span', { class: `chip ${결과.모드 === '연습' ? 'warn' : 'plain'}` },
      결과.모드 === '연습' ? '📦 연습 모드' : '🌐 실제 호출'),
    h('span', { class: `chip ${결과.ok ? 'ok' : 'bad'}` },
      결과.상태 ? `HTTP ${결과.상태}` : '보내지 못함'),
    h('span', { class: 'dim' }, `${결과.걸린ms} ms 걸렸습니다`),
  ]);
  return 줄;
}

/** 「보내는 중」 표시 */
export function 기다리는줄(말 = '요청을 보내는 중입니다') {
  return h('div', { class: 'statusbar' },
    h('span', { class: 'spin' }, '⏳'),
    h('span', {}, `${말}…`));
}

/**
 * 「지금 무슨 일이 일어나는가」 네 단계.
 * 지금단계: 0~4 (4면 모두 끝)
 */
export function 네단계(지금단계) {
  const 목록 = [
    ['주소를 부른다', '브라우저가 그 주소로 요청을 보낸다'],
    ['서버가 찾는다', '나이스·기상 서버가 조건에 맞는 자료를 찾는다'],
    ['JSON 을 보낸다', '찾은 것을 글(JSON)로 적어 돌려준다'],
    ['화면에 그린다', '받은 값을 꺼내 사람이 볼 모양으로 만든다'],
  ];
  const 상자 = h('div', { class: 'steps' });
  목록.forEach(([제목, 설명], i) => {
    상자.append(h('div', { class: `step ${i < 지금단계 ? 'on' : ''}`.trim() },
      h('div', { class: 'no' }, String(i + 1)),
      h('div', {}, h('b', {}, 제목), h('div', { class: 'dim' }, 설명))));
  });
  return 상자;
}

/* ───────────────────────── 요청 하나를 다루는 틀 ─────────────────────── */

/**
 * 「단추 → 기다림 → 결과」를 통째로 맡는 상자를 만든다.
 *
 *   보낼거리()  — 부를 spec 을 돌려주는 함수 (누를 때마다 새로 만든다)
 *   그리기(결과, 담을곳) — 결과가 오면 화면을 그리는 함수
 *   옵션.단추말 · 옵션.단계보이기
 *
 * 돌려주는 것 = { 상자, 보내기() }  — 밖에서도 보낼 수 있게 해 둔다.
 */
export function 요청상자(보낼거리, 그리기, 옵션 = {}) {
  const 상자 = h('div', {});
  const 단추자리 = h('div', { class: 'row' });
  const 결과자리 = h('div', {});
  const 단추 = button(옵션.단추말 || '요청 보내기',
    () => { 보내기(); }, { kind: 'primary', lg: opt불리언(옵션.큰단추) });
  단추자리.append(단추);
  if (옵션.곁들임) add(단추자리, [옵션.곁들임]);
  상자.append(단추자리, 결과자리);

  let 보내는중 = false;

  async function 보내기() {
    if (보내는중) return;
    보내는중 = true;
    단추.disabled = true;
    clear(결과자리);
    결과자리.append(기다리는줄());
    if (옵션.단계보이기) 결과자리.append(네단계(1));

    const spec = 보낼거리();
    let 결과;
    try {
      결과 = await (옵션.부르기 || (await import('./api.js')).부르기)(spec);
    } finally {
      보내는중 = false;
      단추.disabled = false;
    }

    clear(결과자리);
    결과자리.append(주소보이기(결과.주소));
    결과자리.append(상태줄(결과));
    if (옵션.단계보이기) 결과자리.append(네단계(4));

    if (결과.오류) {
      결과자리.append(note('bad', h('b', {}, '❌ '), 결과.오류));
      if (결과.모드 === '실제') 결과자리.append(연습모드권함());
    }
    그리기(결과, 결과자리);
  }

  return { 상자, 보내기, 단추 };
}

function opt불리언(v) { return v === undefined ? true : Boolean(v); }

/** 실제 호출이 실패했을 때 보여 주는 안내 */
export function 연습모드권함() {
  return note('warn',
    h('p', {}, h('b', {}, '📦 연습 모드로 바꿔 보세요.')),
    h('p', {}, '위쪽 머리말의 [📦 연습 모드] 단추를 누르면, 미리 받아 둔 진짜 응답으로 '
      + '똑같이 실습할 수 있습니다. 교실 인터넷이 막혀 있어도 수업은 그대로 진행됩니다.'));
}

/* ─────────────────────────── 고르기 퀴즈 위젯 ────────────────────────── */

/**
 * 보기에서 골라 [확인] 을 누르면 채점되는 문제 하나.
 * ⚠ 처음에는 아무것도 골라 두지 않는다 — 안 고르고 확인을 눌러도
 *   맞은 것으로 처리되면 채점이 무의미해지기 때문이다.
 */
export function 고르기문제(문제, 옵션 = {}) {
  const 상자 = h('div', { class: 'quiz' });
  let 고른것 = null;
  const 판정자리 = h('div', {});

  상자.append(h('p', {}, h('b', {}, 문제.물음)));
  if (옵션.덧붙임) 상자.append(옵션.덧붙임);

  const 고르는칸 = h('div', { class: 'choices' });
  const 단추들 = 문제.보기.map((보기글) => {
    const b = h('button', { class: 'choice', type: 'button', onclick: () => {
      고른것 = 보기글;
      단추들.forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    } }, 보기글);
    고르는칸.append(b);
    return b;
  });
  상자.append(고르는칸);

  상자.append(h('div', { class: 'row' },
    button('확인', () => {
      clear(판정자리);
      if (고른것 === null) {
        판정자리.append(note('warn', '먼저 보기 하나를 골라 주세요.'));
        return;
      }
      const 맞았나 = 고른것 === 문제.답;
      저장.채점(문제.키, 맞았나);
      판정자리.append(note(맞았나 ? 'ok' : 'bad',
        h('p', {}, h('b', {}, 맞았나 ? '⭕ 맞았습니다.' : `❌ 아쉽습니다. 정답은 「${문제.답}」입니다.`)),
        문제.풀이 ? h('p', {}, 문제.풀이) : null));
      옵션.풀고나면?.(맞았나);
    }, { kind: 'primary' })));
  상자.append(판정자리);
  return 상자;
}

/* ───────────────────────── 코드 빈칸 채우기 위젯 ─────────────────────── */

/**
 * 코드에서 ⓐⓑⓒ 자리를 보기에서 골라 채운다.
 * 다 채우고 [확인] 을 누르면 한꺼번에 채점한다.
 */
export function 코드빈칸문제(문제) {
  const 상자 = h('div', {});
  const 고른값 = {};                 // { 'ⓐ': 'fetch' }
  const 코드자리 = h('pre', { class: 'code' });
  const 판정자리 = h('div', {});

  상자.append(h('p', {}, h('b', {}, 문제.제목),
    h('span', { class: 'dim' }, `  (${문제.언어 === 'py' ? '파이썬' : '자바스크립트'})`)));
  상자.append(코드자리);

  문제.빈칸.forEach((빈칸) => {
    const 줄 = h('div', { class: 'row', style: { margin: '10px 0' } });
    줄.append(h('b', {}, `${빈칸.표} 자리:`));
    const 단추들 = 빈칸.보기.map((보기글) => {
      const b = h('button', { class: 'choice', type: 'button',
        style: { padding: '7px 14px', display: 'inline-block' },
        onclick: () => {
          고른값[빈칸.표] = 보기글;
          단추들.forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
          코드다시();
        } }, 보기글);
      줄.append(b);
      return b;
    });
    상자.append(줄);
    상자.append(h('div', { class: 'dim', style: { margin: '0 0 12px' } }, `💡 ${빈칸.힌트}`));
  });

  상자.append(h('div', { class: 'row' },
    button('확인', () => {
      clear(판정자리);
      const 안고른것 = 문제.빈칸.filter((b) => !고른값[b.표]);
      if (안고른것.length) {
        판정자리.append(note('warn',
          `${안고른것.map((b) => b.표).join('·')} 자리를 아직 고르지 않았습니다.`));
        return;
      }
      const 틀린것 = 문제.빈칸.filter((b) => 고른값[b.표] !== b.답);
      저장.채점(문제.키, 틀린것.length === 0);
      if (틀린것.length === 0) {
        판정자리.append(note('ok', h('p', {}, h('b', {}, '⭕ 모두 맞았습니다.')),
          ...문제.빈칸.map((b) => h('p', {}, `${b.표} ${b.답} — ${b.풀이}`))));
      } else {
        판정자리.append(note('bad',
          h('p', {}, h('b', {}, `❌ ${틀린것.map((b) => b.표).join('·')} 자리가 틀렸습니다.`)),
          ...틀린것.map((b) => h('p', {}, `${b.표} 정답은 ${b.답} — ${b.풀이}`))));
      }
      코드다시();
    }, { kind: 'primary' })));
  상자.append(판정자리);

  코드다시();
  return 상자;

  /** 고른 값을 코드 안에 끼워 다시 그린다 */
  function 코드다시() {
    clear(코드자리);
    // 코드 글을 ⓐⓑⓒ 를 경계로 잘라, 사이사이에 색칠한 조각을 넣는다.
    const 표들 = 문제.빈칸.map((b) => b.표);
    const 쪼개기 = new RegExp(`(${표들.join('|')})`, 'g');
    문제.코드.split('\n').forEach((줄글, i) => {
      if (i) 코드자리.append(document.createTextNode('\n'));
      줄글.split(쪼개기).forEach((조각) => {
        if (표들.includes(조각)) {
          const 값 = 고른값[조각];
          코드자리.append(h('span', { class: `blank ${값 ? 'done' : ''}`.trim() }, 값 || 조각));
        } else if (조각.trimStart().startsWith('//') || 조각.trimStart().startsWith('#')) {
          코드자리.append(h('span', { class: 'cmt' }, 조각));
        } else {
          코드자리.append(document.createTextNode(조각));
        }
      });
    });
  }
}

/**
 * 코드 빈칸 자료를 「채워진 코드 + 설명」으로 보여 준다. 채점하지 않는다.
 * ⚠ 학생이 문법을 외우는 데 시간을 쓰지 않게 하려는 것(2026-08-30 사용자 요청).
 *   빈칸을 정답으로 채워 두고, 그 자리가 무슨 일을 하는지 아래에 적는다.
 */
export function 코드읽기(문제) {
  const 상자 = h('div', {});
  상자.append(h('p', {}, h('b', {}, 문제.제목),
    h('span', { class: 'dim' }, `  (${문제.언어 === 'py' ? '파이썬' : '자바스크립트'})`)));

  const 표들 = 문제.빈칸.map((b) => b.표);
  const 쪼개기 = new RegExp(`(${표들.join('|')})`, 'g');
  const pre = h('pre', { class: 'code' });
  문제.코드.split('\n').forEach((줄글, i) => {
    if (i) pre.append(document.createTextNode('\n'));
    줄글.split(쪼개기).forEach((조각) => {
      if (표들.includes(조각)) {
        const 빈칸 = 문제.빈칸.find((b) => b.표 === 조각);
        pre.append(h('span', { class: 'blank done' }, 빈칸.답));
      } else if (조각.trimStart().startsWith('//') || 조각.trimStart().startsWith('#')) {
        pre.append(h('span', { class: 'cmt' }, 조각));
      } else {
        pre.append(document.createTextNode(조각));
      }
    });
  });
  상자.append(pre);

  문제.빈칸.forEach((빈칸) => {
    상자.append(note('info',
      h('p', {}, h('b', {}, 빈칸.답), ' — ', 빈칸.풀이)));
  });
  return 상자;
}

/** 「파이썬으로는 이렇게 씁니다」 상자 */
export function 코드보기(제목, 코드글) {
  const pre = h('pre', { class: 'code' });
  코드글.split('\n').forEach((줄글, i) => {
    if (i) pre.append(document.createTextNode('\n'));
    if (줄글.trimStart().startsWith('#') || 줄글.trimStart().startsWith('//')) {
      pre.append(h('span', { class: 'cmt' }, 줄글));
    } else {
      pre.append(document.createTextNode(줄글));
    }
  });
  return h('div', {}, h('h4', {}, 제목), pre);
}

/** 지금 모드가 연습이면 「담아 둔 값」임을 밝히는 띠 */
export function 연습알림(받은날) {
  if (현재모드() !== '연습') return null;
  return note('warn', `📦 지금은 연습 모드입니다. 아래 값은 ${받은날} 에 미리 받아 둔 진짜 응답이며, `
    + '지금 인터넷으로 가져온 것이 아닙니다.');
}
