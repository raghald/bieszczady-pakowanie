const assert = require("assert");

// Udajemy Upstash: zapisujemy, co poszło, i zwracamy przygotowane wyniki.
const calls = [];
let reply = [];
global.fetch = async (url, opts) => {
  calls.push({ url, auth: opts.headers.Authorization, body: JSON.parse(opts.body) });
  return { ok: true, json: async () => reply };
};
process.env.KV_REST_API_URL = "https://upstash.test";
process.env.KV_REST_API_TOKEN = "t";
const handler = require("../api/state.js");

function res() {
  const r = { headers: {}, code: 0, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}

(async () => {
  // Odczyt obu list
  reply = [{ result: ["czapka", "1", "kijki", "1"] }, { result: [] }, { result: ["nrc", "1"] }];
  let r = res();
  await handler({ method: "GET" }, r);
  assert.strictEqual(r.code, 200);
  assert.deepStrictEqual(r.body.people, { Fryderyk: { czapka: true, kijki: true }, Asieńka: {}, Wspólne: { nrc: true } });
  assert.strictEqual(calls[0].url, "https://upstash.test/pipeline");
  assert.strictEqual(calls[0].auth, "Bearer t");

  // Zapis: każda zmiana to osobna komenda
  reply = [{ result: 1 }, { result: 1 }, { result: 1 }];
  r = res();
  await handler({ method: "POST", body: { ops: [
    { person: "Asieńka", id: "czapka", checked: true },
    { person: "Fryderyk", id: "kijki", checked: false },
    { person: "Fryderyk", reset: true }
  ] } }, r);
  assert.strictEqual(r.code, 200);
  assert.deepStrictEqual(calls[1].body, [
    ["HSET", "bieszczady-pakowanie:Asieńka", "czapka", "1"],
    ["HDEL", "bieszczady-pakowanie:Fryderyk", "kijki"],
    ["DEL", "bieszczady-pakowanie:Fryderyk"]
  ]);

  // Złe dane nie trafiają do bazy
  const n = calls.length;
  for (const ops of [[{ person: "Obcy", id: "a", checked: true }], [{ person: "Fryderyk", id: "ZŁE ID!", checked: true }], []]) {
    r = res();
    await handler({ method: "POST", body: { ops } }, r);
    assert.strictEqual(r.code, 400);
  }
  assert.strictEqual(calls.length, n);

  // Błąd bazy to 502, nie wywrotka funkcji
  global.fetch = async () => ({ ok: false, status: 500 });
  r = res();
  await handler({ method: "GET" }, r);
  assert.strictEqual(r.code, 502);

  r = res();
  await handler({ method: "DELETE" }, r);
  assert.strictEqual(r.code, 405);

  console.log("OK");
})().catch((e) => { console.error(e); process.exit(1); });
