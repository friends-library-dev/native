import fs from 'fs';
import path from 'path';
import exec from 'x-exec';
import { Lang } from '@friends-library/types';
import { MAROON_HEX, GOLD_HEX } from '@friends-library/theme';
import { BUILD_SEMVER_STRING, BUILD_NUM } from './build-constants';

const ENV_DIR = __dirname;
const APP_DIR = path.resolve(ENV_DIR, `..`);
const ENV = `${ENV_DIR}/index.ts`;
const IS_RELEASE = process.argv.includes(`--release`);
const LANG: Lang = process.argv[2] === `es` ? `es` : `en`;
const APP_NAME = LANG === `en` ? `Friends Library` : `Biblioteca de los Amigos`;
const PRIMARY_COLOR_HEX = LANG === `en` ? MAROON_HEX : GOLD_HEX;
const GIT_BRANCH = exec.exit(`git branch --show-current`).trim();
const INSTALL = GIT_BRANCH === `master` ? `release` : IS_RELEASE ? `beta` : `dev`;
const APP_IDENTIFIER = getAppIdentifier();

function main(): void {
  exec.exit(`printf "import { Lang } from '@friends-library/types';\n\n" > ${ENV}`);
  exec.exit(`cat ${ENV_DIR}/build-constants.ts >> ${ENV}`);

  const API_URL =
    INSTALL === `dev` ? `http://10.0.1.238:8080` : `https://api.friendslibrary.com`;

  // @see https://xkcd.com/1638/
  const constants = [
    `export const LANG: Lang = \\\`${LANG}\\\`;`,
    `export const PRIMARY_COLOR_HEX = \\\`${PRIMARY_COLOR_HEX}\\\`;`,
    `export const APP_NAME = \\\`${APP_NAME}\\\`;`,
    `export const INSTALL: 'release' | 'beta' | 'dev' = \\\`${INSTALL}\\\`;`,
    `export const API_URL = \\\`${API_URL}\\\`;`,
  ];

  exec.exit(`printf "${constants.join(`\n`)}" >> ${ENV}`);

  // compile ./env/index.ts -> ./env/index.js
  exec.exit(`npx tsc --project ./env`);

  copyFileWithEnv(`android/build.gradle`, `android/app/build.gradle`);
  copyFileWithEnv(`android/colors.xml`, `android/app/src/main/res/values/colors.xml`);
  copyFileWithEnv(`android/strings.xml`, `android/app/src/main/res/values/strings.xml`);
  copyFileWithEnv(`android/_BUCK`, `android/app/_BUCK`);
  copyFileWithEnv(
    `android/MainApplication.java`,
    `android/app/src/main/java/com/friendslibrary/MainApplication.java`,
  );
  copyFileWithEnv(
    `android/SplashActivity.java`,
    `android/app/src/main/java/com/friendslibrary/SplashActivity.java`,
  );
  copyFileWithEnv(
    `android/AndroidManifest.xml`,
    `android/app/src/main/AndroidManifest.xml`,
  );
  copyFileWithEnv(
    `android/MainActivity.java`,
    `android/app/src/main/java/com/friendslibrary/MainActivity.java`,
  );
  copyFileWithEnv(`ios/Info.plist`, `ios/FriendsLibrary/Info.plist`);
  copyFileWithEnv(
    `ios/${LANG}/LaunchScreen.storyboard`,
    `ios/FriendsLibrary/LaunchScreen.storyboard`,
  );

  copyDir(
    `ios/${LANG}/${INSTALL}/AppIcon.appiconset`,
    `ios/FriendsLibrary/Images.xcassets`,
  );
  copyDir(`ios/${LANG}/SplashIcon.imageset`, `ios/FriendsLibrary/Images.xcassets`);

  const resDirs = [
    `drawable`,
    `mipmap-hdpi`,
    `mipmap-mdpi`,
    `mipmap-xhdpi`,
    `mipmap-xxhdpi`,
    `mipmap-xxxhdpi`,
  ];
  resDirs.forEach((dir) => copyDir(`android/${LANG}/${dir}`, `android/app/src/main/res`));

  const workspacePath = `${APP_DIR}/ios/FriendsLibrary.xcodeproj/project.pbxproj`;
  const workspaceCode = fs.readFileSync(workspacePath, `utf8`);
  const updatedCode = workspaceCode.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = "com\.friendslibrary\..+";/g,
    `PRODUCT_BUNDLE_IDENTIFIER = "${APP_IDENTIFIER}";`,
  );
  fs.writeFileSync(workspacePath, updatedCode);
}

function copyDir(src: string, dest: string): void {
  if (!dest) throw new Error(`Unexpected unsafe destination!`);
  const destPath = `${APP_DIR}/${dest}`;
  exec.exit(`rm -rf ${destPath}/${src.split(`/`).pop()}`);
  exec.exit(`mkdir -p ${destPath}`);
  exec.exit(`cp -r ${ENV_DIR}/files/${src} ${destPath}`);
}

function copyFileWithEnv(src: string, dest: string): void {
  let code = fs.readFileSync(`${ENV_DIR}/files/${src}`, `utf8`);

  const replacements: [string, string][] = [
    [`{LANG}`, LANG],
    [`{APP_NAME}`, APP_NAME],
    [`{BUILD_NUM}`, String(BUILD_NUM)],
    [`{APP_IDENTIFIER}`, APP_IDENTIFIER],
    [`{ANDROID_APP_IDENTIFIER}`, IS_RELEASE ? APP_IDENTIFIER : `com.friendslibrary`],
    [`{BUILD_SEMVER_STRING}`, BUILD_SEMVER_STRING],
    [`{PRIMARY_COLOR_HEX}`, PRIMARY_COLOR_HEX],
    [`{ALLOW_INSECURE_LOCALHOST}`, ALLOW_INSECURE_LOCALHOST],
  ];

  for (const [pattern, value] of replacements) {
    code = code.replace(new RegExp(pattern, `g`), value);
  }

  let generatedComment = ``;
  if (src.endsWith(`.xml`) || src.endsWith(`.plist`)) {
    generatedComment = `<!-- AUTO-GENERATED DO NOT EDIT -->`;
  }

  // insert comment on second line (comments not valid above xml declaration)
  const lines = code.split(`\n`);
  lines[0] = `${lines[0]}${generatedComment ? `\n${generatedComment}` : ``}`;
  code = lines.join(`\n`);

  fs.writeFileSync(`${APP_DIR}/${dest}`, code);
}

function getAppIdentifier(): string {
  const base = `com.friendslibrary.FriendsLibrary`;
  if (INSTALL === `beta` && LANG === `en`) {
    return base; // match original bundle id for ios english test flight
  }
  return `${base}.${LANG}.${INSTALL}`;
}

const ALLOW_INSECURE_LOCALHOST = IS_RELEASE
  ? `<!-- omit localhost http exception for release -->`
  : `<key>NSExceptionDomains</key>
       <dict>
         <key>localhost</key>
         <dict>
           <key>NSExceptionAllowsInsecureHTTPLoads</key>
           <true/>
         </dict>
       </dict>`;

main();
