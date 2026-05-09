#!/usr/bin/env bash
# Instala un LaunchAgent en macOS que ejecuta auto-push-to-github.sh cada 600 s (10 min).
# Ejecutar desde la raíz del repo:
#   bash scripts/install-auto-push-launchagent.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLIST_NAME="com.care.auto-push-github.plist"
DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"
RUNNER="$REPO_ROOT/scripts/auto-push-to-github.sh"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "Este instalador es solo para macOS. En Linux usa crontab con */10 * * * *"
  exit 1
fi

chmod +x "$RUNNER"

cat >"$DEST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.care.auto-push-github</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$RUNNER</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$REPO_ROOT</string>
  <key>StartInterval</key>
  <integer>600</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$HOME/Library/Logs/care-auto-push-github.out.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/Library/Logs/care-auto-push-github.err.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)" "$DEST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"

echo "Instalado: $DEST"
echo "Intervalo: 600 s (10 min). Logs: ~/Library/Logs/care-auto-push-github.*.log"
echo "Detener: launchctl bootout gui/\$(id -u) $DEST"
