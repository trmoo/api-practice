/* ============================================================================
 * harness.mjs — 시험 도구
 *
 * 시험 파일 하나는 이렇게 생겼다.
 *   export const 이름 = '호환 판정';
 *   export function run(T) {
 *     T.group('초음파 센서');
 *     T.ok("설명", 나온값, 바라는값);
 *   }
 *
 * © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 무단 배포와 상업적 이용을 금합니다.
 * 그 밖의 이용(재배포·2차 저작물·수업 외 목적)은 먼저 문의해 주세요.
 * 자세한 이용 범위는 이 저장소의 LICENSE 파일에 적어 두었습니다.
 * ========================================================================== */

export function makeHarness() {
  let pass = 0;
  let fail = 0;
  const fails = [];

  const T = {
    /** 두 값이 같은가 (JSON 으로 견주므로 배열·객체도 된다) */
    ok(name, got, want) {
      const g = JSON.stringify(got);
      const w = JSON.stringify(want);
      if (g === w) { pass++; return true; }
      fail++;
      fails.push(`  ✗ ${name}\n      나온 값: ${g}\n      바라는 값: ${w}`);
      return false;
    },

    /** 참인가 */
    truthy(name, v) { return T.ok(name, !!v, true); },

    /** 거짓인가 */
    falsy(name, v) { return T.ok(name, !!v, false); },

    /** 소수 비교 (오차 허용) */
    near(name, got, want, eps = 1e-6) {
      if (Number.isFinite(got) && Math.abs(got - want) <= eps) { pass++; return true; }
      fail++;
      fails.push(`  ✗ ${name}\n      나온 값: ${got}\n      바라는 값: ${want} (±${eps})`);
      return false;
    },

    /** 글자가 들어 있는가 */
    has(name, hay, needle) {
      if (String(hay).includes(needle)) { pass++; return true; }
      fail++;
      fails.push(`  ✗ ${name}\n      「${needle}」 가 안 들어 있다\n      나온 값: ${hay}`);
      return false;
    },

    /** 시험 묶음의 제목 줄 */
    group(nm) { console.log(`\n── ${nm}`); },

    get pass() { return pass; },
    get fail() { return fail; },
    get fails() { return fails; },
  };

  return T;
}
