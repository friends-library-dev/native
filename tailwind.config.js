// @ts-check
const { getTailwindConfig } = require(`@friends-library/theme`);

// hardcode `en` so we don't have to regen tailwind styles
// when switching languages.  the `flprimary` is barely used
// in the app, so we can just manually switch on languages then
const config = { ...getTailwindConfig(`en`) };

config.theme.screens = {
  // @see https://www.ios-resolution.com/
  tween: `477px`, // 1px larger than largest iPhone
  ipad: `767px`,
  'ipad-lg': `1025px`,
  'ipad-xl': `1195px`,
};

config.theme.extend.colors[`ebookcolorscheme`] = {
  blackbg: `rgb(0, 0, 0)`,
  blackfg: `rgb(169, 169, 169)`,
  blackaccent: `rgb(110, 141, 234)`,
  whitebg: `rgb(253, 253, 253)`,
  whitefg: `rgb(3, 3, 3)`,
  whiteaccent: `rgb(0, 0, 255)`,
  sepiabg: `rgb(250, 242, 231)`,
  sepiafg: `rgb(50, 50, 50)`,
  sepiaaccent: `rgb(201, 154, 61)`,
};

config.theme.extend.colors[`v1blue`] = {
  100: `#EBF8FF`,
  200: `#BEE3F8`,
  300: `#90CDF4`,
  400: `#63B3ED`,
  500: `#4299E1`,
  600: `#3182CE`,
  700: `#2B6CB0`,
  800: `#2C5282`,
  900: `#2A4365`,
};

config.theme.extend.colors[`v1gray`] = {
  100: `#F7FAFC`,
  200: `#EDF2F7`,
  300: `#E2E8F0`,
  400: `#CBD5E0`,
  500: `#A0AEC0`,
  600: `#718096`,
  700: `#4A5568`,
  800: `#2D3748`,
  900: `#1A202C`,
};

config.theme.extend.colors[`v1green`] = {
  100: `#F0FFF4`,
  200: `#C6F6D5`,
  300: `#9AE6B4`,
  400: `#68D391`,
  500: `#48BB78`,
  550: `#40AE70`,
  600: `#38A169`,
  700: `#2F855A`,
  800: `#276749`,
  900: `#22543D`,
};

module.exports = config;
