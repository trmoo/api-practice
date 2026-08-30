/*! ==========================================================================
 * main.js — API 실습실. 탭·화면을 짜 맞추고 주소 해시로 화면을 잇는다.
 *
 * 성취기준 [12정02-03] 문제 해결에 적합한 데이터를 수집한다.
 *          [12데과02-01] 데이터를 편향되지 않도록 수집하고, 특성을 분석한다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import './style.css';
import { h, add, clear, beginScreen, footer, note, button } from './lib/ui.js';
import * as api from './lib/api.js';
import * as 저장 from './lib/store.js';
import * as 기초 from './tabs/basics.js';
import * as 급식 from './tabs/meal.js';

/* ─────────────────────────── 탭과 화면 차례 ──────────────────────────── */

const 탭들 = [
  {
    키: 'basic', 이름: '① 요청과 응답',
    화면들: [
      { 키: 'first', 이름: '첫 요청', 그리기: 기초.first },
      { 키: 'url', 이름: '주소 해부기', 그리기: 기초.url },
      { 키: 'param', 이름: '파라미터 실험실', 그리기: 기초.param },
      { 키: 'json', 이름: 'JSON 탐험기', 그리기: 기초.json },
    ],
  },
  {
    키: 'meal', 이름: '② 급식 API 실습',
    화면들: [
      { 키: 'school', 이름: '학교 찾기', 그리기: 급식.school },
      { 키: 'meal', 이름: '급식 조회', 그리기: 급식.meal },
      { 키: 'path', 이름: '경로 찾기', 그리기: 급식.path },
      { 키: 'parse', 이름: '전처리·마무리', 그리기: 급식.parse },
    ],
  },
];

let 지금탭 = 탭들[0].키;
let 지금화면 = 탭들[0].화면들[0].키;

/* ────────────────────────────── 틀 만들기 ───────────────────────────── */

const 뿌리 = document.getElementById('app');
const 머리 = h('header', { class: 'top' });
const 탭줄 = h('nav', { class: 'tabs', 'aria-label': '대단원' });
const 알약줄 = h('nav', { class: 'pillrow', 'aria-label': '화면' });
const 본문 = h('main', {});
뿌리.append(머리, 탭줄, 알약줄, 본문, footer());

/** 머리말 — 제목과 모드 스위치 */
function 머리다시() {
  clear(머리);
  const 모드칸 = h('div', { class: 'modebox', role: 'group', 'aria-label': '호출 모드' });
  [['실제', '🌐 실제 호출'], ['연습', '📦 연습 모드']].forEach(([키, 이름]) => {
    모드칸.append(h('button', {
      class: `modebtn ${api.현재모드() === 키 ? 'on' : ''}`.trim(),
      type: 'button',
      'aria-pressed': api.현재모드() === 키 ? 'true' : 'false',
      onclick: () => { api.모드바꾸기(키); 머리다시(); 화면다시(); },
    }, 이름));
  });

  머리.append(h('div', { class: 'row' },
    h('div', { class: 'grow' },
      h('h1', {}, 'API 실습실'),
      h('p', { class: 'lead' }, '주소를 부르면 JSON이 온다 — 데이터를 수집하는 방법')),
    모드칸));
}

/** 탭 줄 */
function 탭다시() {
  clear(탭줄);
  탭들.forEach((탭) => {
    탭줄.append(h('button', {
      class: `tab ${탭.키 === 지금탭 ? 'on' : ''}`.trim(), type: 'button',
      onclick: () => 가기(탭.키, 탭.화면들[0].키),
    }, 탭.이름));
  });
}

/** 알약 줄 — 지금 탭의 화면들 */
function 알약다시() {
  clear(알약줄);
  const 탭 = 탭찾기(지금탭);
  탭.화면들.forEach((화면, i) => {
    알약줄.append(h('button', {
      class: `pill ${화면.키 === 지금화면 ? 'on' : ''}`.trim(), type: 'button',
      onclick: () => 가기(지금탭, 화면.키),
    }, `${i + 1}. ${화면.이름}`));
  });
}

/** 본문 — 지금 화면을 그린다 */
function 화면다시() {
  beginScreen();          // 앞 화면이 걸어 둔 리스너·타이머를 걷어 낸다
  clear(본문);
  const 탭 = 탭찾기(지금탭);
  const 화면 = 탭.화면들.find((s) => s.키 === 지금화면) || 탭.화면들[0];
  try {
    화면.그리기(본문);
  } catch (e) {
    // 화면 하나가 죽어도 앱 전체가 흰 화면이 되지 않게 한다.
    본문.append(note('bad',
      h('p', {}, h('b', {}, '이 화면을 그리는 중 문제가 생겼습니다.')),
      h('p', {}, String(e && e.message ? e.message : e)),
      h('div', { class: 'row' }, button('처음 화면으로', () => 가기('basic', 'first')))));
    console.error(e);
  }
  본문.append(다음화면단추());
}

/** 화면 아래 「다음 화면으로」 */
function 다음화면단추() {
  const 순서 = 탭들.flatMap((탭) => 탭.화면들.map((s) => ({ 탭: 탭.키, 화면: s.키, 이름: s.이름 })));
  const 자리 = 순서.findIndex((s) => s.탭 === 지금탭 && s.화면 === 지금화면);
  const 줄 = h('div', { class: 'row', style: { marginTop: '20px', justifyContent: 'space-between' } });
  if (자리 > 0) {
    const 앞 = 순서[자리 - 1];
    줄.append(button(`← ${앞.이름}`, () => 가기(앞.탭, 앞.화면), { kind: 'ghost' }));
  } else {
    줄.append(h('span', {}));
  }
  if (자리 >= 0 && 자리 < 순서.length - 1) {
    const 뒤 = 순서[자리 + 1];
    줄.append(button(`${뒤.이름} →`, () => 가기(뒤.탭, 뒤.화면), { kind: 'primary' }));
  }
  return 줄;
}

function 탭찾기(키) { return 탭들.find((t) => t.키 === 키) || 탭들[0]; }

/* ─────────────────────────── 주소 해시로 잇기 ────────────────────────── */

function 가기(탭키, 화면키) {
  지금탭 = 탭키;
  지금화면 = 화면키;
  const 새해시 = `#${탭키}/${화면키}`;
  if (location.hash !== 새해시) {
    location.hash = 새해시;   // 해시가 바뀌면 hashchange 가 다시 그린다
    return;
  }
  전부다시();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function 해시읽기() {
  const 글 = (location.hash || '').replace(/^#/, '');
  const [탭키, 화면키] = 글.split('/');
  const 탭 = 탭들.find((t) => t.키 === 탭키);
  if (!탭) return false;
  const 화면 = 탭.화면들.find((s) => s.키 === 화면키);
  지금탭 = 탭.키;
  지금화면 = (화면 || 탭.화면들[0]).키;
  return true;
}

function 전부다시() {
  머리다시();
  탭다시();
  알약다시();
  화면다시();
}

window.addEventListener('hashchange', () => {
  해시읽기();
  전부다시();
  window.scrollTo({ top: 0, behavior: 'instant' });
});

/* ────────────────────────────── 시작 ────────────────────────────────── */

저장.불러오기();
해시읽기();
전부다시();
