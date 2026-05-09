#!/usr/bin/env bash
# Commit y push a origin cada vez que se ejecuta (pensado para cron/LaunchAgent cada 10 min).
#
# Uso manual:
#   ./scripts/auto-push-to-github.sh
#
# Cron (cada 10 min):
#   */10 * * * * /bin/bash /ruta/absoluta/a/care/scripts/auto-push-to-github.sh
#
# macOS LaunchAgent: ver scripts/install-auto-push-launchagent.sh
#
# Variables opcionales:
#   CARE_AUTO_PUSH_LOG  - archivo de log (default: <repo>/.auto-push.log)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

LOG="${CARE_AUTO_PUSH_LOG:-$REPO_ROOT/.auto-push.log}"
export GIT_TERMINAL_PROMPT=0

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >>"$LOG"
}

append_cmd_output() {
  local out="$1"
  while IFS= read -r line || [[ -n "$line" ]]; do
    printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$line" >>"$LOG"
  done <<<"$out"
}

main() {
  log "=== auto-push start ==="

  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log "abort: not a git repository"
    return 1
  fi

  if ! git remote get-url origin >/dev/null 2>&1; then
    log "skip: no remote named origin"
    return 0
  fi

  if [[ -z "$(git config user.email 2>/dev/null || true)" ]]; then
    log "warn: git user.email no configurado; el commit puede fallar (git config user.email ...)"
  fi

  BRANCH="$(git symbolic-ref -q --short HEAD 2>/dev/null || echo main)"

  # Cambios en working tree / staging / untracked
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    git add -A
    if git diff --cached --quiet 2>/dev/null; then
      log "nothing staged after add"
    else
      MSG="chore(auto): snapshot $(date -u +%Y-%m-%dT%H-%M-%SZ)"
      OUT=""
      if OUT=$(git commit -m "$MSG" 2>&1); then
        append_cmd_output "$OUT"
        log "committed: $MSG"
      else
        append_cmd_output "$OUT"
        log "commit failed"
        return 1
      fi
    fi
  fi

  if ! git rev-parse HEAD >/dev/null 2>&1; then
    log "skip: sin commits y sin cambios pendientes"
    return 0
  fi

  # Aborto en HEAD detached: no queremos pushear sin saber a que rama va
  if [[ "$BRANCH" == "HEAD" ]] || ! git symbolic-ref -q HEAD >/dev/null 2>&1; then
    log "abort: HEAD detached, no se pushea nada"
    return 1
  fi

  PUSH_OUT=""
  if git rev-parse '@{u}' >/dev/null 2>&1; then
    if ! PUSH_OUT=$(git push origin "$BRANCH" 2>&1); then
      append_cmd_output "$PUSH_OUT"
      # Detecta divergencia con remoto. NO hacemos rebase automatico para
      # evitar resoluciones agresivas en background; pedimos al usuario que
      # corra `git pull --rebase` manualmente.
      if grep -q -E "non-fast-forward|fetch first|rejected" <<<"$PUSH_OUT"; then
        log "push rechazado por divergencia con origin/$BRANCH. Ejecuta 'git pull --rebase origin $BRANCH' manualmente y vuelve a correr el script."
      else
        log "push failed"
      fi
      return 1
    fi
    append_cmd_output "$PUSH_OUT"
    log "push ok branch=$BRANCH"
  else
    if ! PUSH_OUT=$(git push -u origin "$BRANCH" 2>&1); then
      append_cmd_output "$PUSH_OUT"
      log "push failed (primer upstream)"
      return 1
    fi
    append_cmd_output "$PUSH_OUT"
    log "push ok (upstream set) branch=$BRANCH"
  fi

  return 0
}

main "$@"
