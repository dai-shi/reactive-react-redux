import { createDeepProxy, isDeepChanged } from '../src/utils';

const noop = () => {};

describe('shallow object spec', () => {
  it('no property access', () => {
    const s1 = { a: 'a', b: 'b' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1);
    const s2 = { a: 'a', b: 'b' };
    expect(isDeepChanged(s1, s2, a1)).toBe(false);
    const s3 = { a: 'a2', b: 'b' };
    expect(isDeepChanged(s1, s3, a1)).toBe(false);
    const s4 = { a: 'a', b: 'b2' };
    expect(isDeepChanged(s1, s4, a1)).toBe(false);
  });

  it('one property access', () => {
    const s1 = { a: 'a', b: 'b' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a);
    const s2 = { a: 'a', b: 'b' };
    expect(isDeepChanged(s1, s2, a1)).toBe(false);
    const s3 = { a: 'a2', b: 'b' };
    expect(isDeepChanged(s1, s3, a1)).toBe(true);
    const s4 = { a: 'a', b: 'b2' };
    expect(isDeepChanged(s1, s4, a1)).toBe(false);
  });
});

describe('deep object spec', () => {
  it('intermediate property access', () => {
    const s1 = { a: { b: 'b', c: 'c' } };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a);
    const s2 = { a: s1.a }; // to keep reference
    expect(isDeepChanged(s1, s2, a1)).toBe(false);
    const s3 = { a: { b: 'b2', c: 'c' } };
    expect(isDeepChanged(s1, s3, a1)).toBe(true);
    const s4 = { a: { b: 'b', c: 'c2' } };
    expect(isDeepChanged(s1, s4, a1)).toBe(true);
  });

  it('leaf property access', () => {
    const s1 = { a: { b: 'b', c: 'c' } };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a.b);
    const s2 = { a: s1.a }; // to keep reference
    expect(isDeepChanged(s1, s2, a1)).toBe(false);
    const s3 = { a: { b: 'b2', c: 'c' } };
    expect(isDeepChanged(s1, s3, a1)).toBe(true);
    const s4 = { a: { b: 'b', c: 'c2' } };
    expect(isDeepChanged(s1, s4, a1)).toBe(false);
  });
});

describe('reference equality spec', () => {
  it('simple', () => {
    const proxyCache = new WeakMap();
    const s1 = { a: 'a', b: 'b' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1, proxyCache);
    noop(p1.a);
    const s2 = s1; // keep the reference
    const a2 = new WeakMap();
    const p2 = createDeepProxy(s2, a2, proxyCache);
    noop(p2.b);
    expect(p1).toBe(p2);
    expect(isDeepChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: 'a2', b: 'b' }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false);
    expect(isDeepChanged(s2, { a: 'a', b: 'b' }, a2)).toBe(false);
    expect(isDeepChanged(s2, { a: 'a2', b: 'b' }, a2)).toBe(false);
    expect(isDeepChanged(s2, { a: 'a', b: 'b2' }, a2)).toBe(true);
  });

  it('nested', () => {
    const proxyCache = new WeakMap();
    const s1 = { a: { b: 'b', c: 'c' } };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1, proxyCache);
    noop(p1.a.b);
    const s2 = { a: s1.a }; // keep the reference
    const a2 = new WeakMap();
    const p2 = createDeepProxy(s2, a2, proxyCache);
    noop(p2.a.c);
    expect(p1).not.toBe(p2);
    expect(p1.a).toBe(p2.a);
    expect(isDeepChanged(s1, { a: { b: 'b', c: 'c' } }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: { b: 'b2', c: 'c' } }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: { b: 'b', c: 'c2' } }, a1)).toBe(false);
    expect(isDeepChanged(s2, { a: { b: 'b', c: 'c' } }, a2)).toBe(false);
    expect(isDeepChanged(s2, { a: { b: 'b2', c: 'c' } }, a2)).toBe(false);
    expect(isDeepChanged(s2, { a: { b: 'b', c: 'c2' } }, a2)).toBe(true);
  });
});

// TODO symbol property
// TODO cycles
// TODO builtins, frozen objects
