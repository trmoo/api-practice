/*! ==========================================================================
 * test/run.mjs — 앱이 스스로를 점검하는 시험 (전체를 모아 돌리는 곳)
 *
 *   실행:  npm test
 *
 * 화면을 그리는 함수는 부르지 않으므로 브라우저 없이 node 로 돌아간다.
 * ★ src/data/*.js 와 src/lib/*.js 에서 최상위에 document 를 건드리면 여기서 죽는다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import { makeHarness } from './harness.mjs';

import * as 자료 from './data.test.mjs';
import * as 라이브러리 from './lib.test.mjs';
import * as 에이피아이 from './api.test.mjs';

const 묶음들 = [자료, 라이브러리, 에이피아이];

const T = makeHarness();

for (const 묶음 of 묶음들) {
  console.log(`\n\n══════ ${묶음.이름} ══════`);
  // run() 이 Promise 를 돌려주면 끝날 때까지 기다린다.
  await 묶음.run(T);
}

console.log(`\n${'─'.repeat(64)}`);
if (T.fail) {
  console.log(T.fails.join('\n'));
  console.log(`\n❌ ${T.fail}가지가 어긋났습니다.  (통과 ${T.pass})`);
  process.exit(1);
}
console.log(`✅ ${T.pass}가지 모두 통과했습니다.`);
