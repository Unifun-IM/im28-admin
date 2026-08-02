#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
script="$script_dir/commit-mode.sh"

assert_mode() {
  local expected=$1
  local message=$2
  local actual

  actual=$("$script" "$message")
  if [[ "$actual" != "$expected" ]]; then
    printf 'expected %q for %q, got %q\n' "$expected" "$message" "$actual" >&2
    return 1
  fi
}

assert_mode build 'build'
assert_mode build 'build: publish image'
assert_mode build 'build publish image'
assert_mode deploy 'deploy'
assert_mode deploy 'deploy: production'
assert_mode deploy $'deploy production\n\nRelease body'
assert_mode skip 'builder update'
assert_mode skip 'deployment notes'
assert_mode skip 'Build: uppercase is ignored'
assert_mode skip 'feat: normal commit'

printf 'commit-mode tests passed\n'
