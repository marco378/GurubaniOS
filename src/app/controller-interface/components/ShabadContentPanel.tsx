'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShabadLine {
  id: string;
  gurmukhi: string;
  translation: string;
  translationSource?: string;
}

interface ShabadContentPanelProps {
  shabadId: string | null;
  onLineChange?: (lineIndex: number) => void;
  onDisplayToggle?: (isDisplaying: boolean) => void;
  className?: string;
}

const ShabadContentPanel = ({
  shabadId,
  onLineChange,
  onDisplayToggle,
  className = '',
}: ShabadContentPanelProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editedTranslation, setEditedTranslation] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean Gurmukhi text by removing orphaned combining marks
  const cleanGurmukhi = (text: string): string => {
    const gurmukhuiVowels = new Set([
      '\u0A81', // Adak Bindi
      '\u0A82', // Bindi
      '\u0A83', // Visarga
      '\u0A3C', // Nukta
      '\u0A41', // Vowel Sign U
      '\u0A42', // Vowel Sign UU
      '\u0A47', // Vowel Sign EE
      '\u0A48', // Vowel Sign AI
      '\u0A4B', // Vowel Sign OO
      '\u0A4C', // Vowel Sign AU
      '\u0A3E', // Vowel Sign AA
      '\u0A3F', // Vowel Sign I
    ]);

    const gurmukhuiBaseChars = new Set([
      '\u0A15', '\u0A16', '\u0A17', '\u0A18', '\u0A19', // Ka-Nya
      '\u0A1A', '\u0A1B', '\u0A1C', '\u0A1D', '\u0A1E', // Cha-Na
      '\u0A1F', '\u0A20', '\u0A21', '\u0A22', '\u0A23', // Tta-Na
      '\u0A24', '\u0A25', '\u0A26', '\u0A27', '\u0A28', // Ta-Na
      '\u0A2A', '\u0A2B', '\u0A2C', '\u0A2D', '\u0A2E', // Pa-Ma
      '\u0A2F', '\u0A30', '\u0A32', '\u0A33',           // Ya-Lla
      '\u0A35', '\u0A36', '\u0A37', '\u0A38', '\u0A39', // Va-Ha
      '\u0A59', '\u0A5A', '\u0A5B', '\u0A5C', '\u0A5E', // Additional consonants
    ]);

    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      
      // If it's a vowel/combining mark
      if (gurmukhuiVowels.has(char)) {
        // Only add if previous character is a base consonant
        if (i > 0 && gurmukhuiBaseChars.has(text[i - 1])) {
          result += char;
        }
        // Otherwise skip it (orphaned vowel)
      } else {
        // Keep all non-vowel characters
        result += char;
      }
    }
    
    return result;
  };

  const defaultShabadLines: ShabadLine[] = [
  {
    "id": "line-1",
    "gurmukhi": "ੴ ਸਿਤ ਨਾਮ ੁਕਰਤਾ ਪਰੁਖ ੁਿਨਰਭਉ ਿਨਰਵਰੈ ੁਅਕਾਲ ਮਰੂਿਤ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ੁਪਸਾਦ ੁ॥",
    "translation": "One Universal Creator, the Name of the One is the Truth, the Being that does everything, without fear, without hate, beyond time, beyond birth, self-existent, experienced and achieved by the Guru's grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-2",
    "gurmukhi": "॥ ਜਪ  ੁ॥",
    "translation": "Chant and meditate.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-3",
    "gurmukhi": "ਆਿਦ ਸਚੁ ਜਗੁਾਿਦ ਸਚੁ ॥",
    "translation": "The One existed in the beginning and at the beginning of the creation (ages).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-4",
    "gurmukhi": "ਹ ੈਭੀ ਸਚੁ ਨਾਨਕ ਹਸੋੀ ਭੀ ਸਚੁ ॥੧॥",
    "translation": "The One exists now. Nanak says, the One will forever exist.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-5",
    "gurmukhi": "ਸੋਚ ੈਸੋਿਚ ਨ ਹਵੋਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥",
    "translation": "By cleansing the body, the mind cannot be purified, even if you cleanse your body hundreds of thousands of times.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-6",
    "gurmukhi": "ਚੁਪੈ ਚੁਪ ਨ ਹਵੋਈ ਜੇ ਲਾਇ ਰਹਾ ਿਲਵ ਤਾਰ ॥",
    "translation": "By remaining silent, inner silence is not obtained, even by remaining absorbed deep within.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-7",
    "gurmukhi": "ਭੁਿਖਆ ਭੁਖ ਨ ਉਤਰੀ ਜੇ ਬੰਨਾ ਪਰੁੀਆ ਭਾਰ ॥",
    "translation": "The hunger of the hungry is not appeased, even if we piled up the weight of goods accumulated from multiple worlds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-8",
    "gurmukhi": "ਸਹਸ ਿਸਆਣਪਾ ਲਖ ਹਿੋਹ ਤ ਇਕ ਨ ਚਲੈ ਨਾਿਲ ॥",
    "translation": "If you have got hundreds of thousands of clever tricks,  not even a single one of them will work.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-9",
    "gurmukhi": "ਿਕਵ ਸਿਚਆਰਾ ਹਈੋਐ ਿਕਵ ਕੂੜ ੈਤੁਟ ੈਪਾਿਲ ॥",
    "translation": "How can we become the truth? How can the wall of illusion be broken?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-10",
    "gurmukhi": "ਹਕੁਿਮ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਿਲਿਖਆ ਨਾਿਲ ॥੧॥",
    "translation": "Walking in the will of the Creator,  O Nanak, the will is inscribed within us.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-11",
    "gurmukhi": "ਹਕੁਮੀ ਹਵੋਿਨ ਆਕਾਰ ਹਕੁਮ ੁਨ ਕਿਹਆ ਜਾਈ ॥",
    "translation": "By the One's divine will, the form (the creation) came into being. The divine will cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-12",
    "gurmukhi": "ਹਕੁਮੀ ਹਵੋਿਨ ਜੀਅ ਹਕੁਿਮ ਿਮਲੈ ਵਿਡਆਈ ॥",
    "translation": "By the One's divine will, living beings come to exist. By the One's divine will, greatness is obtained.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-13",
    "gurmukhi": "ਹਕੁਮੀ ਉਤਮ ੁਨੀਚੁ ਹਕੁਿਮ ਿਲਿਖ ਦਖੁ ਸਖੁ ਪਾਈਅਿਹ ॥",
    "translation": "By the One's divine will, some are high and some are low. By the One's divine written will, suffering and peace is received accordingly to our actions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-14",
    "gurmukhi": "ਇਕਨਾ ਹਕੁਮੀ ਬਖਸੀਸ ਇਿਕ ਹਕੁਮੀ ਸਦਾ ਭਵਾਈਅਿਹ ॥",
    "translation": "Some, by the One's divine will, are blessed. Others continuously go around in circles (in the cycle of life and death).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-15",
    "gurmukhi": "ਹਕੁਮੈ ਅੰਦਿਰ ਸਭੁ ਕ ੋਬਾਹਿਰ ਹਕੁਮ ਨ ਕਇੋ ॥",
    "translation": "Everyone is subject to the One's divine will. No one is outside of the divine will.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-16",
    "gurmukhi": "ਨਾਨਕ ਹਕੁਮੈ ਜੇ ਬਝੁ ੈਤ ਹਉਮੈ ਕਹ ੈਨ ਕਇੋ ॥੨॥",
    "translation": "Nanak says, those who understand the divine will do not speak in ego.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-17",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਤਾਣ ੁਹਵੋ ੈਿਕਸੈ ਤਾਣ ੁ॥",
    "translation": "Some sing of the One's power, based on their realisation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-18",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਦਾਿਤ ਜਾਣ ੈਨੀਸਾਣ ੁ॥",
    "translation": "Some sing of the One's gifts and see these gifts as a sign of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-19",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਗਣੁ ਵਿਡਆਈਆ ਚਾਰ ॥",
    "translation": "Some sing of the One's beautiful and great virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-20",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਿਵਿਦਆ ਿਵਖਮ ੁਵੀਚਾਰ ੁ॥",
    "translation": "Some sing of the One through the knowledge obtained from difficult philosophical studies.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-21",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਸਾਿਜ ਕਰ ੇਤਨੁ ਖੇਹ ॥",
    "translation": "Some sing that the One fashions the body and then reduces it to dust.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-22",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਜੀਅ ਲੈ ਿਫਿਰ ਦਹੇ ॥",
    "translation": "Some sing of the One who takes life away and then restores it.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-23",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਜਾਪੈ ਿਦਸੈ ਦਿੂਰ ॥",
    "translation": "Some sing of the One, that they can seem to see at a distance.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-24",
    "gurmukhi": "ਗਾਵ ੈਕ ੋਵਖੇੈ ਹਾਦਰਾ ਹਦਿੂਰ ॥",
    "translation": "Some sing of the One, who experience that One as being forever present.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-25",
    "gurmukhi": "ਕਥਨਾ ਕਥੀ ਨ ਆਵ ੈਤਿੋਟ ॥",
    "translation": "There is no shortage of those who attempt to explain that One's power.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-26",
    "gurmukhi": "ਕਿਥ ਕਿਥ ਕਥੀ ਕਟੋੀ ਕਿੋਟ ਕਿੋਟ ॥",
    "translation": "Millions upon millions have made an attempt millions of times to explain that One's power.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-27",
    "gurmukhi": "ਦਦੇਾ ਦ ੇਲੈਦ ੇਥਿਕ ਪਾਿਹ ॥",
    "translation": "The Giver keeps on giving, while those who receive grow tired of receiving.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-28",
    "gurmukhi": "ਜਗੁਾ ਜਗੁੰਤਿਰ ਖਾਹੀ ਖਾਿਹ ॥",
    "translation": "Throughout the ages, consumers consume.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-29",
    "gurmukhi": "ਹਕੁਮੀ ਹਕੁਮ ੁਚਲਾਏ ਰਾਹ ੁ॥",
    "translation": "The Creator of divine will operates the way of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-30",
    "gurmukhi": "ਨਾਨਕ ਿਵਗਸੈ ਵਪੇਰਵਾਹ ੁ॥੩॥",
    "translation": "Nanak says that the One is forever blossoming and carefree.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-31",
    "gurmukhi": "ਸਾਚਾ ਸਾਿਹਬ ੁਸਾਚੁ ਨਾਇ ਭਾਿਖਆ ਭਾਉ ਅਪਾਰ ੁ॥",
    "translation": "The Master (the One) and the One's divine law is the only truth. The limitless One expresses that law through the language of love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-32",
    "gurmukhi": "ਆਖਿਹ ਮੰਗਿਹ ਦਿੇਹ ਦਿੇਹ ਦਾਿਤ ਕਰ ੇਦਾਤਾਰ ੁ॥",
    "translation": "As people ask and request, 'give to us, give to us', the One (the Giver) provides the gifts.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-33",
    "gurmukhi": "ਫਿੇਰ ਿਕ ਅਗੈ ਰਖੀਐ ਿਜਤੁ ਿਦਸੈ ਦਰਬਾਰ ੁ॥",
    "translation": "(If everything is given to us by the Giver), then what do we place before that One by which we can see (experience) Your court?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-34",
    "gurmukhi": "ਮਹੁ ੌਿਕ ਬੋਲਣ ੁਬੋਲੀਐ ਿਜਤੁ ਸਿੁਣ ਧਰ ੇਿਪਆਰ ੁ॥",
    "translation": "What words can we speak, where by the One listening to them, will be filled with love?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-35",
    "gurmukhi": "ਅੰਿਮ�ਤ ਵਲੇਾ ਸਚੁ ਨਾਉ ਵਿਡਆਈ ਵੀਚਾਰ ੁ॥",
    "translation": "During the ambrosial hours before dawn, meditate on the true One's name and deeply contemplate on the greatness of that One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-36",
    "gurmukhi": "ਕਰਮੀ ਆਵ ੈਕਪੜਾ ਨਦਰੀ ਮੋਖ ੁਦਆੁਰ ੁ॥",
    "translation": "Through the action (of meditating on the One's name), that individual with the grace of the One, receives the clothing of loving devotion, leading to the door of liberation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-37",
    "gurmukhi": "ਨਾਨਕ ਏਵ ੈਜਾਣੀਐ ਸਭੁ ਆਪੇ ਸਿਚਆਰ ੁ॥੪॥",
    "translation": "Nanak says that know this; the True One is everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-38",
    "gurmukhi": "ਥਾਿਪਆ ਨ ਜਾਇ ਕੀਤਾ ਨ ਹਇੋ ॥",
    "translation": "The One cannot be established and cannot be created.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-39",
    "gurmukhi": "ਆਪੇ ਆਿਪ ਿਨਰਜੰਨੁ ਸੋਇ ॥",
    "translation": "The One is self-existent and is beyond the effect of Maya (illusion).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-40",
    "gurmukhi": "ਿਜਿਨ ਸੇਿਵਆ ਿਤਿਨ ਪਾਇਆ ਮਾਨੁ ॥",
    "translation": "Those that serve the One, obtain honour.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-41",
    "gurmukhi": "ਨਾਨਕ ਗਾਵੀਐ ਗਣੁੀ ਿਨਧਾਨੁ ॥",
    "translation": "Nanak says sing of the One, the treasure of virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-42",
    "gurmukhi": "ਗਾਵੀਐ ਸਣੁੀਐ ਮਿਨ ਰਖੀਐ ਭਾਉ ॥",
    "translation": "Sing, listen and fill your mind with love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-43",
    "gurmukhi": "ਦਖੁ ੁਪਰਹਿਰ ਸਖੁ ੁਘਿਰ ਲੈ ਜਾਇ ॥",
    "translation": "Your suffering will go and peace will come into the home of your heart.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-44",
    "gurmukhi": "ਗਰੁਮਿੁਖ ਨਾਦ ੰਗਰੁਮਿੁਖ ਵਦੇ ੰਗਰੁਮਿੁਖ ਰਿਹਆ ਸਮਾਈ ॥",
    "translation": "Through the Guru, the sound current and divine wisdom is realised. Through the Guru, the One is realised to be emersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-45",
    "gurmukhi": "ਗਰੁ ੁਈਸਰ ੁਗਰੁ ੁਗੋਰਖ ੁਬਰਮਾ ਗਰੁ ੁਪਾਰਬਤੀ ਮਾਈ ॥",
    "translation": "(When you take on the Guru), the Guru is Shiva, Vishnu, Brahma, Paarvati and Lakshmi.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-46",
    "gurmukhi": "ਜੇ ਹਉ ਜਾਣਾ ਆਖਾ ਨਾਹੀ ਕਹਣਾ ਕਥਨੁ ਨ ਜਾਈ ॥",
    "translation": "If I come to know the One, I cannot explain what that One is (because that One can only be experienced). The One cannot be described in words.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-47",
    "gurmukhi": "ਗਰੁਾ ਇਕ ਦਿੇਹ ਬਝੁਾਈ ॥",
    "translation": "The Guru has given me this one understanding:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-48",
    "gurmukhi": "ਸਭਨਾ ਜੀਆ ਕਾ ਇਕੁ ਦਾਤਾ ਸੋ ਮੈ ਿਵਸਿਰ ਨ ਜਾਈ ॥੫॥",
    "translation": "there is only one Giver to all life. May I never forget the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-49",
    "gurmukhi": "ਤੀਰਿਥ ਨਾਵਾ ਜੇ ਿਤਸ ੁਭਾਵਾ ਿਵਣ ੁਭਾਣ ੇਿਕ ਨਾਇ ਕਰੀ ॥",
    "translation": "I would go to pilgrimage to bathe if it were pleasing to the One. If it's not going to please the One, then what am I going to gain from ritual bathing?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-50",
    "gurmukhi": "ਜੇਤੀ ਿਸਰਿਠ ਉਪਾਈ ਵਖੇਾ ਿਵਣ ੁਕਰਮਾ ਿਕ ਿਮਲੈ ਲਈ ॥",
    "translation": "As I see all created beings in the world, without the One's grace, what does anyone receive?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-51",
    "gurmukhi": "ਗਰੁਾ ਇਕ ਦਿੇਹ ਬਝੁਾਈ ॥",
    "translation": "The Guru has given me this one understanding:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-52",
    "gurmukhi": "ਸਭਨਾ ਜੀਆ ਕਾ ਇਕੁ ਦਾਤਾ ਸੋ ਮੈ ਿਵਸਿਰ ਨ ਜਾਈ ॥੬॥",
    "translation": "there is only one Giver to all life. May I never forget the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-53",
    "gurmukhi": "ਜੇ ਜਗੁ ਚਾਰ ੇਆਰਜਾ ਹਰੋ ਦਸਣੂੀ ਹਇੋ ॥",
    "translation": "If one could live throughout the four ages, or even ten times more,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-54",
    "gurmukhi": "ਨਵਾ ਖੰਡਾ ਿਵਿਚ ਜਾਣੀਐ ਨਾਿਲ ਚਲੈ ਸਭੁ ਕਇੋ ॥",
    "translation": "if one was known throughout the nine continents and followed by all,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-55",
    "gurmukhi": "ਚਗੰਾ ਨਾਉ ਰਖਾਇ ਕ ੈਜਸ ੁਕੀਰਿਤ ਜਿਗ ਲੇਇ ॥",
    "translation": "with a good name and reputation, with praise and fame throughout the world;",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-56",
    "gurmukhi": "ਜੇ ਿਤਸ ੁਨਦਿਰ ਨ ਆਵਈ ਤ ਵਾਤ ਨ ਪਛੁੈ ਕ ੇ॥",
    "translation": "still, if the One does not bless you with the glance of grace, then it’s like nobody is asking about you.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-57",
    "gurmukhi": "ਕੀਟਾ ਅੰਦਿਰ ਕੀਟ ੁਕਿਰ ਦੋਸੀ ਦੋਸ ੁਧਰ ੇ॥",
    "translation": "One would be considered a worm amongst worms, and even by sinners, regarded a sinner.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-58",
    "gurmukhi": "ਨਾਨਕ ਿਨਰਗਿੁਣ ਗਣੁ ੁਕਰ ੇਗਣੁਵਿੰਤਆ ਗਣੁ ੁਦ ੇ॥",
    "translation": "Nanak says that the One blesses the virtueless with virtues and gives virtues to the virtuous.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-59",
    "gurmukhi": "ਤਹੇਾ ਕਇੋ ਨ ਸਝੁਈ ਿਜ ਿਤਸ ੁਗਣੁ ੁਕਇੋ ਕਰ ੇ॥੭॥",
    "translation": "There is no one that can be found (other than the One) that can give virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-60",
    "gurmukhi": "ਸਿੁਣਐ ਿਸਧ ਪੀਰ ਸਿੁਰ ਨਾਥ ॥",
    "translation": "yogis (Naath).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-61",
    "gurmukhi": "ਸਿੁਣਐ ਧਰਿਤ ਧਵਲ ਆਕਾਸ ॥",
    "translation": "Through listening to the One's name, one comes to the understanding that the earth and the sky are all supported by the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-62",
    "gurmukhi": "ਸਿੁਣਐ ਦੀਪ ਲੋਅ ਪਾਤਾਲ ॥",
    "translation": "Through listening to the One's name, one obtains knowledge about the continents, worlds and nether regions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-63",
    "gurmukhi": "ਸਿੁਣਐ ਪੋਿਹ ਨ ਸਕ ੈਕਾਲੁ ॥",
    "translation": "Through listening to the One's name, death cannot touch you.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-64",
    "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਿਵਗਾਸ ੁ॥",
    "translation": "Nanak says, the devotees always remain in bliss.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-65",
    "gurmukhi": "ਸਿੁਣਐ ਦਖੂ ਪਾਪ ਕਾ ਨਾਸ ੁ॥੮॥",
    "translation": "Through listening to the One's name, suffering and sin are destroyed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-66",
    "gurmukhi": "ਸਿੁਣਐ ਈਸਰ ੁਬਰਮਾ ਇੰਦ ੁ॥",
    "translation": "Through listening to the One's name, ordinary people can obtain the status of Shiva, Brahma and Indra.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-67",
    "gurmukhi": "ਸਿੁਣਐ ਮਿੁਖ ਸਾਲਾਹਣ ਮੰਦ ੁ॥",
    "translation": "Through listening to the One's name, people that were foul-mouthed now praise the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-68",
    "gurmukhi": "ਸਿੁਣਐ ਜੋਗ ਜਗੁਿਤ ਤਿਨ ਭਦੇ ॥",
    "translation": "Through listening to the One's name, the way of union and the secrets of the body are revealed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-69",
    "gurmukhi": "ਸਿੁਣਐ ਸਾਸਤ ਿਸਿਮ�ਿਤ ਵਦੇ ॥",
    "translation": "Through listening to the One's name, you will understand the knowledge of the Shaastras, Simritees and the Vedas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-70",
    "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਿਵਗਾਸ ੁ॥",
    "translation": "Nanak says, the devotees always remain in bliss.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-71",
    "gurmukhi": "ਸਿੁਣਐ ਦਖੂ ਪਾਪ ਕਾ ਨਾਸ ੁ॥੯॥",
    "translation": "Through listening to the One's name, suffering and sin are destroyed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-72",
    "gurmukhi": "ਸਿੁਣਐ ਸਤੁ ਸੰਤਖੋ ੁਿਗਆਨੁ ॥",
    "translation": "Through listening to the One's name, one becomes truthful and obtains contentment and divine wisdom.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-73",
    "gurmukhi": "ਸਿੁਣਐ ਅਠਸਿਠ ਕਾ ਇਸਨਾਨੁ ॥",
    "translation": "Through listening to the One's name, one is purified as if one has bathed at the sixty-eight places of pilgrimage.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-74",
    "gurmukhi": "ਸਿੁਣਐ ਪਿੜ ਪਿੜ ਪਾਵਿਹ ਮਾਨੁ ॥",
    "translation": "Through listening to the One's name, one obtains honour as those who are very well read.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-75",
    "gurmukhi": "ਸਿੁਣਐ ਲਾਗੈ ਸਹਿਜ ਿਧਆਨੁ ॥",
    "translation": "Through listening to the One's name, one's mind is effortlessly attuned to meditation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-76",
    "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਿਵਗਾਸ ੁ॥",
    "translation": "Nanak says, the devotees always remain in bliss.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-77",
    "gurmukhi": "ਸਿੁਣਐ ਦਖੂ ਪਾਪ ਕਾ ਨਾਸ ੁ॥੧੦॥",
    "translation": "Through listening to the One's name, suffering and sin are destroyed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-78",
    "gurmukhi": "ਸਿੁਣਐ ਸਰਾ ਗਣੁਾ ਕ ੇਗਾਹ ॥",
    "translation": "Through listening to the One's name, one obtains the deep ocean of divine virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-79",
    "gurmukhi": "ਸਿੁਣਐ ਸੇਖ ਪੀਰ ਪਾਿਤਸਾਹ ॥",
    "translation": "Through listening to the One's name, obtains the status of Sheikhs (Muslim leaders), Pirs (Muslim saints) and kings.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-80",
    "gurmukhi": "ਸਿੁਣਐ ਅੰਧੇ ਪਾਵਿਹ ਰਾਹ ੁ॥",
    "translation": "Through listening to the One's name, the blind (spiritually ignorant) obtain the path to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-81",
    "gurmukhi": "ਸਿੁਣਐ ਹਾਥ ਹਵੋ ੈਅਸਗਾਹ ੁ॥",
    "translation": "Through listening to the One's name, conquering the depth of the ocean (the world) becomes within the grasp of your hand.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-82",
    "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਿਵਗਾਸ ੁ॥",
    "translation": "Nanak says, the devotees always remain in bliss.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-83",
    "gurmukhi": "ਸਿੁਣਐ ਦਖੂ ਪਾਪ ਕਾ ਨਾਸ ੁ॥੧੧॥",
    "translation": "Through listening to the One's name, suffering and sin are destroyed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-84",
    "gurmukhi": "ਮੰਨ�  ਕੀ ਗਿਤ ਕਹੀ ਨ ਜਾਇ ॥",
    "translation": "The spiritual state of a devotee cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-85",
    "gurmukhi": "ਜੇ ਕ ੋਕਹ ੈਿਪਛੈ ਪਛੁਤਾਇ ॥",
    "translation": "Whoever tries to describe it will regret the attempt.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-86",
    "gurmukhi": "ਕਾਗਿਦ ਕਲਮ ਨ ਿਲਖਣਹਾਰ ੁ॥",
    "translation": "No paper or pen or scribe",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-87",
    "gurmukhi": "ਮੰਨ�  ਕਾ ਬਿਹ ਕਰਿਨ ਵੀਚਾਰ ੁ॥",
    "translation": "can record the state of the devoted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-88",
    "gurmukhi": "ਐਸਾ ਨਾਮ ੁਿਨਰਜੰਨੁ ਹਇੋ ॥",
    "translation": "Such is the name of the immaculate One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-89",
    "gurmukhi": "ਜੇ ਕ ੋਮੰਿਨ ਜਾਣ ੈਮਿਨ ਕਇੋ ॥੧੨॥",
    "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-90",
    "gurmukhi": "ਮੰਨ�  ਸਰੁਿਤ ਹਵੋ ੈਮਿਨ ਬਿੁਧ ॥",
    "translation": "Through devotion, one obtains intuitive awareness of their mind and intellect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-91",
    "gurmukhi": "ਮੰਨ�  ਸਗਲ ਭਵਣ ਕੀ ਸਿੁਧ ॥",
    "translation": "Through devotion, one know about all worlds and realms.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-92",
    "gurmukhi": "ਮੰਨ�  ਮਿੁਹ ਚਟੋਾ ਨਾ ਖਾਇ ॥",
    "translation": "Through devotion, one won't endure the suffering of the five vices.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-93",
    "gurmukhi": "ਮੰਨ�  ਜਮ ਕ ੈਸਾਿਥ ਨ ਜਾਇ ॥",
    "translation": "Through devotion, one does not go with the messenger of death.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-94",
    "gurmukhi": "ਐਸਾ ਨਾਮ ੁਿਨਰਜੰਨੁ ਹਇੋ ॥",
    "translation": "Such is the name of the immaculate One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-95",
    "gurmukhi": "ਜੇ ਕ ੋਮੰਿਨ ਜਾਣ ੈਮਿਨ ਕਇੋ ॥੧੩॥",
    "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-96",
    "gurmukhi": "ਮੰਨ�  ਮਾਰਿਗ ਠਾਕ ਨ ਪਾਇ ॥",
    "translation": "Through devotion, one won't be stopped by the five vices on their spiritual path.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-97",
    "gurmukhi": "ਮੰਨ�  ਪਿਤ ਿਸਉ ਪਰਗਟ ੁਜਾਇ ॥",
    "translation": "Through devotion, one will be known and will leave with honour.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-98",
    "gurmukhi": "ਮੰਨ�  ਮਗ ੁਨ ਚਲੈ ਪੰਥ ੁ॥",
    "translation": "Through devotion, one won't walk on the path of empty religious rituals.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-99",
    "gurmukhi": "ਮੰਨ�  ਧਰਮ ਸੇਤੀ ਸਨਬੰਧ ੁ॥",
    "translation": "Through devotion, one is connected to righteousness.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-100",
    "gurmukhi": "ਐਸਾ ਨਾਮ ੁਿਨਰਜੰਨੁ ਹਇੋ ॥",
    "translation": "Such is the name of the immaculate One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-101",
    "gurmukhi": "ਜੇ ਕ ੋਮੰਿਨ ਜਾਣ ੈਮਿਨ ਕਇੋ ॥੧੪॥",
    "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-102",
    "gurmukhi": "ਮੰਨ�  ਪਾਵਿਹ ਮੋਖ ੁਦਆੁਰ ੁ॥",
    "translation": "Through devotion, one finds the door of liberation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-103",
    "gurmukhi": "ਮੰਨ�  ਪਰਵਾਰ ੈਸਾਧਾਰ ੁ॥",
    "translation": "Through devotion, one purifies their family.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-104",
    "gurmukhi": "ਮੰਨ�  ਤਰ ੈਤਾਰ ੇਗਰੁ ੁਿਸਖ ॥",
    "translation": "Through devotion, one is saved, and they help save others by making them Sikhs of the Guru.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-105",
    "gurmukhi": "ਮੰਨ�  ਨਾਨਕ ਭਵਿਹ ਨ ਿਭਖ ॥",
    "translation": "Nanak says, through devotion, one does not wander around begging.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-106",
    "gurmukhi": "ਐਸਾ ਨਾਮ ੁਿਨਰਜੰਨੁ ਹਇੋ ॥",
    "translation": "Such is the name of the immaculate One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-107",
    "gurmukhi": "ਜੇ ਕ ੋਮੰਿਨ ਜਾਣ ੈਮਿਨ ਕਇੋ ॥੧੫॥",
    "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-108",
    "gurmukhi": "ਪੰਚ ਪਰਵਾਣ ਪੰਚ ਪਰਧਾਨੁ ॥",
    "translation": "The virtuous are accepted by the One and are spiritual leaders.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-109",
    "gurmukhi": "ਪੰਚ ੇਪਾਵਿਹ ਦਰਗਿਹ ਮਾਨੁ ॥",
    "translation": "The virtuous are honoured in the court of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-110",
    "gurmukhi": "ਪੰਚ ੇਸੋਹਿਹ ਦਿਰ ਰਾਜਾਨੁ ॥",
    "translation": "The virtuous are beautiful in the court of the King (the One).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-111",
    "gurmukhi": "ਪੰਚਾ ਕਾ ਗਰੁ ੁਏਕੁ ਿਧਆਨੁ ॥",
    "translation": "The virtuous single-mindedly focus on the eternal Guru.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-112",
    "gurmukhi": "ਜੇ ਕ ੋਕਹ ੈਕਰ ੈਵੀਚਾਰ ੁ॥",
    "translation": "No matter how much anyone tries to explain and reflect the doings of the One,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-113",
    "gurmukhi": "ਕਰਤ ੇਕ ੈਕਰਣ ੈਨਾਹੀ ਸਮੁਾਰ ੁ॥",
    "translation": "the doings of the Creator cannot be counted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-114",
    "gurmukhi": "ਧੌਲੁ ਧਰਮ ੁਦਇਆ ਕਾ ਪਤੂੁ ॥",
    "translation": "Whilst some people believe that a bull is literally supporting the earth, it actually is dharam (divine law), based on compassion.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-115",
    "gurmukhi": "ਸੰਤਖੋ ੁਥਾਿਪ ਰਿਖਆ ਿਜਿਨ ਸਿੂਤ ॥",
    "translation": "The laws of the creation patiently keep everything strung together.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-116",
    "gurmukhi": "ਜੇ ਕ ੋਬਝੁ ੈਹਵੋ ੈਸਿਚਆਰ ੁ॥",
    "translation": "That one who understands this becomes the embodiment of truth.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-117",
    "gurmukhi": "ਧਵਲੈ ਉਪਿਰ ਕਤੇਾ ਭਾਰ ੁ॥",
    "translation": "(If someone were to believe the mythical story that a bull supports the earth, the Guru asks), 'how much of a great load is there on the bull?'",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-118",
    "gurmukhi": "ਧਰਤੀ ਹਰੋ ੁਪਰ ੈਹਰੋ ੁਹਰੋ ੁ॥",
    "translation": "There are many worlds beyond this world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-119",
    "gurmukhi": "ਿਤਸ ਤ ੇਭਾਰ ੁਤਲੈ ਕਵਣ ੁਜੋਰ ੁ॥",
    "translation": "What power holds those worlds and supports their weight?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-120",
    "gurmukhi": "ਜੀਅ ਜਾਿਤ ਰਗੰਾ ਕ ੇਨਾਵ ॥",
    "translation": "All the different types of creatures and all their colours",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-121",
    "gurmukhi": "ਸਭਨਾ ਿਲਿਖਆ ਵੁੜੀ ਕਲਾਮ ॥",
    "translation": "are all inscribed by the ever-flowing pen of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-122",
    "gurmukhi": "ਏਹ ੁਲੇਖਾ ਿਲਿਖ ਜਾਣ ੈਕਇੋ ॥",
    "translation": "Who knows how to write this account?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-123",
    "gurmukhi": "ਲੇਖਾ ਿਲਿਖਆ ਕਤੇਾ ਹਇੋ ॥",
    "translation": "What would that written account even be like?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-124",
    "gurmukhi": "ਕਤੇਾ ਤਾਣ ੁਸਆੁਿਲਹ ੁਰਪੂ ੁ॥",
    "translation": "How much power and beauty has the form of that One got?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-125",
    "gurmukhi": "ਕਤੇੀ ਦਾਿਤ ਜਾਣ ੈਕਣੌ ੁਕੂਤੁ ॥",
    "translation": "How can someone measure the extent of that One's gifts?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-126",
    "gurmukhi": "ਕੀਤਾ ਪਸਾਉ ਏਕ ੋਕਵਾਉ ॥",
    "translation": "The One created the expanse of the creation with one word.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-127",
    "gurmukhi": "ਿਤਸ ਤ ੇਹਏੋ ਲਖ ਦਰੀਆਉ ॥",
    "translation": "Hundreds of thousands of rivers (worlds) began to flow.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-128",
    "gurmukhi": "ਕੁਦਰਿਤ ਕਵਣ ਕਹਾ ਵੀਚਾਰ ੁ॥",
    "translation": "How can the One's creative power be described?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-129",
    "gurmukhi": "ਵਾਿਰਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
    "translation": "I cannot even once be a sacrifice to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-130",
    "gurmukhi": "ਜੋ ਤੁਧ ੁਭਾਵ ੈਸਾਈ ਭਲੀ ਕਾਰ ॥",
    "translation": "Whatever Your divine will is; that doing is perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-131",
    "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਿਤ ਿਨਰਕੰਾਰ ॥੧੬॥",
    "translation": "You are always stable, O formless One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-132",
    "gurmukhi": "ਅਸੰਖ ਜਪ ਅਸੰਖ ਭਾਉ ॥",
    "translation": "Countless people meditate and express love for the One in their own way.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-133",
    "gurmukhi": "ਅਸੰਖ ਪਜੂਾ ਅਸੰਖ ਤਪ ਤਾਉ ॥",
    "translation": "Countless people worship the One and carry out strict practises.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-134",
    "gurmukhi": "ਅਸੰਖ ਗਰਥੰ ਮਿੁਖ ਵਦੇ ਪਾਠ ॥",
    "translation": "Countless people recite scriptures and the Vedas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-135",
    "gurmukhi": "ਅਸੰਖ ਜੋਗ ਮਿਨ ਰਹਿਹ ਉਦਾਸ ॥",
    "translation": "Countless yogis minds remain detached from the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-136",
    "gurmukhi": "ਅਸੰਖ ਭਗਤ ਗਣੁ ਿਗਆਨ ਵੀਚਾਰ ॥",
    "translation": "Countless devotees contemplate the wisdom and the qualities of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-137",
    "gurmukhi": "ਅਸੰਖ ਸਤੀ ਅਸੰਖ ਦਾਤਾਰ ॥",
    "translation": "Countless people live in contentment and are generous.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-138",
    "gurmukhi": "ਅਸੰਖ ਸਰੂ ਮਹੁ ਭਖ ਸਾਰ ॥",
    "translation": "Countless warriors take the brunt in battle (who eat iron with their mouths).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-139",
    "gurmukhi": "ਅਸੰਖ ਮੋਿਨ ਿਲਵ ਲਾਇ ਤਾਰ ॥",
    "translation": "Countless silent sages remain absorbed deep within.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-140",
    "gurmukhi": "ਕੁਦਰਿਤ ਕਵਣ ਕਹਾ ਵੀਚਾਰ ੁ॥",
    "translation": "How can the One's creative power be described?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-141",
    "gurmukhi": "ਵਾਿਰਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
    "translation": "I cannot even once be a sacrifice to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-142",
    "gurmukhi": "ਜੋ ਤੁਧ ੁਭਾਵ ੈਸਾਈ ਭਲੀ ਕਾਰ ॥",
    "translation": "Whatever Your divine will is; that doing is perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-143",
    "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਿਤ ਿਨਰਕੰਾਰ ॥੧੭॥",
    "translation": "You are always stable, O formless One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-144",
    "gurmukhi": "ਅਸੰਖ ਮਰੂਖ ਅੰਧ ਘੋਰ ॥",
    "translation": "Countless people are fools, utterly blind in ignorance.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-145",
    "gurmukhi": "ਅਸੰਖ ਚਰੋ ਹਰਾਮਖੋਰ ॥",
    "translation": "Countless people are thieves and corrupt.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-146",
    "gurmukhi": "ਅਸੰਖ ਅਮਰ ਕਿਰ ਜਾਿਹ ਜੋਰ ॥",
    "translation": "Countless people impose their will by force.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-147",
    "gurmukhi": "ਅਸੰਖ ਗਲਵਢ ਹਿਤਆ ਕਮਾਿਹ ॥",
    "translation": "Countless people are ruthless killers.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-148",
    "gurmukhi": "ਅਸੰਖ ਪਾਪੀ ਪਾਪ ੁਕਿਰ ਜਾਿਹ ॥",
    "translation": "Countless people are sinners who keep on sinning.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-149",
    "gurmukhi": "ਅਸੰਖ ਕੂਿੜਆਰ ਕੂੜ ੇਿਫਰਾਿਹ ॥",
    "translation": "Countless people are liars, going around and around, lost in their lies.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-150",
    "gurmukhi": "ਅਸੰਖ ਮਲੇਛ ਮਲੁ ਭਿਖ ਖਾਿਹ ॥",
    "translation": "Countless people are low-minded who consume filthy language.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-151",
    "gurmukhi": "ਅਸੰਖ ਿਨ�ਦਕ ਿਸਿਰ ਕਰਿਹ ਭਾਰ ੁ॥",
    "translation": "Countless people are slanderers who carry the weight of slandering on their heads.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-152",
    "gurmukhi": "ਨਾਨਕੁ ਨੀਚੁ ਕਹ ੈਵੀਚਾਰ ੁ॥",
    "translation": "Nanak in humility offers this understanding.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-153",
    "gurmukhi": "ਵਾਿਰਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
    "translation": "I cannot even once be a sacrifice to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-154",
    "gurmukhi": "ਜੋ ਤੁਧ ੁਭਾਵ ੈਸਾਈ ਭਲੀ ਕਾਰ ॥",
    "translation": "Whatever Your divine will is; that doing is perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-155",
    "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਿਤ ਿਨਰਕੰਾਰ ॥੧੮॥",
    "translation": "You are always stable, O formless One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-156",
    "gurmukhi": "ਅਸੰਖ ਨਾਵ ਅਸੰਖ ਥਾਵ ॥",
    "translation": "There are countless names and countless places.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-157",
    "gurmukhi": "ਅਗੰਮ ਅਗੰਮ ਅਸੰਖ ਲੋਅ ॥",
    "translation": "There are countless inaccessible realms.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-158",
    "gurmukhi": "ਅਸੰਖ ਕਹਿਹ ਿਸਿਰ ਭਾਰ ੁਹਇੋ ॥",
    "translation": "Countless people attempting to describe the creation in its entirety put a burden on their mind.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-159",
    "gurmukhi": "ਅਖਰੀ ਨਾਮ ੁਅਖਰੀ ਸਾਲਾਹ ॥",
    "translation": "Through the divine word, the name of the One is realised and is praised.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-160",
    "gurmukhi": "ਅਖਰੀ ਿਗਆਨੁ ਗੀਤ ਗਣੁ ਗਾਹ ॥",
    "translation": "Through the divine word, spiritual wisdom is attained and the One's praises are sung.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-161",
    "gurmukhi": "ਅਖਰੀ ਿਲਖਣ ੁਬੋਲਣ ੁਬਾਿਣ ॥",
    "translation": "Through the divine word, one can write, speak and use language.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-162",
    "gurmukhi": "ਅਖਰਾ ਿਸਿਰ ਸੰਜੋਗ ੁਵਖਾਿਣ ॥",
    "translation": "According to the divine word, the account of our actions is with us.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-163",
    "gurmukhi": "ਿਜਿਨ ਏਿਹ ਿਲਖੇ ਿਤਸ ੁਿਸਿਰ ਨਾਿਹ ॥",
    "translation": "The One that writes this divine law is not subject to it.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-164",
    "gurmukhi": "ਿਜਵ ਫਰੁਮਾਏ ਿਤਵ ਿਤਵ ਪਾਿਹ ॥",
    "translation": "As the One commands, so do we receive.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-165",
    "gurmukhi": "ਜੇਤਾ ਕੀਤਾ ਤਤੇਾ ਨਾਉ ॥",
    "translation": "Whatever has been created has Your name on it.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-166",
    "gurmukhi": "ਿਵਣ ੁਨਾਵ ੈਨਾਹੀ ਕ ੋਥਾਉ ॥",
    "translation": "Without Your Name, there is no place at all.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-167",
    "gurmukhi": "ਕੁਦਰਿਤ ਕਵਣ ਕਹਾ ਵੀਚਾਰ ੁ॥",
    "translation": "How can the One's creative power be described?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-168",
    "gurmukhi": "ਵਾਿਰਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
    "translation": "I cannot even once be a sacrifice to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-169",
    "gurmukhi": "ਜੋ ਤੁਧ ੁਭਾਵ ੈਸਾਈ ਭਲੀ ਕਾਰ ॥",
    "translation": "Whatever Your divine will is; that doing is perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-170",
    "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਿਤ ਿਨਰਕੰਾਰ ॥੧੯॥",
    "translation": "You are always stable, O formless One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-171",
    "gurmukhi": "ਭਰੀਐ ਹਥ ੁਪੈਰ ੁਤਨੁ ਦਹੇ ॥",
    "translation": "When the hands, feet and the body are dirty,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-172",
    "gurmukhi": "ਪਾਣੀ ਧੋਤ ੈਉਤਰਸ ੁਖੇਹ ॥",
    "translation": "water can wash away the dirt.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-173",
    "gurmukhi": "ਮਤੂ ਪਲੀਤੀ ਕਪੜ ੁਹਇੋ ॥",
    "translation": "When clothes are ruined by urine,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-174",
    "gurmukhi": "ਦ ੇਸਾਬਣੂ ੁਲਈਐ ਓਹ ੁਧੋਇ ॥",
    "translation": "soap can wash them clean.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-175",
    "gurmukhi": "ਭਰੀਐ ਮਿਤ ਪਾਪਾ ਕ ੈਸੰਿਗ ॥",
    "translation": "When the mind is filled with sins,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-176",
    "gurmukhi": "ਓਹ ੁਧੋਪੈ ਨਾਵ ੈਕ ੈਰਿੰਗ ॥",
    "translation": "those sins are washed with the colour of the One's name.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-177",
    "gurmukhi": "ਪੰਨੁੀ ਪਾਪੀ ਆਖਣ ੁਨਾਿਹ ॥",
    "translation": "The impact of being virtuous or a sinner is no small thing.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-178",
    "gurmukhi": "ਕਿਰ ਕਿਰ ਕਰਣਾ ਿਲਿਖ ਲੈ ਜਾਹ ੁ॥",
    "translation": "Repeating the same actions again and again, they become engraved on the mind and take control of your life.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-179",
    "gurmukhi": "ਆਪੇ ਬੀਿਜ ਆਪੇ ਹੀ ਖਾਹ ੁ॥",
    "translation": "You reap what you sow.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-180",
    "gurmukhi": "ਨਾਨਕ ਹਕੁਮੀ ਆਵਹ ੁਜਾਹ ੁ॥੨੦॥",
    "translation": "Nanak says, by the One's divine will, you come and go in reincarnation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-181",
    "gurmukhi": "ਤੀਰਥ ੁਤਪ ੁਦਇਆ ਦਤੁ ਦਾਨੁ ॥",
    "translation": "Pilgrimages, spiritual penance and compassionately giving gifts,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-182",
    "gurmukhi": "ਜੇ ਕ ੋਪਾਵ ੈਿਤਲ ਕਾ ਮਾਨੁ ॥",
    "translation": "even if someone were to receive something in return, it would only amount to a minuscule blessing.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-183",
    "gurmukhi": "ਸਿੁਣਆ ਮੰਿਨਆ ਮਿਨ ਕੀਤਾ ਭਾਉ ॥",
    "translation": "Those who listen with devotion are filled with love in their mind,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-184",
    "gurmukhi": "ਅੰਤਰਗਿਤ ਤੀਰਿਥ ਮਿਲ ਨਾਉ ॥",
    "translation": "thoroughly cleanse themsleves in their internal pilgrimage.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-185",
    "gurmukhi": "ਸਿਭ ਗਣੁ ਤਰੇ ੇਮੈ ਨਾਹੀ ਕਇੋ ॥",
    "translation": "All qualities belong to you. I have none at all.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-186",
    "gurmukhi": "ਿਵਣ ੁਗਣੁ ਕੀਤ ੇਭਗਿਤ ਨ ਹਇੋ ॥",
    "translation": "Without you giving me qualities, there is no devotion.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-187",
    "gurmukhi": "ਸਅੁਸਿਤ ਆਿਥ ਬਾਣੀ ਬਰਮਾਉ ॥",
    "translation": "I bow to the One that created the creation with the primal sound.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-188",
    "gurmukhi": "ਸਿਤ ਸਹੁਾਣ ੁਸਦਾ ਮਿਨ ਚਾਉ ॥",
    "translation": "The One is the beautiful truth and exists in a constant state of joy.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-189",
    "gurmukhi": "ਕਵਣ ੁਸ ੁਵਲੇਾ ਵਖਤੁ ਕਵਣ ੁਕਵਣ ਿਥਿਤ ਕਵਣ ੁਵਾਰ ੁ॥",
    "translation": "What was that time and what was that moment? What was that lunar day and what was solar day?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-190",
    "gurmukhi": "ਕਵਿਣ ਿਸ ਰਤੁੀ ਮਾਹ ੁਕਵਣ ੁਿਜਤੁ ਹਆੋ ਆਕਾਰ ੁ॥",
    "translation": "What was that season and what was that month when the creation came into being?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-191",
    "gurmukhi": "ਵਲੇ ਨ ਪਾਈਆ ਪੰਡਤੀ ਿਜ ਹਵੋ ੈਲੇਖ ੁਪਰੁਾਣ ੁ॥",
    "translation": "The religious scholars weren't able to find the time (when the creation came into being). If they knew, they would have dedicated a Purana to it.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-192",
    "gurmukhi": "ਵਖਤੁ ਨ ਪਾਇਓ ਕਾਦੀਆ ਿਜ ਿਲਖਿਨ ਲੇਖ ੁਕੁਰਾਣ ੁ॥",
    "translation": "The Qazis (Islamic judges) weren't able to find that moment (when the creation came into being). If they had written it, it would have been included in the Quran.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-193",
    "gurmukhi": "ਿਥਿਤ ਵਾਰ ੁਨਾ ਜੋਗੀ ਜਾਣ ੈਰਿੁਤ ਮਾਹ ੁਨਾ ਕਈੋ ॥",
    "translation": "The Yogis don't know the lunar day (when the creation came into being). No one knows what the season or month was.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-194",
    "gurmukhi": "ਜਾ ਕਰਤਾ ਿਸਰਠੀ ਕਉ ਸਾਜੇ ਆਪੇ ਜਾਣ ੈਸੋਈ ॥",
    "translation": "When the Creator created the creation, only that One knows (when the creation came into being).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-195",
    "gurmukhi": "ਿਕਵ ਕਿਰ ਆਖਾ ਿਕਵ ਸਾਲਾਹੀ ਿਕਉ ਵਰਨੀ ਿਕਵ ਜਾਣਾ ॥",
    "translation": "How can I speak of, praise, describe and know the One?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-196",
    "gurmukhi": "ਨਾਨਕ ਆਖਿਣ ਸਭੁ ਕ ੋਆਖੈ ਇਕ ਦ ੂਇਕੁ ਿਸਆਣਾ ॥",
    "translation": "Nanak says everyone attemping to describe the One claims to be wiser than the rest.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-197",
    "gurmukhi": "ਵਡਾ ਸਾਿਹਬ ੁਵਡੀ ਨਾਈ ਕੀਤਾ ਜਾ ਕਾ ਹਵੋ ੈ॥",
    "translation": "The One Master and the One's Name is Great. Whatever happens is according to the One's divine will.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-198",
    "gurmukhi": "ਨਾਨਕ ਜੇ ਕ ੋਆਪੌ ਜਾਣ ੈਅਗੈ ਗਇਆ ਨ ਸੋਹ ੈ॥੨੧॥",
    "translation": "Nanak says, if somebody according to their own intellect attemps to describe the extent of the One, they won't be honoured when they go (from this world).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-199",
    "gurmukhi": "ਪਾਤਾਲਾ ਪਾਤਾਲ ਲਖ ਆਗਾਸਾ ਆਗਾਸ ॥",
    "translation": "There are hundreds of thousands of worlds below and above (subtle and physical).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-200",
    "gurmukhi": "ਓੜਕ ਓੜਕ ਭਾਿਲ ਥਕ ੇਵਦੇ ਕਹਿਨ ਇਕ ਵਾਤ ॥",
    "translation": "The Vedas say coherently that those that search to find the end of them will tire.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-201",
    "gurmukhi": "ਸਹਸ ਅਠਾਰਹ ਕਹਿਨ ਕਤਬੇਾ ਅਸਲੁੂ ਇਕੁ ਧਾਤੁ ॥",
    "translation": "Various scriptures say that there are 18,000 worlds, but at the root of all these worlds, there's One creator.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-202",
    "gurmukhi": "ਲੇਖਾ ਹਇੋ ਤ ਿਲਖੀਐ ਲੇਖੈ ਹਇੋ ਿਵਣਾਸ ੁ॥",
    "translation": "If one could write an account of the entire creation, they would (but they can't), as the means of measuring the creation will come to an end.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-203",
    "gurmukhi": "ਨਾਨਕ ਵਡਾ ਆਖੀਐ ਆਪੇ ਜਾਣ ੈਆਪ ੁ॥੨੨॥",
    "translation": "Nanak says, call the One great! Only the One knows the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-204",
    "gurmukhi": "ਸਾਲਾਹੀ ਸਾਲਾਿਹ ਏਤੀ ਸਰੁਿਤ ਨ ਪਾਈਆ ॥",
    "translation": "The devotees praise the One yet will not attain a complete understanding of the One's limits (as the One is limitless).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-205",
    "gurmukhi": "ਨਦੀਆ ਅਤ ੈਵਾਹ ਪਵਿਹ ਸਮੰਿੁਦ ਨ ਜਾਣੀਅਿਹ ॥",
    "translation": "Those rivers and streams that flow into the ocean are no longer known (as they've gone beyond the ego).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-206",
    "gurmukhi": "ਸਮੰਦੁ ਸਾਹ ਸਲੁਤਾਨ ਿਗਰਹਾ ਸੇਤੀ ਮਾਲੁ ਧਨੁ ॥",
    "translation": "Even if a king or emperor had property and wealth amounting to an ocean and a mountain,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-207",
    "gurmukhi": "ਕੀੜੀ ਤੁਿਲ ਨ ਹਵੋਨੀ ਜੇ ਿਤਸ ੁਮਨਹ ੁਨ ਵੀਸਰਿਹ ॥੨੩॥",
    "translation": "they wouldn't equal even an ant who doesn't forget the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-208",
    "gurmukhi": "ਅੰਤੁ ਨ ਿਸਫਤੀ ਕਹਿਣ ਨ ਅੰਤੁ ॥",
    "translation": "There is no limit to the One's praises and how much we could say about the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-209",
    "gurmukhi": "ਅੰਤੁ ਨ ਕਰਣ ੈਦਿੇਣ ਨ ਅੰਤੁ ॥",
    "translation": "There is no limit to the creation and gifts of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-210",
    "gurmukhi": "ਅੰਤੁ ਨ ਵਖੇਿਣ ਸਣੁਿਣ ਨ ਅੰਤੁ ॥",
    "translation": "There is no limit to what the One can see and hear.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-211",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਿਕਆ ਮਿਨ ਮੰਤੁ ॥",
    "translation": "There is no limit to perceiving what the intelligence of the One is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-212",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਕੀਤਾ ਆਕਾਰ ੁ॥",
    "translation": "There is no limit to perceiving what the One has created.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-213",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਪਾਰਾਵਾਰ ੁ॥",
    "translation": "The One's limits here and beyond cannot be perceived.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-214",
    "gurmukhi": "ਅੰਤ ਕਾਰਿਣ ਕਤੇ ੇਿਬਲਲਾਿਹ ॥",
    "translation": "Many struggle to know the One's limits,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-215",
    "gurmukhi": "ਤਾ ਕ ੇਅੰਤ ਨ ਪਾਏ ਜਾਿਹ ॥",
    "translation": "but the One's limits cannot be found.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-216",
    "gurmukhi": "ਏਹ ੁਅੰਤੁ ਨ ਜਾਣ ੈਕਇੋ ॥",
    "translation": "No one can know these limits.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-217",
    "gurmukhi": "ਬਹਤੁਾ ਕਹੀਐ ਬਹਤੁਾ ਹਇੋ ॥",
    "translation": "The more you describe the One's qualities, the more you realise their greatness exceeds your words.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-218",
    "gurmukhi": "ਵਡਾ ਸਾਿਹਬ ੁਊਚਾ ਥਾਉ ॥",
    "translation": "Great is the master. That One's place (of bliss) is the highest.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-219",
    "gurmukhi": "ਊਚ ੇਉਪਿਰ ਊਚਾ ਨਾਉ ॥",
    "translation": "Higher than the One is the One's Name.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-220",
    "gurmukhi": "ਏਵਡੁ ਊਚਾ ਹਵੋ ੈਕਇੋ ॥",
    "translation": "Anyone that becomes as great as that One;",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-221",
    "gurmukhi": "ਿਤਸ ੁਊਚ ੇਕਉ ਜਾਣ ੈਸੋਇ ॥",
    "translation": "they will know that One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-222",
    "gurmukhi": "ਜੇਵਡੁ ਆਿਪ ਜਾਣ ੈਆਿਪ ਆਿਪ ॥",
    "translation": "The One knows how great the One is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-223",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਕਰਮੀ ਦਾਿਤ ॥੨੪॥",
    "translation": "Nanak says that the knowing of the One is a gift from the glance of grace of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-224",
    "gurmukhi": "ਬਹਤੁਾ ਕਰਮ ੁਿਲਿਖਆ ਨਾ ਜਾਇ ॥",
    "translation": "The One's blessings are so abundant that there can be no written account of them.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-225",
    "gurmukhi": "ਵਡਾ ਦਾਤਾ ਿਤਲੁ ਨ ਤਮਾਇ ॥",
    "translation": "The greatest giver does not desire even an iota in return.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-226",
    "gurmukhi": "ਕਤੇ ੇਮੰਗਿਹ ਜੋਧ ਅਪਾਰ ॥",
    "translation": "There are many warriors begging infinitely at the door of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-227",
    "gurmukhi": "ਕਿੇਤਆ ਗਣਤ ਨਹੀ ਵੀਚਾਰ ੁ॥",
    "translation": "I cannot comtemplate the amount of those who are begging from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-228",
    "gurmukhi": "ਕਤੇ ੇਖਿਪ ਤੁਟਿਹ ਵਕੇਾਰ ॥",
    "translation": "Many waste away engaged in unrighteousness.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-229",
    "gurmukhi": "ਕਤੇ ੇਲੈ ਲੈ ਮਕੁਰ ੁਪਾਿਹ ॥",
    "translation": "Many take and take and deny receiving.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-230",
    "gurmukhi": "ਕਤੇ ੇਮਰੂਖ ਖਾਹੀ ਖਾਿਹ ॥",
    "translation": "Many fools keep on consuming.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-231",
    "gurmukhi": "ਕਿੇਤਆ ਦਖੂ ਭੂਖ ਸਦ ਮਾਰ ॥",
    "translation": "Many see suffering caused by desires as a calling to return home.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-232",
    "gurmukhi": "ਏਿਹ ਿਭ ਦਾਿਤ ਤਰੇੀ ਦਾਤਾਰ ॥",
    "translation": "Even this is Your gift, O Giver.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-233",
    "gurmukhi": "ਬੰਿਦ ਖਲਾਸੀ ਭਾਣ ੈਹਇੋ ॥",
    "translation": "Liberation from being bound by attachments comes from walking in the way of the One's divine will.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-234",
    "gurmukhi": "ਹਰੋ ੁਆਿਖ ਨ ਸਕ ੈਕਇੋ ॥",
    "translation": "No one else has any say in this.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-235",
    "gurmukhi": "ਜੇ ਕ ੋਖਾਇਕੁ ਆਖਿਣ ਪਾਇ ॥",
    "translation": "If a fool suggested another way contrary to the One's divine will,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-236",
    "gurmukhi": "ਓਹ ੁਜਾਣ ੈਜੇਤੀਆ ਮਿੁਹ ਖਾਇ ॥",
    "translation": "those fools know, who have been smacked in the face (from their choices against that divine will).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-237",
    "gurmukhi": "ਆਪੇ ਜਾਣ ੈਆਪੇ ਦਇੇ ॥",
    "translation": "The One knows and gives.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-238",
    "gurmukhi": "ਆਖਿਹ ਿਸ ਿਭ ਕਈੇ ਕਇੇ ॥",
    "translation": "There are very few who recognise the blessings of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-239",
    "gurmukhi": "ਿਜਸ ਨ�  ਬਖਸੇ ਿਸਫਿਤ ਸਾਲਾਹ ॥",
    "translation": "One who is blessed to sing the praises of the One,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-240",
    "gurmukhi": "ਨਾਨਕ ਪਾਿਤਸਾਹੀ ਪਾਿਤਸਾਹ ੁ॥੨੫॥",
    "translation": "Nanak says that they are the king of kings.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-241",
    "gurmukhi": "ਅਮਲੁ ਗਣੁ ਅਮਲੁ ਵਾਪਾਰ ॥",
    "translation": "The One's virtues and the trade of those virtues are priceless.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-242",
    "gurmukhi": "ਅਮਲੁ ਵਾਪਾਰੀਏ ਅਮਲੁ ਭਡੰਾਰ ॥",
    "translation": "Priceless are the traders and the treasure of those virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-243",
    "gurmukhi": "ਅਮਲੁ ਆਵਿਹ ਅਮਲੁ ਲੈ ਜਾਿਹ ॥",
    "translation": "Priceless are those who come into the world and take away those virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-244",
    "gurmukhi": "ਅਮਲੁ ਭਾਇ ਅਮਲੁਾ ਸਮਾਿਹ ॥",
    "translation": "Priceless are those who are in love and are emersed in the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-245",
    "gurmukhi": "ਅਮਲੁੁ ਧਰਮ ੁਅਮਲੁੁ ਦੀਬਾਣ ੁ॥",
    "translation": "Priceless is the One's divine law and court.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-246",
    "gurmukhi": "ਅਮਲੁੁ ਤੁਲੁ ਅਮਲੁੁ ਪਰਵਾਣ ੁ॥",
    "translation": "Priceless are the figurative scales and weights that measure our actions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-247",
    "gurmukhi": "ਅਮਲੁੁ ਬਖਸੀਸ ਅਮਲੁੁ ਨੀਸਾਣ ੁ॥",
    "translation": "Priceless is the One's grace. Priceless is the sign of that One's grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-248",
    "gurmukhi": "ਅਮਲੁੁ ਕਰਮ ੁਅਮਲੁੁ ਫਰੁਮਾਣ ੁ॥",
    "translation": "Priceless is the grace and divine command of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-249",
    "gurmukhi": "ਅਮਲੁੋ ਅਮਲੁੁ ਆਿਖਆ ਨ ਜਾਇ ॥",
    "translation": "It can't be said how priceless the One is!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-250",
    "gurmukhi": "ਆਿਖ ਆਿਖ ਰਹ ੇਿਲਵ ਲਾਇ ॥",
    "translation": "Saying how priceless You are, I lose myself emersed in the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-251",
    "gurmukhi": "ਆਖਿਹ ਵਦੇ ਪਾਠ ਪਰੁਾਣ ॥",
    "translation": "The Vedas and Puranas attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-252",
    "gurmukhi": "ਆਖਿਹ ਪੜ ੇਕਰਿਹ ਵਿਖਆਣ ॥",
    "translation": "The scholars attempt to explain the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-253",
    "gurmukhi": "ਆਖਿਹ ਬਰਮੇ ਆਖਿਹ ਇੰਦ ॥",
    "translation": "Many Brahmas and the deity Indra attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-254",
    "gurmukhi": "ਆਖਿਹ ਗੋਪੀ ਤ ੈਗੋਿਵਦੰ ॥",
    "translation": "Krishna and his gopis attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-255",
    "gurmukhi": "ਆਖਿਹ ਈਸਰ ਆਖਿਹ ਿਸਧ ॥",
    "translation": "The Sidhas and Shiva attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-256",
    "gurmukhi": "ਆਖਿਹ ਕਤੇ ੇਕੀਤ ੇਬਧੁ ॥",
    "translation": "Many Buddhas attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-257",
    "gurmukhi": "ਆਖਿਹ ਦਾਨਵ ਆਖਿਹ ਦਵੇ ॥",
    "translation": "There are many deities and demons and many silent sages. There are many oceans of jewels.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-258",
    "gurmukhi": "ਆਖਿਹ ਸਿੁਰ ਨਰ ਮਿੁਨ ਜਨ ਸੇਵ ॥",
    "translation": "Divine natured people, silent sages and people who live in service attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-259",
    "gurmukhi": "ਕਤੇ ੇਆਖਿਹ ਆਖਿਣ ਪਾਿਹ ॥",
    "translation": "Many attempt to express and describe the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-260",
    "gurmukhi": "ਕਤੇ ੇਕਿਹ ਕਿਹ ਉਿਠ ਉਿਠ ਜਾਿਹ ॥",
    "translation": "Many attempting to express the extent of the One, one by one leave the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-261",
    "gurmukhi": "ਏਤ ੇਕੀਤ ੇਹਿੋਰ ਕਰਿੇਹ ॥",
    "translation": "If the One were to create as many people as there are already,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-262",
    "gurmukhi": "ਤਾ ਆਿਖ ਨ ਸਕਿਹ ਕਈੇ ਕਇੇ ॥",
    "translation": "even then, those people cannot express the complete extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-263",
    "gurmukhi": "ਜੇਵਡੁ ਭਾਵ ੈਤਵੇਡੁ ਹਇੋ ॥",
    "translation": "However great the One wills to be, the One becomes that great.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-264",
    "gurmukhi": "ਨਾਨਕ ਜਾਣ ੈਸਾਚਾ ਸੋਇ ॥",
    "translation": "Nanak says that only the true One knows.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-265",
    "gurmukhi": "ਜੇ ਕ ੋਆਖੈ ਬੋਲੁਿਵਗਾੜ ੁ॥",
    "translation": "If a know-it-all attempts to express the extent of the One,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-266",
    "gurmukhi": "ਤਾ ਿਲਖੀਐ ਿਸਿਰ ਗਾਵਾਰਾ ਗਾਵਾਰ ੁ॥੨੬॥",
    "translation": "then, that person is considered a fool of fools.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-267",
    "gurmukhi": "ਸੋ ਦਰ ੁਕਹੇਾ ਸੋ ਘਰ ੁਕਹੇਾ ਿਜਤੁ ਬਿਹ ਸਰਬ ਸਮਾਲੇ ॥",
    "translation": "What kind of door and home is that, from where the One sits and takes care of all.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-268",
    "gurmukhi": "ਵਾਜੇ ਨਾਦ ਅਨ� ਕ ਅਸੰਖਾ ਕਤੇ ੇਵਾਵਣਹਾਰ ੇ॥",
    "translation": "There are countless instruments, sounds and musicians in Your creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-269",
    "gurmukhi": "ਕਤੇ ੇਰਾਗ ਪਰੀ ਿਸਉ ਕਹੀਅਿਨ ਕਤੇ ੇਗਾਵਣਹਾਰ ੇ॥",
    "translation": "There are many ragas that subtle beings are expressing and there are many singing those ragas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-270",
    "gurmukhi": "ਗਾਵਿਹ ਿਚਤੁ ਗਪੁਤੁ ਿਲਿਖ ਜਾਣਿਹ ਿਲਿਖ ਿਲਿਖ ਧਰਮ ੁਵੀਚਾਰ ੇ",
    "translation": "Chitr and Gupt, the symbolic energies that record our physical and subtle actions, sing at the door of the One. The judge of righteousness makes a conclusion",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-271",
    "gurmukhi": "ਗਾਵਿਹ ਈਸਰ ੁਬਰਮਾ ਦਵੇੀ ਸੋਹਿਨ ਸਦਾ ਸਵਾਰ ੇ॥",
    "translation": "Shiva (descructive power), Brahma (creative power) and the feminine energy sing of the One. They are always and beautifully adorned by the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-272",
    "gurmukhi": "ਗਾਵਿਹ ਇੰਦ ਇਦਾਸਿਣ ਬੈਠ�  ਦਵੇਿਤਆ ਦਿਰ ਨਾਲੇ ॥",
    "translation": "Many Indras seated upon their thrones along with the deites sing at Your door.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-273",
    "gurmukhi": "ਗਾਵਿਹ ਿਸਧ ਸਮਾਧੀ ਅੰਦਿਰ ਗਾਵਿਨ ਸਾਧ ਿਵਚਾਰ ੇ॥",
    "translation": "Those with spiritual powers in deep meditation and those spiritually acomplished beings in contemplation sing of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-274",
    "gurmukhi": "ਗਾਵਿਨ ਜਤੀ ਸਤੀ ਸੰਤਖੋੀ ਗਾਵਿਹ ਵੀਰ ਕਰਾਰ ੇ॥",
    "translation": "Celibates, those who speak truthfully, those who live in contentment and strong warriors sing of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-275",
    "gurmukhi": "ਗਾਵਿਨ ਪੰਿਡਤ ਪੜਿਨ ਰਖੀਸਰ ਜਗੁ ੁਜਗੁ ੁਵਦੇਾ ਨਾਲੇ ॥",
    "translation": "Throughout the ages, the Hindu scholars and the great sages sing of the One through the Vedas .",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-276",
    "gurmukhi": "ਗਾਵਿਹ ਮੋਹਣੀਆ ਮਨੁ ਮੋਹਿਨ ਸਰੁਗਾ ਮਛ ਪਇਆਲੇ ॥",
    "translation": "Those encticing women who entice the mind of people in heaven, this world and the lower world, sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-277",
    "gurmukhi": "ਗਾਵਿਨ ਰਤਨ ਉਪਾਏ ਤਰੇ ੇਅਠਸਿਠ ਤੀਰਥ ਨਾਲੇ ॥",
    "translation": "The jewels created by You and the sixty-eight places of pilgrimage sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-278",
    "gurmukhi": "ਗਾਵਿਹ ਜੋਧ ਮਹਾਬਲ ਸਰੂਾ ਗਾਵਿਹ ਖਾਣੀ ਚਾਰ ੇ॥",
    "translation": "The great brave powerful warriors and the four sources of creation sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-279",
    "gurmukhi": "ਗਾਵਿਹ ਖੰਡ ਮੰਡਲ ਵਰਭਡੰਾ ਕਿਰ ਕਿਰ ਰਖੇ ਧਾਰ ੇ॥",
    "translation": "The planets, solar systems and universes, created and placed by the One, sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-280",
    "gurmukhi": "ਸੇਈ ਤੁਧਨੁ�  ਗਾਵਿਹ ਜੋ ਤੁਧ ੁਭਾਵਿਨ ਰਤ ੇਤਰੇ ੇਭਗਤ ਰਸਾਲੇ ॥",
    "translation": "However, only those who are pleasing to You truly sing of You. Your devotees are imbued in Your love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-281",
    "gurmukhi": "ਸੋਈ ਸੋਈ ਸਦਾ ਸਚੁ ਸਾਿਹਬ ੁਸਾਚਾ ਸਾਚੀ ਨਾਈ ॥",
    "translation": "The One is always the true Master. The One's divine law is true to itself.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-282",
    "gurmukhi": "ਹ ੈਭੀ ਹਸੋੀ ਜਾਇ ਨ ਜਾਸੀ ਰਚਨਾ ਿਜਿਨ ਰਚਾਈ ॥",
    "translation": "That One who created the creation exists now, will always be and will not leave.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-283",
    "gurmukhi": "ਰਗੰੀ ਰਗੰੀ ਭਾਤੀ ਕਿਰ ਕਿਰ ਿਜਨਸੀ ਮਾਇਆ ਿਜਿਨ ਉਪਾਈ ॥",
    "translation": "The One has created all the various colours and illusions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-284",
    "gurmukhi": "ਕਿਰ ਕਿਰ ਵਖੇੈ ਕੀਤਾ ਆਪਣਾ ਿਜਵ ਿਤਸ ਦੀ ਵਿਡਆਈ ॥",
    "translation": "That which the One has created is observed by the One as per divine law.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-285",
    "gurmukhi": "ਜੋ ਿਤਸ ੁਭਾਵ ੈਸੋਈ ਕਰਸੀ ਹਕੁਮ ੁਨ ਕਰਣਾ ਜਾਈ ॥",
    "translation": "That which pleases the One, the One does. No one can order the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-286",
    "gurmukhi": "ਸੋ ਪਾਿਤਸਾਹ ੁਸਾਹਾ ਪਾਿਤਸਾਿਹਬ ੁਨਾਨਕ ਰਹਣ ੁਰਜਾਈ ॥੨੭॥",
    "translation": "That One is the king, the king of kings. Nanak says, remain in the will of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-287",
    "gurmukhi": "ਮੰਦੁਾ ਸੰਤਖੋ ੁਸਰਮ ੁਪਤੁ ਝਲੋੀ ਿਧਆਨ ਕੀ ਕਰਿਹ ਿਬਭੂਿਤ ॥",
    "translation": "(O Yogi), I have made contentment my ear-rings, shame for doing negative actions my begging bowl and being conscious to the One's presence the ashes applied to my body.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-288",
    "gurmukhi": "ਿਖੰਥਾ ਕਾਲੁ ਕੁਆਰੀ ਕਾਇਆ ਜਗੁਿਤ ਡਡੰਾ ਪਰਤੀਿਤ ॥",
    "translation": "(O Yogi), for the patched coat you wear as a symbol of the remembrance of death, I have the awareness that, although death will eventually claim the body, I remain sep",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-289",
    "gurmukhi": "ਆਈ ਪੰਥੀ ਸਗਲ ਜਮਾਤੀ ਮਿਨ ਜੀਤ ੈਜਗ ੁਜੀਤੁ ॥",
    "translation": "O Yogi, the actual highest order of yogi is being able to see all beings as your own. This is what it means to conquer your mind and the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-290",
    "gurmukhi": "ਆਦੇਸ ੁਿਤਸੈ ਆਦੇਸ ੁ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-291",
    "gurmukhi": "ਆਿਦ ਅਨੀਲੁ ਅਨਾਿਦ ਅਨਾਹਿਤ ਜਗੁ ੁਜਗੁ ੁਏਕ ੋਵਸੇ ੁ॥੨੮॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-292",
    "gurmukhi": "ਭੁਗਿਤ ਿਗਆਨੁ ਦਇਆ ਭਡੰਾਰਿਣ ਘਿਟ ਘਿਟ ਵਾਜਿਹ ਨਾਦ ॥",
    "translation": "(O Yogi), I have made spiritual wisdom my food, given by the server of compassion. I have made the primal sound at the heart of everything the calling of the sound to eat. The One is the supreme master, who has strung together the entire creation. Pursuing the attainment of miraculous powers offers only a worldly pleasure",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-293",
    "gurmukhi": "ਆਿਪ ਨਾਥ ੁਨਾਥੀ ਸਭ ਜਾ ਕੀ ਿਰਿਧ ਿਸਿਧ ਅਵਰਾ ਸਾਦ ॥",
    "translation": "compared to the primary fulfillment of union. The play of the One's creation revolves around the dynamic interplay of union and separation, with our actions determining the trajectory towards either,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-294",
    "gurmukhi": "ਸੰਜੋਗ ੁਿਵਜੋਗ ੁਦਇੁ ਕਾਰ ਚਲਾਵਿਹ ਲੇਖੇ ਆਵਿਹ ਭਾਗ ॥",
    "translation": "thereby shaping our destiny.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-295",
    "gurmukhi": "ਆਦੇਸ ੁਿਤਸੈ ਆਦੇਸ ੁ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-296",
    "gurmukhi": "ਆਿਦ ਅਨੀਲੁ ਅਨਾਿਦ ਅਨਾਹਿਤ ਜਗੁ ੁਜਗੁ ੁਏਕ ੋਵਸੇ ੁ॥੨੯॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-297",
    "gurmukhi": "ਏਕਾ ਮਾਈ ਜਗੁਿਤ ਿਵਆਈ ਿਤਿਨ ਚਲੇੇ ਪਰਵਾਣ ੁ॥",
    "translation": "The One gave birth to creation (Maya) in a mysterious way, which manifested in three qualities,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-298",
    "gurmukhi": "ਇਕੁ ਸੰਸਾਰੀ ਇਕੁ ਭਡੰਾਰੀ ਇਕੁ ਲਾਏ ਦੀਬਾਣ ੁ॥",
    "translation": "one that is creating (Brahma), one that is sustaining (Vishnu) and one that is destroying (Shiva).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-299",
    "gurmukhi": "ਿਜਵ ਿਤਸ ੁਭਾਵ ੈਿਤਵ ੈਚਲਾਵ ੈਿਜਵ ਹਵੋ ੈਫਰੁਮਾਣ ੁ॥",
    "translation": "The creation operates according to the divine will of the One, who orchestrates its functioning as they please. The formless One sees everything, however those who see the creation through the lens of the illusion cannot have vision of the formless One. Great is this",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-300",
    "gurmukhi": "ਓਹ ੁਵਖੇੈ ਓਨਾ ਨਦਿਰ ਨ ਆਵ ੈਬਹਤੁਾ ਏਹ ੁਿਵਡਾਣ ੁ॥",
    "translation": "wonder.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-301",
    "gurmukhi": "ਆਦੇਸ ੁਿਤਸੈ ਆਦੇਸ ੁ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-302",
    "gurmukhi": "ਆਿਦ ਅਨੀਲੁ ਅਨਾਿਦ ਅਨਾਹਿਤ ਜਗੁ ੁਜਗੁ ੁਏਕ ੋਵਸੇ ੁ॥੩੦॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-303",
    "gurmukhi": "ਆਸਣ ੁਲੋਇ ਲੋਇ ਭਡੰਾਰ ॥",
    "translation": "The One that is the inexhaustable source of abundance is seated within the entire creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-304",
    "gurmukhi": "ਜੋ ਿਕਛੁ ਪਾਇਆ ਸ ੁਏਕਾ ਵਾਰ ॥",
    "translation": "Whatever was put into the creation (from the primal sound), was put in there once.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-305",
    "gurmukhi": "ਕਿਰ ਕਿਰ ਵਖੇੈ ਿਸਰਜਣਹਾਰ ੁ॥",
    "translation": "That which the One has created is observed by the Creator.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-306",
    "gurmukhi": "ਨਾਨਕ ਸਚ ੇਕੀ ਸਾਚੀ ਕਾਰ ॥",
    "translation": "Nanak says the True One's creation is entirely complete, lacking nothing, and eternally perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-307",
    "gurmukhi": "ਆਦੇਸ ੁਿਤਸੈ ਆਦੇਸ ੁ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-308",
    "gurmukhi": "ਆਿਦ ਅਨੀਲੁ ਅਨਾਿਦ ਅਨਾਹਿਤ ਜਗੁ ੁਜਗੁ ੁਏਕ ੋਵਸੇ ੁ॥੩੧॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-309",
    "gurmukhi": "ਇਕ ਦ ੂਜੀਭ ੌਲਖ ਹਿੋਹ ਲਖ ਹਵੋਿਹ ਲਖ ਵੀਸ ॥",
    "translation": "May my one tongue become a hundred thousand. Let that hundred thousand become twenty times that (millions)!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-310",
    "gurmukhi": "ਲਖ ੁਲਖ ੁਗੇੜਾ ਆਖੀਅਿਹ ਏਕੁ ਨਾਮ ੁਜਗਦੀਸ ॥",
    "translation": "I would chant and repeat, hundreds of thousands of times, the name of the One, the master of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-311",
    "gurmukhi": "ਏਤੁ ਰਾਿਹ ਪਿਤ ਪਵੜੀਆ ਚੜੀਐ ਹਇੋ ਇਕੀਸ ॥",
    "translation": "Through this way, take those steps to your husband (the One). As you climb those steps, you become one with the master of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-312",
    "gurmukhi": "ਸਿੁਣ ਗਲਾ ਆਕਾਸ ਕੀ ਕੀਟਾ ਆਈ ਰੀਸ ॥",
    "translation": "Through hearing stories, ignorant people imitate the actions of realised beings and think they're in a spiritual state, like a insect trying to copy a bird flying in the sky.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-313",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਪਾਈਐ ਕੂੜੀ ਕੂੜ ੈਠੀਸ ॥੩੨॥",
    "translation": "Nanak says, through receiving the glance of grace of the One, you can achieve union. The false ones talk false nonsense.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-314",
    "gurmukhi": "ਆਖਿਣ ਜੋਰ ੁਚੁਪੈ ਨਹ ਜੋਰ ੁ॥",
    "translation": "I have no power to determine the nature of how to speak and keep silent.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-315",
    "gurmukhi": "ਜੋਰ ੁਨ ਮੰਗਿਣ ਦਿੇਣ ਨ ਜੋਰ ੁ॥",
    "translation": "I have no power to determine the nature of how to beg and give.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-316",
    "gurmukhi": "ਜੋਰ ੁਨ ਜੀਵਿਣ ਮਰਿਣ ਨਹ ਜੋਰ ੁ॥",
    "translation": "I have no power to determine the nature of how to remain alive and die.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-317",
    "gurmukhi": "ਜੋਰ ੁਨ ਰਾਿਜ ਮਾਿਲ ਮਿਨ ਸੋਰ ੁ॥",
    "translation": "I have no power to determine the nature of how to acquire power and wealth that cause disturbances within the mind.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-318",
    "gurmukhi": "ਜੋਰ ੁਨ ਸਰੁਤੀ ਿਗਆਿਨ ਵੀਚਾਿਰ ॥",
    "translation": "I have no power to determine the nature of how to focus in meditation and aquire divine wisdom.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-319",
    "gurmukhi": "ਜੋਰ ੁਨ ਜਗੁਤੀ ਛੁਟ ੈਸੰਸਾਰ ੁ॥",
    "translation": "I have no power to determine the nature of how to escape from the entanglement of the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-320",
    "gurmukhi": "ਿਜਸ ੁਹਿਥ ਜੋਰ ੁਕਿਰ ਵਖੇੈ ਸੋਇ ॥",
    "translation": "The One, with power in hand, watches over the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-321",
    "gurmukhi": "ਨਾਨਕ ਉਤਮ ੁਨੀਚੁ ਨ ਕਇੋ ॥੩੩॥",
    "translation": "Nanak says, no one has the power to determine the nature of what it means to be high or low.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-322",
    "gurmukhi": "ਰਾਤੀ ਰਤੁੀ ਿਥਤੀ ਵਾਰ ॥",
    "translation": "Nights, seasons, lunar days, weeks,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-323",
    "gurmukhi": "ਪਵਣ ਪਾਣੀ ਅਗਨੀ ਪਾਤਾਲ ॥",
    "translation": "air, water, fire, and the nether regions (space);",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-324",
    "gurmukhi": "ਿਤਸ ੁਿਵਿਚ ਧਰਤੀ ਥਾਿਪ ਰਖੀ ਧਰਮ ਸਾਲ ॥",
    "translation": "within these, Earth was created as a place for practicing righteousness and connecting to the Divine.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-325",
    "gurmukhi": "ਿਤਸ ੁਿਵਿਚ ਜੀਅ ਜਗੁਿਤ ਕ ੇਰਗੰ ॥",
    "translation": "On Earth, through the One's divine way, there are beings of various colours (diversity);",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-326",
    "gurmukhi": "ਿਤਨ ਕ ੇਨਾਮ ਅਨ� ਕ ਅਨੰ ਤ ॥",
    "translation": "the names of these beings are countless and endless.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-327",
    "gurmukhi": "ਕਰਮੀ ਕਰਮੀ ਹਇੋ ਵੀਚਾਰ ੁ॥",
    "translation": "Each and every action of all beings are observed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-328",
    "gurmukhi": "ਸਚਾ ਆਿਪ ਸਚਾ ਦਰਬਾਰ ੁ॥",
    "translation": "The One is true and the One's court is true.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-329",
    "gurmukhi": "ਿਤਥੈ ਸੋਹਿਨ ਪੰਚ ਪਰਵਾਣ ੁ॥",
    "translation": "In the One's court, the accepted virtuous beings are beautiful.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-330",
    "gurmukhi": "ਨਦਰੀ ਕਰਿਮ ਪਵ ੈਨੀਸਾਣ ੁ॥",
    "translation": "They receive the radiance of the One's graceful vision.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-331",
    "gurmukhi": "ਕਚ ਪਕਾਈ ਓਥੈ ਪਾਇ ॥",
    "translation": "In the One's court (state of supreme consciousness), there is clarity on who is unripened (unrighteous) or ripened (righteous).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-332",
    "gurmukhi": "ਨਾਨਕ ਗਇਆ ਜਾਪੈ ਜਾਇ ॥੩੪॥",
    "translation": "Nanak says that only upon going to the One's court is this clarity realised.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-333",
    "gurmukhi": "ਧਰਮ ਖੰਡ ਕਾ ਏਹ ੋਧਰਮ ੁ॥",
    "translation": "The nature of the realm of righteousness is as per the previous pauri.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-334",
    "gurmukhi": "ਿਗਆਨ ਖੰਡ ਕਾ ਆਖਹ ੁਕਰਮ ੁ॥",
    "translation": "Now I speak of the workings of the realm of divine knowing.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-335",
    "gurmukhi": "ਕਤੇ ੇਪਵਣ ਪਾਣੀ ਵਸੈੰਤਰ ਕਤੇ ੇਕਾਨ ਮਹਸੇ ॥",
    "translation": "There are many forms of air, water and fire. There are many Krishanas and Shivas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-336",
    "gurmukhi": "ਕਤੇ ੇਬਰਮੇ ਘਾੜਿਤ ਘੜੀਅਿਹ ਰਪੂ ਰਗੰ ਕ ੇਵਸੇ ॥",
    "translation": "There are many Brahmas (creative powers) that are carving the creation, dressed in different forms and colours.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-337",
    "gurmukhi": "ਕਤੇੀਆ ਕਰਮ ਭੂਮੀ ਮੇਰ ਕਤੇ ੇਕਤੇ ੇਧ ੂਉਪਦੇਸ ॥",
    "translation": "There are many worlds where the law of karma applies. There are many Meru mountains. There are many beings like Narada that give teachings to those like Bhagat Dhru.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-338",
    "gurmukhi": "ਕਤੇ ੇਇੰਦ ਚੰਦ ਸਰੂ ਕਤੇ ੇਕਤੇ ੇਮੰਡਲ ਦੇਸ ॥",
    "translation": "There are many Indras, many moons and suns. There are many solar systems and lands.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-339",
    "gurmukhi": "ਕਤੇ ੇਿਸਧ ਬਧੁ ਨਾਥ ਕਤੇ ੇਕਤੇ ੇਦਵੇੀ ਵਸੇ ॥",
    "translation": "There are many siddhas, Buddhas and many yogic masters. There are many goddesses of various kinds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-340",
    "gurmukhi": "ਕਤੇ ੇਦਵੇ ਦਾਨਵ ਮਿੁਨ ਕਤੇ ੇਕਤੇ ੇਰਤਨ ਸਮੰਦੁ ॥",
    "translation": "There are many deities and demons. There are many silent sages. There are many oceans of jewels.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-341",
    "gurmukhi": "ਕਤੇੀਆ ਖਾਣੀ ਕਤੇੀਆ ਬਾਣੀ ਕਤੇ ੇਪਾਤ ਨਿਰਦੰ ॥",
    "translation": "There are many ways in which life is created. There are many languages. There are many kings and rulers of people.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-342",
    "gurmukhi": "ਕਤੇੀਆ ਸਰੁਤੀ ਸੇਵਕ ਕਤੇ ੇਨਾਨਕ ਅੰਤੁ ਨ ਅੰਤੁ ॥੩੫॥",
    "translation": "There are many ways to practise focused meditation. There are many selfless servants. Nanak says the One's limit has no limit!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-343",
    "gurmukhi": "ਿਗਆਨ ਖੰਡ ਮਿਹ ਿਗਆਨੁ ਪਰਚੰਡੁ ॥",
    "translation": "In the realm of divine knowing, there is a radiance of divine clarity.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-344",
    "gurmukhi": "ਿਤਥੈ ਨਾਦ ਿਬਨ� ਦ ਕਡੋ ਅਨੰ ਦ ੁ॥",
    "translation": "The experience of that place of diving knowing is a state of internal joy and bliss, enjoying the play of sounds (emotions).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-345",
    "gurmukhi": "ਸਰਮ ਖੰਡ ਕੀ ਬਾਣੀ ਰਪੂ ੁ॥",
    "translation": "The realm of humility makes you truly beautiful.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-346",
    "gurmukhi": "ਿਤਥੈ ਘਾੜਿਤ ਘੜੀਐ ਬਹਤੁੁ ਅਨੂਪ ੁ॥",
    "translation": "This chisel of humility carves you to immense incomparability.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-347",
    "gurmukhi": "ਤਾ ਕੀਆ ਗਲਾ ਕਥੀਆ ਨਾ ਜਾਿਹ ॥",
    "translation": "In that realm of humility, those stories are beyond words. They cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-348",
    "gurmukhi": "ਜੇ ਕ ੋਕਹ ੈਿਪਛੈ ਪਛੁਤਾਇ ॥",
    "translation": "Whoever tries to describe the realm of humility will regret the attempt.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-349",
    "gurmukhi": "ਿਤਥੈ ਘੜੀਐ ਸਰੁਿਤ ਮਿਤ ਮਿਨ ਬਿੁਧ ॥",
    "translation": "Intuitive awareness, understanding, thinking and the intellect are carved in the state of humility.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-350",
    "gurmukhi": "ਿਤਥੈ ਘੜੀਐ ਸਰੁਾ ਿਸਧਾ ਕੀ ਸਿੁਧ ॥੩੬॥",
    "translation": "The chisel of humility makes deities and those with spiritual powers wise.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-351",
    "gurmukhi": "ਕਰਮ ਖੰਡ ਕੀ ਬਾਣੀ ਜੋਰ ੁ॥",
    "translation": "The realm of grace gives you internal strength (to fight the vices).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-352",
    "gurmukhi": "ਿਤਥੈ ਹਰੋ ੁਨ ਕਈੋ ਹਰੋ ੁ॥",
    "translation": "In that realm of grace, nothing else dwells there but grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-353",
    "gurmukhi": "ਿਤਥੈ ਜੋਧ ਮਹਾਬਲ ਸਰੂ ॥",
    "translation": "In that realm of grace, spiritual warriors of great strength are made.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-354",
    "gurmukhi": "ਿਤਨ ਮਿਹ ਰਾਮ ੁਰਿਹਆ ਭਰਪਰੂ ॥",
    "translation": "With them is an overflowing of the One that is immersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-355",
    "gurmukhi": "ਿਤਥੈ ਸੀਤ ੋਸੀਤਾ ਮਿਹਮਾ ਮਾਿਹ ॥",
    "translation": "In the realm of grace, the praise of the One is sown within them.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-356",
    "gurmukhi": "ਤਾ ਕ ੇਰਪੂ ਨ ਕਥਨ�  ਜਾਿਹ ॥",
    "translation": "The beauty that grace gives them cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-357",
    "gurmukhi": "ਨਾ ਓਿਹ ਮਰਿਹ ਨ ਠਾਗੇ ਜਾਿਹ ॥",
    "translation": "In the realm of grace, they cannot die or be looted (by the vices).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-358",
    "gurmukhi": "ਿਜਨ ਕ ੈਰਾਮ ੁਵਸੈ ਮਨ ਮਾਿਹ ॥",
    "translation": "Within the minds of those abides the One that is emmersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-359",
    "gurmukhi": "ਿਤਥੈ ਭਗਤ ਵਸਿਹ ਕ ੇਲੋਅ ॥",
    "translation": "In the realm of grace, devotees dwell in many worlds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-360",
    "gurmukhi": "ਕਰਿਹ ਅਨੰ ਦ ੁਸਚਾ ਮਿਨ ਸੋਇ ॥",
    "translation": "Those in the realm of grace enjoy bliss and their minds are with the eternal One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-361",
    "gurmukhi": "ਸਚ ਖੰਿਡ ਵਸੈ ਿਨਰਕੰਾਰ ੁ॥",
    "translation": "In the realm of truth, the formless One abides.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-362",
    "gurmukhi": "ਕਿਰ ਕਿਰ ਵਖੇੈ ਨਦਿਰ ਿਨਹਾਲ ॥",
    "translation": "That which the One has created is observed by the One. The One's vision of divine law upon creation is filled with mercy. Those in the realm of truth who realise this vision are exalted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-363",
    "gurmukhi": "ਿਤਥੈ ਖੰਡ ਮੰਡਲ ਵਰਭਡੰ ॥",
    "translation": "Those in the realm of truth see that there are planets, solar systems and universes.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-364",
    "gurmukhi": "ਜੇ ਕ ੋਕਥੈ ਤ ਅੰਤ ਨ ਅੰਤ ॥",
    "translation": "If someone from that realm of truth were to describe the extent of divine law and the creation, that description has no limit.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-365",
    "gurmukhi": "ਿਤਥੈ ਲੋਅ ਲੋਅ ਆਕਾਰ ॥",
    "translation": "Those in the realm of truth see that there are worlds upon worlds in the One's creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-366",
    "gurmukhi": "ਿਜਵ ਿਜਵ ਹਕੁਮ ੁਿਤਵ ੈਿਤਵ ਕਾਰ ॥",
    "translation": "Those in the realm of truth see that everything in the creation is working according to the One's divine law.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-367",
    "gurmukhi": "ਵਖੇੈ ਿਵਗਸੈ ਕਿਰ ਵੀਚਾਰ ੁ॥",
    "translation": "The One is in a state of forever blossoming, observing the manifestation of the deep contemplation that created the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-368",
    "gurmukhi": "ਨਾਨਕ ਕਥਨਾ ਕਰੜਾ ਸਾਰ ੁ॥੩੭॥",
    "translation": "Nanak says that to explain the realm of truth is as hard as iron! (In taking the steps to self-realisation), if you were to have a workshop as a goldsmith, let self-control of the senses be that workshop and let patience be the",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-369",
    "gurmukhi": "ਜਤੁ ਪਾਹਾਰਾ ਧੀਰਜ ੁਸਿੁਨਆਰ ੁ॥",
    "translation": "goldsmith.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-370",
    "gurmukhi": "ਅਹਰਿਣ ਮਿਤ ਵਦੇ ੁਹਥੀਆਰ ੁ॥",
    "translation": "Let the divine hammer of spiritual knowledge hit the anvil of your understanding.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-371",
    "gurmukhi": "ਭਉ ਖਲਾ ਅਗਿਨ ਤਪ ਤਾਉ ॥",
    "translation": "Let the bellows be your loving fear (being conscious of the One watching you). Let the heat of the fire be your penance (selfless service).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-372",
    "gurmukhi": "ਭਾਂਡਾ ਭਾਉ ਅੰਿਮ�ਤੁ ਿਤਤੁ ਢਾਿਲ ॥",
    "translation": "If you were to make gold coins, make love the melting pot, that the molten gold of the One's immortal name goes in to. Being moulded by self-control of the senses, patience, humbling spiritual knowledge, loving fear, penance, love, and melting into the One's immortal name, you",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-373",
    "gurmukhi": "ਘੜੀਐ ਸਬਦ ੁਸਚੀ ਟਕਸਾਲ ॥",
    "translation": "realise the divine word (the essence). This is the true mint, where the coins of self-realised beings are made.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-374",
    "gurmukhi": "ਿਜਨ ਕਉ ਨਦਿਰ ਕਰਮ ੁਿਤਨ ਕਾਰ ॥",
    "translation": "This is the work of those who receive the glance of grace from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-375",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਨਦਿਰ ਿਨਹਾਲ ॥੩੮॥",
    "translation": "Nanak says, those who receive that glance of mercy are exalted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-376",
    "gurmukhi": "ਸਲੋਕੁ ॥",
    "translation": "A rhyming couplet:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-377",
    "gurmukhi": "ਪਵਣ ੁਗਰੁ ੂਪਾਣੀ ਿਪਤਾ ਮਾਤਾ ਧਰਿਤ ਮਹਤੁ ॥",
    "translation": "Air is the Guru, water is the father and soil is the great mother.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-378",
    "gurmukhi": "ਿਦਵਸ ੁਰਾਿਤ ਦਇੁ ਦਾਈ ਦਾਇਆ ਖੇਲੈ ਸਗਲ ਜਗਤੁ ॥",
    "translation": "The whole world plays in the lap of the babysitter called day and night.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-379",
    "gurmukhi": "ਚਿੰਗਆਈਆ ਬਿੁਰਆਈਆ ਵਾਚ ੈਧਰਮ ੁਹਦਿੂਰ ॥",
    "translation": "Good and bad actions are studied in the presence of the judge of righteousness.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-380",
    "gurmukhi": "ਕਰਮੀ ਆਪੋ ਆਪਣੀ ਕ ੇਨ� ੜ ੈਕ ੇਦਿੂਰ ॥",
    "translation": "According to your own actions, some are closer and some are further from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-381",
    "gurmukhi": "ਿਜਨੀ ਨਾਮ ੁਿਧਆਇਆ ਗਏ ਮਸਕਿਤ ਘਾਿਲ ॥",
    "translation": "Just like hard work pays off, those who leave the world with naam having paid off,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-382",
    "gurmukhi": "ਨਾਨਕ ਤ ੇਮਖੁ ਉਜਲੇ ਕਤੇੀ ਛੁਟੀ ਨਾਿਲ ॥੧॥",
    "translation": "Nanak says their faces are radiant and many are released (from the shackled of maya) along with them.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  }
];

  const [shabadLines, setShabadLines] = useState<ShabadLine[]>(defaultShabadLines);

  // Load translations from localStorage on mount
  useEffect(() => {
    const savedTranslations = localStorage.getItem('japji-translations');
    if (savedTranslations) {
      try {
        const parsed = JSON.parse(savedTranslations);
        setShabadLines(parsed);
      } catch (error) {
        console.error('Failed to load saved translations:', error);
      }
    }
  }, []);

  // Sync display state to localStorage for projector
  useEffect(() => {
    if (isDisplaying && shabadId) {
      const displayState = {
        mode: 'shabad',
        currentLineIndex: currentLineIndex,
        lines: shabadLines.map(line => ({
          id: line.id,
          text: cleanGurmukhi(line.gurmukhi),
          translation: line.translation,
        })),
      };
      localStorage.setItem('gurbani-display-state', JSON.stringify(displayState));
    } else {
      // Clear display state when not displaying
      localStorage.removeItem('gurbani-display-state');
    }
  }, [isDisplaying, currentLineIndex, shabadLines, shabadId]);

  const handleLineClick = (index: number) => {
    if (isEditMode) {
      // In edit mode, clicking a line enters edit state
      const line = shabadLines[index];
      setEditingLineId(line.id);
      setEditedTranslation(line.translation);
    }
    setCurrentLineIndex(index);
    onLineChange?.(index);
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      const newIndex = currentLineIndex - 1;
      setCurrentLineIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleNext = () => {
    if (currentLineIndex < shabadLines.length - 1) {
      const newIndex = currentLineIndex + 1;
      setCurrentLineIndex(newIndex);
      onLineChange?.(newIndex);
    }
  };

  const handleDisplayToggle = () => {
    const newState = !isDisplaying;
    setIsDisplaying(newState);
    onDisplayToggle?.(newState);
    
    if (newState) {
      // Open projector display in a new window
      const projectorWindow = window.open(
        '/projector-display',
        'GurbaniProjector',
        'width=1920,height=1080,left=0,top=0'
      );
      if (!projectorWindow) {
        alert('Popup blocked! Please enable popups for this site to open the projector display.');
      }
    }
  };

  const handleClearDisplay = () => {
    setIsDisplaying(false);
    onDisplayToggle?.(false);
  };

  const handleEditTranslation = (lineId: string, currentTranslation: string) => {
    setEditingLineId(lineId);
    setEditedTranslation(currentTranslation);
  };

  const handleSaveTranslation = () => {
    if (!editingLineId) return;

    const updatedLines = shabadLines.map((line) =>
      line.id === editingLineId
        ? { ...line, translation: editedTranslation }
        : line
    );

    setShabadLines(updatedLines);
    setEditingLineId(null);
    setEditedTranslation('');
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    setEditingLineId(null);
    setEditedTranslation('');
  };

  const handleSaveAllChanges = () => {
    localStorage.setItem('japji-translations', JSON.stringify(shabadLines));
    setHasUnsavedChanges(false);
    alert('Translations saved successfully!');
  };

  const handleExportTranslations = () => {
    const dataStr = JSON.stringify(shabadLines, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `japji-translations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        // Validate the imported data structure
        if (!Array.isArray(imported)) {
          alert('Invalid file format. Expected an array of translation objects.');
          return;
        }

        // Validate each line has required fields
        const isValid = imported.every(
          (line) =>
            line.id &&
            line.gurmukhi &&
            line.translation !== undefined
        );

        if (!isValid) {
          alert('Invalid file format. Each line must have id, gurmukhi, and translation fields.');
          return;
        }

        setShabadLines(imported);
        setHasUnsavedChanges(true);
        alert(`Successfully imported ${imported.length} translations!`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import translations. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input value to allow re-importing the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetTranslations = () => {
    if (confirm('Are you sure you want to reset all translations to default? This cannot be undone.')) {
      setShabadLines(defaultShabadLines);
      localStorage.removeItem('japji-translations');
      setHasUnsavedChanges(false);
      alert('Translations reset to default successfully!');
    }
  };

  if (!shabadId) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 bg-surface rounded-lg border border-border ${className}`}>
        <Icon name="BookOpenIcon" size={64} className="text-text-secondary mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Shabad Selected</h3>
        <p className="text-sm text-text-secondary text-center max-w-md">
          Search and select a shabad from the left panel to begin presentation management
        </p>
      </div>
    );
  }

  const previousLine = currentLineIndex > 0 ? shabadLines[currentLineIndex - 1] : null;
  const currentLine = shabadLines[currentLineIndex];
  const nextLine = currentLineIndex < shabadLines.length - 1 ? shabadLines[currentLineIndex + 1] : null;

  return (
    <div className={`flex flex-col h-full space-y-2 ${className}`}>
      {/* Translation Management Controls */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              transition-smooth font-medium text-sm
              active:scale-[0.98]
              ${
                isEditMode
                  ? 'bg-primary text-primary-foreground shadow-elevated'
                  : 'bg-muted text-text-secondary hover:text-foreground hover:bg-muted'
              }
            `}
          >
            <Icon name={isEditMode ? 'PencilSquareIcon' : 'PencilIcon'} size={20} />
            <span>{isEditMode ? 'Editing Mode' : 'Edit Translations'}</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAllChanges}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-smooth active:scale-[0.98] font-medium text-sm shadow-elevated"
            >
              <Icon name="CheckCircleIcon" size={20} />
              <span>Save Changes</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTranslations}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowUpTrayIcon" size={20} />
            <span>Import JSON</span>
          </button>
          <button
            onClick={handleExportTranslations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowDownTrayIcon" size={20} />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleResetTranslations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-destructive hover:text-destructive-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="ArrowPathIcon" size={20} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Display Controls */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDisplayToggle}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg
              transition-smooth font-medium text-sm
              active:scale-[0.98]
              ${
                isDisplaying
                  ? 'bg-success text-success-foreground shadow-elevated'
                  : 'bg-muted text-text-secondary hover:text-foreground hover:bg-primary hover:text-primary-foreground'
              }
            `}
          >
            <Icon name={isDisplaying ? 'EyeIcon' : 'EyeSlashIcon'} size={20} />
            <span>{isDisplaying ? 'Displaying' : 'Display Off'}</span>
          </button>
          <button
            onClick={handleClearDisplay}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-secondary hover:text-foreground hover:bg-destructive hover:text-destructive-foreground transition-smooth active:scale-[0.98] font-medium text-sm"
          >
            <Icon name="XCircleIcon" size={20} />
            <span>Clear Display</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-sm">
            Line {currentLineIndex + 1} of {shabadLines.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentLineIndex === 0}
              className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              aria-label="Previous line"
            >
              <Icon name="ChevronUpIcon" size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentLineIndex === shabadLines.length - 1}
              className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              aria-label="Next line"
            >
              <Icon name="ChevronDownIcon" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Context Preview */}
      <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-surface rounded-lg border border-border flex-shrink-0">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <Icon name="EyeIcon" size={16} />
          Display Preview
        </h3>
        
        {/* Previous Line */}
        {previousLine && (
          <div className="opacity-40 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1 font-gurmukhi">
              {cleanGurmukhi(previousLine.gurmukhi)}
            </p>
          </div>
        )}

        {/* Current Line */}
        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-lg transition-smooth">
          <p className="text-lg font-medium text-foreground mb-2 font-gurmukhi">
            {cleanGurmukhi(currentLine.gurmukhi)}
          </p>
          <p className="text-sm text-text-secondary">{currentLine.translation}</p>
          {currentLine.translationSource && (
            <p className="text-xs text-text-secondary mt-2 opacity-75">
              Translation: {currentLine.translationSource}
            </p>
          )}
        </div>

        {/* Next Line */}
        {nextLine && (
          <div className="opacity-60 transition-smooth">
            <p className="text-sm text-text-secondary line-clamp-1 font-gurmukhi">
              {cleanGurmukhi(nextLine.gurmukhi)}
            </p>
          </div>
        )}
      </div>

      {/* Complete Shabad Lines with Edit Capability */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-surface rounded-lg border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2 sticky top-0 bg-surface pb-3 z-10">
          <Icon name="ListBulletIcon" size={18} />
          All Lines {isEditMode && <span className="text-xs text-primary">(Click to edit)</span>}
        </h3>
        {shabadLines.map((line, index) => (
          <div
            key={line.id}
            className={`
              w-full p-4 rounded-lg transition-smooth
              ${
                index === currentLineIndex
                  ? 'bg-primary/10 border-2 border-primary' :'bg-background border border-border'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs opacity-60 mt-1 flex-shrink-0 w-6">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-base font-gurmukhi text-foreground leading-relaxed">
                  {cleanGurmukhi(line.gurmukhi)}
                </p>
                
                {editingLineId === line.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editedTranslation}
                      onChange={(e) => setEditedTranslation(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveTranslation}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-smooth text-xs font-medium"
                      >
                        <Icon name="CheckIcon" size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-text-secondary hover:bg-destructive hover:text-destructive-foreground transition-smooth text-xs font-medium"
                      >
                        <Icon name="XMarkIcon" size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-text-secondary flex-1 leading-relaxed">
                      {line.translation}
                    </p>
                    {isEditMode && (
                      <button
                        onClick={() => handleEditTranslation(line.id, line.translation)}
                        className="p-1 rounded hover:bg-primary hover:text-primary-foreground transition-smooth flex-shrink-0"
                        aria-label="Edit translation"
                      >
                        <Icon name="PencilIcon" size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="flex items-center justify-center gap-4 p-3 bg-muted/50 rounded-lg text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↑</kbd>
          Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">↓</kbd>
          Next
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-surface rounded border border-border">Space</kbd>
          Toggle Display
        </span>
      </div>
    </div>
  );
};

export default ShabadContentPanel;