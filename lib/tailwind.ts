import tailwind from 'tailwind-rn';
import { ViewStyle, TextStyle, Platform } from 'react-native';

type Arg =
  | string
  | string[]
  | false
  | null
  | undefined
  | { [k: string]: boolean }
  | ViewStyle
  | TextStyle;

/**
 * A `classnames`-like function for interacting with `tailwind-rn`
 */
export default function tw(...args: Arg[]): ViewStyle | TextStyle {
  let classNames: string[] = [];
  let styles: ViewStyle | TextStyle = {};
  args.forEach((arg) => {
    if (typeof arg === `string`) {
      classNames = [...classNames, ...arg.trim().split(/ +/)];
    } else if (Array.isArray(arg)) {
      classNames = [...classNames, ...arg.map((str) => String(str).trim())];
    } else if (typeof arg === `object` && arg !== null) {
      const keys = Object.keys(arg);
      const values = Object.values(arg);
      if (typeof values[0] === `boolean`) {
        keys.forEach((key, idx) => {
          if (values[idx] === true) {
            classNames.push(key);
          }
        });
      } else {
        styles = { ...styles, ...arg };
      }
    }
  });
  return {
    ...tailwind(
      classNames
        .map((c) => c.trim())
        .map(platformPrefix)
        .filter(Boolean)
        .join(` `),
    ),
    ...styles,
  };
}

function platformPrefix(className: string): string {
  console.log(`className`, className);
  return className.replace(/^(ios|android):(.*)/, (_, os, cx) => {
    console.log({ _, os, cx });
    return Platform.OS === os ? cx : ``;
  });
}
