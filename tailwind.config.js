// @ts-check
const { getTailwindConfig } = require(`@friends-library/theme`);

const config = { ...getTailwindConfig(`en`) };

config.theme.extend.colors[`v1-blue`] = {
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

config.theme.extend.colors[`v1-gray`] = {
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

config.theme.extend.colors[`v1-green`] = {
  100: `#F0FFF4`,
  200: `#C6F6D5`,
  300: `#9AE6B4`,
  400: `#68D391`,
  500: `#48BB78`,
  600: `#38A169`,
  700: `#2F855A`,
  800: `#276749`,
  900: `#22543D`,
};

module.exports = config;
