# DNS bloqueado en port 53 — workaround DoH

> Este doc solo aplica si tu red bloquea el outbound UDP/TCP 53 hacia los DNS
> publicos (1.1.1.1, 8.8.8.8, etc.) y `npm install` o `next dev` fallan con
> `getaddrinfo ENOTFOUND`. En cualquier otra red, los scripts sin sufijo
> (`npm install`, `npm run dev`) son los correctos.

## Sintoma

```
npm error code ENOTFOUND
npm error syscall getaddrinfo
npm error errno ENOTFOUND
npm error network request to https://registry.npmjs.org/... failed,
        reason: getaddrinfo ENOTFOUND registry.npmjs.org
```

`dig +short registry.npmjs.org` también falla (`connection timed out`),
pero el browser anda perfecto. Causa: DNS over HTTPS (puerto 443) si pasa,
DNS clasico (puerto 53) no.

## Causas comunes

- Firewall o filtro corporativo (NextDNS, Cloudflare WARP, Tailscale MagicDNS,
  Cisco Umbrella, perfil MDM).
- ISP que solo permite DoH/DoT.
- Politica de la red WiFi (cafe, hotel, oficina).

## Solucion permanente (recomendada)

1. **macOS Sonoma+**: Settings → Network → Wi-Fi → Details → DNS → click ⓘ →
   activar **Encrypted DNS**.
2. O bajar el [perfil DoH oficial de Cloudflare](https://one.one.one.one/dns/)
   y instalarlo (`Settings → Privacy & Security → Profiles`).

Una vez activado, `npm install` funciona normal sin scripts especiales.

## Workaround temporal (este repo)

Si todavia no podes cambiar la config de DNS, esta repo trae un mini-resolver
que monkey-patchea `dns.lookup` y resuelve via DoH:

| Comando | Equivalente normal |
| ------------------------ | ------------------ |
| `npm run install:doh`    | `npm install`      |
| `npm run dev:doh`        | `npm run dev`      |
| `npm run build:doh`      | `npm run build`    |
| `npm run start:doh`      | `npm run start`    |

Implementacion: [`scripts/doh-resolver.js`](../scripts/doh-resolver.js)
inyectado via `NODE_OPTIONS=--require`. No requiere sudo, no toca
`/etc/hosts`, no deja residuo en el sistema. Solo afecta al proceso Node
en el que se carga.

## Verificacion

```bash
node --require ./scripts/doh-resolver.js -e "
require('dns').lookup('registry.npmjs.org', (err, addr) =>
  console.log(err || ('OK ' + addr)));
"
```

Debe imprimir `[doh-resolver] dns.lookup → DoH 1.1.1.1` y luego
`OK 104.16.x.x`.
