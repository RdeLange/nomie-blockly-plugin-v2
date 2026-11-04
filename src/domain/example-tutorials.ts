// The tutorials of the example library, by language (see tutorials/). Each example has one tutorial in each language:
// what it builds, what the user needs first, and the steps, with the blocks by name. The Detailed tab shows it.
import { TUTORIAL_EN } from './tutorials/en';
import { TUTORIAL_NL } from './tutorials/nl';
import { TUTORIAL_DE } from './tutorials/de';
import { TUTORIAL_IT } from './tutorials/it';

export const TUTORIALS: Record<'en' | 'nl' | 'de' | 'it', Record<string, string>> = {
  en: TUTORIAL_EN,
  nl: TUTORIAL_NL,
  de: TUTORIAL_DE,
  it: TUTORIAL_IT,
};
