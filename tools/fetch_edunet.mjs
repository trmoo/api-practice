/* 에듀넷 주제별 학습자료 API — 연습 모드용 자료 만들기
 *
 * ⚠ 이 API 는 브라우저에서 직접 못 부른다 (2026-08-30 확인)
 *   ① Access-Control-Allow-Origin 헤더가 없다 → 브라우저가 막는다
 *   ② 파일이 1.3~8.2MB 다 → 한 반이 동시에 받으면 학교망이 버티지 못한다
 *   그래서 여기서 한 번 받아 「제목·키워드」만 남기고 잘라 담는다.
 *
 * ⚠ 저작권 — 콘텐츠 본문(<expln>, 1만 자 HTML)은 담지 않는다.
 *   제목·키워드·링크만 남긴다. 출처는 한국교육학술정보원(KERIS) 에듀넷.
 */
import { writeFileSync } from 'node:fs';

const 주소틀 = (id) => 'https://kr.object.gov-ncloudstorage.com/edunet-data'
  + `/KEDNCM/OPENAPI/CNEDU/WKSTCONT/cnedu_wkst_cont_${id}.xml`;

// 매뉴얼 2)요청 변수 표에 적힌 값 그대로
const 과목들 = [
  { id: '362', 이름: '사회' },
  { id: '363', 이름: '과학' },
  { id: '75541', 이름: '음악' },
  { id: '75542', 이름: '미술' },
  { id: '75543', 이름: '체육' },
  { id: '75544', 이름: '기술·가정·실과' },
  { id: '89162', 이름: '범교과 학습 주제' },
];

const 한줄 = (글, 태그) => {
  const m = new RegExp(`<${태그}>([\\s\\S]*?)</${태그}>`).exec(글);
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
};

const 결과 = {};
for (const 과목 of 과목들) {
  const res = await fetch(주소틀(과목.id), { signal: AbortSignal.timeout(180000) });
  const 글 = await res.text();
  const 만든날 = 한줄(글, 'create_date');
  const 전체 = Number(한줄(글, 'total')) || 0;

  // row 를 하나씩 훑되 무거운 expln 은 아예 건드리지 않는다.
  const 줄들 = [];
  const 정규식 = /<row>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = 정규식.exec(글)) !== null) {
    const 한칸 = m[1];
    const 제목 = 한줄(한칸, 'ttl');
    if (!제목) continue;
    줄들.push({
      conts_id: 한줄(한칸, 'conts_id'),
      ttl: 제목,
      kywd: 한줄(한칸, 'kywd'),
      unit_nm: 한줄(한칸, 'unit_nm') === 'null' ? '' : 한줄(한칸, 'unit_nm'),
      url: 한줄(한칸, 'url'),
    });
    if (줄들.length >= 12) break;   // 수업에는 12개면 넉넉하다
  }

  결과[과목.id] = {
    이름: 과목.이름, create_date: 만든날, total: 전체,
    보인건수: 줄들.length, rows: 줄들,
  };
  // ⚠ 글자 수(글.length)로 크기를 재면 안 된다 — 한글 UTF-8 은 한 글자가 3바이트라
  //   실제보다 30~40% 작게 나온다. Buffer.byteLength 로 진짜 바이트를 잰다.
  const 바이트 = Buffer.byteLength(글, 'utf8');
  console.log(`  ✓ ${과목.이름.padEnd(12)} clss_id=${과목.id.padEnd(6)} `
    + `전체 ${String(전체).padStart(4)}건 · ${(바이트 / 1048576).toFixed(1)}MB → ${줄들.length}건만 담음`);
}

writeFileSync(new URL('./edunet.json', import.meta.url),
  JSON.stringify(결과, null, 1), 'utf8');
const 크기 = JSON.stringify(결과).length;
console.log(`\n✔ edunet.json — ${(크기 / 1024).toFixed(0)} KB`);
