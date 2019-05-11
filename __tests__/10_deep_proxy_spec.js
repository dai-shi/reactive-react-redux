import { createDeepProxy, isDeepChanged } from '../src/utils';

const noop = () => {};

describe('shallow object spec', () => {
  it('no property access', () => {
    const s1 = { a: 'a', b: 'b' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1);
    expect(isDeepChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: 'a2', b: 'b' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false);
  });

  it('one property access', () => {
    const s1 = { a: 'a', b: 'b' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a);
    expect(isDeepChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: 'a2', b: 'b' }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false);
  });
});

describe('deep object spec', () => {
  it('intermediate property access', () => {
    const s1 = { a: { b: 'b', c: 'c' } };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a);
    expect(isDeepChanged(s1, { a: s1.a }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: { b: 'b2', c: 'c' } }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: { b: 'b', c: 'c2' } }, a1)).toBe(true);
  });

  it('leaf property access', () => {
    const s1 = { a: { b: 'b', c: 'c' } };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.a.b);
    expect(isDeepChanged(s1, { a: s1.a }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: { b: 'b2', c: 'c' } }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: { b: 'b', c: 'c2' } }, a1)).toBe(false);
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

describe('array spec', () => {
  it('length', () => {
    const s1 = [1, 2, 3];
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(p1.length);
    expect(isDeepChanged(s1, [1, 2, 3], a1)).toBe(false);
    expect(isDeepChanged(s1, [1, 2, 3, 4], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2, 4], a1)).toBe(false);
  });

  it('forEach', () => {
    const s1 = [1, 2, 3];
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    p1.forEach(noop);
    expect(isDeepChanged(s1, [1, 2, 3], a1)).toBe(false);
    expect(isDeepChanged(s1, [1, 2, 3, 4], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2, 4], a1)).toBe(true);
  });

  it('for-of', () => {
    const s1 = [1, 2, 3];
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    // eslint-disable-next-line no-restricted-syntax
    for (const x of p1) {
      noop(x);
    }
    expect(isDeepChanged(s1, [1, 2, 3], a1)).toBe(false);
    expect(isDeepChanged(s1, [1, 2, 3, 4], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2], a1)).toBe(true);
    expect(isDeepChanged(s1, [1, 2, 4], a1)).toBe(true);
  });
});

describe('ownKeys spec', () => {
  it('object keys', () => {
    const s1 = { a: { b: 'b' }, c: 'c' };
    const a1 = new WeakMap();
    const p1 = createDeepProxy(s1, a1);
    noop(Object.keys(p1));
    expect(isDeepChanged(s1, { a: s1.a, c: 'c' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: { b: 'b' }, c: 'c' }, a1)).toBe(false);
    expect(isDeepChanged(s1, { a: s1.a }, a1)).toBe(true);
    expect(isDeepChanged(s1, { a: s1.a, c: 'c', d: 'd' }, a1)).toBe(true);
  });
});

// TODO in operator
// TODO cycles
// TODO builtins, frozen objects
