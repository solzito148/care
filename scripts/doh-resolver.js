// DoH (DNS over HTTPS) resolver para uso con NODE_OPTIONS=--require
//
// Por que existe:
//   La red de la maquina bloquea outbound port 53 (DNS clasico) hacia 1.1.1.1,
//   8.8.8.8, 9.9.9.9 y router. Eso rompe `npm install` y cualquier herramienta
//   Node que use getaddrinfo().
//
// Que hace:
//   Monkey-patch dns.lookup() para que las consultas se resuelvan via
//   Cloudflare DoH en https://1.1.1.1/dns-query (puerto 443, no bloqueado).
//   Cachea resultados en memoria mientras dura el proceso.
//
// Uso:
//   NODE_OPTIONS="--require ./scripts/doh-resolver.js" npm install
//
// Limitaciones:
//   - Solo IPv4 (registros A). Casi todo el ecosistema npm vive ahi.
//   - No reemplaza /etc/hosts. Localhost, IPs literales y dominios .local pasan
//     por el lookup nativo.
//   - Una vez terminado el proceso npm, no queda residuo en el sistema.

"use strict";

const dns = require("dns");
const https = require("https");

const DOH_HOSTNAME = "1.1.1.1";
const DOH_PATH = "/dns-query";
const REQ_TIMEOUT_MS = 8000;

const aCache = new Map(); // hostname -> { ip, expiresAt }
const aaaaCache = new Map();

function isIpLiteral(host) {
  return /^\d+\.\d+\.\d+\.\d+$/.test(host) || /^[0-9a-fA-F:]+$/.test(host);
}

function isLocalLike(host) {
  if (!host) return true;
  if (host === "localhost") return true;
  if (host.endsWith(".local")) return true;
  return false;
}

function dohQuery(name, type, callback) {
  const cache = type === 28 ? aaaaCache : aCache;
  const cached = cache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return callback(null, cached.ip);
  }

  const req = https.request(
    {
      hostname: DOH_HOSTNAME,
      port: 443,
      path: `${DOH_PATH}?name=${encodeURIComponent(name)}&type=${type}`,
      method: "GET",
      headers: { accept: "application/dns-json" },
      timeout: REQ_TIMEOUT_MS,
      // 1.1.1.1 es IP literal, no requiere getaddrinfo
      lookup: (host, opts, cb) => cb(null, host, 4),
    },
    (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const answer = (json.Answer || []).find((a) => a.type === type);
          if (!answer || !answer.data) {
            return callback(new Error(`DoH: no answer for ${name} type=${type}`));
          }
          const ttlMs = Math.max(30, answer.TTL || 60) * 1000;
          cache.set(name, { ip: answer.data, expiresAt: Date.now() + ttlMs });
          callback(null, answer.data);
        } catch (err) {
          callback(err);
        }
      });
    }
  );
  req.on("timeout", () => req.destroy(new Error("DoH timeout")));
  req.on("error", callback);
  req.end();
}

const originalLookup = dns.lookup;

dns.lookup = function patchedLookup(hostname, optsOrCb, maybeCb) {
  let options = {};
  let callback;
  if (typeof optsOrCb === "function") {
    callback = optsOrCb;
  } else {
    options = optsOrCb || {};
    callback = maybeCb;
  }
  if (typeof callback !== "function") {
    return originalLookup.apply(this, arguments);
  }

  if (isIpLiteral(hostname) || isLocalLike(hostname)) {
    return originalLookup(hostname, options, callback);
  }

  // Solo A (IPv4) por ahora. AAAA opcional segun options.family.
  const wantsV6 = options.family === 6;
  const type = wantsV6 ? 28 : 1;
  const family = wantsV6 ? 6 : 4;

  dohQuery(hostname, type, (err, ip) => {
    if (err) {
      // Fallback al lookup nativo (probablemente fallara, pero damos chance)
      return originalLookup(hostname, options, callback);
    }
    if (options.all) {
      return callback(null, [{ address: ip, family }]);
    }
    callback(null, ip, family);
  });
};

dns.promises.lookup = function patchedPromiseLookup(hostname, options) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, options || {}, (err, address, family) => {
      if (err) return reject(err);
      if (options && options.all) return resolve(address);
      resolve({ address, family });
    });
  });
};

// Registro discreto para que el primer require deje rastro en stderr.
process.stderr.write("[doh-resolver] dns.lookup → DoH 1.1.1.1\n");
