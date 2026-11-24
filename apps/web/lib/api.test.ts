import { describe, expect, it } from 'vitest';
import { ApiError, formatTime, groupCode, makeClient, secondsLeft } from './api';

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status });

describe('makeClient', () => {
  it('sends the bearer token and parses JSON', async () => {
    let seen: RequestInit | undefined;
    const c = makeClient('http://api', 'tok', (async (_u: string, i?: RequestInit) => ((seen = i), json({ ok: 1 }))) as typeof fetch);
    expect(await c.get('/x')).toEqual({ ok: 1 });
    expect((seen!.headers as Record<string, string>).authorization).toBe('Bearer tok');
  });
  it('sends a JSON body on PUT', async () => {
    let seen: RequestInit | undefined;
    const c = makeClient('http://api', 't', (async (_u: string, i?: RequestInit) => ((seen = i), json({}))) as typeof fetch);
    await c.send('PUT', '/p', { rules: ['a'] });
    expect(seen!.method).toBe('PUT');
    expect(seen!.body).toBe('{"rules":["a"]}');
  });
  it('turns API errors into ApiError with the server message and status', async () => {
    const c = makeClient('http://api', 't', (async () => json({ error: { message: 'Send 2 to 4 rules' } }, 400)) as typeof fetch);
    await expect(c.get('/x')).rejects.toMatchObject({ status: 400, message: 'Send 2 to 4 rules' });
  });
  it('falls back to a generic message when the error body is not JSON', async () => {
    const c = makeClient('http://api', 't', (async () => new Response('boom', { status: 500 })) as typeof fetch);
    await expect(c.get('/x')).rejects.toMatchObject({ status: 500, message: 'Request failed (500)' });
  });
  it('reports an unreachable server as status 0', async () => {
    const c = makeClient('http://api', 't', (async () => { throw new TypeError('fail'); }) as typeof fetch);
    const e = await c.get('/x').catch((x) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(0);
  });
});

describe('helpers', () => {
  it('formatTime is UTC and stable', () => expect(formatTime('2026-11-26T14:03:11.000Z')).toBe('26 Nov 14:03:11'));
  it('formatTime leaves garbage alone', () => expect(formatTime('nope')).toBe('nope'));
  it('groupCode', () => {
    expect(groupCode('123456')).toBe('123-456');
    expect(groupCode('12')).toBe('12');
  });
  it('secondsLeft counts down and floors at zero', () => {
    const now = Date.parse('2026-11-26T10:00:00Z');
    expect(secondsLeft('2026-11-26T10:10:00Z', now)).toBe(600);
    expect(secondsLeft('2026-11-26T09:00:00Z', now)).toBe(0);
  });
});
