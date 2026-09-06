const fs = require('fs');
const path = require('path');

const { IndicTokenizer } = require('./dist_test/IndicTokenizer');
const { IndicProcessor } = require('./dist_test/IndicProcessor');

const indicEnVocabDir = path.join(__dirname, 'assets', 'models', 'vocab', 'indic-en');
const enIndicVocabDir = path.join(__dirname, 'assets', 'models', 'vocab', 'en-indic');

console.log('Loading vocabularies...');
const t0 = Date.now();

const indicEnPieces = JSON.parse(fs.readFileSync(path.join(indicEnVocabDir, 'spm_src_vocab.json'), 'utf-8'));
const indicEnSrcDict = JSON.parse(fs.readFileSync(path.join(indicEnVocabDir, 'dict.SRC.json'), 'utf-8'));
const indicEnTgtDict = JSON.parse(fs.readFileSync(path.join(indicEnVocabDir, 'dict.TGT.json'), 'utf-8'));

const enIndicPieces = JSON.parse(fs.readFileSync(path.join(enIndicVocabDir, 'spm_src_vocab.json'), 'utf-8'));
const enIndicSrcDict = JSON.parse(fs.readFileSync(path.join(enIndicVocabDir, 'dict.SRC.json'), 'utf-8'));
const enIndicTgtDict = JSON.parse(fs.readFileSync(path.join(enIndicVocabDir, 'dict.TGT.json'), 'utf-8'));

console.log(`Vocabularies loaded in ${Date.now() - t0}ms`);

const tokIndicEn = new IndicTokenizer(indicEnPieces, indicEnSrcDict, indicEnTgtDict);
const tokEnIndic = new IndicTokenizer(enIndicPieces, enIndicSrcDict, enIndicTgtDict);

const testCases = [
  {
    name: 'Hindi -> English',
    srcLang: 'hin_Deva',
    tgtLang: 'eng_Latn',
    text: 'मुझे आज डॉक्टर के पास जाना है।',
    tok: tokIndicEn,
    expectedIds: [8, 4, 462, 772, 2573, 12, 518, 1184, 11, 7, 2],
    expectedPieces: ['hin_Deva', 'eng_Latn', '▁मुझे', '▁आज', '▁डॉक्टर', '▁के', '▁पास', '▁जाना', '▁है', '▁।'],
  },
  {
    name: 'Telugu -> English',
    srcLang: 'tel_Telu',
    tgtLang: 'eng_Latn',
    text: 'నేను ఈరోజు డాక్టర్ వద్దకు వెళ్ళాలి.',
    tok: tokIndicEn,
    expectedIds: [15, 4, 405, 22414, 8526, 43138, 2220, 1117, 5, 2],
    expectedPieces: ['tel_Telu', 'eng_Latn', '▁नेनु', '▁ईरोजु', '▁डाक्टर्', '▁वद्दकु', '▁वॆळ्ळ', 'ालि', '▁.'],
  },
  {
    name: 'Tamil -> English',
    srcLang: 'tam_Taml',
    tgtLang: 'eng_Latn',
    text: 'நான் இன்று மருத்துவரிடம் செல்ல வேண்டும்.',
    tok: tokIndicEn,
    expectedIds: [16, 4, 329, 5324, 5647, 19970, 1997, 563, 5, 2],
    expectedPieces: ['tam_Taml', 'eng_Latn', '▁नाऩ्', '▁इऩ्ऱु', '▁मरुत्तुव', 'रिटम्', '▁चॆल्ल', '▁वेण्टुम्', '▁.'],
  },
  {
    name: 'English -> Hindi',
    srcLang: 'eng_Latn',
    tgtLang: 'hin_Deva',
    text: 'I have to go to the doctor today.',
    tok: tokEnIndic,
    expectedIds: [4, 15, 24, 37, 9, 197, 9, 6, 761, 368, 5, 2],
    expectedPieces: ['eng_Latn', 'hin_Deva', '▁I', '▁have', '▁to', '▁go', '▁to', '▁the', '▁doctor', '▁today', '▁.'],
  },
  {
    name: 'English -> Telugu',
    srcLang: 'eng_Latn',
    tgtLang: 'tel_Telu',
    text: 'I have to go to the doctor today.',
    tok: tokEnIndic,
    expectedIds: [4, 21, 24, 37, 9, 197, 9, 6, 761, 368, 5, 2],
    expectedPieces: ['eng_Latn', 'tel_Telu', '▁I', '▁have', '▁to', '▁go', '▁to', '▁the', '▁doctor', '▁today', '▁.'],
  },
];

console.log('\n=== RUNNING ENCODING TESTS ===\n');

let allPassed = true;

for (const tc of testCases) {
  const encStart = process.hrtime.bigint();
  const res = tc.tok.encode(tc.text, tc.srcLang, tc.tgtLang);
  const encEnd = process.hrtime.bigint();
  const durMs = Number(encEnd - encStart) / 1e6;

  const idsMatch = JSON.stringify(res.input_ids) === JSON.stringify(tc.expectedIds);
  const piecesMatch = JSON.stringify(res.pieces) === JSON.stringify(tc.expectedPieces);

  console.log(`Test: ${tc.name} (${durMs.toFixed(2)}ms)`);
  console.log(`  Preprocessed: ${res.preprocessedText}`);
  console.log(`  Pieces:       ${JSON.stringify(res.pieces)}`);
  console.log(`  Expected:     ${JSON.stringify(tc.expectedPieces)}`);
  console.log(`  Pieces Match: ${piecesMatch ? 'PASS' : 'FAIL'}`);
  console.log(`  Input IDs:    ${JSON.stringify(res.input_ids)}`);
  console.log(`  Expected IDs: ${JSON.stringify(tc.expectedIds)}`);
  console.log(`  IDs Match:    ${idsMatch ? 'PASS' : 'FAIL'}\n`);

  if (!idsMatch || !piecesMatch) {
    allPassed = false;
  }
}

console.log('=== RUNNING DECODING TESTS ===\n');

// 1. Target English decoding
const enTokenIds = [2, 18, 28, 8, 181, 8, 5, 744, 351, 4, 2];
const decodedEn = tokIndicEn.decode(enTokenIds, 'eng_Latn');
console.log(`Decoded EN IDs ${JSON.stringify(enTokenIds)} -> "${decodedEn}"`);
const expectedEn = 'I have to go to the doctor today.';
const enMatch = decodedEn === expectedEn;
console.log(`EN Decode Match: ${enMatch ? 'PASS' : 'FAIL'}\n`);

// 2. Target Hindi decoding
const hiTokenIds = [2, 445, 755, 2553, 9, 501, 1166, 8, 6, 2];
const decodedHi = tokEnIndic.decode(hiTokenIds, 'hin_Deva');
console.log(`Decoded HI IDs ${JSON.stringify(hiTokenIds)} -> "${decodedHi}"`);
const expectedHi = 'मुझे आज डॉक्टर के पास जाना है।';
const hiMatch = decodedHi === expectedHi;
console.log(`HI Decode Match: ${hiMatch ? 'PASS' : 'FAIL'}\n`);

if (!enMatch || !hiMatch) {
  allPassed = false;
}

console.log(`=== OVERALL RESULT: ${allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'} ===`);
process.exit(allPassed ? 0 : 1);
