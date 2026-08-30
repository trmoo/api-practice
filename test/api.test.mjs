/*! ==========================================================================
 * api.test.mjs — 이중 모드가 실제와 어긋나지 않는가
 *
 * ★ 이 시험이 지키는 것 —
 *   연습 모드가 실제 API 와 「다르게」 동작하면 학생이 틀린 것을 배운다.
 *   그래서 5건 제한·INFO-200·GMT 환산까지 실제와 같은지 대조한다.
 *   (실제 응답 형태는 2026-08-30 에 진짜로 불러 확인한 것이다.)
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import * as api from '../src/lib/api.js';

export const 이름 = 'API 이중 모드';

export function run(T) {
  api.모드바꾸기('연습');

  T.group('모드 스위치');
  T.ok('연습으로 바꾸면 연습이다', api.현재모드(), '연습');
  api.모드바꾸기('실제');
  T.ok('실제로 되돌아온다', api.현재모드(), '실제');
  api.모드바꾸기('엉뚱한값');
  T.ok('모르는 값은 실제로 친다', api.현재모드(), '실제');
  api.모드바꾸기('연습');

  T.group('나이스 응답 껍데기 — 실제와 같은 모양인가');
  const 있음 = api.나이스모양('schoolInfo', [{ SCHUL_NM: '가' }], 7);
  T.ok('자료가 있으면 이름 아래 두 칸', Object.keys(있음), ['schoolInfo']);
  T.ok('[0]은 head', Object.keys(있음.schoolInfo[0]), ['head']);
  T.ok('[1]은 row', Object.keys(있음.schoolInfo[1]), ['row']);
  T.ok('전체 건수가 head 에 들어간다', api.나이스전체건수(있음, 'schoolInfo'), 7);
  T.ok('처리 결과는 INFO-000', 있음.schoolInfo[0].head[1].RESULT.CODE, 'INFO-000');

  const 없음 = api.나이스모양('schoolInfo', []);
  T.ok('자료가 없으면 RESULT 가 맨 바깥으로', Object.keys(없음), ['RESULT']);
  T.ok('없을 때 코드는 INFO-200', 없음.RESULT.CODE, 'INFO-200');
  T.ok('없을 때 줄 꺼내면 빈 배열', api.나이스줄(없음, 'schoolInfo'), []);
  T.ok('없을 때 건수는 0', api.나이스전체건수(없음, 'schoolInfo'), 0);

  T.group('나이스 풀이 — 200 이라고 자료가 있는 건 아니다');
  T.ok('INFO-000 은 좋음', api.나이스풀이(있음).좋음, true);
  T.ok('INFO-200 은 좋지 않음', api.나이스풀이(없음).좋음, false);
  T.has('INFO-200 풀이에 「성공했지만」이 있다', api.나이스풀이(없음).말, '성공했지만');
  T.ok('응답이 없으면 좋지 않음', api.나이스풀이(null).좋음, false);

  T.group('학교 찾기 — 주소 만들기');
  const 찾기 = api.학교찾기('와우');
  T.has('나이스 주소를 부른다', 찾기.주소, 'open.neis.go.kr/hub/schoolInfo');
  T.has('한글은 인코딩해서 넣는다', 찾기.주소, 'SCHUL_NM=%EC%99%80%EC%9A%B0');
  T.has('pSize 는 5', 찾기.주소, 'pSize=5');
  T.falsy('인증키를 주소에 넣지 않는다', 찾기.주소.includes('KEY='));

  T.group('학교 찾기 — 연습 모드가 5건 제한을 재현하는가');
  const 와우 = 찾기.연습();
  T.ok('와우로 찾으면 한 곳', api.나이스줄(와우, 'schoolInfo').length, 1);
  T.ok('그것은 와우고등학교', api.나이스줄(와우, 'schoolInfo')[0].SCHUL_NM, '와우고등학교');
  T.ok('시도교육청은 경기(J10)', api.나이스줄(와우, 'schoolInfo')[0].ATPT_OFCDC_SC_CODE, 'J10');

  // 「고」로 찾으면 많이 걸린다 — 그래도 5건까지만 와야 한다.
  const 많음 = api.학교찾기('고').연습();
  const 많음줄 = api.나이스줄(많음, 'schoolInfo');
  T.ok('많이 걸려도 5건까지만 온다', 많음줄.length <= api.무키최대건수, true);
  T.ok('전체 건수는 자르기 전 수를 알려 준다',
    api.나이스전체건수(많음, 'schoolInfo') >= 많음줄.length, true);

  const 빈검색 = api.학교찾기('').연습();
  T.ok('빈 검색어는 자료 없음', api.나이스풀이(빈검색).코드, 'INFO-200');
  const 없는학교 = api.학교찾기('없는학교이름zzz').연습();
  T.ok('없는 이름도 INFO-200', api.나이스풀이(없는학교).코드, 'INFO-200');

  T.group('★ JSON 만 오는 것이 아니다 — Type 파라미터로 형식이 갈린다');
  T.has('기본은 Type=json', api.학교찾기('와우').주소, 'Type=json');
  T.has('xml 을 주면 Type=xml', api.학교찾기('와우', 'xml').주소, 'Type=xml');
  T.ok('형식을 밝혀 준다', api.학교찾기('와우', 'xml').형식, 'xml');
  T.ok('모르는 값은 json 으로 친다', api.학교찾기('와우', '엉뚱').형식, 'json');
  T.ok('형식만 다르고 나머지 주소는 같다',
    api.학교찾기('와우', 'xml').주소.replace('Type=xml', 'Type=json'),
    api.학교찾기('와우', 'json').주소);
  T.ok('형식이 달라도 연습 자료는 같다',
    JSON.stringify(api.학교찾기('와우', 'xml').연습()),
    JSON.stringify(api.학교찾기('와우', 'json').연습()));

  T.group('나이스 XML 옮겨 적기 — 같은 자료, 다른 모양');
  const 찾은것 = api.학교찾기('와우').연습();
  const xml = api.나이스XML(찾은것, 'schoolInfo');
  T.has('XML 선언으로 시작한다', xml, '<?xml version="1.0" encoding="UTF-8"?>');
  T.has('바깥 태그가 이름과 같다', xml, '<schoolInfo>');
  T.has('닫는 태그도 있다', xml, '</schoolInfo>');
  T.has('head 가 있다', xml, '<list_total_count>');
  T.has('row 가 있다', xml, '<row>');
  T.has('학교 이름이 태그 안에 들어간다', xml, '<SCHUL_NM>와우고등학교</SCHUL_NM>');
  T.ok('여는 태그와 닫는 태그 수가 같다',
    (xml.match(/<row>/g) || []).length, (xml.match(/<\/row>/g) || []).length);
  T.ok('JSON 이 아니다', (() => { try { JSON.parse(xml); return false; } catch { return true; } })(), true);
  const 빈xml = api.나이스XML(api.학교찾기('없는학교zzz').연습(), 'schoolInfo');
  T.has('자료가 없으면 XML 로도 INFO-200', 빈xml, '<CODE>INFO-200</CODE>');

  T.group('급식 — 주소 만들기');
  const 하루 = api.급식('J10', '7531428', '20260824');
  T.has('날짜 하나면 MLSV_YMD', 하루.주소, 'MLSV_YMD=20260824');
  T.falsy('날짜 하나면 기간 파라미터는 안 붙는다', 하루.주소.includes('MLSV_FROM_YMD'));
  const 기간 = api.급식('J10', '7531428', '20260824', '20260828');
  T.has('기간이면 FROM 이 붙는다', 기간.주소, 'MLSV_FROM_YMD=20260824');
  T.has('기간이면 TO 가 붙는다', 기간.주소, 'MLSV_TO_YMD=20260828');
  T.has('시도교육청 코드가 들어간다', 기간.주소, 'ATPT_OFCDC_SC_CODE=J10');
  T.has('학교 코드가 들어간다', 기간.주소, 'SD_SCHUL_CODE=7531428');

  T.group('급식 — 연습 모드');
  const 급식응답 = 기간.연습();
  const 급식줄 = api.나이스줄(급식응답, 'mealServiceDietInfo');
  T.ok('와우고 급식이 담겨 있다', 급식줄.length > 0, true);
  T.ok('5건을 넘지 않는다', 급식줄.length <= api.무키최대건수, true);
  T.ok('날짜가 차례대로다', 급식줄.map((m) => m.MLSV_YMD),
    [...급식줄.map((m) => m.MLSV_YMD)].sort());
  T.truthy('식단(DDISH_NM)이 있다', 급식줄[0].DDISH_NM);
  T.truthy('열량(CAL_INFO)이 있다', 급식줄[0].CAL_INFO);
  T.has('열량에 Kcal 이 붙어 있다 — 숫자가 아니다', 급식줄[0].CAL_INFO, 'Kcal');
  T.has('식단이 <br/> 로 이어져 있다', 급식줄[0].DDISH_NM, '<br/>');

  const 일요일 = api.급식('J10', '7531428', '20260830').연습();
  T.ok('급식 없는 날은 INFO-200', api.나이스풀이(일요일).코드, 'INFO-200');
  const 딴학교 = api.급식('J10', '9999999', '20260824').연습();
  T.ok('담기지 않은 학교도 INFO-200', api.나이스풀이(딴학교).코드, 'INFO-200');

  T.group('연습 모드에 담긴 것 알려 주기');
  T.ok('와우고는 급식이 있다', api.연습에급식있나('J10', '7531428'), true);
  T.ok('없는 학교는 없다고 한다', api.연습에급식있나('J10', '9999999'), false);
  T.ok('담긴 학교 목록이 비어 있지 않다', api.연습급식학교들().length > 0, true);
  T.truthy('담긴 학교에 이름이 붙어 있다',
    api.연습급식학교들().every((s) => s.이름 && s.이름 !== '(이름 모름)'));
  T.ok('와우고의 담긴 날짜가 있다', api.연습급식날짜들('J10', '7531428').length > 0, true);

  T.group('날씨 — 고른 항목만 온다');
  const 하나만 = api.날씨('서울', ['temperature_2m'], true).연습();
  T.ok('기온만 골랐으면 기온만',
    Object.keys(하나만.current).filter((k) => k !== 'time' && k !== 'interval'),
    ['temperature_2m']);
  const 셋 = api.날씨('서울', ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m'], true).연습();
  T.ok('셋을 고르면 셋이 온다',
    Object.keys(셋.current).filter((k) => k !== 'time' && k !== 'interval').length, 3);
  T.ok('단위도 고른 것만 온다',
    Object.keys(셋.current_units).filter((k) => k !== 'time' && k !== 'interval').length, 3);
  T.ok('아무것도 안 고르면 자료가 없다', api.날씨('서울', [], true).연습(), null);
  T.ok('모르는 도시는 자료가 없다', api.날씨('없는도시', ['temperature_2m'], true).연습(), null);

  T.group('날씨 — 시간대를 빼면 GMT 로 온다 (실제 API 와 같게)');
  const 한국 = api.날씨('서울', ['temperature_2m'], true).연습();
  const 세계 = api.날씨('서울', ['temperature_2m'], false).연습();
  T.ok('붙이면 Asia/Seoul', 한국.timezone, 'Asia/Seoul');
  T.ok('빼면 GMT', 세계.timezone, 'GMT');
  T.ok('붙이면 시차 32400초', 한국.utc_offset_seconds, 32400);
  T.ok('빼면 시차 0초', 세계.utc_offset_seconds, 0);
  T.ok('기온 값 자체는 같다', 세계.current.temperature_2m, 한국.current.temperature_2m);
  const 한국시각 = new Date(`${한국.current.time}:00Z`).getTime();
  const 세계시각 = new Date(`${세계.current.time}:00Z`).getTime();
  T.ok('시각이 정확히 9시간 이르다', (한국시각 - 세계시각) / 3600000, 9);
  T.has('주소에 시간대가 붙는다', api.날씨('서울', ['temperature_2m'], true).주소, 'timezone=Asia%2FSeoul');
  T.falsy('빼면 주소에도 없다', api.날씨('서울', ['temperature_2m'], false).주소.includes('timezone'));

  T.group('날씨 — 도시마다 좌표가 다르다');
  T.ok('도시가 여섯 곳', Object.keys(api.도시좌표).length, 6);
  const 좌표들 = Object.values(api.도시좌표).map((c) => c.join(','));
  T.ok('좌표가 겹치는 도시가 없다', new Set(좌표들).size, 좌표들.length);
  T.has('서울 좌표가 주소에 들어간다', api.날씨('서울', ['temperature_2m']).주소, 'latitude=37.5665');
  T.has('부산 좌표가 주소에 들어간다', api.날씨('부산', ['temperature_2m']).주소, 'latitude=35.1796');

  T.group('첫 요청용 API');
  T.has('강아지 주소', api.강아지().주소, 'dog.ceo/api/breeds/image/random');
  T.truthy('강아지 연습 응답에 message 가 있다', api.강아지().연습().message);
  T.has('위키 주소에 낱말이 인코딩되어 들어간다',
    api.위키('인공지능').주소, encodeURIComponent('인공지능'));
  T.truthy('위키 연습 응답에 요약이 있다', api.위키('인공지능').연습().extract);
  T.ok('담기지 않은 낱말은 자료 없음', api.위키('없는낱말zzz').연습(), null);

  T.group('시도교육청 코드 풀이');
  T.ok('J10 은 경기도교육청', api.시도이름('J10'), '경기도교육청');
  T.ok('B10 은 서울특별시교육청', api.시도이름('B10'), '서울특별시교육청');
  T.ok('모르는 코드는 그대로', api.시도이름('ZZZ'), 'ZZZ');

  T.group('부르기 — 연습 모드는 실패해도 앱이 죽지 않는다');
  const 결과묶음 = [];
  return Promise.all([
    api.부르기(api.학교찾기('와우'), { 뜸: 0 }).then((r) => 결과묶음.push(['찾음', r])),
    api.부르기(api.위키('없는낱말zzz'), { 뜸: 0 }).then((r) => 결과묶음.push(['없음', r])),
  ]).then(() => {
    const 찾음 = 결과묶음.find((x) => x[0] === '찾음')[1];
    const 없음2 = 결과묶음.find((x) => x[0] === '없음')[1];
    T.ok('연습 모드는 200 을 준다', 찾음.상태, 200);
    T.ok('연습 모드라고 밝힌다', 찾음.모드, '연습');
    T.ok('ok 가 참', 찾음.ok, true);
    T.ok('오류가 없다', 찾음.오류, null);
    T.ok('담기지 않은 것은 ok 가 거짓', 없음2.ok, false);
    T.has('무엇을 하라고 알려 준다', 없음2.오류, '실제 호출');
    T.ok('걸린 시간을 잰다', typeof 찾음.걸린ms, 'number');
  });
}
