#!/usr/bin/env bash
set -euo pipefail

subject=${1%%$'\n'*}
case "$subject" in
  deploy|deploy\ *|deploy:*) printf '%s\n' deploy ;;
  build|build\ *|build:*) printf '%s\n' build ;;
  *) printf '%s\n' skip ;;
esac
