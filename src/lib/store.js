/*! ==========================================================================
 * store.js — 화면끼리 주고받는 값과 점수를 담아 두는 곳
 *
 * ⚠ 학생 개인정보를 한 글자도 받지 않는다. 이름·학번 칸이 없고 서버도 없다.
 *   담기는 것은 「고른 학교」와 「활동 점수」뿐이고, 그나마도
 *   sessionStorage 라서 브라우저 탭을 닫으면 사라진다(컴퓨터실을 위한 것).
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

const 열쇠 = 'api-practice/v1';

const 처음값 = {
  고른학교: null,   // { 이름, 시도, 코드, 주소 }
  점수: {},         // { 활동키: true/false }
  마지막응답: null,  // 화면끼리 넘겨 보는 응답 (저장하지 않는다)
};

let 상태 = { ...처음값, 점수: {} };

/** 브라우저에 담아 둔 것을 불러온다 (없거나 깨졌으면 처음값) */
export function 불러오기() {
  try {
    const 글 = sessionStorage.getItem(열쇠);
    if (글) {
      const d = JSON.parse(글);
      상태 = { ...처음값, ...d, 점수: d.점수 || {}, 마지막응답: null };
    }
  } catch {
    // 사생활 보호 모드 등에서 sessionStorage 가 막힐 수 있다. 그래도 앱은 돌아가야 한다.
  }
  return 상태;
}

function 담기() {
  try {
    sessionStorage.setItem(열쇠, JSON.stringify({
      고른학교: 상태.고른학교, 점수: 상태.점수,
    }));
  } catch { /* 막혀 있어도 그냥 넘어간다 */ }
}

export function 값() { return 상태; }

export function 학교고르기(학교) { 상태.고른학교 = 학교; 담기(); }
export function 고른학교() { return 상태.고른학교; }

/** 활동 하나의 결과를 적는다 */
export function 채점(활동키, 맞았나) {
  상태.점수[활동키] = Boolean(맞았나);
  담기();
}

export function 맞았나(활동키) { return 상태.점수[활동키] === true; }

/** 지금까지 맞힌 수 / 푼 수 */
export function 점수요약(전체활동목록) {
  const 전체 = 전체활동목록.length;
  const 푼것 = 전체활동목록.filter((k) => k in 상태.점수).length;
  const 맞은것 = 전체활동목록.filter((k) => 상태.점수[k] === true).length;
  return { 전체, 푼것, 맞은것 };
}

/** 공용 컴퓨터를 위해 한 번에 지운다 */
export function 모두지우기() {
  상태 = { ...처음값, 점수: {} };
  try { sessionStorage.removeItem(열쇠); } catch { /* 막혀 있어도 그만 */ }
}

/** 화면끼리 응답을 넘겨 준다 (담아 두지는 않는다) */
export function 응답넘기기(응답) { 상태.마지막응답 = 응답; }
export function 넘어온응답() { return 상태.마지막응답; }
