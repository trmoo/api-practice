/*! ==========================================================================
 * json.js — 받은 JSON 을 나무처럼 펼쳐 보고, 값의 「경로」를 짚는 도구
 *
 * 이 앱에서 학생이 넘어야 할 가장 큰 고비는
 *   d.mealServiceDietInfo[1].row[0].DDISH_NM
 * 처럼 깊이 들어간 값을 꺼내는 일이다.
 * 그래서 값을 눌러 보면 그 경로가 저절로 적히게 했다.
 *
 * ⚠ 이 파일은 불러오기만 해서는 document 를 건드리지 않는다.
 *   (node 로 시험할 수 있어야 하므로 최상위에서 DOM 을 만들지 말 것.)
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import { h, add } from './ui.js';

/* ──────────────────────────── 경로 다루기 ────────────────────────────── */

/** 자바스크립트에서 점(.)으로 이어 쓸 수 있는 이름인가 */
function 점으로되나(이름) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(이름);
}

/**
 * 경로 배열을 글로 적는다.
 *   경로글(['schoolInfo', 1, 'row', 0, 'SCHUL_NM'], 'js')
 *     → 데이터.schoolInfo[1].row[0].SCHUL_NM
 *   경로글(같은 것, 'py')
 *     → 데이터["schoolInfo"][1]["row"][0]["SCHUL_NM"]
 */
export function 경로글(경로, 문법 = 'js', 뿌리이름 = '데이터') {
  let 글 = 뿌리이름;
  for (const 조각 of 경로) {
    if (typeof 조각 === 'number') {
      글 += `[${조각}]`;
    } else if (문법 === 'py') {
      글 += `["${조각}"]`;
    } else if (점으로되나(조각)) {
      글 += `.${조각}`;
    } else {
      글 += `["${조각}"]`;
    }
  }
  return 글;
}

/** 경로를 따라가 값을 꺼낸다. 길이 끊기면 undefined. */
export function 값꺼내기(뿌리, 경로) {
  let 지금 = 뿌리;
  for (const 조각 of 경로) {
    if (지금 === null || 지금 === undefined) return undefined;
    지금 = 지금[조각];
  }
  return 지금;
}

/** 두 경로가 같은가 */
export function 경로같나(가, 나) {
  if (!Array.isArray(가) || !Array.isArray(나) || 가.length !== 나.length) return false;
  return 가.every((조각, i) => String(조각) === String(나[i]));
}

/**
 * JSON 안의 모든 「잎」(더 안 갈라지는 값)의 경로를 모은다.
 * 경로 찾기 퀴즈에서 「고를 수 있는 답」을 만드는 데 쓴다.
 */
export function 잎경로모으기(값, 경로 = [], 담을곳 = [], 깊이한도 = 8) {
  if (경로.length >= 깊이한도) return 담을곳;
  if (Array.isArray(값)) {
    값.forEach((v, i) => 잎경로모으기(v, [...경로, i], 담을곳, 깊이한도));
  } else if (값 && typeof 값 === 'object') {
    for (const [k, v] of Object.entries(값)) 잎경로모으기(v, [...경로, k], 담을곳, 깊이한도);
  } else {
    담을곳.push({ 경로, 값 });
  }
  return 담을곳;
}

/** 값의 종류를 한국어로 */
export function 값종류(값) {
  if (값 === null) return 'null';
  if (Array.isArray(값)) return '목록';
  switch (typeof 값) {
    case 'object': return '객체';
    case 'string': return '문자열';
    case 'number': return '숫자';
    case 'boolean': return '참거짓';
    default: return String(typeof 값);
  }
}

/** 값을 한 줄로 짧게 (미리보기용) */
export function 값요약(값, 최대 = 40) {
  if (값 === null) return 'null';
  if (Array.isArray(값)) return `[ … ${값.length}개 ]`;
  if (typeof 값 === 'object') return `{ … ${Object.keys(값).length}개 }`;
  const 글 = typeof 값 === 'string' ? `"${값}"` : String(값);
  return 글.length > 최대 ? `${글.slice(0, 최대)}…` : 글;
}

/* ────────────────────────────── 나무 그리기 ──────────────────────────── */

/**
 * JSON 을 접었다 폈다 하는 나무로 그린다.
 *
 * 옵션
 *   열림깊이   — 이 깊이까지는 처음부터 펼쳐 둔다 (기본 2)
 *   눌리면     — (경로, 값) 을 받는 함수. 값을 누르면 불린다.
 *   짚은경로   — 이 경로에 있는 값을 도드라지게 칠한다
 *   뿌리이름   — 경로 글에 쓸 이름 (기본 '데이터')
 */
