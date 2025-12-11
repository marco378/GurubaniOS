'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShabadLine {
  id: string;
  code: string;
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
    "code": "0NVY",
    "gurmukhi": "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    "translation": "One Universal Creator, the Name of the One is the Truth, the Being that does everything, without fear, without hate, beyond time, beyond birth, self-existent, experienced and achieved by the Guru's grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-2",
    "code": "RBP6",
    "gurmukhi": "॥ ਜਪੁ ॥",
    "translation": "Chant and meditate.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-3",
    "code": "J92N",
    "gurmukhi": "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥",
    "translation": "The One existed in the beginning and at the beginning of the creation (ages).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-4",
    "code": "K0U6",
    "gurmukhi": "ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
    "translation": "The One exists now. Nanak says, the One will forever exist.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-5",
    "code": "BL70",
    "gurmukhi": "ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥",
    "translation": "By cleansing the body, the mind cannot be purified, even if you cleanse your body hundreds of thousands of times.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-6",
    "code": "GJW9",
    "gurmukhi": "ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ ॥",
    "translation": "By remaining silent, inner silence is not obtained, even by remaining absorbed deep within.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-7",
    "code": "ZERL",
    "gurmukhi": "ਭੁਖਿਆ ਭੁਖ ਨ ਉਤਰੀ ਜੇ ਬੰਨਾ ਪੁਰੀਆ ਭਾਰ ॥",
    "translation": "The hunger of the hungry is not appeased, even if we piled up the weight of goods accumulated from multiple worlds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-8",
    "code": "9MN2",
    "gurmukhi": "ਸਹਸ ਸਿਆਣਪਾ ਲਖ ਹੋਹਿ ਤ ਇਕ ਨ ਚਲੈ ਨਾਲਿ ॥",
    "translation": "If you have got hundreds of thousands of clever tricks, not even a single one of them will work.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-9",
    "code": "MK1Q",
    "gurmukhi": "ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ ॥",
    "translation": "How can we become the truth? How can the wall of illusion be broken?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-10",
    "code": "H0PC",
    "gurmukhi": "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥",
    "translation": "Walking in the will of the Creator, O Nanak, the will is inscribed within us.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-11",
    "code": "60LK",
    "gurmukhi": "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
    "translation": "By the One's divine will, the form (the creation) came into being. The divine will cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-12",
    "code": "UVSL",
    "gurmukhi": "ਹੁਕਮੀ ਹੋਵਨਿ ਜੀਅ ਹੁਕਮਿ ਮਿਲੈ ਵਡਿਆਈ ॥",
    "translation": "By the One's divine will, living beings come to exist. By the One's divine will, greatness is obtained.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-13",
    "code": "GLXS",
    "gurmukhi": "ਹੁਕਮੀ ਉਤਮੁ ਨੀਚੁ ਹੁਕਮਿ ਲਿਖਿ ਦੁਖ ਸੁਖ ਪਾਈਅਹਿ ॥",
    "translation": "By the One's divine will, some are high and some are low. By the One's divine written will, suffering and peace is received accordingly to our actions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-14",
    "code": "P2VG",
    "gurmukhi": "ਇਕਨਾ ਹੁਕਮੀ ਬਖਸੀਸ ਇਕਿ ਹੁਕਮੀ ਸਦਾ ਭਵਾਈਅਹਿ ॥",
    "translation": "Some, by the One's divine will, are blessed. Others continuously go around in circles (in the cycle of life and death).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-15",
    "code": "MX4P",
    "gurmukhi": "ਹੁਕਮੈ ਅੰਦਰਿ ਸਭੁ ਕੋ ਬਾਹਰਿ ਹੁਕਮ ਨ ਕੋਇ ॥",
    "translation": "Everyone is subject to the One's divine will. No one is outside of the divine will.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-16",
    "code": "FKUU",
    "gurmukhi": "ਨਾਨਕ ਹੁਕਮੈ ਜੇ ਬੁਝੈ ਤ ਹਉਮੈ ਕਹੈ ਨ ਕੋਇ ॥੨॥",
    "translation": "Nanak says, those who understand the divine will do not speak in ego.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-17",
    "code": "VUQD",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਤਾਣੁ ਹੋਵੈ ਕਿਸੈ ਤਾਣੁ ॥",
    "translation": "Some sing of the One's power, based on their realisation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-18",
    "code": "7AC7",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਦਾਤਿ ਜਾਣੈ ਨੀਸਾਣੁ ॥",
    "translation": "Some sing of the One's gifts and see these gifts as a sign of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-19",
    "code": "MB8C",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਗੁਣ ਵਡਿਆਈਆ ਚਾਰ ॥",
    "translation": "Some sing of the One's beautiful and great virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-20",
    "code": "C5NR",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਵਿਦਿਆ ਵਿਖਮੁ ਵੀਚਾਰੁ ॥",
    "translation": "Some sing of the One through the knowledge obtained from difficult philosophical studies.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-21",
    "code": "HZSG",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਸਾਜਿ ਕਰੇ ਤਨੁ ਖੇਹ ॥",
    "translation": "Some sing that the One fashions the body and then reduces it to dust.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-22",
    "code": "13CH",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਜੀਅ ਲੈ ਫਿਰਿ ਦੇਹ॥",
    "translation": "Some sing of the One who takes life away and then restores it.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-23",
    "code": "4SBX",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਜਾਪੈ ਦਿਸੈ ਦੂਰਿ ॥",
    "translation": "Some sing of the One, that they can seem to see at a distance.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-24",
    "code": "ELAE",
    "gurmukhi": "ਗਾਵੈ ਕੋ ਵੇਖੈ ਹਾਦਰਾ ਹਦੂਰਿ ॥",
    "translation": "Some sing of the One, who experience that One as being forever present.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-25",
    "code": "7922",
    "gurmukhi": "ਕਥਨਾ ਕਥੀ ਨ ਆਵੈ ਤੋਟਿ ॥",
    "translation": "There is no shortage of those who attempt to explain that One's power.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-26",
    "code": "Y9R8",
    "gurmukhi": "ਕਥਿ ਕਥਿ ਕਥੀ ਕੋਟੀ ਕੋਟਿ ਕੋਟਿ ॥",
    "translation": "Millions upon millions have made an attempt millions of times to explain that One's power.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-27",
    "code": "1UMU",
    "gurmukhi": "ਦੇਦਾ ਦੇ ਲੈਦੇ ਥਕਿ ਪਾਹਿ॥",
    "translation": "The Giver keeps on giving, while those who receive grow tired of receiving.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-28",
    "code": "32FN",
    "gurmukhi": "ਜੁਗਾ ਜੁਗੰਤਰਿ ਖਾਹੀ ਖਾਹਿ ॥",
    "translation": "Throughout the ages, consumers consume.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-29",
    "code": "Q13S",
    "gurmukhi": "ਹੁਕਮੀ ਹੁਕਮੁ ਚਲਾਏ ਰਾਹੁ ॥",
    "translation": "The Creator of divine will operates the way of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-30",
    "code": "6VSN",
    "gurmukhi": "ਨਾਨਕ ਵਿਗਸੈ ਵੇਪਰਵਾਹੁ ॥੩॥",
    "translation": "Nanak says that the One is forever blossoming and carefree.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-31",
    "code": "PU7L",
    "gurmukhi": "ਸਾਚਾ ਸਾਹਿਬੁ ਸਾਚੁ ਨਾਇ ਭਾਖਿਆ ਭਾਉ ਅਪਾਰੁ ॥",
    "translation": "The Master (the One) and the One's divine law is the only truth. The limitless One expresses that law through the language of love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-32",
    "code": "AY0H",
    "gurmukhi": "ਆਖਹਿ ਮੰਗਹਿ ਦੇਹਿ ਦੇਹਿ ਦਾਤਿ ਕਰੇ ਦਾਤਾਰੁ ॥",
    "translation": "As people ask and request, 'give to us, give to us', the One (the Giver) provides the gifts.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-33",
    "code": "NFYC",
    "gurmukhi": "ਫੇਰਿ ਕਿ ਅਗੈ ਰਖੀਐ ਜਿਤੁ ਦਿਸੈ ਦਰਬਾਰੁ ॥",
    "translation": "(If everything is given to us by the Giver), then what do we place before that One by which we can see (experience) Your court?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-34",
    "code": "XPT5",
    "gurmukhi": "ਮੁਹੌ ਕਿ ਬੋਲਣੁ ਬੋਲੀਐ ਜਿਤੁ ਸੁਣਿ ਧਰੇ ਪਿਆਰੁ ॥",
    "translation": "What words can we speak, where by the One listening to them, will be filled with love?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-35",
    "code": "Y0C8",
    "gurmukhi": "ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥",
    "translation": "During the ambrosial hours before dawn, meditate on the true One's name and deeply contemplate on the greatness of that One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-36",
    "code": "L7P6",
    "gurmukhi": "ਕਰਮੀ ਆਵੈ ਕਪੜਾ ਨਦਰੀ ਮੋਖੁ ਦੁਆਰੁ ॥",
    "translation": "Through the action (of meditating on the One's name), that individual with the grace of the One, receives the clothing of loving devotion, leading to the door of liberation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-37",
    "code": "HJP9",
    "gurmukhi": "ਨਾਨਕ ਏਵੈ ਜਾਣੀਐ ਸਭੁ ਆਪੇ ਸਚਿਆਰੁ ॥੪॥",
    "translation": "Nanak says that know this; the True One is everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-38",
    "code": "34GD",
    "gurmukhi": "ਥਾਪਿਆ ਨ ਜਾਇ ਕੀਤਾ ਨ ਹੋਇ ॥",
    "translation": "The One cannot be established and cannot be created.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-39",
    "code": "8KH1",
    "gurmukhi": "ਆਪੇ ਆਪਿ ਨਿਰੰਜਨੁ ਸੋਇ ॥",
    "translation": "The One is self-existent and is beyond the effect of Maya (illusion).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-40",
    "code": "TPDM",
    "gurmukhi": "ਜਿਨਿ ਸੇਵਿਆ ਤਿਨਿ ਪਾਇਆ ਮਾਨੁ ॥",
    "translation": "Those that serve the One, obtain honour.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-41",
    "code": "3K42",
    "gurmukhi": "ਨਾਨਕ ਗਾਵੀਐ ਗੁਣੀ ਨਿਧਾਨੁ ॥",
    "translation": "Nanak says sing of the One, the treasure of virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-42",
    "code": "H4D8",
    "gurmukhi": "ਗਾਵੀਐ ਸੁਣੀਐ ਮਨਿ ਰਖੀਐ ਭਾਉ ॥",
    "translation": "Sing, listen and fill your mind with love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-43",
    "code": "TE18",
    "gurmukhi": "ਦੁਖੁ ਪਰਹਰਿ ਸੁਖੁ ਘਰਿ ਲੈ ਜਾਇ ॥",
    "translation": "Your suffering will go and peace will come into the home of your heart.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-44",
    "code": "3PHR",
    "gurmukhi": "ਗੁਰਮੁਖਿ ਨਾਦੰ ਗੁਰਮੁਖਿ ਵੇਦੰ ਗੁਰਮੁਖਿ ਰਹਿਆ ਸਮਾਈ ॥",
    "translation": "Through the Guru, the sound current and divine wisdom is realised. Through the Guru, the One is realised to be emersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-45",
    "code": "5YV5",
    "gurmukhi": "ਗੁਰੁ ਈਸਰੁ ਗੁਰੁ ਗੋਰਖੁ ਬਰਮਾ ਗੁਰੁ ਪਾਰਬਤੀ ਮਾਈ ॥",
    "translation": "(When you take on the Guru), the Guru is Shiva, Vishnu, Brahma, Paarvati and Lakshmi.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-46",
    "code": "X1GF",
    "gurmukhi": "ਜੇ ਹਉ ਜਾਣਾ ਆਖਾ ਨਾਹੀ ਕਹਣਾ ਕਥਨੁ ਨ ਜਾਈ ॥",
    "translation": "If I come to know the One, I cannot explain what that One is (because that One can only be experienced). The One cannot be described in words.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-47",
    "code": "5KPL",
    "gurmukhi": "ਗੁਰਾ ਇਕ ਦੇਹਿ ਬੁਝਾਈ ॥",
    "translation": "The Guru has given me this one understanding:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-48",
    "code": "DJAR",
    "gurmukhi": "ਸਭਨਾ ਜੀਆ ਕਾ ਇਕੁ ਦਾਤਾ ਸੋ ਮੈ ਵਿਸਰਿ ਨ ਜਾਈ ॥੫॥",
    "translation": "there is only one Giver to all life. May I never forget the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-49",
    "code": "7NRN",
    "gurmukhi": "ਤੀਰਥਿ ਨਾਵਾ ਜੇ ਤਿਸੁ ਭਾਵਾ ਵਿਣੁ ਭਾਣੇ ਕਿ ਨਾਇ ਕਰੀ ॥",
    "translation": "I would go to pilgrimage to bathe if it were pleasing to the One. If it's not going to please the One, then what am I going to gain from ritual bathing?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-50",
    "code": "8HGP",
    "gurmukhi": "ਜੇਤੀ ਸਿਰਠਿ ਉਪਾਈ ਵੇਖਾ ਵਿਣੁ ਕਰਮਾ ਕਿ ਮਿਲੈ ਲਈ ॥",
    "translation": "As I see all created beings in the world, without the One's grace, what does anyone receive?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-51",
    "code": "J6KZ",
    "gurmukhi": "ਮਤਿ ਵਿਚਿ ਰਤਨ ਜਵਾਹਰ ਮਾਣਿਕ ਜੇ ਇਕ ਗੁਰ ਕੀ ਸਿਖ ਸੁਣੀ ॥",
    "translation": "The mind is filled with gems, jewels and rubies (divine virtues) if you listen to even one of the Guru's teachings.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-52",
    "code": "NVVQ",
    "gurmukhi": "ਗੁਰਾ ਇਕ ਦੇਹਿ ਬੁਝਾਈ ॥",
    "translation": "The Guru has given me this one understanding:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-53",
    "code": "AGUV",
    "gurmukhi": "ਸਭਨਾ ਜੀਆ ਕਾ ਇਕੁ ਦਾਤਾ ਸੋ ਮੈ ਵਿਸਰਿ ਨ ਜਾਈ ॥੬॥",
    "translation": "there is only one Giver to all life. May I never forget the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-54",
    "code": "MLKE",
    "gurmukhi": "ਜੇ ਜੁਗ ਚਾਰੇ ਆਰਜਾ ਹੋਰ ਦਸੂਣੀ ਹੋਇ ॥",
    "translation": "If one could live throughout the four ages, or even ten times more,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-55",
    "code": "C69U",
    "gurmukhi": "ਨਵਾ ਖੰਡਾ ਵਿਚਿ ਜਾਣੀਐ ਨਾਲਿ ਚਲੈ ਸਭੁ ਕੋਇ ॥",
    "translation": "if one was known throughout the nine continents and followed by all,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-56",
    "code": "CZ4N",
    "gurmukhi": "ਚੰਗਾ ਨਾਉ ਰਖਾਇ ਕੈ ਜਸੁ ਕੀਰਤਿ ਜਗਿ ਲੇਇ ॥",
    "translation": "with a good name and reputation, with praise and fame throughout the world;",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-57",
    "code": "EPP1",
    "gurmukhi": "ਜੇ ਤਿਸੁ ਨਦਰਿ ਨ ਆਵਈ ਤ ਵਾਤ ਨ ਪੁਛੈ ਕੇ ॥",
    "translation": "still, if the One does not bless you with the glance of grace, then it’s like nobody is asking about you.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-58",
    "code": "FTM0",
    "gurmukhi": "ਕੀਟਾ ਅੰਦਰਿ ਕੀਟੁ ਕਰਿ ਦੋਸੀ ਦੋਸੁ ਧਰੇ ॥",
    "translation": "One would be considered a worm amongst worms, and even by sinners, regarded a sinner.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-59",
    "code": "Q2DD",
    "gurmukhi": "ਨਾਨਕ ਨਿਰਗੁਣਿ ਗੁਣੁ ਕਰੇ ਗੁਣਵੰਤਿਆ ਗੁਣੁ ਦੇ ॥",
    "translation": "Nanak says that the One blesses the virtueless with virtues and gives virtues to the virtuous.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-60",
    "code": "SYSB",
    "gurmukhi": "ਤੇਹਾ ਕੋਇ ਨ ਸੁਝਈ ਜਿ ਤਿਸੁ ਗੁਣੁ ਕੋਇ ਕਰੇ ॥੭॥",
    "translation": "There is no one that can be found (other than the One) that can give virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
{
  "id": "line-61",
  "code": "ZYF3",
  "gurmukhi": "ਸੁਣਿਐ ਸਿਧ ਪੀਰ ਸੁਰਿ ਨਾਥ ॥",
  "translation": "Through listening to the One's name, ordinary people can obtain the status of those with spiritual powers (Sidh), spiritual leaders (Peer), deities (Sur) and great yogis (Naath).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-62",
  "code": "A7FY",
  "gurmukhi": "ਸੁਣਿਐ ਧਰਤਿ ਧਵਲ ਆਕਾਸ ॥",
  "translation": "Through listening to the One's name, one comes to the understanding that the earth and the sky are all supported by the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-63",
  "code": "QYGU",
  "gurmukhi": "ਸੁਣਿਐ ਦੀਪ ਲੋਅ ਪਾਤਾਲ ॥",
  "translation": "Through listening to the One's name, one obtains knowledge about the continents, worlds and nether regions.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-64",
  "code": "F28C",
  "gurmukhi": "ਸੁਣਿਐ ਪੋਹਿ ਨ ਸਕੈ ਕਾਲੁ ॥",
  "translation": "Through listening to the One's name, death cannot touch you.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-65",
  "code": "3477",
  "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਵਿਗਾਸੁ ॥",
  "translation": "Nanak says, the devotees always remain in bliss.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-66",
  "code": "FVWP",
  "gurmukhi": "ਸੁਣਿਐ ਦੂਖ ਪਾਪ ਕਾ ਨਾਸੁ ॥੮॥",
  "translation": "Through listening to the One's name, suffering and sin are destroyed.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-67",
  "code": "TENR",
  "gurmukhi": "ਸੁਣਿਐ ਈਸਰੁ ਬਰਮਾ ਇੰਦੁ ॥",
  "translation": "Through listening to the One's name, ordinary people can obtain the status of Shiva, Brahma and Indra.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-68",
  "code": "7M4S",
  "gurmukhi": "ਸੁਣਿਐ ਮੁਖਿ ਸਾਲਾਹਣ ਮੰਦੁ ॥",
  "translation": "Through listening to the One's name, people that were foul-mouthed now praise the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-69",
  "code": "UCWQ",
  "gurmukhi": "ਸੁਣਿਐ ਜੋਗ ਜੁਗਤਿ ਤਨਿ ਭੇਦ ॥",
  "translation": "Through listening to the One's name, the way of union and the secrets of the body are revealed.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-70",
  "code": "BXPY",
  "gurmukhi": "ਸੁਣਿਐ ਸਾਸਤ ਸਿਮ੍ਰਿਤਿ ਵੇਦ ॥",
  "translation": "Through listening to the One's name, you will understand the knowledge of the Shaastras, Simritees and the Vedas.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-71",
  "code": "GXL1",
  "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਵਿਗਾਸੁ ॥",
  "translation": "Nanak says, the devotees always remain in bliss.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-72",
  "code": "97SA",
  "gurmukhi": "ਸੁਣਿਐ ਦੂਖ ਪਾਪ ਕਾ ਨਾਸੁ ॥੯॥",
  "translation": "Through listening to the One's name, suffering and sin are destroyed.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-73",
  "code": "62ZU",
  "gurmukhi": "ਸੁਣਿਐ ਸਤੁ ਸੰਤੋਖੁ ਗਿਆਨੁ ॥",
  "translation": "Through listening to the One's name, one becomes truthful and obtains contentment and divine wisdom.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-74",
  "code": "RT8C",
  "gurmukhi": "ਸੁਣਿਐ ਅਠਸਠਿ ਕਾ ਇਸਨਾਨੁ ॥",
  "translation": "Through listening to the One's name, one is purified as if one has bathed at the sixty-eight places of pilgrimage.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-75",
  "code": "KDHE",
  "gurmukhi": "ਸੁਣਿਐ ਪੜਿ ਪੜਿ ਪਾਵਹਿ ਮਾਨੁ ॥",
  "translation": "Through listening to the One's name, one obtains honour as those who are very well read.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-76",
  "code": "7T0L",
  "gurmukhi": "ਸੁਣਿਐ ਲਾਗੈ ਸਹਜਿ ਧਿਆਨੁ ॥",
  "translation": "Through listening to the One's name, one's mind is effortlessly attuned to meditation.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-77",
  "code": "WXKL",
  "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਵਿਗਾਸੁ ॥",
  "translation": "Nanak says, the devotees always remain in bliss.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-78",
  "code": "EV0P",
  "gurmukhi": "ਸੁਣਿਐ ਦੂਖ ਪਾਪ ਕਾ ਨਾਸੁ ॥੧੦॥",
  "translation": "Through listening to the One's name, suffering and sin are destroyed.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-79",
  "code": "YAQ2",
  "gurmukhi": "ਸੁਣਿਐ ਸਰਾ ਗੁਣਾ ਕੇ ਗਾਹ ॥",
  "translation": "Through listening to the One's name, one obtains the deep ocean of divine virtues.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-80",
  "code": "HCMF",
  "gurmukhi": "ਸੁਣਿਐ ਸੇਖ ਪੀਰ ਪਾਤਿਸਾਹ ॥",
  "translation": "Through listening to the One's name, obtains the status of Sheikhs (Muslim leaders), Pirs (Muslim saints) and kings.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-81",
  "code": "PSFG",
  "gurmukhi": "ਸੁਣਿਐ ਅੰਧੇ ਪਾਵਹਿ ਰਾਹੁ ॥",
  "translation": "Through listening to the One's name, the blind (spiritually ignorant) obtain the path to the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-82",
  "code": "7J2W",
  "gurmukhi": "ਸੁਣਿਐ ਹਾਥ ਹੋਵੈ ਅਸਗਾਹੁ ॥",
  "translation": "Through listening to the One's name, conquering the depth of the ocean (the world) becomes within the grasp of your hand.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-83",
  "code": "PQ8D",
  "gurmukhi": "ਨਾਨਕ ਭਗਤਾ ਸਦਾ ਵਿਗਾਸੁ ॥",
  "translation": "Nanak says, the devotees always remain in bliss.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-84",
  "code": "VC8U",
  "gurmukhi": "ਸੁਣਿਐ ਦੂਖ ਪਾਪ ਕਾ ਨਾਸੁ ॥੧੧॥",
  "translation": "Through listening to the One's name, suffering and sin are destroyed.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-85",
  "code": "NM9A",
  "gurmukhi": "ਮੰਨੇ ਕੀ ਗਤਿ ਕਹੀ ਨ ਜਾਇ ॥",
  "translation": "The spiritual state of a devotee cannot be described.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-86",
  "code": "ZZT7",
  "gurmukhi": "ਜੇ ਕੋ ਕਹੈ ਪਿਛੈ ਪਛੁਤਾਇ ॥",
  "translation": "Whoever tries to describe it will regret the attempt.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-87",
  "code": "MER7",
  "gurmukhi": "ਕਾਗਦਿ ਕਲਮ ਨ ਲਿਖਣਹਾਰੁ ॥",
  "translation": "No paper or pen or scribe",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-88",
  "code": "R15V",
  "gurmukhi": "ਮੰਨੇ ਕਾ ਬਹਿ ਕਰਨਿ ਵੀਚਾਰੁ ॥",
  "translation": "can record the state of the devoted.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-89",
  "code": "NS3T",
  "gurmukhi": "ਐਸਾ ਨਾਮੁ ਨਿਰੰਜਨੁ ਹੋਇ ॥",
  "translation": "Such is the name of the immaculate One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-90",
  "code": "B5CT",
  "gurmukhi": "ਜੇ ਕੋ ਮੰਨਿ ਜਾਣੈ ਮਨਿ ਕੋਇ ॥੧੨॥",
  "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-91",
  "code": "2GA0",
  "gurmukhi": "ਮੰਨੈ ਸੁਰਤਿ ਹੋਵੈ ਮਨਿ ਬੁਧਿ ॥",
  "translation": "Through devotion, one obtains intuitive awareness of their mind and intellect.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-92",
  "code": "V1LA",
  "gurmukhi": "ਮੰਨੈ ਸਗਲ ਭਵਣ ਕੀ ਸੁਧਿ ॥",
  "translation": "Through devotion, one know about all worlds and realms.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-93",
  "code": "B3JS",
  "gurmukhi": "ਮੰਨੈ ਮੁਹਿ ਚੋਟਾ ਨਾ ਖਾਇ ॥",
  "translation": "Through devotion, one won't endure the suffering of the five vices.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-94",
  "code": "VQ72",
  "gurmukhi": "ਮੰਨੈ ਜਮ ਕੈ ਸਾਥਿ ਨ ਜਾਇ ॥",
  "translation": "Through devotion, one does not go with the messenger of death.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-95",
  "code": "RZQP",
  "gurmukhi": "ਐਸਾ ਨਾਮੁ ਨਿਰੰਜਨੁ ਹੋਇ ॥",
  "translation": "Such is the name of the immaculate One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-96",
  "code": "92E4",
  "gurmukhi": "ਜੇ ਕੋ ਮੰਨਿ ਜਾਣੈ ਮਨਿ ਕੋਇ ॥੧੩॥",
  "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-97",
  "code": "8NGG",
  "gurmukhi": "ਮੰਨੈ ਮਾਰਗਿ ਠਾਕ ਨ ਪਾਇ ॥",
  "translation": "Through devotion, one won't be stopped by the five vices on their spiritual path.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-98",
  "code": "3A8V",
  "gurmukhi": "ਮੰਨੈ ਪਤਿ ਸਿਉ ਪਰਗਟੁ ਜਾਇ ॥",
  "translation": "Through devotion, one will be known and will leave with honour.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-99",
  "code": "R9RA",
  "gurmukhi": "ਮੰਨੈ ਮਗੁ ਨ ਚਲੈ ਪੰਥੁ ॥",
  "translation": "Through devotion, one won't walk on the path of empty religious rituals.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-100",
  "code": "6VHT",
  "gurmukhi": "ਮੰਨੈ ਧਰਮ ਸੇਤੀ ਸਨਬੰਧੁ ॥",
  "translation": "Through devotion, one is connected to righteousness.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-101",
  "code": "314W",
  "gurmukhi": "ਐਸਾ ਨਾਮੁ ਨਿਰੰਜਨੁ ਹੋਇ ॥",
  "translation": "Such is the name of the immaculate One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-102",
  "code": "NLHT",
  "gurmukhi": "ਜੇ ਕੋ ਮੰਨਿ ਜਾਣੈ ਮਨਿ ਕੋਇ ॥੧੪॥",
  "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-103",
  "code": "EEV2",
  "gurmukhi": "ਮੰਨੈ ਪਾਵਹਿ ਮੋਖੁ ਦੁਆਰੁ ॥",
  "translation": "Through devotion, one finds the door of liberation.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-104",
  "code": "XDGX",
  "gurmukhi": "ਮੰਨੈ ਪਰਵਾਰੈ ਸਾਧਾਰੁ ॥",
  "translation": "Through devotion, one purifies their family.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-105",
  "code": "EMX5",
  "gurmukhi": "ਮੰਨੈ ਤਰੈ ਤਾਰੇ ਗੁਰੁ ਸਿਖ ॥",
  "translation": "Through devotion, one is saved, and they help save others by making them Sikhs of the Guru.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-106",
  "code": "PD82",
  "gurmukhi": "ਮੰਨੈ ਨਾਨਕ ਭਵਹਿ ਨ ਭਿਖ ॥",
  "translation": "Nanak says, through devotion, one does not wander around begging.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-107",
  "code": "V24N",
  "gurmukhi": "ਐਸਾ ਨਾਮੁ ਨਿਰੰਜਨੁ ਹੋਇ ॥",
  "translation": "Such is the name of the immaculate One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-108",
  "code": "Y8UM",
  "gurmukhi": "ਜੇ ਕੋ ਮੰਨਿ ਜਾਣੈ ਮਨਿ ਕੋਇ ॥੧੫॥",
  "translation": "Only those with devotion will know in their minds just how immaculate the One's name is.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-109",
  "code": "K3GP",
  "gurmukhi": "ਪੰਚ ਪਰਵਾਣ ਪੰਚ ਪਰਧਾਨੁ ॥",
  "translation": "The virtuous are accepted by the One and are spiritual leaders.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-110",
  "code": "4XG0",
  "gurmukhi": "ਪੰਚੇ ਪਾਵਹਿ ਦਰਗਹਿ ਮਾਨੁ ॥",
  "translation": "The virtuous are honoured in the court of the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-111",
  "code": "SYQV",
  "gurmukhi": "ਪੰਚੇ ਸੋਹਹਿ ਦਰਿ ਰਾਜਾਨੁ ॥",
  "translation": "The virtuous are beautiful in the court of the King (the One).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-112",
  "code": "WBA3",
  "gurmukhi": "ਪੰਚਾ ਕਾ ਗੁਰੁ ਏਕੁ ਧਿਆਨੁ ॥",
  "translation": "The virtuous single-mindedly focus on the eternal Guru.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-113",
  "code": "VPS6",
  "gurmukhi": "ਜੇ ਕੋ ਕਹੈ ਕਰੈ ਵੀਚਾਰੁ ॥",
  "translation": "No matter how much anyone tries to explain and reflect the doings of the One,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-114",
  "code": "ZP00",
  "gurmukhi": "ਕਰਤੇ ਕੈ ਕਰਣੈ ਨਾਹੀ ਸੁਮਾਰੁ ॥",
  "translation": "the doings of the Creator cannot be counted.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-115",
  "code": "JUGS",
  "gurmukhi": "ਧੌਲੁ ਧਰਮੁ ਦਇਆ ਕਾ ਪੂਤੁ ॥",
  "translation": "Whilst some people believe that a bull is literally supporting the earth, it actually is dharam (divine law), based on compassion.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-116",
  "code": "BRQJ",
  "gurmukhi": "ਸੰਤੋਖੁ ਥਾਪਿ ਰਖਿਆ ਜਿਨਿ ਸੂਤਿ ॥",
  "translation": "The laws of the creation patiently keep everything strung together.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-117",
  "code": "M2D6",
  "gurmukhi": "ਜੇ ਕੋ ਬੁਝੈ ਹੋਵੈ ਸਚਿਆਰੁ ॥",
  "translation": "That one who understands this becomes the embodiment of truth.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-118",
  "code": "TH49",
  "gurmukhi": "ਧਵਲੈ ਉਪਰਿ ਕੇਤਾ ਭਾਰੁ ॥",
  "translation": "(If someone were to believe the mythical story that a bull supports the earth, the Guru asks), 'how much of a great load is there on the bull?'",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-119",
  "code": "F3DS",
  "gurmukhi": "ਧਰਤੀ ਹੋਰੁ ਪਰੈ ਹੋਰੁ ਹੋਰੁ ॥",
  "translation": "There are many worlds beyond this world.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-120",
  "code": "DLGR",
  "gurmukhi": "ਤਿਸ ਤੇ ਭਾਰੁ ਤਲੈ ਕਵਣੁ ਜੋਰੁ ॥",
  "translation": "What power holds those worlds and supports their weight?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-121",
  "code": "TU5M",
  "gurmukhi": "ਜੀਅ ਜਾਤਿ ਰੰਗਾ ਕੇ ਨਾਵ ॥",
  "translation": "All the different types of creatures and all their colours",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-122",
  "code": "45QD",
  "gurmukhi": "ਸਭਨਾ ਲਿਖਿਆ ਵੁੜੀ ਕਲਾਮ ॥",
  "translation": "are all inscribed by the ever-flowing pen of the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-123",
  "code": "U280",
  "gurmukhi": "ਏਹੁ ਲੇਖਾ ਲਿਖਿ ਜਾਣੈ ਕੋਇ ॥",
  "translation": "Who knows how to write this account?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-124",
  "code": "3EN4",
  "gurmukhi": "ਲੇਖਾ ਲਿਖਿਆ ਕੇਤਾ ਹੋਇ ॥",
  "translation": "What would that written account even be like?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-125",
  "code": "KC1Y",
  "gurmukhi": "ਕੇਤਾ ਤਾਣੁ ਸੁਆਲਿਹੁ ਰੂਪੁ ॥",
  "translation": "How much power and beauty has the form of that One got?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-126",
  "code": "RQ99",
  "gurmukhi": "ਕੇਤੀ ਦਾਤਿ ਜਾਣੈ ਕੌਣੁ ਕੂਤੁ ॥",
  "translation": "How can someone measure the extent of that One's gifts?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-127",
  "code": "ADTJ",
  "gurmukhi": "ਕੀਤਾ ਪਸਾਉ ਏਕੋ ਕਵਾਉ ॥",
  "translation": "The One created the expanse of the creation with one word.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-128",
  "code": "YG5R",
  "gurmukhi": "ਤਿਸ ਤੇ ਹੋਏ ਲਖ ਦਰੀਆਉ ॥",
  "translation": "Hundreds of thousands of rivers (worlds) began to flow.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-129",
  "code": "WUJB",
  "gurmukhi": "ਕੁਦਰਤਿ ਕਵਣ ਕਹਾ ਵੀਚਾਰੁ ॥",
  "translation": "How can the One's creative power be described?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-130",
  "code": "MF67",
  "gurmukhi": "ਵਾਰਿਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
  "translation": "I cannot even once be a sacrifice to the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-131",
  "code": "Y8MW",
  "gurmukhi": "ਜੋ ਤੁਧੁ ਭਾਵੈ ਸਾਈ ਭਲੀ ਕਾਰ ॥",
  "translation": "Whatever Your divine will is; that doing is perfect.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-132",
  "code": "33K1",
  "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਤਿ ਨਿਰੰਕਾਰ ॥੧੬॥",
  "translation": "You are always stable, O formless One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-133",
  "code": "5Z42",
  "gurmukhi": "ਅਸੰਖ ਜਪ ਅਸੰਖ ਭਾਉ ॥",
  "translation": "Countless people meditate and express love for the One in their own way.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-134",
  "code": "203N",
  "gurmukhi": "ਅਸੰਖ ਪੂਜਾ ਅਸੰਖ ਤਪ ਤਾਉ ॥",
  "translation": "Countless people worship the One and carry out strict practises.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-135",
  "code": "G4FX",
  "gurmukhi": "ਅਸੰਖ ਗਰੰਥ ਮੁਖਿ ਵੇਦ ਪਾਠ ॥",
  "translation": "Countless people recite scriptures and the Vedas.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-136",
  "code": "011M",
  "gurmukhi": "ਅਸੰਖ ਜੋਗ ਮਨਿ ਰਹਹਿ ਉਦਾਸ ॥",
  "translation": "Countless yogis minds remain detached from the world.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-137",
  "code": "GRXU",
  "gurmukhi": "ਅਸੰਖ ਭਗਤ ਗੁਣ ਗਿਆਨ ਵੀਚਾਰ ॥",
  "translation": "Countless devotees contemplate the wisdom and the qualities of the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-138",
  "code": "KRAN",
  "gurmukhi": "ਅਸੰਖ ਸਤੀ ਅਸੰਖ ਦਾਤਾਰ ॥",
  "translation": "Countless people live in contentment and are generous.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-139",
  "code": "1F9S",
  "gurmukhi": "ਅਸੰਖ ਸੂਰ ਮੁਹ ਭਖ ਸਾਰ ॥",
  "translation": "Countless warriors take the brunt in battle (who eat iron with their mouths).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-140",
  "code": "LF7G",
  "gurmukhi": "ਅਸੰਖ ਮੋਨਿ ਲਿਵ ਲਾਇ ਤਾਰ ॥",
  "translation": "Countless silent sages remain absorbed deep within.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-141",
  "code": "3NQR",
  "gurmukhi": "ਕੁਦਰਤਿ ਕਵਣ ਕਹਾ ਵੀਚਾਰੁ ॥",
  "translation": "How can the One's creative power be described?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-142",
  "code": "44CB",
  "gurmukhi": "ਵਾਰਿਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
  "translation": "I cannot even once be a sacrifice to the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-143",
  "code": "86A1",
  "gurmukhi": "ਜੋ ਤੁਧੁ ਭਾਵੈ ਸਾਈ ਭਲੀ ਕਾਰ ॥",
  "translation": "Whatever Your divine will is; that doing is perfect.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-144",
  "code": "9Y0C",
  "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਤਿ ਨਿਰੰਕਾਰ ॥੧੭॥",
  "translation": "You are always stable, O formless One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-145",
  "code": "77V0",
  "gurmukhi": "ਅਸੰਖ ਮੂਰਖ ਅੰਧ ਘੋਰ ॥",
  "translation": "Countless people are fools, utterly blind in ignorance.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-146",
  "code": "BXZ6",
  "gurmukhi": "ਅਸੰਖ ਚੋਰ ਹਰਾਮਖੋਰ ॥",
  "translation": "Countless people are thieves and corrupt.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-147",
  "code": "SHAV",
  "gurmukhi": "ਅਸੰਖ ਅਮਰ ਕਰਿ ਜਾਹਿ ਜੋਰ ॥",
  "translation": "Countless people impose their will by force.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-148",
  "code": "DUUN",
  "gurmukhi": "ਅਸੰਖ ਗਲਵਢ ਹਤਿਆ ਕਮਾਹਿ ॥",
  "translation": "Countless people are ruthless killers.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-149",
  "code": "WESS",
  "gurmukhi": "ਅਸੰਖ ਪਾਪੀ ਪਾਪੁ ਕਰਿ ਜਾਹਿ ॥",
  "translation": "Countless people are sinners who keep on sinning.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-150",
  "code": "EKX0",
  "gurmukhi": "ਅਸੰਖ ਕੂੜਿਆਰ ਕੂੜੇ ਫਿਰਾਹਿ ॥",
  "translation": "Countless people are liars, going around and around, lost in their lies.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-151",
  "code": "0HA1",
  "gurmukhi": "ਅਸੰਖ ਮਲੇਛ ਮਲੁ ਭਖਿ ਖਾਹਿ ॥",
  "translation": "Countless people are low-minded who consume filthy language.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-152",
  "code": "XZLU",
  "gurmukhi": "ਅਸੰਖ ਨਿੰਦਕ ਸਿਰਿ ਕਰਹਿ ਭਾਰੁ ॥",
  "translation": "Countless people are slanderers who carry the weight of slandering on their heads.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-153",
  "code": "RT3D",
  "gurmukhi": "ਨਾਨਕੁ ਨੀਚੁ ਕਹੈ ਵੀਚਾਰੁ ॥",
  "translation": "Nanak in humility offers this understanding.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-154",
  "code": "3N2N",
  "gurmukhi": "ਵਾਰਿਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
  "translation": "I cannot even once be a sacrifice to the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-155",
  "code": "QWLN",
  "gurmukhi": "ਜੋ ਤੁਧੁ ਭਾਵੈ ਸਾਈ ਭਲੀ ਕਾਰ ॥",
  "translation": "Whatever Your divine will is; that doing is perfect.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-156",
  "code": "C9VV",
  "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਤਿ ਨਿਰੰਕਾਰ ॥੧੮॥",
  "translation": "You are always stable, O formless One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-157",
  "code": "VWZQ",
  "gurmukhi": "ਅਸੰਖ ਨਾਵ ਅਸੰਖ ਥਾਵ ॥",
  "translation": "There are countless names and countless places.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-158",
  "code": "2YCD",
  "gurmukhi": "ਅਗੰਮ ਅਗੰਮ ਅਸੰਖ ਲੋਅ ॥",
  "translation": "There are countless inaccessible realms.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-159",
  "code": "878C",
  "gurmukhi": "ਅਸੰਖ ਕਹਹਿ ਸਿਰਿ ਭਾਰੁ ਹੋਇ ॥",
  "translation": "Countless people attempting to describe the creation in its entirety put a burden on their mind.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-160",
  "code": "CYS8",
  "gurmukhi": "ਅਖਰੀ ਨਾਮੁ ਅਖਰੀ ਸਾਲਾਹ ॥",
  "translation": "Through the divine word, the name of the One is realised and is praised.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-161",
  "code": "ZZGR",
  "gurmukhi": "ਅਖਰੀ ਗਿਆਨੁ ਗੀਤ ਗੁਣ ਗਾਹ ॥",
  "translation": "Through the divine word, spiritual wisdom is attained and the One's praises are sung.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-162",
  "code": "UYP2",
  "gurmukhi": "ਅਖਰੀ ਲਿਖਣੁ ਬੋਲਣੁ ਬਾਣਿ ॥",
  "translation": "Through the divine word, one can write, speak and use language.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-163",
  "code": "7C0T",
  "gurmukhi": "ਅਖਰਾ ਸਿਰਿ ਸੰਜੋਗੁ ਵਖਾਣਿ ॥",
  "translation": "According to the divine word, the account of our actions is with us.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-164",
  "code": "4R85",
  "gurmukhi": "ਜਿਨਿ ਏਹਿ ਲਿਖੇ ਤਿਸੁ ਸਿਰਿ ਨਾਹਿ ॥",
  "translation": "The One that writes this divine law is not subject to it.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-165",
  "code": "PJLP",
  "gurmukhi": "ਜਿਵ ਫੁਰਮਾਏ ਤਿਵ ਤਿਵ ਪਾਹਿ ॥",
  "translation": "As the One commands, so do we receive.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-166",
  "code": "15VH",
  "gurmukhi": "ਜੇਤਾ ਕੀਤਾ ਤੇਤਾ ਨਾਉ ॥",
  "translation": "Whatever has been created has Your name on it.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-167",
  "code": "9D4Y",
  "gurmukhi": "ਵਿਣੁ ਨਾਵੈ ਨਾਹੀ ਕੋ ਥਾਉ ॥",
  "translation": "Without Your Name, there is no place at all.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-168",
  "code": "043J",
  "gurmukhi": "ਕੁਦਰਤਿ ਕਵਣ ਕਹਾ ਵੀਚਾਰੁ ॥",
  "translation": "How can the One's creative power be described?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-169",
  "code": "8F4V",
  "gurmukhi": "ਵਾਰਿਆ ਨ ਜਾਵਾ ਏਕ ਵਾਰ ॥",
  "translation": "I cannot even once be a sacrifice to the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-170",
  "code": "BTSX",
  "gurmukhi": "ਜੋ ਤੁਧੁ ਭਾਵੈ ਸਾਈ ਭਲੀ ਕਾਰ ॥",
  "translation": "Whatever Your divine will is; that doing is perfect.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-171",
  "code": "15AZ",
  "gurmukhi": "ਤੂ ਸਦਾ ਸਲਾਮਤਿ ਨਿਰੰਕਾਰ ॥੧੯॥",
  "translation": "You are always stable, O formless One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-172",
  "code": "6FSH",
  "gurmukhi": "ਭਰੀਐ ਹਥੁ ਪੈਰੁ ਤਨੁ ਦੇਹ ॥",
  "translation": "When the hands, feet and the body are dirty,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-173",
  "code": "22V7",
  "gurmukhi": "ਪਾਣੀ ਧੋਤੈ ਉਤਰਸੁ ਖੇਹ ॥",
  "translation": "water can wash away the dirt.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-174",
  "code": "LD59",
  "gurmukhi": "ਮੂਤ ਪਲੀਤੀ ਕਪੜੁ ਹੋਇ ॥",
  "translation": "When clothes are ruined by urine,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-175",
  "code": "AXQC",
  "gurmukhi": "ਦੇ ਸਾਬੂਣੁ ਲਈਐ ਓਹੁ ਧੋਇ ॥",
  "translation": "soap can wash them clean.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-176",
  "code": "3R6D",
  "gurmukhi": "ਭਰੀਐ ਮਤਿ ਪਾਪਾ ਕੈ ਸੰਗਿ ॥",
  "translation": "When the mind is filled with sins,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-177",
  "code": "H2Z4",
  "gurmukhi": "ਓਹੁ ਧੋਪੈ ਨਾਵੈ ਕੈ ਰੰਗਿ ॥",
  "translation": "those sins are washed with the colour of the One's name.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-178",
  "code": "5AWU",
  "gurmukhi": "ਪੁੰਨੀ ਪਾਪੀ ਆਖਣੁ ਨਾਹਿ ॥",
  "translation": "The impact of being virtuous or a sinner is no small thing.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-179",
  "code": "1U42",
  "gurmukhi": "ਕਰਿ ਕਰਿ ਕਰਣਾ ਲਿਖਿ ਲੈ ਜਾਹੁ ॥",
  "translation": "Repeating the same actions again and again, they become engraved on the mind and take control of your life.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-180",
  "code": "VCR2",
  "gurmukhi": "ਆਪੇ ਬੀਜਿ ਆਪੇ ਹੀ ਖਾਹੁ ॥",
  "translation": "You reap what you sow.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-181",
  "code": "JQ73",
  "gurmukhi": "ਨਾਨਕ ਹੁਕਮੀ ਆਵਹੁ ਜਾਹੁ ॥੨੦॥",
  "translation": "Nanak says, by the One's divine will, you come and go in reincarnation.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-182",
  "code": "9RPP",
  "gurmukhi": "ਤੀਰਥੁ ਤਪੁ ਦਇਆ ਦਤੁ ਦਾਨੁ ॥",
  "translation": "Pilgrimages, spiritual penance and compassionately giving gifts,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-183",
  "code": "79QT",
  "gurmukhi": "ਜੇ ਕੋ ਪਾਵੈ ਤਿਲ ਕਾ ਮਾਨੁ ॥",
  "translation": "even if someone were to receive something in return, it would only amount to a minuscule blessing.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-184",
  "code": "ND4F",
  "gurmukhi": "ਸੁਣਿਆ ਮੰਨਿਆ ਮਨਿ ਕੀਤਾ ਭਾਉ ॥",
  "translation": "Those who listen with devotion are filled with love in their mind,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-185",
  "code": "W7L9",
  "gurmukhi": "ਅੰਤਰਗਤਿ ਤੀਰਥਿ ਮਲਿ ਨਾਉ ॥",
  "translation": "thoroughly cleanse themselves in their internal pilgrimage.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-186",
  "code": "6MYT",
  "gurmukhi": "ਸਭਿ ਗੁਣ ਤੇਰੇ ਮੈ ਨਾਹੀ ਕੋਇ ॥",
  "translation": "All qualities belong to you. I have none at all.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-187",
  "code": "BCM6",
  "gurmukhi": "ਵਿਣੁ ਗੁਣ ਕੀਤੇ ਭਗਤਿ ਨ ਹੋਇ ॥",
  "translation": "Without you giving me qualities, there is no devotion.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-188",
  "code": "E30D",
  "gurmukhi": "ਸੁਅਸਤਿ ਆਥਿ ਬਾਣੀ ਬਰਮਾਉ ॥",
  "translation": "I bow to the One that created the creation with the primal sound.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-189",
  "code": "4SDK",
  "gurmukhi": "ਸਤਿ ਸੁਹਾਣੁ ਸਦਾ ਮਨਿ ਚਾਉ ॥",
  "translation": "The One is the beautiful truth and exists in a constant state of joy.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-190",
  "code": "V7HC",
  "gurmukhi": "ਕਵਣੁ ਸੁ ਵੇਲਾ ਵਖਤੁ ਕਵਣੁ ਕਵਣ ਥਿਤਿ ਕਵਣੁ ਵਾਰੁ ॥",
  "translation": "What was that time and what was that moment? What was that lunar day and what was solar day?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-191",
  "code": "G0TE",
  "gurmukhi": "ਕਵਣਿ ਸਿ ਰੁਤੀ ਮਾਹੁ ਕਵਣੁ ਜਿਤੁ ਹੋਆ ਆਕਾਰੁ ॥",
  "translation": "What was that season and what was that month when the creation came into being?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-192",
  "code": "WN0J",
  "gurmukhi": "ਵੇਲ ਨ ਪਾਈਆ ਪੰਡਤੀ ਜਿ ਹੋਵੈ ਲੇਖੁ ਪੁਰਾਣੁ ॥",
  "translation": "The religious scholars weren't able to find the time (when the creation came into being). If they knew, they would have dedicated a Purana to it.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-193",
  "code": "MP96",
  "gurmukhi": "ਵਖਤੁ ਨ ਪਾਇਓ ਕਾਦੀਆ ਜਿ ਲਿਖਨਿ ਲੇਖੁ ਕੁਰਾਣੁ ॥",
  "translation": "The Qazis (Islamic judges) weren't able to find that moment (when the creation came into being). If they had written it, it would have been included in the Quran.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-194",
  "code": "S0KM",
  "gurmukhi": "ਥਿਤਿ ਵਾਰੁ ਨਾ ਜੋਗੀ ਜਾਣੈ ਰੁਤਿ ਮਾਹੁ ਨਾ ਕੋਈ ॥",
  "translation": "The Yogis don't know the lunar day (when the creation came into being). No one knows what the season or month was.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-195",
  "code": "YXDC",
  "gurmukhi": "ਜਾ ਕਰਤਾ ਸਿਰਠੀ ਕਉ ਸਾਜੇ ਆਪੇ ਜਾਣੈ ਸੋਈ ॥",
  "translation": "When the Creator created the creation, only that One knows (when the creation came into being).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-196",
  "code": "XEQL",
  "gurmukhi": "ਕਿਵ ਕਰਿ ਆਖਾ ਕਿਵ ਸਾਲਾਹੀ ਕਿਉ ਵਰਨੀ ਕਿਵ ਜਾਣਾ ॥",
  "translation": "How can I speak of, praise, describe and know the One?",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-197",
  "code": "RW45",
  "gurmukhi": "ਨਾਨਕ ਆਖਣਿ ਸਭੁ ਕੋ ਆਖੈ ਇਕ ਦੂ ਇਕੁ ਸਿਆਣਾ ॥",
  "translation": "Nanak says everyone attempting to describe the One claims to be wiser than the rest.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-198",
  "code": "FN4U",
  "gurmukhi": "ਵਡਾ ਸਾਹਿਬੁ ਵਡੀ ਨਾਈ ਕੀਤਾ ਜਾ ਕਾ ਹੋਵੈ ॥",
  "translation": "The One Master and the One's Name is Great. Whatever happens is according to the One's divine will.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-199",
  "code": "SM79",
  "gurmukhi": "ਨਾਨਕ ਜੇ ਕੋ ਆਪੌ ਜਾਣੈ ਅਗੈ ਗਇਆ ਨ ਸੋਹੈ ॥੨੧॥",
  "translation": "Nanak says, if somebody according to their own intellect attempts to describe the extent of the One, they won't be honoured when they go (from this world).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-200",
  "code": "YB5R",
  "gurmukhi": "ਪਾਤਾਲਾ ਪਾਤਾਲ ਲਖ ਆਗਾਸਾ ਆਗਾਸ ॥",
  "translation": "There are hundreds of thousands of worlds below and above (subtle and physical).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-201",
  "code": "CWGK",
  "gurmukhi": "ਓੜਕ ਓੜਕ ਭਾਲਿ ਥਕੇ ਵੇਦ ਕਹਨਿ ਇਕ ਵਾਤ ॥",
  "translation": "The Vedas say coherently that those that search to find the end of them will tire.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-202",
  "code": "2B00",
  "gurmukhi": "ਸਹਸ ਅਠਾਰਹ ਕਹਨਿ ਕਤੇਬਾ ਅਸੁਲੂ ਇਕੁ ਧਾਤੁ ॥",
  "translation": "Various scriptures say that there are 18,000 worlds, but at the root of all these worlds, there's One creator.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-203",
  "code": "1H1W",
  "gurmukhi": "ਲੇਖਾ ਹੋਇ ਤ ਲਿਖੀਐ ਲੇਖੈ ਹੋਇ ਵਿਣਾਸੁ ॥",
  "translation": "If one could write an account of the entire creation, they would (but they can't), as the means of measuring the creation will come to an end.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-204",
  "code": "WR3V",
  "gurmukhi": "ਨਾਨਕ ਵਡਾ ਆਖੀਐ ਆਪੇ ਜਾਣੈ ਆਪੁ ॥੨੨॥",
  "translation": "Nanak says, call the One great! Only the One knows the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-205",
  "code": "YTFR",
  "gurmukhi": "ਸਾਲਾਹੀ ਸਾਲਾਹਿ ਏਤੀ ਸੁਰਤਿ ਨ ਪਾਈਆ ॥",
  "translation": "The devotees praise the One yet will not attain a complete understanding of the One's limits (as the One is limitless).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-206",
  "code": "5WQP",
  "gurmukhi": "ਨਦੀਆ ਅਤੈ ਵਾਹ ਪਵਹਿ ਸਮੁੰਦਿ ਨ ਜਾਣੀਅਹਿ ॥",
  "translation": "Those rivers and streams that flow into the ocean are no longer known (as they've gone beyond the ego).",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-207",
  "code": "X2T8",
  "gurmukhi": "ਸਮੁੰਦ ਸਾਹ ਸੁਲਤਾਨ ਗਿਰਹਾ ਸੇਤੀ ਮਾਲੁ ਧਨੁ ॥",
  "translation": "Even if a king or emperor had property and wealth amounting to an ocean and a mountain,",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-208",
  "code": "5K0J",
  "gurmukhi": "ਕੀੜੀ ਤੁਲਿ ਨ ਹੋਵਨੀ ਜੇ ਤਿਸੁ ਮਨਹੁ ਨ ਵੀਸਰਹਿ ॥੨੩॥",
  "translation": "they wouldn't equal even an ant who doesn't forget the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-209",
  "code": "40DA",
  "gurmukhi": "ਅੰਤੁ ਨ ਸਿਫਤੀ ਕਹਣਿ ਨ ਅੰਤੁ ॥",
  "translation": "There is no limit to the One's praises and how much we could say about the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
  "id": "line-210",
  "code": "VKD8",
  "gurmukhi": "ਅੰਤੁ ਨ ਕਰਣੈ ਦੇਣਿ ਨ ਅੰਤੁ ॥",
  "translation": "There is no limit to the creation and gifts of the One.",
  "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
},
{
    "id": "line-211",
    "code": "X8NU",
    "gurmukhi": "ਅੰਤੁ ਨ ਵੇਖਣਿ ਸੁਣਣਿ ਨ ਅੰਤੁ ॥",
    "translation": "There is no limit to what the One can see and hear.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-212",
    "code": "N8DF",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਕਿਆ ਮਨਿ ਮੰਤੁ ॥",
    "translation": "There is no limit to perceiving what the intelligence of the One is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-213",
    "code": "WHBU",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਕੀਤਾ ਆਕਾਰੁ ॥",
    "translation": "There is no limit to perceiving what the One has created.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-214",
    "code": "5T92",
    "gurmukhi": "ਅੰਤੁ ਨ ਜਾਪੈ ਪਾਰਾਵਾਰੁ ॥",
    "translation": "The One's limits here and beyond cannot be perceived.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-215",
    "code": "LDZY",
    "gurmukhi": "ਅੰਤ ਕਾਰਣਿ ਕੇਤੇ ਬਿਲਲਾਹਿ ॥",
    "translation": "Many struggle to know the One's limits,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-216",
    "code": "J73M",
    "gurmukhi": "ਤਾ ਕੇ ਅੰਤ ਨ ਪਾਏ ਜਾਹਿ ॥",
    "translation": "but the One's limits cannot be found.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-217",
    "code": "CXK7",
    "gurmukhi": "ਏਹੁ ਅੰਤੁ ਨ ਜਾਣੈ ਕੋਇ ॥",
    "translation": "No one can know these limits.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-218",
    "code": "WRQ5",
    "gurmukhi": "ਬਹੁਤਾ ਕਹੀਐ ਬਹੁਤਾ ਹੋਇ ॥",
    "translation": "The more you describe the One's qualities, the more you realise their greatness exceeds your words.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-219",
    "code": "0W15",
    "gurmukhi": "ਵਡਾ ਸਾਹਿਬੁ ਊਚਾ ਥਾਉ ॥",
    "translation": "Great is the master. That One's place (of bliss) is the highest.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-220",
    "code": "E6WZ",
    "gurmukhi": "ਊਚੇ ਉਪਰਿ ਊਚਾ ਨਾਉ ॥",
    "translation": "Higher than the One is the One's Name.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-221",
    "code": "BLFR",
    "gurmukhi": "ਏਵਡੁ ਊਚਾ ਹੋਵੈ ਕੋਇ ॥",
    "translation": "Anyone that becomes as great as that One;",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-222",
    "code": "J79G",
    "gurmukhi": "ਤਿਸੁ ਊਚੇ ਕਉ ਜਾਣੈ ਸੋਇ ॥",
    "translation": "they will know that One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-223",
    "code": "RMD4",
    "gurmukhi": "ਜੇਵਡੁ ਆਪਿ ਜਾਣੈ ਆਪਿ ਆਪਿ ॥",
    "translation": "The One knows how great the One is.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-224",
    "code": "W145",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਕਰਮੀ ਦਾਤਿ ॥੨੪॥",
    "translation": "Nanak says that the knowing of the One is a gift from the glance of grace of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-225",
    "code": "YXH5",
    "gurmukhi": "ਬਹੁਤਾ ਕਰਮੁ ਲਿਖਿਆ ਨਾ ਜਾਇ ॥",
    "translation": "The One's blessings are so abundant that there can be no written account of them.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-226",
    "code": "QRM0",
    "gurmukhi": "ਵਡਾ ਦਾਤਾ ਤਿਲੁ ਨ ਤਮਾਇ ॥",
    "translation": "The greatest giver does not desire even an iota in return.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-227",
    "code": "8F5K",
    "gurmukhi": "ਕੇਤੇ ਮੰਗਹਿ ਜੋਧ ਅਪਾਰ ॥",
    "translation": "There are many warriors begging infinitely at the door of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-228",
    "code": "WATD",
    "gurmukhi": "ਕੇਤਿਆ ਗਣਤ ਨਹੀ ਵੀਚਾਰੁ ॥",
    "translation": "I cannot comtemplate the amount of those who are begging from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-229",
    "code": "E536",
    "gurmukhi": "ਕੇਤੇ ਖਪਿ ਤੁਟਹਿ ਵੇਕਾਰ ॥",
    "translation": "Many waste away engaged in unrighteousness.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-230",
    "code": "MZZ6",
    "gurmukhi": "ਕੇਤੇ ਲੈ ਲੈ ਮੁਕਰੁ ਪਾਹਿ ॥",
    "translation": "Many take and take and deny receiving.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-231",
    "code": "3N29",
    "gurmukhi": "ਕੇਤੇ ਮੂਰਖ ਖਾਹੀ ਖਾਹਿ ॥",
    "translation": "Many fools keep on consuming.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-232",
    "code": "TRBN",
    "gurmukhi": "ਕੇਤਿਆ ਦੂਖ ਭੂਖ ਸਦ ਮਾਰ ॥",
    "translation": "Many see suffering caused by desires as a calling to return home.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-233",
    "code": "5AFL",
    "gurmukhi": "ਏਹਿ ਭਿ ਦਾਤਿ ਤੇਰੀ ਦਾਤਾਰ ॥",
    "translation": "Even this is Your gift, O Giver.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-234",
    "code": "W1JH",
    "gurmukhi": "ਬੰਦਿ ਖਲਾਸੀ ਭਾਣੈ ਹੋਇ ॥",
    "translation": "Liberation from being bound by attachments comes from walking in the way of the One's divine will.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-235",
    "code": "85FC",
    "gurmukhi": "ਹੋਰੁ ਆਖਿ ਨ ਸਕੈ ਕੋਇ ॥",
    "translation": "No one else has any say in this.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-236",
    "code": "7AFD",
    "gurmukhi": "ਜੇ ਕੋ ਖਾਇਕੁ ਆਖਣਿ ਪਾਇ ॥",
    "translation": "If a fool suggested another way contrary to the One's divine will,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-237",
    "code": "R3S4",
    "gurmukhi": "ਓਹੁ ਜਾਣੈ ਜੇਤੀਆ ਮੁਹਿ ਖਾਇ ॥",
    "translation": "those fools know, who have been smacked in the face (from their choices against that divine will).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-238",
    "code": "GXTL",
    "gurmukhi": "ਆਪੇ ਜਾਣੈ ਆਪੇ ਦੇਇ ॥",
    "translation": "The One knows and gives.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-239",
    "code": "JWU4",
    "gurmukhi": "ਆਖਹਿ ਸਿ ਭਿ ਕੇਈ ਕੇਇ ॥",
    "translation": "There are very few who recognise the blessings of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-240",
    "code": "ZDF9",
    "gurmukhi": "ਜਿਸ ਨੋ ਬਖਸੇ ਸਿਫਤਿ ਸਾਲਾਹ ॥",
    "translation": "One who is blessed to sing the praises of the One,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-241",
    "code": "B8J0",
    "gurmukhi": "ਨਾਨਕ ਪਾਤਿਸਾਹੀ ਪਾਤਿਸਾਹੁ ॥੨੫॥",
    "translation": "Nanak says that they are the king of kings.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-242",
    "code": "MU2K",
    "gurmukhi": "ਅਮੁਲ ਗੁਣ ਅਮੁਲ ਵਾਪਾਰ ॥",
    "translation": "The One's virtues and the trade of those virtues are priceless.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-243",
    "code": "XEQ3",
    "gurmukhi": "ਅਮੁਲ ਵਾਪਾਰੀਏ ਅਮੁਲ ਭੰਡਾਰ ॥",
    "translation": "Priceless are the traders and the treasure of those virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-244",
    "code": "EU2A",
    "gurmukhi": "ਅਮੁਲ ਆਵਹਿ ਅਮੁਲ ਲੈ ਜਾਹਿ ॥",
    "translation": "Priceless are those who come into the world and take away those virtues.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-245",
    "code": "T80Z",
    "gurmukhi": "ਅਮੁਲ ਭਾਇ ਅਮੁਲਾ ਸਮਾਹਿ ॥",
    "translation": "Priceless are those who are in love and are emersed in the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-246",
    "code": "0T04",
    "gurmukhi": "ਅਮੁਲੁ ਧਰਮੁ ਅਮੁਲੁ ਦੀਬਾਣੁ ॥",
    "translation": "Priceless is the One's divine law and court.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-247",
    "code": "YH93",
    "gurmukhi": "ਅਮੁਲੁ ਤੁਲੁ ਅਮੁਲੁ ਪਰਵਾਣੁ ॥",
    "translation": "Priceless are the figurative scales and weights that measure our actions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-248",
    "code": "7UZX",
    "gurmukhi": "ਅਮੁਲੁ ਬਖਸੀਸ ਅਮੁਲੁ ਨੀਸਾਣੁ ॥",
    "translation": "Priceless is the One's grace. Priceless is the sign of that One's grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-249",
    "code": "NKLS",
    "gurmukhi": "ਅਮੁਲੁ ਕਰਮੁ ਅਮੁਲੁ ਫੁਰਮਾਣੁ ॥",
    "translation": "Priceless is the grace and divine command of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-250",
    "code": "ABFZ",
    "gurmukhi": "ਅਮੁਲੋ ਅਮੁਲੁ ਆਖਿਆ ਨ ਜਾਇ ॥",
    "translation": "It can't be said how priceless the One is!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-251",
    "code": "D11C",
    "gurmukhi": "ਆਖਿ ਆਖਿ ਰਹੇ ਲਿਵ ਲਾਇ ॥",
    "translation": "Saying how priceless You are, I lose myself emersed in the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-252",
    "code": "99JY",
    "gurmukhi": "ਆਖਹਿ ਵੇਦ ਪਾਠ ਪੁਰਾਣ ॥",
    "translation": "The Vedas and Puranas attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-253",
    "code": "ZEVZ",
    "gurmukhi": "ਆਖਹਿ ਪੜੇ ਕਰਹਿ ਵਖਿਆਣ ॥",
    "translation": "The scholars attempt to explain the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-254",
    "code": "FDPH",
    "gurmukhi": "ਆਖਹਿ ਬਰਮੇ ਆਖਹਿ ਇੰਦ ॥",
    "translation": "Many Brahmas and the deity Indra attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-255",
    "code": "WTLL",
    "gurmukhi": "ਆਖਹਿ ਗੋਪੀ ਤੈ ਗੋਵਿੰਦ ॥",
    "translation": "Krishna and his gopis attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-256",
    "code": "Q9NN",
    "gurmukhi": "ਆਖਹਿ ਈਸਰ ਆਖਹਿ ਸਿਧ ॥",
    "translation": "The Sidhas and Shiva attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-257",
    "code": "SQND",
    "gurmukhi": "ਆਖਹਿ ਕੇਤੇ ਕੀਤੇ ਬੁਧ ॥",
    "translation": "Many Buddhas attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-258",
    "code": "ABKG",
    "gurmukhi": "ਆਖਹਿ ਦਾਨਵ ਆਖਹਿ ਦੇਵ ॥",
    "translation": "There are many deities and demons and many silent sages. There are many oceans of jewels.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-259",
    "code": "M8B4",
    "gurmukhi": "ਆਖਹਿ ਸੁਰਿ ਨਰ ਮੁਨਿ ਜਨ ਸੇਵ ॥",
    "translation": "Divine natured people, silent sages and people who live in service attempt to express the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-260",
    "code": "3XVL",
    "gurmukhi": "ਕੇਤੇ ਆਖਹਿ ਆਖਣਿ ਪਾਹਿ ॥",
    "translation": "Many attempt to express and describe the extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-261",
    "code": "71Q6",
    "gurmukhi": "ਕੇਤੇ ਕਹਿ ਕਹਿ ਉਠਿ ਉਠਿ ਜਾਹਿ ॥",
    "translation": "Many attempting to express the extent of the One, one by one leave the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-262",
    "code": "4YZF",
    "gurmukhi": "ਏਤੇ ਕੀਤੇ ਹੋਰਿ ਕਰੇਹਿ ॥",
    "translation": "If the One were to create as many people as there are already,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-263",
    "code": "F5CB",
    "gurmukhi": "ਤਾ ਆਖਿ ਨ ਸਕਹਿ ਕੇਈ ਕੇਇ ॥",
    "translation": "even then, those people cannot express the complete extent of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-264",
    "code": "M1HS",
    "gurmukhi": "ਜੇਵਡੁ ਭਾਵੈ ਤੇਵਡੁ ਹੋਇ ॥",
    "translation": "However great the One wills to be, the One becomes that great.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-265",
    "code": "JCDQ",
    "gurmukhi": "ਨਾਨਕ ਜਾਣੈ ਸਾਚਾ ਸੋਇ ॥",
    "translation": "Nanak says that only the true One knows.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-266",
    "code": "33KG",
    "gurmukhi": "ਜੇ ਕੋ ਆਖੈ ਬੋਲੁਵਿਗਾੜੁ ॥",
    "translation": "If a know-it-all attempts to express the extent of the One,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-267",
    "code": "G676",
    "gurmukhi": "ਤਾ ਲਿਖੀਐ ਸਿਰਿ ਗਾਵਾਰਾ ਗਾਵਾਰੁ ॥੨੬॥",
    "translation": "then, that person is considered a fool of fools.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-268",
    "code": "G6UD",
    "gurmukhi": "ਸੋ ਦਰੁ ਕੇਹਾ ਸੋ ਘਰੁ ਕੇਹਾ ਜਿਤੁ ਬਹਿ ਸਰਬ ਸਮਾਲੇ ॥",
    "translation": "What kind of door and home is that, from where the One sits and takes care of all.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-269",
    "code": "3HYE",
    "gurmukhi": "ਵਾਜੇ ਨਾਦ ਅਨੇਕ ਅਸੰਖਾ ਕੇਤੇ ਵਾਵਣਹਾਰੇ ॥",
    "translation": "There are countless instruments, sounds and musicians in Your creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-270",
    "code": "4DUL",
    "gurmukhi": "ਕੇਤੇ ਰਾਗ ਪਰੀ ਸਿਉ ਕਹੀਅਨਿ ਕੇਤੇ ਗਾਵਣਹਾਰੇ ॥",
    "translation": "There are many ragas that subtle beings are expressing and there are many singing those ragas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-271",
    "code": "WXCD",
    "gurmukhi": "ਗਾਵਹਿ ਤੁਹਨੋ ਪਉਣੁ ਪਾਣੀ ਬੈਸੰਤਰੁ ਗਾਵੈ ਰਾਜਾ ਧਰਮੁ ਦੁਆਰੇ ॥",
    "translation": "Wind, water, fire and the judge of righteousness sing at the door of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-272",
    "code": "VNN6",
    "gurmukhi": "ਗਾਵਹਿ ਚਿਤੁ ਗੁਪਤੁ ਲਿਖਿ ਜਾਣਹਿ ਲਿਖਿ ਲਿਖਿ ਧਰਮੁ ਵੀਚਾਰੇ ॥",
    "translation": "Chitr and Gupt, the symbolic energies that record our physical and subtle actions, sing at the door of the One. The judge of righteousness makes a conclusion on those records.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-273",
    "code": "6DR6",
    "gurmukhi": "ਗਾਵਹਿ ਈਸਰੁ ਬਰਮਾ ਦੇਵੀ ਸੋਹਨਿ ਸਦਾ ਸਵਾਰੇ ॥",
    "translation": "Shiva (descructive power), Brahma (creative power) and the feminine energy sing of the One. They are always and beautifully adorned by the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-274",
    "code": "SLHX",
    "gurmukhi": "ਗਾਵਹਿ ਇੰਦ ਇਦਾਸਣਿ ਬੈਠੇ ਦੇਵਤਿਆ ਦਰਿ ਨਾਲੇ ॥",
    "translation": "Many Indras seated upon their thrones along with the deites sing at Your door.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-275",
    "code": "TAMR",
    "gurmukhi": "ਗਾਵਹਿ ਸਿਧ ਸਮਾਧੀ ਅੰਦਰਿ ਗਾਵਨਿ ਸਾਧ ਵਿਚਾਰੇ ॥",
    "translation": "Those with spiritual powers in deep meditation and those spiritually acomplished beings in contemplation sing of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-276",
    "code": "Z22B",
    "gurmukhi": "ਗਾਵਨਿ ਜਤੀ ਸਤੀ ਸੰਤੋਖੀ ਗਾਵਹਿ ਵੀਰ ਕਰਾਰੇ ॥",
    "translation": "Celibates, those who speak truthfully, those who live in contentment and strong warriors sing of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-277",
    "code": "NU8S",
    "gurmukhi": "ਗਾਵਨਿ ਪੰਡਿਤ ਪੜਨਿ ਰਖੀਸਰ ਜੁਗੁ ਜੁਗੁ ਵੇਦਾ ਨਾਲੇ ॥",
    "translation": "Throughout the ages, the Hindu scholars and the great sages sing of the One through the Vedas .",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-278",
    "code": "BZ16",
    "gurmukhi": "ਗਾਵਹਿ ਮੋਹਣੀਆ ਮਨੁ ਮੋਹਨਿ ਸੁਰਗਾ ਮਛ ਪਇਆਲੇ ॥",
    "translation": "Those encticing women who entice the mind of people in heaven, this world and the lower world, sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-279",
    "code": "RURG",
    "gurmukhi": "ਗਾਵਨਿ ਰਤਨ ਉਪਾਏ ਤੇਰੇ ਅਠਸਠਿ ਤੀਰਥ ਨਾਲੇ ॥",
    "translation": "The jewels created by You and the sixty-eight places of pilgrimage sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-280",
    "code": "T08A",
    "gurmukhi": "ਗਾਵਹਿ ਜੋਧ ਮਹਾਬਲ ਸੂਰਾ ਗਾਵਹਿ ਖਾਣੀ ਚਾਰੇ ॥",
    "translation": "The great brave powerful warriors and the four sources of creation sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-281",
    "code": "99PA",
    "gurmukhi": "ਗਾਵਹਿ ਖੰਡ ਮੰਡਲ ਵਰਭੰਡਾ ਕਰਿ ਕਰਿ ਰਖੇ ਧਾਰੇ ॥",
    "translation": "The planets, solar systems and universes, created and placed by the One, sing of You.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-282",
    "code": "SP1N",
    "gurmukhi": "ਸੇਈ ਤੁਧੁਨੋ ਗਾਵਹਿ ਜੋ ਤੁਧੁ ਭਾਵਨਿ ਰਤੇ ਤੇਰੇ ਭਗਤ ਰਸਾਲੇ ॥",
    "translation": "However, only those who are pleasing to You truly sing of You. Your devotees are imbued in Your love.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-283",
    "code": "TB32",
    "gurmukhi": "ਹੋਰਿ ਕੇਤੇ ਗਾਵਨਿ ਸੇ ਮੈ ਚਿਤਿ ਨ ਆਵਨਿ ਨਾਨਕੁ ਕਿਆ ਵੀਚਾਰੇ ॥",
    "translation": "So many others sing of You and they do not come to mind. How can Nanak think about them all?",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-284",
    "code": "3BSB",
    "gurmukhi": "ਸੋਈ ਸੋਈ ਸਦਾ ਸਚੁ ਸਾਹਿਬੁ ਸਾਚਾ ਸਾਚੀ ਨਾਈ ॥",
    "translation": "The One is always the true Master. The One's divine law is true to itself.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-285",
    "code": "Q2ZY",
    "gurmukhi": "ਹੈ ਭੀ ਹੋਸੀ ਜਾਇ ਨ ਜਾਸੀ ਰਚਨਾ ਜਿਨਿ ਰਚਾਈ ॥",
    "translation": "That One who created the creation exists now, will always be and will not leave.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-286",
    "code": "MC85",
    "gurmukhi": "ਰੰਗੀ ਰੰਗੀ ਭਾਤੀ ਕਰਿ ਕਰਿ ਜਿਨਸੀ ਮਾਇਆ ਜਿਨਿ ਉਪਾਈ ॥",
    "translation": "The One has created all the various colours and illusions.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-287",
    "code": "9GWC",
    "gurmukhi": "ਕਰਿ ਕਰਿ ਵੇਖੈ ਕੀਤਾ ਆਪਣਾ ਜਿਵ ਤਿਸ ਦੀ ਵਡਿਆਈ ॥",
    "translation": "That which the One has created is observed by the One as per divine law.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-288",
    "code": "5GNH",
    "gurmukhi": "ਜੋ ਤਿਸੁ ਭਾਵੈ ਸੋਈ ਕਰਸੀ ਹੁਕਮੁ ਨ ਕਰਣਾ ਜਾਈ ॥",
    "translation": "That which pleases the One, the One does. No one can order the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-289",
    "code": "DT5S",
    "gurmukhi": "ਸੋ ਪਾਤਿਸਾਹੁ ਸਾਹਾ ਪਾਤਿਸਾਹਿਬੁ ਨਾਨਕ ਰਹਣੁ ਰਜਾਈ ॥੨੭॥",
    "translation": "That One is the king, the king of kings. Nanak says, remain in the will of the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-290",
    "code": "2Y9L",
    "gurmukhi": "ਮੁੰਦਾ ਸੰਤੋਖੁ ਸਰਮੁ ਪਤੁ ਝੋਲੀ ਧਿਆਨ ਕੀ ਕਰਹਿ ਬਿਭੂਤਿ ॥",
    "translation": "(O Yogi), I have made contentment my ear-rings, shame for doing negative actions my begging bowl and being conscious to the One's presence the ashes applied to my body.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-291",
    "code": "ZEPX",
    "gurmukhi": "ਖਿੰਥਾ ਕਾਲੁ ਕੁਆਰੀ ਕਾਇਆ ਜੁਗਤਿ ਡੰਡਾ ਪਰਤੀਤਿ ॥",
    "translation": "(O Yogi), for the patched coat you wear as a symbol of the remembrance of death, I have the awareness that, although death will eventually claim the body, I remain sepa",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-292",
    "code": "UNDR",
    "gurmukhi": "ਆਈ ਪੰਥੀ ਸਗਲ ਜਮਾਤੀ ਮਨਿ ਜੀਤੈ ਜਗੁ ਜੀਤੁ ॥",
    "translation": "O Yogi, the actual highest order of yogi is being able to see all beings as your own. This is what it means to conquer your mind and the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-293",
    "code": "CBB2",
    "gurmukhi": "ਆਦੇਸੁ ਤਿਸੈ ਆਦੇਸੁ ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-294",
    "code": "CBMX",
    "gurmukhi": "ਆਦਿ ਅਨੀਲੁ ਅਨਾਦਿ ਅਨਾਹਤਿ ਜੁਗੁ ਜੁਗੁ ਏਕੋ ਵੇਸੁ ॥੨੮॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-295",
    "code": "FFJA",
    "gurmukhi": "ਭੁਗਤਿ ਗਿਆਨੁ ਦਇਆ ਭੰਡਾਰਣਿ ਘਟਿ ਘਟਿ ਵਾਜਹਿ ਨਾਦ ॥",
    "translation": "(O Yogi), I have made spiritual wisdom my food, given by the server of compassion. I have made the primal sound at the heart of everything the calling of the sound to eat.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-296",
    "code": "6V6K",
    "gurmukhi": "ਆਪਿ ਨਾਥੁ ਨਾਥੀ ਸਭ ਜਾ ਕੀ ਰਿਧਿ ਸਿਧਿ ਅਵਰਾ ਸਾਦ ॥",
    "translation": "The One is the supreme master, who has strung together the entire creation. Pursuing the attainment of miraculous powers offers only a worldly pleasure compared to the primary fulfillment of union.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-297",
    "code": "8TCX",
    "gurmukhi": "ਸੰਜੋਗੁ ਵਿਜੋਗੁ ਦੁਇ ਕਾਰ ਚਲਾਵਹਿ ਲੇਖੇ ਆਵਹਿ ਭਾਗ ॥",
    "translation": "The play of the One's creation revolves around the dynamic interplay of union and separation, with our actions determining the trajectory towards either, thereby shaping our destiny.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-298",
    "code": "481K",
    "gurmukhi": "ਆਦੇਸੁ ਤਿਸੈ ਆਦੇਸੁ ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-299",
    "code": "0QT9",
    "gurmukhi": "ਆਦਿ ਅਨੀਲੁ ਅਨਾਦਿ ਅਨਾਹਤਿ ਜੁਗੁ ਜੁਗੁ ਏਕੋ ਵੇਸੁ ॥੨੯॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-300",
    "code": "7F2E",
    "gurmukhi": "ਏਕਾ ਮਾਈ ਜੁਗਤਿ ਵਿਆਈ ਤਿਨਿ ਚੇਲੇ ਪਰਵਾਣੁ ॥",
    "translation": "The One gave birth to creation (Maya) in a mysterious way, which manifested in three qualities,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-301",
    "code": "VRZR",
    "gurmukhi": "ਇਕੁ ਸੰਸਾਰੀ ਇਕੁ ਭੰਡਾਰੀ ਇਕੁ ਲਾਏ ਦੀਬਾਣੁ ॥",
    "translation": "one that is creating (Brahma), one that is sustaining (Vishnu) and one that is destroying (Shiva).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-302",
    "code": "6Q3P",
    "gurmukhi": "ਜਿਵ ਤਿਸੁ ਭਾਵੈ ਤਿਵੈ ਚਲਾਵੈ ਜਿਵ ਹੋਵੈ ਫੁਰਮਾਣੁ ॥",
    "translation": "The creation operates according to the divine will of the One, who orchestrates its functioning as they please.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-303",
    "code": "YMXX",
    "gurmukhi": "ਓਹੁ ਵੇਖੈ ਓਨਾ ਨਦਰਿ ਨ ਆਵੈ ਬਹੁਤਾ ਏਹੁ ਵਿਡਾਣੁ ॥",
    "translation": "The formless One sees everything, however those who see the creation through the lens of the illusion cannot have vision of the formless One. Great is this wonder.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-304",
    "code": "A3DN",
    "gurmukhi": "ਆਦੇਸੁ ਤਿਸੈ ਆਦੇਸੁ ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-305",
    "code": "2JDC",
    "gurmukhi": "ਆਦਿ ਅਨੀਲੁ ਅਨਾਦਿ ਅਨਾਹਤਿ ਜੁਗੁ ਜੁਗੁ ਏਕੋ ਵੇਸੁ ॥੩੦॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-306",
    "code": "6YHD",
    "gurmukhi": "ਆਸਣੁ ਲੋਇ ਲੋਇ ਭੰਡਾਰ ॥",
    "translation": "The One that is the inexhaustable source of abundance is seated within the entire creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-307",
    "code": "3AYC",
    "gurmukhi": "ਜੋ ਕਿਛੁ ਪਾਇਆ ਸੁ ਏਕਾ ਵਾਰ ॥",
    "translation": "Whatever was put into the creation (from the primal sound), was put in there once.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-308",
    "code": "SKBT",
    "gurmukhi": "ਕਰਿ ਕਰਿ ਵੇਖੈ ਸਿਰਜਣਹਾਰੁ ॥",
    "translation": "That which the One has created is observed by the Creator.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-309",
    "code": "E1CC",
    "gurmukhi": "ਨਾਨਕ ਸਚੇ ਕੀ ਸਾਚੀ ਕਾਰ ॥",
    "translation": "Nanak says the True One's creation is entirely complete, lacking nothing, and eternally perfect.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-310",
    "code": "9STB",
    "gurmukhi": "ਆਦੇਸੁ ਤਿਸੈ ਆਦੇਸੁ ॥",
    "translation": "I bow, I bow to the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-311",
    "code": "1RNS",
    "gurmukhi": "ਆਦਿ ਅਨੀਲੁ ਅਨਾਦਿ ਅਨਾਹਤਿ ਜੁਗੁ ਜੁਗੁ ਏਕੋ ਵੇਸੁ ॥੩੧॥",
    "translation": "The One is the beginning of all, beyond the colour of creation, is without beginning and cannot be destroyed. Throughout all the ages, the One is the same.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-312",
    "code": "FZ3S",
    "gurmukhi": "ਇਕ ਦੂ ਜੀਭੌ ਲਖ ਹੋਹਿ ਲਖ ਹੋਵਹਿ ਲਖ ਵੀਸ ॥",
    "translation": "May my one tongue become a hundred thousand. Let that hundred thousand become twenty times that (millions)!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-313",
    "code": "QG45",
    "gurmukhi": "ਲਖੁ ਲਖੁ ਗੇੜਾ ਆਖੀਅਹਿ ਏਕੁ ਨਾਮੁ ਜਗਦੀਸ ॥",
    "translation": "I would chant and repeat, hundreds of thousands of times, the name of the One, the master of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-314",
    "code": "6PAP",
    "gurmukhi": "ਏਤੁ ਰਾਹਿ ਪਤਿ ਪਵੜੀਆ ਚੜੀਐ ਹੋਇ ਇਕੀਸ॥",
    "translation": "Through this way, take those steps to your husband (the One). As you climb those steps, you become one with the master of the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-315",
    "code": "AGTS",
    "gurmukhi": "ਸੁਣਿ ਗਲਾ ਆਕਾਸ ਕੀ ਕੀਟਾ ਆਈ ਰੀਸ ॥",
    "translation": "Through hearing stories, ignorant people imitate the actions of realised beings and think they're in a spiritual state, like a insect trying to copy a bird flying in the sky.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-316",
    "code": "HT8B",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਪਾਈਐ ਕੂੜੀ ਕੂੜੈ ਠੀਸ ॥੩੨॥",
    "translation": "Nanak says, through receiving the glance of grace of the One, you can achieve union. The false ones talk false nonsense.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-317",
    "code": "NW8V",
    "gurmukhi": "ਆਖਣਿ ਜੋਰੁ ਚੁਪੈ ਨਹ ਜੋਰੁ ॥",
    "translation": "I have no power to determine the nature of how to speak and keep silent.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-318",
    "code": "8XBB",
    "gurmukhi": "ਜੋਰੁ ਨ ਮੰਗਣਿ ਦੇਣਿ ਨ ਜੋਰੁ ॥",
    "translation": "I have no power to determine the nature of how to beg and give.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-319",
    "code": "P07R",
    "gurmukhi": "ਜੋਰੁ ਨ ਜੀਵਣਿ ਮਰਣਿ ਨਹ ਜੋਰੁ ॥",
    "translation": "I have no power to determine the nature of how to remain alive and die.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-320",
    "code": "YKT7",
    "gurmukhi": "ਜੋਰੁ ਨ ਰਾਜਿ ਮਾਲਿ ਮਨਿ ਸੋਰੁ ॥",
    "translation": "I have no power to determine the nature of how to acquire power and wealth that cause disturbances within the mind.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-321",
    "code": "0GPM",
    "gurmukhi": "ਜੋਰੁ ਨ ਸੁਰਤੀ ਗਿਆਨਿ ਵੀਚਾਰਿ ॥",
    "translation": "I have no power to determine the nature of how to focus in meditation and aquire divine wisdom.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-322",
    "code": "WQC9",
    "gurmukhi": "ਜੋਰੁ ਨ ਜੁਗਤੀ ਛੁਟੈ ਸੰਸਾਰੁ ॥",
    "translation": "I have no power to determine the nature of how to escape from the entanglement of the world.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-323",
    "code": "BPJS",
    "gurmukhi": "ਜਿਸੁ ਹਥਿ ਜੋਰੁ ਕਰਿ ਵੇਖੈ ਸੋਇ ॥",
    "translation": "The One, with power in hand, watches over the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-324",
    "code": "FWE0",
    "gurmukhi": "ਨਾਨਕ ਉਤਮੁ ਨੀਚੁ ਨ ਕੋਇ ॥੩੩॥",
    "translation": "Nanak says, no one has the power to determine the nature of what it means to be high or low.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-325",
    "code": "KCH3",
    "gurmukhi": "ਰਾਤੀ ਰੁਤੀ ਥਿਤੀ ਵਾਰ ॥",
    "translation": "Nights, seasons, lunar days, weeks,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-326",
    "code": "ZREW",
    "gurmukhi": "ਪਵਣ ਪਾਣੀ ਅਗਨੀ ਪਾਤਾਲ ॥",
    "translation": "air, water, fire, and the nether regions (space);",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-327",
    "code": "U8TR",
    "gurmukhi": "ਤਿਸੁ ਵਿਚਿ ਧਰਤੀ ਥਾਪਿ ਰਖੀ ਧਰਮ ਸਾਲ ॥",
    "translation": "within these, Earth was created as a place for practicing righteousness and connecting to the Divine.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-328",
    "code": "5KTJ",
    "gurmukhi": "ਤਿਸੁ ਵਿਚਿ ਜੀਅ ਜੁਗਤਿ ਕੇ ਰੰਗ ॥",
    "translation": "On Earth, through the One's divine way, there are beings of various colours (diversity);",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-329",
    "code": "3TLN",
    "gurmukhi": "ਤਿਨ ਕੇ ਨਾਮ ਅਨੇਕ ਅਨੰਤ ॥",
    "translation": "the names of these beings are countless and endless.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-330",
    "code": "AKMD",
    "gurmukhi": "ਕਰਮੀ ਕਰਮੀ ਹੋਇ ਵੀਚਾਰੁ ॥",
    "translation": "Each and every action of all beings are observed.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-331",
    "code": "Q66G",
    "gurmukhi": "ਸਚਾ ਆਪਿ ਸਚਾ ਦਰਬਾਰੁ ॥",
    "translation": "The One is true and the One's court is true.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-332",
    "code": "7RB7",
    "gurmukhi": "ਤਿਥੈ ਸੋਹਨਿ ਪੰਚ ਪਰਵਾਣੁ ॥",
    "translation": "In the One's court, the accepted virtuous beings are beautiful.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-333",
    "code": "U1LH",
    "gurmukhi": "ਨਦਰੀ ਕਰਮਿ ਪਵੈ ਨੀਸਾਣੁ ॥",
    "translation": "They receive the radiance of the One's graceful vision.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-334",
    "code": "U24Q",
    "gurmukhi": "ਕਚ ਪਕਾਈ ਓਥੈ ਪਾਇ ॥",
    "translation": "In the One's court (state of supreme consciousness), there is clarity on who is unripened (unrighteous) or ripened (righteous).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-335",
    "code": "7VQN",
    "gurmukhi": "ਨਾਨਕ ਗਇਆ ਜਾਪੈ ਜਾਇ ॥੩੪॥",
    "translation": "Nanak says that only upon going to the One's court is this clarity realised.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-336",
    "code": "24CD",
    "gurmukhi": "ਧਰਮ ਖੰਡ ਕਾ ਏਹੋ ਧਰਮੁ ॥",
    "translation": "The nature of the realm of righteousness is as per the previous pauri.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-337",
    "code": "K1RK",
    "gurmukhi": "ਗਿਆਨ ਖੰਡ ਕਾ ਆਖਹੁ ਕਰਮੁ ॥",
    "translation": "Now I speak of the workings of the realm of divine knowing.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-338",
    "code": "N50P",
    "gurmukhi": "ਕੇਤੇ ਪਵਣ ਪਾਣੀ ਵੈਸੰਤਰ ਕੇਤੇ ਕਾਨ ਮਹੇਸ ॥",
    "translation": "There are many forms of air, water and fire. There are many Krishanas and Shivas.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-339",
    "code": "4WPT",
    "gurmukhi": "ਕੇਤੇ ਬਰਮੇ ਘਾੜਤਿ ਘੜੀਅਹਿ ਰੂਪ ਰੰਗ ਕੇ ਵੇਸ ॥",
    "translation": "There are many Brahmas (creative powers) that are carving the creation, dressed in different forms and colours.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-340",
    "code": "FEM5",
    "gurmukhi": "ਕੇਤੀਆ ਕਰਮ ਭੂਮੀ ਮੇਰ ਕੇਤੇ ਕੇਤੇ ਧੂ ਉਪਦੇਸ ॥",
    "translation": "There are many worlds where the law of karma applies. There are many Meru mountains. There are many beings like Narada that give teachings to those like Bhagat Dhru.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-341",
    "code": "Q0HU",
    "gurmukhi": "ਕੇਤੇ ਇੰਦ ਚੰਦ ਸੂਰ ਕੇਤੇ ਕੇਤੇ ਮੰਡਲ ਦੇਸ ॥",
    "translation": "There are many Indras, many moons and suns. There are many solar systems and lands.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-342",
    "code": "D1W9",
    "gurmukhi": "ਕੇਤੇ ਸਿਧ ਬੁਧ ਨਾਥ ਕੇਤੇ ਕੇਤੇ ਦੇਵੀ ਵੇਸ ॥",
    "translation": "There are many siddhas, Buddhas and many yogic masters. There are many goddesses of various kinds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-343",
    "code": "1Q0R",
    "gurmukhi": "ਕੇਤੇ ਦੇਵ ਦਾਨਵ ਮੁਨਿ ਕੇਤੇ ਕੇਤੇ ਰਤਨ ਸਮੁੰਦ ॥",
    "translation": "There are many deities and demons. There are many silent sages. There are many oceans of jewels.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-344",
    "code": "2ZEN",
    "gurmukhi": "ਕੇਤੀਆ ਖਾਣੀ ਕੇਤੀਆ ਬਾਣੀ ਕੇਤੇ ਪਾਤ ਨਰਿੰਦ ॥",
    "translation": "There are many ways in which life is created. There are many languages. There are many kings and rulers of people.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-345",
    "code": "LWRF",
    "gurmukhi": "ਕੇਤੀਆ ਸੁਰਤੀ ਸੇਵਕ ਕੇਤੇ ਨਾਨਕ ਅੰਤੁ ਨ ਅੰਤੁ ॥੩੫॥",
    "translation": "There are many ways to practise focused meditation. There are many selfless servants. Nanak says the One's limit has no limit!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-346",
    "code": "RSBW",
    "gurmukhi": "ਗਿਆਨ ਖੰਡ ਮਹਿ ਗਿਆਨੁ ਪਰਚੰਡੁ ॥",
    "translation": "In the realm of divine knowing, there is a radiance of divine clarity.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-347",
    "code": "K59J",
    "gurmukhi": "ਤਿਥੈ ਨਾਦ ਬਿਨੋਦ ਕੋਡ ਅਨੰਦੁ ॥",
    "translation": "The experience of that place of diving knowing is a state of internal joy and bliss, enjoying the play of sounds (emotions).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-348",
    "code": "RZ2R",
    "gurmukhi": "ਸਰਮ ਖੰਡ ਕੀ ਬਾਣੀ ਰੂਪੁ ॥",
    "translation": "The realm of humility makes you truly beautiful.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-349",
    "code": "L3PT",
    "gurmukhi": "ਤਿਥੈ ਘਾੜਤਿ ਘੜੀਐ ਬਹੁਤੁ ਅਨੂਪੁ ॥",
    "translation": "This chisel of humility carves you to immense incomparability.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-350",
    "code": "C8DN",
    "gurmukhi": "ਤਾ ਕੀਆ ਗਲਾ ਕਥੀਆ ਨਾ ਜਾਹਿ ॥",
    "translation": "In that realm of humility, those stories are beyond words. They cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-351",
    "code": "Z1ZK",
    "gurmukhi": "ਜੇ ਕੋ ਕਹੈ ਪਿਛੈ ਪਛੁਤਾਇ ॥",
    "translation": "Whoever tries to describe the realm of humility will regret the attempt.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-352",
    "code": "4Q9F",
    "gurmukhi": "ਤਿਥੈ ਘੜੀਐ ਸੁਰਤਿ ਮਤਿ ਮਨਿ ਬੁਧਿ ॥",
    "translation": "Intuitive awareness, understanding, thinking and the intellect are carved in the state of humility.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-353",
    "code": "AMXU",
    "gurmukhi": "ਤਿਥੈ ਘੜੀਐ ਸੁਰਾ ਸਿਧਾ ਕੀ ਸੁਧਿ ॥੩੬॥",
    "translation": "The chisel of humility makes deities and those with spiritual powers wise.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-354",
    "code": "5ULX",
    "gurmukhi": "ਕਰਮ ਖੰਡ ਕੀ ਬਾਣੀ ਜੋਰੁ ॥",
    "translation": "The realm of grace gives you internal strength (to fight the vices).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-355",
    "code": "BJM6",
    "gurmukhi": "ਤਿਥੈ ਹੋਰੁ ਨ ਕੋਈ ਹੋਰੁ ॥",
    "translation": "In that realm of grace, nothing else dwells there but grace.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-356",
    "code": "BNJ2",
    "gurmukhi": "ਤਿਥੈ ਜੋਧ ਮਹਾਬਲ ਸੂਰ ॥",
    "translation": "In that realm of grace, spiritual warriors of great strength are made.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-357",
    "code": "7VNW",
    "gurmukhi": "ਤਿਨ ਮਹਿ ਰਾਮੁ ਰਹਿਆ ਭਰਪੂਰ ॥",
    "translation": "With them is an overflowing of the One that is immersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-358",
    "code": "WE5M",
    "gurmukhi": "ਤਿਥੈ ਸੀਤੋ ਸੀਤਾ ਮਹਿਮਾ ਮਾਹਿ ॥",
    "translation": "In the realm of grace, the praise of the One is sown within them.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-359",
    "code": "9LXP",
    "gurmukhi": "ਤਾ ਕੇ ਰੂਪ ਨ ਕਥਨੇ ਜਾਹਿ ॥",
    "translation": "The beauty that grace gives them cannot be described.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-360",
    "code": "YCB7",
    "gurmukhi": "ਨਾ ਓਹਿ ਮਰਹਿ ਨ ਠਾਗੇ ਜਾਹਿ ॥",
    "translation": "In the realm of grace, they cannot die or be looted (by the vices).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-361",
    "code": "7V61",
    "gurmukhi": "ਜਿਨ ਕੈ ਰਾਮੁ ਵਸੈ ਮਨ ਮਾਹਿ ॥",
    "translation": "Within the minds of those abides the One that is emmersed in everything.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-362",
    "code": "MT5G",
    "gurmukhi": "ਤਿਥੈ ਭਗਤ ਵਸਹਿ ਕੇ ਲੋਅ ॥",
    "translation": "In the realm of grace, devotees dwell in many worlds.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-363",
    "code": "UMUK",
    "gurmukhi": "ਕਰਹਿ ਅਨੰਦੁ ਸਚਾ ਮਨਿ ਸੋਇ ॥",
    "translation": "Those in the realm of grace enjoy bliss and their minds are with the eternal One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-364",
    "code": "RQ4A",
    "gurmukhi": "ਸਚ ਖੰਡਿ ਵਸੈ ਨਿਰੰਕਾਰੁ ॥",
    "translation": "In the realm of truth, the formless One abides.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-365",
    "code": "ANCE",
    "gurmukhi": "ਕਰਿ ਕਰਿ ਵੇਖੈ ਨਦਰਿ ਨਿਹਾਲ ॥",
    "translation": "That which the One has created is observed by the One. The One's vision of divine law upon creation is filled with mercy. Those in the realm of truth who realise this vision are exalted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-366",
    "code": "GSN9",
    "gurmukhi": "ਤਿਥੈ ਖੰਡ ਮੰਡਲ ਵਰਭੰਡ ॥",
    "translation": "Those in the realm of truth see that there are planets, solar systems and universes.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-367",
    "code": "VG6U",
    "gurmukhi": "ਜੇ ਕੋ ਕਥੈ ਤ ਅੰਤ ਨ ਅੰਤ ॥",
    "translation": "If someone from that realm of truth were to describe the extent of divine law and the creation, that description has no limit.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-368",
    "code": "MDYU",
    "gurmukhi": "ਤਿਥੈ ਲੋਅ ਲੋਅ ਆਕਾਰ ॥",
    "translation": "Those in the realm of truth see that there are worlds upon worlds in the One's creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-369",
    "code": "UHV5",
    "gurmukhi": "ਜਿਵ ਜਿਵ ਹੁਕਮੁ ਤਿਵੈ ਤਿਵ ਕਾਰ ॥",
    "translation": "Those in the realm of truth see that everything in the creation is working according to the One's divine law.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-370",
    "code": "2953",
    "gurmukhi": "ਵੇਖੈ ਵਿਗਸੈ ਕਰਿ ਵੀਚਾਰੁ ॥",
    "translation": "The One is in a state of forever blossoming, observing the manifestation of the deep contemplation that created the creation.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-371",
    "code": "9AJ4",
    "gurmukhi": "ਨਾਨਕ ਕਥਨਾ ਕਰੜਾ ਸਾਰੁ ॥੩੭॥",
    "translation": "Nanak says that to explain the realm of truth is as hard as iron!",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-372",
    "code": "BEWM",
    "gurmukhi": "ਜਤੁ ਪਾਹਾਰਾ ਧੀਰਜੁ ਸੁਨਿਆਰੁ ॥",
    "translation": "(In taking the steps to self-realisation), if you were to have a workshop as a goldsmith, let self-control of the senses be that workshop and let patience be the goldsmith.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-373",
    "code": "XXEE",
    "gurmukhi": "ਅਹਰਣਿ ਮਤਿ ਵੇਦੁ ਹਥੀਆਰੁ ॥",
    "translation": "Let the divine hammer of spiritual knowledge hit the anvil of your understanding.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-374",
    "code": "0VWK",
    "gurmukhi": "ਭਉ ਖਲਾ ਅਗਨਿ ਤਪ ਤਾਉ ॥",
    "translation": "Let the bellows be your loving fear (being conscious of the One watching you). Let the heat of the fire be your penance (selfless service).",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-375",
    "code": "9762",
    "gurmukhi": "ਭਾਂਡਾ ਭਾਉ ਅੰਮ੍ਰਿਤੁ ਤਿਤੁ ਢਾਲਿ ॥",
    "translation": "If you were to make gold coins, make love the melting pot, that the molten gold of the One's immortal name goes in to.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-376",
    "code": "766E",
    "gurmukhi": "ਘੜੀਐ ਸਬਦੁ ਸਚੀ ਟਕਸਾਲ ॥",
    "translation": "Being moulded by self-control of the senses, patience, humbling spiritual knowledge, loving fear, penance, love, and melting into the One's immortal name, you realise the divine word (the essence). This is the true mint, where the coins of self-realised beings are made.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-377",
    "code": "C1Y3",
    "gurmukhi": "ਜਿਨ ਕਉ ਨਦਰਿ ਕਰਮੁ ਤਿਨ ਕਾਰ ॥",
    "translation": "This is the work of those who receive the glance of grace from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-378",
    "code": "K552",
    "gurmukhi": "ਨਾਨਕ ਨਦਰੀ ਨਦਰਿ ਨਿਹਾਲ ॥੩੮॥",
    "translation": "Nanak says, those who receive that glance of mercy are exalted.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },

  {
    "id": "line-379",
    "code": "XQLL",
    "gurmukhi": "ਸਲੋਕੁ ॥",
    "translation": "A rhyming couplet:",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-380",
    "code": "62FB",
    "gurmukhi": "ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥",
    "translation": "Air is the Guru, water is the father and soil is the great mother.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-381",
    "code": "8TXG",
    "gurmukhi": "ਦਿਵਸੁ ਰਾਤਿ ਦੁਇ ਦਾਈ ਦਾਇਆ ਖੇਲੈ ਸਗਲ ਜਗਤੁ ॥",
    "translation": "The whole world plays in the lap of the babysitter called day and night.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-382",
    "code": "Q495",
    "gurmukhi": "ਚੰਗਿਆਈਆ ਬੁਰਿਆਈਆ ਵਾਚੈ ਧਰਮੁ ਹਦੂਰਿ ॥",
    "translation": "Good and bad actions are studied in the presence of the judge of righteousness.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-383",
    "code": "2D8J",
    "gurmukhi": "ਕਰਮੀ ਆਪੋ ਆਪਣੀ ਕੇ ਨੇੜੈ ਕੇ ਦੂਰਿ ॥",
    "translation": "According to your own actions, some are closer and some are further from the One.",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-384",
    "code": "V9TG",
    "gurmukhi": "ਜਿਨੀ ਨਾਮੁ ਧਿਆਇਆ ਗਏ ਮਸਕਤਿ ਘਾਲਿ ॥",
    "translation": "Just like hard work pays off, those who leave the world with naam having paid off,",
    "translationSource": "BOS - Baljit Singh & Preetcharan Singh"
  },
  {
    "id": "line-385",
    "code": "9WAL",
    "gurmukhi": "ਨਾਨਕ ਤੇ ਮੁਖ ਉਜਲੇ ਕੇਤੀ ਛੁਟੀ ਨਾਲਿ ॥੧॥",
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