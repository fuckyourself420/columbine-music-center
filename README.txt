# Columbine Music Center (CMC)

Desktop music player for Windows and macOS.

## Development
- Install Node.js 22 or newer.
- Run `npm install`.
- Run `npm start`.

## Builds
- Windows installer: `npm run dist:win`
- Universal macOS DMG: `npm run dist:mac`

GitHub Actions workflows are available under `.github/workflows/`.

## Discord Rich Presence
CMC uses Discord Rich Presence when the Discord desktop app is running.
The activity displays `Listening to SONG by ARTIST` and the album name.
For the CMC skull image, add an image asset in the Discord Developer Portal
for this application with the exact asset key `cmc_icon`.

Discord Application ID: `1574631415201534002`

## Notes
- macOS builds are not code-signed or notarized by default.
- The Discord application asset key must be configured in the Developer Portal.
