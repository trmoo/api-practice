/*! ==========================================================================
 * ui.js — 모든 탭이 함께 쓰는 화면 조각 만들기 도구
 *
 * 「화면 수명 관리」 — 탭을 옮기면 main.js 가 화면을 통째로 지우고 다시 그린다.
 * 그런데 지워지는 것은 화면에 붙어 있던 태그뿐이라, 그 화면이 window 에 걸어 둔
 * 리스너와 타이머는 그대로 살아남아 오갈 때마다 쌓인다.
 * ★ 탭 모듈에서 window.addEventListener 나 setInterval 을 직접 쓰지 말고
 *   아래의 onWindow() · screenInterval() 을 쓸 것.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

let screen = null;

/** main.js 가 새 화면을 그리기 직전에 부른다 — 이전 화면의 뒷정리를 한다 */
export function beginScreen() {
  if (screen) {
    screen.controller.abort();
    screen.timers.forEach(clearTimeout);
  }
  screen = { controller: new AbortController(), timers: new Set() };
  return screen;
}

/** 지금 화면이 아직 살아 있는가 — 느린 요청이 끝났을 때 확인용 */
export function 화면살아있나(표) {
  return screen !== null && screen === 표;
}

/** 지금 화면의 표를 얻는다 (요청 전에 받아 두었다가 끝나고 대조한다) */
export function 화면표() { return screen; }

/** window 에 리스너를 건다. 화면을 옮기면 자동으로 떨어진다. */
export function onWindow(type, fn) {
  window.addEventListener(type, fn, screen ? { signal: screen.controller.signal } : undefined);
}

/** setTimeout 과 같지만, 화면을 옮기면 자동으로 멈춘다. */
export function screenTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  if (screen) screen.timers.add(id);
  return id;
}

/* ────────────────────────────── 태그 만들기 ──────────────────────────── */

/**
 * 태그 하나를 만든다.
 *   h('div', { class: 'card' }, '글자', h('b', {}, '굵게'))
 * attrs 안에서 on 으로 시작하는 키는 이벤트로 붙는다. (onclick, oninput …)
 * ⚠ 자식 자리에 HTML 태그 글자를 넣으면 글자 그대로 보인다. {html: …} 를 쓸 것.
 */
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  add(e, kids);
  return e;
}

/** 자식(문자열·노드·배열·null 섞여도 됨)을 붙인다. */
export function add(parent, kids) {
  for (const k of kids.flat(9)) {
    if (k === null || k === undefined || k === false) continue;
    parent.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return parent;
}

/** 안을 비운다. */
export function clear(e) {
  while (e.firstChild) e.removeChild(e.firstChild);
  return e;
}

/* ─────────────────────────────── 큰 틀 조각 ──────────────────────────── */

/** 흰 상자 하나. 제목은 생략 가능. */
export function card(title, ...kids) {
  return h('section', { class: 'card' }, title ? h('h3', {}, title) : null, ...kids);
}

/** 화면 머리 — 제목 + 한 줄 설명 */
export function pageHead(title, sub) {
  return h('div', { class: 'page-head' },
    h('h2', {}, title),
    sub ? h('p', { class: 'sub' }, sub) : null);
}

/** 안내 상자. kind: 'info' | 'warn' | 'bad' | 'ok' */
export function note(kind, ...kids) {
  return h('div', { class: `note ${kind || 'info'}` }, ...kids);
}

/** 큰 단추. kind: 'primary' | 'ghost' | 'lg' */
export function button(label, onclick, opts = {}) {
  return h('button', {
    class: `btn ${opts.kind || ''} ${opts.lg ? 'lg' : ''}`.trim(),
    onclick,
    disabled: opts.disabled || false,
    type: 'button',
  }, label);
}

/** 고정폭 글씨 조각 */
export function mono(text, cls = '') {
  return h('code', { class: `mono ${cls}`.trim() }, text);
}

/** 접이식 상자 — 심화 내용을 감춰 둔다 */
export function details(summary, ...kids) {
  return h('details', { class: 'more' }, h('summary', {}, summary), ...kids);
}

/** 알약 단추 줄. items = [{키, 이름}] */
export function pills(items, 지금, 고르면) {
  const box = h('div', { class: 'pillrow' });
  // ⚠ 가운데 맞추기는 justify-content:center 가 아니라 첫·마지막의 margin:auto 로 한다.
  //   center 를 쓰면 줄이 넘칠 때 왼쪽 끝이 잘려 스크롤로도 닿지 못한다.
  items.forEach((it) => {
    box.append(h('button', {
      class: `pill ${it.키 === 지금 ? 'on' : ''}`.trim(),
      type: 'button',
      onclick: () => 고르면(it.키),
    }, it.이름));
  });
  return box;
}

/* ─────────────────────────── 고르기·채점 조각 ────────────────────────── */

/**
 * 채점이 붙는 고르기.
 * ⚠ 첫 항목이 기본 선택되면 안 된다 — 학생이 안 고르고 [확인] 을 눌러도
 *   골라진 것으로 처리되어 채점이 무의미해진다. 그래서 처음에는 아무것도 안 골라 둔다.
 */
export function choicePicker(항목들, 바뀌면) {
  let 고른것 = null;
  const box = h('div', { class: 'choices' });
  const 단추들 = 항목들.map((it, i) => {
    const b = h('button', { class: 'choice', type: 'button', onclick: () => {
      고른것 = it.값 !== undefined ? it.값 : i;
      단추들.forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      바뀌면?.(고른것);
    } }, it.이름 !== undefined ? it.이름 : it);
    box.append(b);
    return b;
  });
  box.고른값 = () => 고른것;
  return box;
}

/** 채점 결과 한 줄 */
export function 판정줄(맞았나, 맞는말, 틀린말) {
  return note(맞았나 ? 'ok' : 'bad', 맞았나 ? `⭕ ${맞는말}` : `❌ ${틀린말}`);
}

/* ────────────────────────────── 화면 푸터 ────────────────────────────── */

/** 화면 아래 저작권 — 학생·교사가 실제로 보는 곳 */
export function footer() {
  return h('footer', { class: 'foot' },
    h('p', {}, 'API 실습실 · 고등학교 「정보」 [12정02-03] · 「데이터 과학」 [12데과02-01]'),
    h('p', {}, '© 2026 티쳐무 · 모든 권리 보유 — 학교 수업 목적으로만 이용해 주세요.'));
}
