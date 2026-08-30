/*! API 실습실 — 연습 모드용 실제 응답 수집기
 *  © 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요.
 *
 *  실제 API 를 한 번 호출해 그 응답을 src/data/samples.js 에 담는다.
 *  교실 인터넷이 끊겨도 앱이 똑같이 동작하게 하려는 것이다(연습 모드).
 *  다시 만들려면:  node tools/fetch_samples.mjs
 *
 *  ⚠ 나이스(NEIS)는 인증키 없이 쓰면 **언제나 첫 5건만** 준다.
 *    pSize 를 키워도, pIndex 로 쪽을 넘겨도 소용없다(2026-08-30 확인).
 *    그래서 전국 목록을 통째로 받을 수 없고, 검색어를 여러 개 돌려 모은다.
 */
import { writeFileSync } from 'node:fs';

const 잠깐 = (ms) => new Promise((r) => setTimeout(r, ms));

async function 받기(url, 이름, 조용히 = false) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) { if (!조용히) console.log(`  ✗ ${이름}: HTTP ${res.status}`); return null; }
    const json = await res.json();
    if (!조용히) console.log(`  ✓ ${이름}`);
    return json;
  } catch (e) {
    if (!조용히) console.log(`  ✗ ${이름}: ${e.message}`);
    return null;
  }
}

const 시도들 = [
  ['B10', '서울'], ['C10', '부산'], ['D10', '대구'], ['E10', '인천'], ['F10', '광주'],
  ['G10', '대전'], ['H10', '울산'], ['I10', '세종'], ['J10', '경기'], ['K10', '강원'],
  ['M10', '충북'], ['N10', '충남'], ['P10', '전북'], ['Q10', '전남'], ['R10', '경북'],
  ['S10', '경남'], ['T10', '제주'],
];

// 검색어를 여러 개 돌려 학교를 모은다. 한 번에 5건뿐이라 이렇게밖에 못 한다.
const 검색어들 = [
  '와우', '중앙', '동화', '봉담', '한빛', '푸른', '늘푸른', '한울', '해솔', '새롬',
  '대명', '성실', '명덕', '경기', '서울', '부산', '대구', '인천', '광주', '대전',
  '제일', '여자', '과학', '외국어', '예술', '체육', '상업', '공업', '농업', '정보',
];

async function 학교모으기() {
  console.log('\n[1] 학교 목록 모으기 (한 번에 5건 제한이라 여러 번 부른다)');
  const 모음 = new Map(); // 「시도코드/학교코드」 → 줄

  const 담기 = (rows) => {
    for (const r of rows || []) {
      if (r.SCHUL_KND_SC_NM !== '고등학교') continue;
      const 열쇠 = `${r.ATPT_OFCDC_SC_CODE}/${r.SD_SCHUL_CODE}`;
      if (모음.has(열쇠)) continue;
      모음.set(열쇠, [
        r.SCHUL_NM,
        r.ATPT_OFCDC_SC_CODE,
        r.SD_SCHUL_CODE,
        (r.ORG_RDNMA || '').split(/\s+/).slice(0, 2).join(' '),
      ]);
    }
  };

  // ⓐ 시도교육청마다 5건씩
  for (const [코드, 이름] of 시도들) {
    const d = await 받기(
      `https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=5&ATPT_OFCDC_SC_CODE=${코드}`
      + `&SCHUL_KND_SC_NM=${encodeURIComponent('고등학교')}`, `시도 ${이름}`, true);
    담기(d?.schoolInfo?.[1]?.row);
    await 잠깐(250);
  }
  console.log(`  시도별 → ${모음.size}개교`);

  // ⓑ 검색어마다 5건씩
  for (const 말 of 검색어들) {
    const d = await 받기(
      `https://open.neis.go.kr/hub/schoolInfo?Type=json&pSize=5`
      + `&SCHUL_NM=${encodeURIComponent(말)}`, `검색 ${말}`, true);
    담기(d?.schoolInfo?.[1]?.row);
    await 잠깐(250);
  }
  console.log(`  검색어까지 → ${모음.size}개교`);

  const 목록 = [...모음.values()].sort((a, b) => a[0].localeCompare(b[0], 'ko'));
  return 목록;
}

