export function shallow<T>(objA: T, objB: T) {
  // Object.is() 的比较相对于全等更精确
  // Object.is(+0, -0) false
  // +0 === -0 true
  // Object.is(NaN, NaN) true
  // NaN === NaN false
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysB[i] as keyof T])
    ) {
      return false
    }
  }
  return true
}
