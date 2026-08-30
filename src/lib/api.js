/*! ==========================================================================
 * api.js — 이 앱의 심장. API 를 부르는 두 가지 길.
 *
 * ★ 이 앱은 다른 앱과 달리 「진짜 인터넷 요청」을 한다.
 *   그런데 교실에서는 인터넷이 끊기거나 학교 방화벽이 막는 일이 흔하다.
 *   그래서 모드를 둘 두었다.
 *
 *     🌐 실제 호출 — 진짜 fetch. 상태 코드와 걸린 시간까지 보여 준다.
 *     📦 연습 모드 — 미리 받아 둔 진짜 응답으로 똑같이 동작한다.
 *
 *   첫 요청이 실패하면 앱이 스스로 연습 모드를 제안한다.
 *   ⚠ 연습 모드도 「나이스는 최대 5건」 같은 제한을 그대로 재현한다.
 *     그러지 않으면 학생이 실제와 다른 것을 배우게 된다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import {
  받은날, 무키최대건수, 학교목록, 급식샘플, 날씨샘플, 강아지샘플, 위키샘플,
} from '../data/samples.js';

export { 받은날, 무키최대건수, 학교목록 };

/* ─────────────────────────────── 모드 ────────────────────────────────── */

let 모드 = '실제';          // '실제' | '연습'
let 실패한적있나 = false;    // 실제 호출이 한 번이라도 실패했는가

export function 현재모드() { return 모드; }
export function 모드바꾸기(m) { 모드 = m === '연습' ? '연습' : '실제'; return 모드; }
export function 실패기록() { return 실패한적있나; }
export function 실패지우기() { 실패한적있나 = false; }

/* ────────────────────────── 나이스 응답 만들기 ───────────────────────── */

/**
 * 나이스(NEIS)가 돌려주는 모양 그대로 만든다.
 * 자료가 있으면  { 이름: [ {head:[…]}, {row:[…]} ] }
 * 없으면        { RESULT: { CODE:'INFO-200', MESSAGE:'해당하는 데이터가 없습니다.' } }
 * ★ 껍데기를 실제와 똑같이 맞추는 것이 중요하다. 학생이 JSON 경로를
 *   d.schoolInfo[1].row[0] 처럼 짚어 보는 것이 이 수업의 핵심이기 때문이다.
 */
