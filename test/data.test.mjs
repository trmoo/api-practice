/*! ==========================================================================
 * data.test.mjs — 화면에 적어 둔 정답과 자료가 어긋나지 않는가
 *
 * ★ 이 시험이 지키는 것 —
 *   ① 경로 퀴즈의 정답 경로가 실제 응답에서 진짜로 값이 나오는가
 *      (정답이라고 적어 둔 길이 실제로는 끊겨 있으면 학생이 영영 못 맞힌다)
 *   ② 보기 안에 정답이 들어 있는가
 *   ③ 활동 열쇠가 겹치지 않는가 (겹치면 점수가 덮어써진다)
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import * as api from '../src/lib/api.js';
import { 값꺼내기, 경로글 } from '../src/lib/json.js';
import {
  주소퀴즈, 코드빈칸, 경로퀴즈, 전처리퀴즈, 활동목록, 알레르기표,
} from '../src/data/quiz.js';
import { 학교목록, 급식샘플, 날씨샘플, 강아지샘플, 위키샘플, 받은날 } from '../src/data/samples.js';

export const 이름 = '자료와 정답 대조';

export function run(T) {
  T.group('모아 둔 샘플');
  T.ok('받은 날이 적혀 있다', /^\d{4}-\d{2}-\d{2}$/.test(받은날), true);
  T.ok('학교가 100곳 넘게 담겨 있다', 학교목록.length >= 100, true);
  T.ok('학교 줄은 네 칸 [이름,시도,코드,주소]',
    학교목록.every((s) => Array.isArray(s) && s.length === 4), true);
  T.ok('와우고등학교가 담겨 있다',
    학교목록.some((s) => s[0] === '와우고등학교'), true);
  // ⚠ 학교급은 모두 고등학교지만(수집기가 걸러 낸다) 이름이 늘 「고등학교」로
  //   끝나지는 않는다. 「광주푸른꿈창작학교」 같은 대안·특성화 학교가 있다.
  const 고등학교로끝남 = 학교목록.filter((s) => s[0].endsWith('고등학교')).length;
  T.ok('거의 모두 「고등학교」로 끝난다', 고등학교로끝남 / 학교목록.length > 0.95, true);
  T.ok('그렇지 않은 곳도 학교 이름이 비어 있지는 않다',
    학교목록.every((s) => s[0].length >= 2), true);
  T.ok('학교 코드가 겹치지 않는다',
    new Set(학교목록.map((s) => `${s[1]}/${s[2]}`)).size, 학교목록.length);
  T.ok('시도교육청 코드를 모두 풀이할 수 있다',
    학교목록.every((s) => api.시도이름(s[1]) !== s[1]), true);

  T.group('급식 샘플');
  const 급식열쇠들 = Object.keys(급식샘플);
  T.ok('여러 학교의 급식이 담겨 있다', 급식열쇠들.length >= 5, true);
  T.ok('와우고 급식이 담겨 있다', 'J10/7531428' in 급식샘플, true);
  T.ok('급식 학교가 모두 학교 목록에도 있다',
    급식열쇠들.every((열쇠) => {
      const [시도, 코드] = 열쇠.split('/');
      return 학교목록.some((s) => s[1] === 시도 && s[2] === 코드);
    }), true);
  const 모든급식 = 급식열쇠들.flatMap((k) => 급식샘플[k]);
  T.ok('모든 급식에 날짜가 있다', 모든급식.every((m) => /^\d{8}$/.test(m.날짜)), true);
  T.ok('모든 급식에 식단이 있다', 모든급식.every((m) => m.식단 && m.식단.length > 0), true);
  T.ok('모든 급식에 열량이 있다', 모든급식.every((m) => m.칼로리), true);

  T.group('날씨·그 밖의 샘플');
  T.ok('도시 샘플과 좌표표의 도시가 같다',
    Object.keys(날씨샘플).sort(), Object.keys(api.도시좌표).sort());
  T.ok('날씨 샘플에 current 가 있다',
    Object.values(날씨샘플).every((d) => d.current && d.current_units), true);
  T.ok('강아지 샘플이 여러 장이다', 강아지샘플.length >= 3, true);
  T.ok('위키 샘플이 세 낱말', Object.keys(위키샘플).length, 3);

  T.group('활동 열쇠 — 겹치면 점수가 덮어써진다');
  T.ok('활동 열쇠가 겹치지 않는다', new Set(활동목록).size, 활동목록.length);
  T.ok('활동 수가 문제 수와 맞는다', 활동목록.length,
    주소퀴즈.length + 코드빈칸.length + 경로퀴즈.length + 전처리퀴즈.length);
  T.ok('모든 열쇠가 빈 글자가 아니다', 활동목록.every((k) => k && k.length > 2), true);

  T.group('고르기 문제 — 정답이 보기 안에 있는가');
  [...주소퀴즈, ...전처리퀴즈].forEach((문제) => {
    T.ok(`${문제.키}: 정답이 보기 안에 있다`, 문제.보기.includes(문제.답), true);
    T.ok(`${문제.키}: 보기가 겹치지 않는다`, new Set(문제.보기).size, 문제.보기.length);
    T.ok(`${문제.키}: 보기가 세 개 이상`, 문제.보기.length >= 3, true);
    T.truthy(`${문제.키}: 풀이가 있다`, 문제.풀이 && 문제.풀이.length > 10);
    T.truthy(`${문제.키}: 물음이 있다`, 문제.물음 && 문제.물음.length > 5);
  });

  T.group('코드 빈칸 — 표시가 코드 안에 있고 정답이 보기 안에 있는가');
  코드빈칸.forEach((문제) => {
    T.truthy(`${문제.키}: 코드가 있다`, 문제.코드 && 문제.코드.length > 20);
    T.ok(`${문제.키}: 언어가 js 나 py`, ['js', 'py'].includes(문제.언어), true);
    문제.빈칸.forEach((빈칸) => {
      T.ok(`${문제.키} ${빈칸.표}: 표시가 코드 안에 있다`, 문제.코드.includes(빈칸.표), true);
      T.ok(`${문제.키} ${빈칸.표}: 정답이 보기 안에 있다`, 빈칸.보기.includes(빈칸.답), true);
      T.ok(`${문제.키} ${빈칸.표}: 보기가 겹치지 않는다`,
        new Set(빈칸.보기).size, 빈칸.보기.length);
      T.truthy(`${문제.키} ${빈칸.표}: 힌트가 있다`, 빈칸.힌트 && 빈칸.힌트.length > 5);
      T.truthy(`${문제.키} ${빈칸.표}: 풀이가 있다`, 빈칸.풀이 && 빈칸.풀이.length > 10);
    });
    // 표시가 서로 겹치면 코드를 쪼갤 때 엉킨다
    T.ok(`${문제.키}: 빈칸 표시가 겹치지 않는다`,
      new Set(문제.빈칸.map((b) => b.표)).size, 문제.빈칸.length);
  });

  T.group('★ 경로 퀴즈 — 정답 경로가 실제 응답에서 값이 나오는가');
  api.모드바꾸기('연습');
  const 날짜들 = api.연습급식날짜들('J10', '7531428');
  const 급식응답 = api.급식('J10', '7531428', 날짜들[0], 날짜들[날짜들.length - 1]).연습();
  T.ok('먼저, 시험에 쓸 응답이 제대로 왔다', api.나이스풀이(급식응답).좋음, true);
  T.ok('두 줄 이상이다 (두 번째 날 문제가 있으므로)',
    api.나이스줄(급식응답, 'mealServiceDietInfo').length >= 2, true);

  경로퀴즈.forEach((문제) => {
    const 값 = 값꺼내기(급식응답, 문제.답);
    T.ok(`${문제.키}: 정답 경로에 값이 있다 (${경로글(문제.답, 'js')})`,
      값 !== undefined && 값 !== null, true);
    T.truthy(`${문제.키}: 풀이가 있다`, 문제.풀이 && 문제.풀이.length > 10);
  });
  T.ok('식단 경로의 값이 문자열이다',
    typeof 값꺼내기(급식응답, 경로퀴즈.find((q) => q.키 === 'path-dish').답), 'string');
  T.ok('건수 경로의 값이 숫자다',
    typeof 값꺼내기(급식응답, 경로퀴즈.find((q) => q.키 === 'path-count').답), 'number');
  T.ok('처리 코드는 INFO-000',
    값꺼내기(급식응답, 경로퀴즈.find((q) => q.키 === 'path-result').답), 'INFO-000');
  T.ok('두 번째 날 경로가 첫째 날과 다른 날짜를 가리킨다',
    값꺼내기(급식응답, ['mealServiceDietInfo', 1, 'row', 1, 'MLSV_YMD'])
      !== 값꺼내기(급식응답, ['mealServiceDietInfo', 1, 'row', 0, 'MLSV_YMD']), true);
  T.ok('경로 퀴즈 정답이 서로 겹치지 않는다',
    new Set(경로퀴즈.map((q) => q.답.join('/'))).size, 경로퀴즈.length);

  T.group('알레르기 표 — 식약처 19종');
  T.ok('열아홉 가지다', Object.keys(알레르기표).length, 19);
  T.ok('번호가 1부터 19까지 빠짐없다',
    Object.keys(알레르기표).map(Number).sort((a, b) => a - b),
    Array.from({ length: 19 }, (_, i) => i + 1));
  T.ok('1번은 난류', 알레르기표[1].startsWith('난류'), true);
  T.ok('2번은 우유', 알레르기표[2], '우유');
  T.ok('5번은 대두', 알레르기표[5].startsWith('대두'), true);
  T.ok('6번은 밀', 알레르기표[6], '밀');
  T.ok('9번은 새우', 알레르기표[9], '새우');
  T.ok('19번은 잣', 알레르기표[19], '잣');
  T.ok('이름이 겹치지 않는다',
    new Set(Object.values(알레르기표)).size, 19);

  T.group('실제 급식 자료에 모르는 알레르기 번호가 없는가');
  const 모든번호 = new Set();
  Object.values(급식샘플).flat().forEach((끼니) => {
    (끼니.식단.match(/\(([\d.\s]+)\)/g) || []).forEach((덩이) => {
      덩이.replace(/[()]/g, '').split('.').forEach((n) => {
        const 수 = Number(n.trim());
        if (Number.isFinite(수) && 수 > 0) 모든번호.add(수);
      });
    });
  });
  const 모르는것 = [...모든번호].filter((n) => !(n in 알레르기표));
  T.ok(`실제 자료의 번호 ${모든번호.size}가지가 모두 표에 있다`, 모르는것, []);
}
