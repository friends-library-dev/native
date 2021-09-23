import React from 'react';
import { t } from '@friends-library/locale';
import { utf8ShortTitle } from '@friends-library/adoc-utils';
import { Serif } from './Text';
import tw from '../lib/tailwind';

export const MainTitle: React.FC<{ title: string }> = ({ title }) => (
  <Serif size={30} style={tw`text-center py-4 px-8`}>
    {utf8ShortTitle(title)}
  </Serif>
);

export const ByLine: React.FC<{ title: string; friend: string }> = ({
  title,
  friend,
}) => {
  if (title.includes(friend) || friend.startsWith(`Compila`)) return null;
  return (
    <Serif size={22} style={tw`text-center italic text-v1gray-700 mb-6 -mt-2`}>
      {t`by`} {friend}
    </Serif>
  );
};

export const JustifiedDescription: React.FC<{ description: string }> = ({
  description,
}) => (
  <Serif
    style={tw`px-6 pt-2 pb-4 text-justify text-v1gray-800 leading-[26px] ipad:leading-[30px] ipad:mt-2 ipad:px-3`}
    size={tw.prefixMatch(`ipad`) ? 20 : 18}
  >
    {description}
  </Serif>
);