export function 나이스모양(이름, 줄들, 전체건수) {
  if (!줄들 || 줄들.length === 0) {
    return { RESULT: { CODE: 'INFO-200', MESSAGE: '해당하는 데이터가 없습니다.' } };
  }
  return {
    [이름]: [
      { head: [
        { list_total_count: 전체건수 ?? 줄들.length },
        { RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' } },
      ] },
      { row: 줄들 },
    ],
  };
}

/** 나이스 응답에서 줄 목록만 꺼낸다. 없으면 빈 배열. */
export function 나이스줄(응답, 이름) {
  return 응답?.[이름]?.[1]?.row ?? [];
}

/** 나이스 응답의 전체 건수. 없으면 0. */
export function 나이스전체건수(응답, 이름) {
  return 응답?.[이름]?.[0]?.head?.[0]?.list_total_count ?? 0;
}

/* ──────────────────────────── 부를 곳 목록 ───────────────────────────── */

const 나이스 = 'https://open.neis.go.kr/hub';

/** 시도교육청 코드 → 이름 */
export function 시도이름(코드) {
  return {
    B10: '서울특별시교육청', C10: '부산광역시교육청', D10: '대구광역시교육청',
    E10: '인천광역시교육청', F10: '광주광역시교육청', G10: '대전광역시교육청',
    H10: '울산광역시교육청', I10: '세종특별자치시교육청', J10: '경기도교육청',
    K10: '강원특별자치도교육청', M10: '충청북도교육청', N10: '충청남도교육청',
    P10: '전북특별자치도교육청', Q10: '전라남도교육청', R10: '경상북도교육청',
    S10: '경상남도교육청', T10: '제주특별자치도교육청',
  }[코드] || 코드;
}

/** 학교 이름으로 찾기 */
export function 학교찾기(이름) {
  const 말 = (이름 || '').trim();
  return {
    설명: `학교 이름에 「${말}」이 든 학교 찾기`,
    주소: `${나이스}/schoolInfo?Type=json&pSize=5&SCHUL_NM=${encodeURIComponent(말)}`,
    연습() {
      if (!말) return 나이스모양('schoolInfo', []);
      const 걸린것 = 학교목록.filter((s) => s[0].includes(말));
      // ⚠ 실제와 똑같이 5건에서 자른다. 전체 건수는 자르기 전 수를 알려 준다.
      const 줄들 = 걸린것.slice(0, 무키최대건수).map(([학교이름, 시도, 코드, 주소]) => ({
        ATPT_OFCDC_SC_CODE: 시도,
        ATPT_OFCDC_SC_NM: 시도이름(시도),
        SD_SCHUL_CODE: 코드,
        SCHUL_NM: 학교이름,
        SCHUL_KND_SC_NM: '고등학교',
        ORG_RDNMA: 주소,
      }));
      return 나이스모양('schoolInfo', 줄들, 걸린것.length);
    },
  };
}

/** 급식 식단 — 날짜 하나 또는 기간 */
export function 급식(시도, 학교코드, 시작, 끝) {
  const 기간 = 끝 && 끝 !== 시작
    ? `MLSV_FROM_YMD=${시작}&MLSV_TO_YMD=${끝}`
    : `MLSV_YMD=${시작}`;
  return {
    설명: `급식 식단 (${시작}${끝 && 끝 !== 시작 ? ` ~ ${끝}` : ''})`,
    주소: `${나이스}/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${시도}`
      + `&SD_SCHUL_CODE=${학교코드}&${기간}`,
    연습() {
      const 담긴것 = 급식샘플[`${시도}/${학교코드}`];
      if (!담긴것) return 나이스모양('mealServiceDietInfo', []);
      const 끝날 = 끝 || 시작;
      const 걸린것 = 담긴것.filter((m) => m.날짜 >= 시작 && m.날짜 <= 끝날);
      const 줄들 = 걸린것.slice(0, 무키최대건수).map((m) => ({
        ATPT_OFCDC_SC_CODE: 시도,
        SD_SCHUL_CODE: 학교코드,
        MMEAL_SC_NM: m.끼니,
        MLSV_YMD: m.날짜,
        DDISH_NM: m.식단,
        CAL_INFO: m.칼로리,
        NTR_INFO: m.영양,
        ORPLC_INFO: m.원산지,
      }));
      return 나이스모양('mealServiceDietInfo', 줄들, 걸린것.length);
    },
  };
}

/** 연습 모드에 급식이 담겨 있는 학교인가 */
export function 연습에급식있나(시도, 학교코드) {
  return Boolean(급식샘플[`${시도}/${학교코드}`]);
}

/** 연습 모드에 담긴 급식 학교들 */
export function 연습급식학교들() {
  return Object.keys(급식샘플).map((열쇠) => {
    const [시도, 코드] = 열쇠.split('/');
    const 찾음 = 학교목록.find((s) => s[1] === 시도 && s[2] === 코드);
    return { 시도, 코드, 이름: 찾음 ? 찾음[0] : '(이름 모름)', 주소: 찾음 ? 찾음[3] : '' };
  });
}

/** 연습 모드에 담긴 급식 날짜들 */
export function 연습급식날짜들(시도, 학교코드) {
  return (급식샘플[`${시도}/${학교코드}`] || []).map((m) => m.날짜);
}

export const 도시좌표 = {
  서울: [37.5665, 126.9780], 부산: [35.1796, 129.0756], 화성: [37.1996, 126.8310],
  강릉: [37.7519, 128.8761], 제주: [33.4996, 126.5312], 광주: [35.1595, 126.8526],
};

/** 「2026-08-30T15:00」에서 9시간을 뺀다 (KST → GMT 흉내) */
function 아홉시간빼기(iso) {
  const t = new Date(`${iso}:00Z`);
  if (Number.isNaN(t.getTime())) return iso;
  t.setUTCHours(t.getUTCHours() - 9);
  return t.toISOString().slice(0, 16);
}

/** 날씨 — 항목을 골라서 부른다 */
export function 날씨(도시, 항목들, 시간대붙이기 = true) {
  const 목록 = 항목들.join(',');
  const 좌표 = 도시좌표[도시] || 도시좌표['서울'];
  return {
    설명: `${도시}의 지금 날씨`,
    주소: `https://api.open-meteo.com/v1/forecast?latitude=${좌표[0]}&longitude=${좌표[1]}`
      + `&current=${목록}${시간대붙이기 ? '&timezone=Asia%2FSeoul' : ''}`,
    연습() {
      const 담긴것 = 날씨샘플[도시];
      if (!담긴것 || !항목들.length) return null;
      // 고른 항목만 남겨 실제 응답과 같은 모양으로 다시 만든다.
      const 값 = { time: 담긴것.current.time, interval: 담긴것.current.interval };
      const 단위 = { time: 담긴것.current_units.time, interval: 담긴것.current_units.interval };
      for (const 항목 of 항목들) {
        if (항목 in 담긴것.current) 값[항목] = 담긴것.current[항목];
        if (항목 in 담긴것.current_units) 단위[항목] = 담긴것.current_units[항목];
      }
      const 답 = { ...담긴것, current_units: 단위, current: 값 };
      // 시간대를 안 붙이면 실제 API 는 GMT 로 돌려준다. 그것까지 흉내 낸다.
      if (!시간대붙이기) {
        답.timezone = 'GMT';
        답.timezone_abbreviation = 'GMT';
        답.utc_offset_seconds = 0;
        답.current = { ...값, time: 아홉시간빼기(값.time) };
      }
      return 답;
    },
  };
}

let 강아지차례 = -1;

/** 강아지 사진 — 첫 요청용 */
export function 강아지() {
  return {
    설명: '강아지 사진 아무거나 한 장',
    주소: 'https://dog.ceo/api/breeds/image/random',
    연습() {
      if (!강아지샘플.length) return null;
      // 부를 때마다 다른 것이 나오도록 돌아가며 고른다.
      강아지차례 = (강아지차례 + 1) % 강아지샘플.length;
      return 강아지샘플[강아지차례];
    },
  };
}

/** 한국어 위키백과 요약 */
export function 위키(낱말) {
  return {
    설명: `위키백과에서 「${낱말}」 요약`,
    주소: `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(낱말)}`,
    연습() { return 위키샘플[낱말] || null; },
  };
}

/* ──────────────────────────────── 부르기 ─────────────────────────────── */

/**
 * 실제로 요청을 보낸다(또는 연습 모드면 담아 둔 응답을 꺼낸다).
 * 돌려주는 것 = { ok, 상태, 본문, 걸린ms, 모드, 주소, 오류 }
 *   ok    — 요청 자체가 성공했는가 (자료가 있다는 뜻은 아니다!)
 *   상태  — HTTP 상태 코드 (연습 모드는 200 으로 둔다)
 *   본문  — 풀어 낸 JSON
 *   오류  — 실패했을 때의 까닭 (사람이 읽을 말)
 */
export async function 부르기(spec, 옵션 = {}) {
  const 시작 = Date.now();

  if (모드 === '연습') {
    // 연습 모드에도 잠깐 뜸을 들인다 — 「보냄 → 기다림 → 받음」의 흐름을 보이게 하려고.
    await new Promise((r) => setTimeout(r, 옵션.뜸 ?? 260));
    const 본문 = spec.연습();
    if (본문 === null || 본문 === undefined) {
      return {
        ok: false, 상태: 0, 본문: null, 걸린ms: Date.now() - 시작,
        모드: '연습', 주소: spec.주소,
        오류: '연습 모드에는 이 자료가 담겨 있지 않습니다. 🌐 실제 호출로 바꿔 보세요.',
      };
    }
    return {
      ok: true, 상태: 200, 본문, 걸린ms: Date.now() - 시작,
      모드: '연습', 주소: spec.주소, 오류: null,
    };
  }

  try {
    // ⚠⚠ 헤더를 함부로 붙이지 말 것 (2026-08-30 실제로 겪음).
    //   Accept: application/json 을 붙였더니 나이스가 CORS 헤더
    //   (Access-Control-Allow-Origin)를 아예 안 보내 브라우저가 요청을 막았다.
    //   curl 로는 멀쩡히 되고 브라우저에서만 죽어서 찾기 어려웠다.
    //   Type=json 파라미터로 이미 형식을 정하고 있으므로 헤더는 필요 없다.
    const res = await fetch(spec.주소, {
      signal: AbortSignal.timeout(옵션.제한 ?? 15000),
    });
    const 글 = await res.text();
    let 본문 = null;
    let 오류 = null;
    try {
      본문 = JSON.parse(글);
    } catch {
      오류 = 'JSON 이 아닌 응답이 왔습니다. 주소를 다시 확인해 보세요.';
    }
    if (!res.ok && !오류) 오류 = `서버가 ${res.status} 을(를) 돌려주었습니다.`;
    return {
      ok: res.ok && !오류, 상태: res.status, 본문,
      걸린ms: Date.now() - 시작, 모드: '실제', 주소: spec.주소, 오류,
    };
  } catch (e) {
    실패한적있나 = true;
    const 시간초과 = e.name === 'TimeoutError' || e.name === 'AbortError';
    return {
      ok: false, 상태: 0, 본문: null, 걸린ms: Date.now() - 시작,
      모드: '실제', 주소: spec.주소,
      오류: 시간초과
        ? '기다려도 답이 오지 않았습니다(시간 초과). 인터넷이 느리거나 막혀 있을 수 있습니다.'
        : '요청을 보내지 못했습니다. 인터넷이 끊겼거나 학교 방화벽이 막았을 수 있습니다.',
    };
  }
}

/**
 * 나이스 응답을 사람이 읽을 말로 풀이한다.
 * ★ 이 앱에서 가장 중요한 가르침 하나 —
 *   HTTP 200 이라고 자료가 있다는 뜻이 아니다. 나이스는 자료가 없어도 200 을 주고
 *   본문에 INFO-200 을 담아 보낸다.
 */
export function 나이스풀이(응답) {
  if (!응답) return { 좋음: false, 코드: null, 말: '응답이 없습니다.' };
  if (응답.RESULT) {
    const c = 응답.RESULT.CODE;
    return {
      좋음: false, 코드: c,
      말: c === 'INFO-200'
        ? '요청은 성공했지만(200) 조건에 맞는 자료가 없습니다. 날짜나 학교를 바꿔 보세요.'
        : `${c} — ${응답.RESULT.MESSAGE}`,
    };
  }
  const 이름 = Object.keys(응답)[0];
  return { 좋음: true, 코드: 'INFO-000', 말: '자료를 찾았습니다.', 이름 };
}
