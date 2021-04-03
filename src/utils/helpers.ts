export function getParameterCaseInsensitive(object, key) {
  return object[
    Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase())
  ];
}

/**
 * Given 2 token symbols, create LP-Pair name based on the following rules (in priority):
 * 1) BANANA comes first
 * 2) BUSD comes second
 * 3) BNB comes second
 * 4) Sort alphabetically
 */
export function createLpPairName(t0, t1) {
  if (t0 == 'BANANA' || t1 == 'BANANA') {
    return t0 == 'BANANA' ? `[${t0}]-[${t1}] LP` : `[${t1}]-[${t0}] LP`;
  }

  if (t0 == 'BUSD' || t1 == 'BUSD') {
    return t0 == 'BUSD' ? `[${t1}]-[${t0}] LP` : `[${t0}]-[${t1}] LP`;
  }

  if (t0 == 'WBNB' || t0 == 'BNB') {
    return `[${t1}]-[${t0}] LP`;
  }
  if (t1 == 'WBNB' || t1 == 'BNB') {
    return `[${t0}]-[${t1}] LP`;
  }

  return t0.toLowerCase() < t1.toLowerCase()
    ? `[${t0}]-[${t1}] LP`
    : `[${t1}]-[${t0}] LP`;
}
