// @ts-check
const path = require(`path`);
const fs = require(`fs`);
const { execSync } = require('child_process');

function restoreBundleIdentifier() {
  const PROJECT_ROOT = path.resolve(__dirname, `..`);
  const XCODE_PROJ_PATH = `${PROJECT_ROOT}/ios/FriendsLibrary.xcodeproj/project.pbxproj`;
  const fileContents = fs.readFileSync(XCODE_PROJ_PATH, `utf8`);
  fs.writeFileSync(
    XCODE_PROJ_PATH,
    fileContents.replace(
      /(\t+)PRODUCT_BUNDLE_IDENTIFIER([^;]+)/g,
      `$1PRODUCT_BUNDLE_IDENTIFIER = "com.friendslibrary.$(PRODUCT_NAME:rfc1034identifier)"`,
    ),
  );
  execSync(`git add ${XCODE_PROJ_PATH}`);
}

restoreBundleIdentifier();
