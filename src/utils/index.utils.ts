import { TransformFnParams } from 'class-transformer';

export function capitalize({ value }: TransformFnParams) {
  const words = String(value).trim().split(' ');

  const capitalizedWords = words.map((word) => {
    const restOfWord = word.slice(1);
    const firstLetter = word.charAt(0).toUpperCase();
    return firstLetter + restOfWord;
  });

  return capitalizedWords.join(' ');
}

export function lowerCase({ value }: TransformFnParams) {
  return String(value).trim().toLowerCase();
}
