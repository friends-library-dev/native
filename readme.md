# Friends Library Native Apps

This readme isn't really for external consumption, it's just the place where I'm dumping
all of the hard-earned arcane knowledge gained through lots of battles with React Native,
Xcode, App Store Connect, Android Studio, AVD, etc...

## IOS

## No bundle URL present error

- Got totally stymied by this for a long time, still totally unsure why, but it happened
  after I updated to Big Sur and Xcode 12.5. The workaround that finally worked was to
  run:

```bash
npx react-native bundle --dev false --platform ios --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ./ios
```

Then, make sure that the `ios/main.jsbundle` was added to the _FriendsLibrary_ target.
Then, run from Xcode, targeting the simulator I wanted to use. Once I got it to run, I
"shook" it and configured the bundler with `10.0.1.212 / 8081 / index` to hook it back up
to the local dev metro server.

**Update 9/21**: Maybe it's Xcode 12.5 or something, but the app crashes and hangs a lot
now in the simulator, which means I have to configure the bundler over and over. To
workaround that annoyance, I hacked
`node_modules/react-native/React/CoreModules/RCTDevMenu.mm` so that I can just click
"Apply Changes" without entering the info. If you ever re-install react-native, or your
internal IP address changes, modify that according to
[instructions here](https://gist.github.com/jaredh159/01cdf2388636b40e7bd7b0cb757f6929)

### Submitting a new version to App Store

- if skipping TestFlight, after you upload the build and it finishes "processing" press
  the little green PLUS symbol in the main App store area to create a new release.

### Screenshots

- build the app onto the 6.5" simulator using
  `run ios:en -- --simulator="iPhone 12 Pro Max"`
- navigate to the screen you want
- `<cmd>-3` to go to actual size
- `<cmd>-s` to save screenshot
- repeat with `run ios:en -- --simulator="iPhone 8 Plus"` to get 5.5" screenshots

### Make new build for TestFlight

- `cd packages/app && npm run xcode:release:en` (or `es`)
- select _Generic iOS Device_ from the upper-right thingy-do (see image below), then
  choose (from the top main menu bar) _Product > Archive_

### Misc iOS

- use `Icon Set Creator` app to create app icons
- to _see all archives_ choose (in Xcode) _Window > Organizer_ and choose the _Archives_
  tab
- really good article on getting builds of ios working on GH actions, includes some full
  commands of how to create an archive from the command line, which might be worth a lot:
  https://zach.codes/ios-builds-using-github-actions-without-fastlane/

## Android

### Emulator things

- You have two bash aliases in `~/.bashrc`: `android` opens up the phone-size emulator,
  and `androidtablet` opens up the tablet emulator. These shortcuts are necessary, because
  for some reason, if I don't open with the `-dns` flag, my android emulators can't talk
  to the external internet to download images, etc.
- the react-native `run-android` method
  [doesn't yet support](https://github.com/react-native-community/cli/issues/1038)
  specifying an emulator. So if you need to build onto a specific emulator, the only
  workaround I found was to a) close all emulators, b) open the emulator I want to build
  onto, and c) then run `npm run android:en|s`

## Emulator Rotation

- if you have screen rotation problems, try moving the emulator to a different monitor
  window after rotating. No idea why that helps, but seems to...
- to get the emulator to actually rotate, you have to click TWICE - first you click the
  external control floating next to the AVD. Second, you have about 3 seconds to click a
  rotation icon that pops up on the bottom black bar of operating system in the emulator
  screen.

## Building

- to build a release, go to `packages/app/android` and run `./gradlew bundleRelease` (this
  seems to create a `.aab` suitable for uploading to Google Play store, see below for
  ad-hoc testing)
- to build a release for direct installation (testing, no app store), do same as above
  except `./gradlew assembleRelease -x bundleReleaseJsAndAssets`
- end result files `.aab` or `.apk` seem to go into
  `./packages/app/android/app/build/outputs/apk/release` dir

### Misc Android

- icon helper tool: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- another icon helper tool https://apetools.webprofusion.com/#/tools/imagegorilla
