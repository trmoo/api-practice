/*! ==========================================================================
 * check_syntax.mjs — src 아래 모든 파일의 문법을 전수 검사한다
 *
 * ★ 왜 따로 두는가 —
 *   npm test 는 화면을 그리는 탭 파일(src/tabs/*.js)을 부르지 않는다.
 *   그래서 탭 파일에 괄호를 하나 빠뜨려도 시험은 멀쩡히 통과하고
 *   빌드에서야 터진다. 그 일을 막으려고 파일마다 문법만 훑는다.
 *
 *   실행:  npm run check:syntax
 *
 * 저작권 표시도 함께 검사한다 — 소스마다 머리 주석이 있어야 하고,
 * 그 주석이 /*! 로 시작해야 압축 뒤에도 살아남는다.
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

const 뿌리 = fileURLToPath(new URL('..', import.meta.url));
const 소스칸 = join(뿌리, 'src');

/** 폴더를 뒤져 파일을 모은다 */
function 파일모으기(폴더, 확장자들) {
  const 담을것 = [];
  for (const 이름 of readdirSync(폴더)) {
    const 길 = join(폴더, 이름);
    if (statSync(길).isDirectory()) 담을것.push(...파일모으기(길, 확장자들));
    else if (확장자들.some((e) => 이름.endsWith(e))) 담을것.push(길);
  }
  return 담을것;
}

const 자바스크립트들 = 파일모으기(소스칸, ['.js']);
const 시에스에스들 = 파일모으기(소스칸, ['.css']);
let 어긋남 = 0;
const 말썽 = [];

console.log(`\n── 문법 검사 — 자바스크립트 ${자바스크립트들.length}개`);

// ⚠ 그냥 import 로 검사할 수 없다 — main.js 는 './style.css' 를 부르는데
//   그것은 Vite 만 아는 문법이라 node 가 「Unknown file extension」 으로 죽는다.
//   그래서 문법은 esbuild 로 훑고(불러오기를 풀지 않는다), 진짜 불러오기는
//   CSS 를 쓰지 않는 파일에만 해서 「최상위 DOM 접근」을 잡는다.
for (const 길 of 자바스크립트들) {
  const 짧은이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf8');
  try {
    transformSync(글, { loader: 'js', format: 'esm', sourcefile: 짧은이름 });
    console.log(`  ✓ ${짧은이름}`);
  } catch (e) {
    어긋남++;
    말썽.push(`  ✗ ${짧은이름} — 문법 오류\n      ${(e.errors?.[0]?.text) || e.message}`);
    console.log(`  ✗ ${짧은이름} — 문법 오류`);
  }
}

console.log('\n── 최상위에서 DOM 을 건드리지 않는가 (node 로 진짜 불러 본다)');
for (const 길 of 자바스크립트들) {
  const 짧은이름 = relative(뿌리, 길).replace(/\\/g, '/');
  // CSS 를 부르는 파일은 node 로 못 불러온다(Vite 전용 문법). 건너뛴다.
  if (/from\s+['"][^'"]+\.css['"]|import\s+['"][^'"]+\.css['"]/.test(readFileSync(길, 'utf8'))) {
    console.log(`  · ${짧은이름} — CSS 를 부르므로 건너뜀`);
    continue;
  }
  try {
    await import(pathToFileURL(길).href);
    console.log(`  ✓ ${짧은이름}`);
  } catch (e) {
    어긋남++;
    말썽.push(`  ✗ ${짧은이름} — 불러오는 것만으로 죽는다\n      ${e.message}`);
    console.log(`  ✗ ${짧은이름}`);
  }
}

console.log(`\n── 저작권 머리 주석 — 소스 ${자바스크립트들.length + 시에스에스들.length}개`);
for (const 길 of [...자바스크립트들, ...시에스에스들]) {
  const 짧은이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf8');
  const 머리 = 글.slice(0, 1200);
  if (!머리.includes('티쳐무')) {
    어긋남++;
    말썽.push(`  ✗ ${짧은이름} — 머리 주석에 저작권 표시가 없다`);
    console.log(`  ✗ ${짧은이름} — 저작권 표시 없음`);
  } else if (!글.startsWith('/*!')) {
    // /*! 로 시작해야 압축할 때 「법적 고지」로 보고 남겨 준다.
    어긋남++;
    말썽.push(`  ✗ ${짧은이름} — 머리 주석이 /*! 로 시작하지 않아 압축하면 지워진다`);
    console.log(`  ✗ ${짧은이름} — /*! 로 시작하지 않음`);
  } else {
    console.log(`  ✓ ${짧은이름}`);
  }
}

console.log('\n── 화면 수명 규칙');
// ⚠ 탭 파일에서 window 리스너·타이머를 직접 걸면 화면을 오갈 때마다 쌓인다.
const 탭칸 = join(소스칸, 'tabs');
for (const 길 of 파일모으기(탭칸, ['.js'])) {
  const 짧은이름 = relative(뿌리, 길).replace(/\\/g, '/');
  const 글 = readFileSync(길, 'utf8');
  const 걸린것 = [];
  if (/window\.addEventListener/.test(글)) 걸린것.push('window.addEventListener → onWindow() 를 쓸 것');
  if (/setInterval\s*\(/.test(글)) 걸린것.push('setInterval → screenTimeout() 을 쓸 것');
  // ⚠ 크롬이 「…에 삽입된 페이지 내용:」 이라는 주소를 붙여 학생에게 보인다.
  if (/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(글)) 걸린것.push('브라우저 기본 alert/confirm/prompt 는 쓰지 말 것');
  if (걸린것.length) {
    어긋남 += 걸린것.length;
    걸린것.forEach((말) => 말썽.push(`  ✗ ${짧은이름} — ${말}`));
    console.log(`  ✗ ${짧은이름}`);
  } else {
    console.log(`  ✓ ${짧은이름}`);
  }
}

console.log(`\n${'─'.repeat(64)}`);
if (어긋남) {
  console.log(말썽.join('\n'));
  console.log(`\n❌ ${어긋남}가지가 어긋났습니다.`);
  process.exit(1);
}
console.log('✅ 문법·저작권·화면 수명 규칙 모두 통과했습니다.');
