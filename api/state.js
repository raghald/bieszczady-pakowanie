// Wspólny zapis odhaczeń dla obu telefonów.
// Dane leżą w Upstash Redis podłączonym do projektu na Vercelu:
// każda osoba ma własny hash, a każde odhaczenie to osobne pole,
// więc dwie osoby klikające naraz nie nadpisują sobie zmian.
// "Wspólne" to lista rzeczy wspólnych (apteczka, auto).
const PEOPLE = ["Asieńka", "Fryderyk", "Wspólne"];
const ID = /^[a-z0-9-]{1,40}$/;

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const key = (person) => `bieszczady-pakowanie:${person}`;

async function redis(commands) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error(`Upstash ${r.status}`);
  const out = await r.json();
  const failed = out.find((x) => x.error);
  if (failed) throw new Error(failed.error);
  return out.map((x) => x.result);
}

async function readAll() {
  const results = await redis(PEOPLE.map((p) => ["HGETALL", key(p)]));
  const people = {};
  PEOPLE.forEach((p, i) => {
    const flat = results[i] || [];
    people[p] = {};
    for (let j = 0; j < flat.length; j += 2) people[p][flat[j]] = true;
  });
  return people;
}

// Jedna zmiana: { person, id, checked } albo { person, reset: true }
function toCommand(op) {
  if (!op || !PEOPLE.includes(op.person)) return null;
  if (op.reset === true) return ["DEL", key(op.person)];
  if (typeof op.id !== "string" || !ID.test(op.id)) return null;
  return op.checked ? ["HSET", key(op.person), op.id, "1"] : ["HDEL", key(op.person), op.id];
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "Brak podłączonej bazy" });
  try {
    if (req.method === "GET") return res.status(200).json({ people: await readAll() });
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const ops = Array.isArray(body.ops) ? body.ops.slice(0, 200) : [];
      const commands = ops.map(toCommand);
      if (commands.length === 0 || commands.includes(null)) return res.status(400).json({ error: "Zła zmiana" });
      await redis(commands);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Metoda niedozwolona" });
  } catch (e) {
    return res.status(502).json({ error: "Baza nie odpowiada" });
  }
};

module.exports.toCommand = toCommand;