export function 나무그리기(값, 옵션 = {}) {
  const {
    열림깊이 = 2, 눌리면 = null, 짚은경로 = null, 뿌리이름 = '데이터',
  } = 옵션;

  const 뿌리 = h('div', { class: 'jtree' });
  뿌리.append(가지(값, [], 0));
  return 뿌리;

  function 가지(값, 경로, 깊이) {
    const 묶음 = Array.isArray(값) || (값 && typeof 값 === 'object');
    if (!묶음) return 잎(값, 경로);

    const 열쇠들 = Array.isArray(값)
      ? 값.map((_, i) => i)
      : Object.keys(값);
    const 펼침 = 깊이 < 열림깊이;

    const 상자 = h('div', { class: 'jnode' });
    const 여닫이 = h('button', {
      class: `jtoggle ${펼침 ? 'open' : ''}`.trim(), type: 'button',
      'aria-expanded': 펼침 ? 'true' : 'false',
    }, 펼침 ? '▾' : '▸');
    const 딸린것 = h('div', { class: 'jkids', style: { display: 펼침 ? '' : 'none' } });

    여닫이.addEventListener('click', () => {
      const 지금열림 = 딸린것.style.display !== 'none';
      딸린것.style.display = 지금열림 ? 'none' : '';
      여닫이.textContent = 지금열림 ? '▸' : '▾';
      여닫이.classList.toggle('open', !지금열림);
      여닫이.setAttribute('aria-expanded', 지금열림 ? 'false' : 'true');
    });

    상자.append(h('div', { class: 'jline' },
      여닫이,
      h('span', { class: 'jbracket' }, Array.isArray(값) ? '[' : '{'),
      h('span', { class: 'jcount' }, `${열쇠들.length}개`)));

    열쇠들.forEach((열쇠) => {
      const 아래경로 = [...경로, 열쇠];
      const 줄 = h('div', { class: 'jrow' });
      줄.append(h('span', { class: `jkey ${typeof 열쇠 === 'number' ? 'idx' : ''}`.trim() },
        typeof 열쇠 === 'number' ? `${열쇠}:` : `"${열쇠}":`));
      줄.append(가지(값[열쇠], 아래경로, 깊이 + 1));
      딸린것.append(줄);
    });

    상자.append(딸린것);
    상자.append(h('div', { class: 'jline jclose' },
      h('span', { class: 'jbracket' }, Array.isArray(값) ? ']' : '}')));
    return 상자;
  }

  function 잎(값, 경로) {
    const 짚힘 = 짚은경로 && 경로같나(경로, 짚은경로);
    const 조각 = h('button', {
      class: `jval ${값종류(값)} ${짚힘 ? 'picked' : ''}`.trim(),
      type: 'button',
      title: 눌리면 ? `누르면 경로가 적힙니다 — ${경로글(경로, 'js', 뿌리이름)}` : '',
    }, 값 === null ? 'null' : (typeof 값 === 'string' ? `"${값}"` : String(값)));
    if (눌리면) 조각.addEventListener('click', () => 눌리면(경로, 값));
    return 조각;
  }
}

/** 보기 좋게 들여쓴 JSON 글 (원문 보기용) */
export function 예쁘게(값) {
  try {
    return JSON.stringify(값, null, 2);
  } catch {
    return String(값);
  }
}

/** 글자를 클립보드에 담는다. 안 되면 false. */
export async function 복사하기(글) {
  try {
    await navigator.clipboard.writeText(글);
    return true;
  } catch {
    return false;
  }
}

/** 나무 옆에 붙는 「경로 표시줄」 — 지금 짚은 경로를 두 문법으로 보여 준다 */
export function 경로표시줄(경로, 값) {
  const 상자 = h('div', { class: 'pathbar' });
  if (!경로) {
    상자.append(h('span', { class: 'dim' }, '값을 눌러 보세요. 그 값을 꺼내는 길이 여기 적힙니다.'));
    return 상자;
  }
  add(상자, [
    h('div', { class: 'pathline' },
      h('span', { class: 'tag js' }, 'JS'),
      h('code', { class: 'mono' }, 경로글(경로, 'js'))),
    h('div', { class: 'pathline' },
      h('span', { class: 'tag py' }, '파이썬'),
      h('code', { class: 'mono' }, 경로글(경로, 'py'))),
    h('div', { class: 'pathval' },
      h('span', { class: 'dim' }, `${값종류(값)} · 값 = `),
      h('code', { class: 'mono' }, 값요약(값, 120))),
  ]);
  return 상자;
}
