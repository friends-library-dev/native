import { describe, expect, test } from '@jest/globals';
import { search } from '../search';

describe(`search()`, () => {
  const cases: Array<[string, string, ReturnType<typeof search>]> = [
    [
      `light`,
      `foo light-house bar`,
      [{ before: `foo`, match: `light`, after: `-house bar`, start: 4, end: 9 }],
    ],
    [
      `in this dark`,
      `into in this dark`,
      [{ before: `into`, match: `in this dark`, after: ``, start: 5, end: 17 }],
    ],
    [
      `in this`,
      `sin in this foo`,
      [{ before: `sin`, match: `in this`, after: `foo`, start: 4, end: 11 }],
    ],
    [
      `this dark`,
      `this foo this dark baz`,
      [{ before: `this foo`, match: `this dark`, after: `baz`, start: 9, end: 18 }],
    ],
    [
      `in this`,
      `foo in this dark baz`,
      [{ before: `foo`, match: `in this`, after: `dark baz`, start: 4, end: 11 }],
    ],
    [
      `in this`,
      `this in this dark jim`,
      [{ before: `this`, match: `in this`, after: `dark jim`, start: 5, end: 12 }],
    ],
    [
      `in at`,
      `foo in at baz`,
      [{ before: `foo`, match: `in at`, after: `baz`, start: 4, end: 9 }],
    ],
    [`foo`, `bar sfoo`, []],
    [
      `foo jim`,
      `bar foo jim baz`,
      [{ before: `bar`, match: `foo jim`, after: `baz`, start: 4, end: 11 }],
    ],
    [
      `foo`,
      `bar foo baz [49]`,
      [{ before: `bar`, match: `foo`, after: `baz`, start: 4, end: 7 }],
    ],
    [
      `foo`,
      `bar foo's`,
      [{ before: `bar`, match: `foo's`, after: ``, start: 4, end: 9 }],
    ],
    [`foo`, `bar foot`, []],
    [`foo`, `bar`, []],
    [
      `foo`,
      `bar foo baz`,
      [{ before: `bar`, match: `foo`, after: `baz`, start: 4, end: 7 }],
    ],
    [
      `foo`,
      `bar foo baz foo jim`, // <-- finds the query TWICE
      [
        { before: `bar`, match: `foo`, after: `baz foo jim`, start: 4, end: 7 },
        { before: `bar foo baz`, match: `foo`, after: `jim`, start: 12, end: 15 },
      ],
    ],
    [
      `foo`,
      `Bar FOO Baz`,
      [{ before: `Bar`, match: `FOO`, after: `Baz`, start: 4, end: 7 }],
    ],
    [
      `FOO`,
      `Bar foo Baz`,
      [{ before: `Bar`, match: `foo`, after: `Baz`, start: 4, end: 7 }],
    ],
    [
      `Oh joy`,
      `and Oh! Joy was`,
      [{ before: `and`, match: `Oh! Joy`, after: `was`, start: 4, end: 11 }],
    ],
    [
      `Christ was`,
      `then "Christ" was`,
      [{ before: `then "`, match: `Christ" was`, after: ``, start: 6, end: 17 }],
    ],
    [`Christ was`, `then Christy was`, []],
    [
      `foobar`,
      `this is very long and should not all appear in the search result, but rather it should be truncated on both sides so it is more readable foobar for the user, so they don't get lost and we don't have to display the search results in some massive component, but rather a tight excerpt`,
      [
        {
          before: `sides so it is more readable`,
          match: `foobar`,
          after: `for the user, so they don't get lost and we don't`,
          start: 137,
          end: 143,
        },
      ],
    ],
  ];

  test.each(cases)(`\`%s\` searched for within \`%s\``, (query, source, expected) => {
    expect(search(query, source)).toEqual(expected);
  });
});