// 급식이 실제로 있는 학교만 골라 담는다.
async function 급식모으기(학교목록) {
  console.log('\n[2] 급식 식단 (급식이 실제로 있는 학교만 담는다)');
  const 결과 = {};
  const 후보 = [];

  // 와우고를 맨 앞에 두고, 시도가 겹치지 않게 골라 담는다.
  const 와우 = 학교목록.find((s) => s[0] === '와우고등학교');
  if (와우) 후보.push(와우);
  const 쓴시도 = new Set(와우 ? [와우[1]] : []);
  for (const s of 학교목록) {
    if (후보.length >= 12) break;
    if (쓴시도.has(s[1])) continue;
    쓴시도.add(s[1]);
    후보.push(s);
  }

  for (const [이름, 시도, 코드] of 후보) {
    const d = await 받기(
      `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${시도}`
      + `&SD_SCHUL_CODE=${코드}&MLSV_FROM_YMD=20260824&MLSV_TO_YMD=20260828`, 이름, true);
    const rows = d?.mealServiceDietInfo?.[1]?.row;
    if (rows?.length) {
      결과[`${시도}/${코드}`] = rows.map((r) => ({
        날짜: r.MLSV_YMD, 끼니: r.MMEAL_SC_NM, 식단: r.DDISH_NM,
        칼로리: r.CAL_INFO, 영양: r.NTR_INFO || '', 원산지: r.ORPLC_INFO || '',
      }));
      console.log(`  ✓ ${이름} — ${rows.length}일치`);
    } else {
      console.log(`  · ${이름} — 급식 없음`);
    }
    await 잠깐(250);
  }
  return 결과;
}

const 도시들 = [
  ['서울', 37.5665, 126.9780], ['부산', 35.1796, 129.0756],
  ['화성', 37.1996, 126.8310], ['강릉', 37.7519, 128.8761],
  ['제주', 33.4996, 126.5312], ['광주', 35.1595, 126.8526],
];
const 항목들 = 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code';

async function 날씨모으기() {
  console.log('\n[3] 날씨');
  const 결과 = {};
  for (const [이름, 위도, 경도] of 도시들) {
    const d = await 받기(`https://api.open-meteo.com/v1/forecast?latitude=${위도}&longitude=${경도}`
      + `&current=${항목들}&timezone=Asia%2FSeoul`, 이름);
    if (d) 결과[이름] = d;
    await 잠깐(200);
  }
  return 결과;
}

async function 첫요청모으기() {
  console.log('\n[4] 첫 요청용 샘플');
  const 강아지 = [];
  for (let i = 0; i < 5; i++) {
    const d = await 받기('https://dog.ceo/api/breeds/image/random', `강아지 ${i + 1}`);
    if (d) 강아지.push(d);
    await 잠깐(200);
  }
  const 위키 = {};
  for (const 낱말 of ['인공지능', '알고리즘', '데이터']) {
    const d = await 받기(
      `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(낱말)}`, `위키 ${낱말}`);
    if (d) 위키[낱말] = { title: d.title, extract: d.extract, thumbnail: d.thumbnail || null };
    await 잠깐(200);
  }
  return { 강아지, 위키 };
}

// ── 실행 ────────────────────────────────────────────────────
const 오늘 = new Date().toISOString().slice(0, 10);
const 학교 = await 학교모으기();
const 급식 = await 급식모으기(학교);
const 날씨 = await 날씨모으기();
const { 강아지, 위키 } = await 첫요청모으기();

if (!학교.some((s) => s[0] === '와우고등학교')) {
  console.log('\n⚠ 와우고등학교가 목록에 없다. 검색어를 확인할 것.');
}

const 본문 = `/*! API 실습실 — 연습 모드용 실제 응답 모음
 * © 2026 티쳐무 · 모든 권리 보유. 학교 수업 목적으로만 이용해 주세요.
 *
 * ⚠ 이 파일은 손으로 고치지 말 것. tools/fetch_samples.mjs 가 만든다.
 *    받은 날: ${오늘}
 *
 * 교실 인터넷이 끊겨도 앱이 동작하도록 진짜 API 응답을 그대로 담아 두었다.
 * 나이스는 인증키 없이 쓰면 언제나 첫 5건만 주므로(pIndex 도 무시된다),
 * 전국 목록을 통째로 받을 수 없어 검색어를 여러 개 돌려 모았다.
 * 그래서 연습 모드의 학교 목록은 전국 2,409개교 가운데 일부다.
 */

/** 샘플을 받은 날 — 화면에 「언제 받아 둔 값인지」 밝히는 데 쓴다 */
export const 받은날 = '${오늘}';

/** 나이스가 인증키 없이 한 번에 주는 최대 건수 */
export const 무키최대건수 = 5;

/** 학교 [이름, 시도코드, 학교코드, 시군구] — 연습 모드 검색 대상 */
export const 학교목록 = ${JSON.stringify(학교)};

/** 급식 식단 — 「시도코드/학교코드」가 열쇠 */
export const 급식샘플 = ${JSON.stringify(급식, null, 1)};

/** 날씨 — 도시 이름이 열쇠 */
export const 날씨샘플 = ${JSON.stringify(날씨, null, 1)};

/** 강아지 사진 (첫 요청 화면) */
export const 강아지샘플 = ${JSON.stringify(강아지, null, 1)};

/** 한국어 위키백과 요약 */
export const 위키샘플 = ${JSON.stringify(위키, null, 1)};
`;

writeFileSync(new URL('../src/data/samples.js', import.meta.url), 본문, 'utf8');
console.log(`\n✔ src/data/samples.js — 학교 ${학교.length}개교 · 급식 ${Object.keys(급식).length}개교`
  + ` · ${(Buffer.byteLength(본문, 'utf8') / 1024).toFixed(0)} KB`);
