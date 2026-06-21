#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p assets/music assets/sfx

echo "Creating demo production-safe audio assets..."

ffmpeg -y \
  -f lavfi -i "sine=frequency=146:duration=60" \
  -filter:a "volume=0.025,afade=t=in:ss=0:d=1,afade=t=out:st=58:d=2" \
  assets/music/fake-news-bed-01.wav

ffmpeg -y \
  -f lavfi -i "sine=frequency=392:duration=60" \
  -filter:a "volume=0.018,afade=t=in:ss=0:d=1,afade=t=out:st=58:d=2" \
  assets/music/documentary-bed-01.wav

ffmpeg -y \
  -f lavfi -i "sine=frequency=880:duration=0.28" \
  -filter:a "volume=0.08" \
  assets/sfx/alert-beep-01.wav

ffmpeg -y \
  -f lavfi -i "sine=frequency=660:duration=0.22" \
  -filter:a "volume=0.07" \
  assets/sfx/ding-confirm-01.wav

ffmpeg -y \
  -f lavfi -i "sine=frequency=180:duration=0.36" \
  -filter:a "volume=0.075" \
  assets/sfx/fail-buzzer-01.wav

./scripts/register-music.sh assets/music/fake-news-bed-01.wav fake-news "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo fake-news bed."
./scripts/register-music.sh assets/music/documentary-bed-01.wav documentary "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo documentary bed."

./scripts/register-sfx.sh assets/sfx/alert-beep-01.wav alert "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo alert beep."
./scripts/register-sfx.sh assets/sfx/ding-confirm-01.wav ding "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo ding."
./scripts/register-sfx.sh assets/sfx/fail-buzzer-01.wav fail "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo fail buzzer."

./scripts/audio-assets-refresh.sh

echo ""
echo "Demo production audio created and registered."
