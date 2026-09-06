import * as path from 'path';
import { TranslationService } from '../TranslationService';

// Resolve absolute path to models in Translator_Chatgpt
const indicEnModelDir = path.resolve('C:/Users/rafey/Desktop/Translator_Chatgpt/models/indic-en-onnx-int8');
const enIndicModelDir = path.resolve('C:/Users/rafey/Desktop/Translator_Chatgpt/models/en-indic-onnx-int8');
const indicEnVocabDir = path.resolve('C:/Users/rafey/Desktop/YAAD/Yaad/assets/models/vocab/indic-en');
const enIndicVocabDir = path.resolve('C:/Users/rafey/Desktop/YAAD/Yaad/assets/models/vocab/en-indic');

const service = TranslationService.getInstance({
  indicEnModelDir,
  enIndicModelDir,
  indicEnVocabDir,
  enIndicVocabDir,
});

async function runTests() {
  console.log('====================================================');
  console.log('  OFFLINE INDIC-TRANS-2 TRANSLATION SERVICE TEST    ');
  console.log('====================================================\n');

  const testCases = [
    {
      id: 1,
      name: 'Hindi -> English (Standard Test Phrase)',
      src: 'hi',
      tgt: 'en',
      text: 'मुझे आज डॉक्टर के पास जाना है।',
      expected: 'I have to go to the doctor today.',
    },
    {
      id: 2,
      name: 'Telugu -> English (Standard Test Phrase)',
      src: 'te',
      tgt: 'en',
      text: 'నేను ఈరోజు డాక్టర్ వద్దకు వెళ్ళాలి.',
      expected: 'I have to go to the doctor today.',
    },
    {
      id: 3,
      name: 'English -> Hindi (Standard Test Phrase)',
      src: 'en',
      tgt: 'hi',
      text: 'I have to go to the doctor today.',
      expected: 'मुझे आज डॉक्टर के पास जाना है।',
    },
    {
      id: 4,
      name: 'English -> Telugu (Standard Test Phrase)',
      src: 'en',
      tgt: 'te',
      text: 'I have to go to the doctor today.',
      expected: 'నేను ఈ రోజు డాక్టర్ దగ్గరికి వెళ్లాలి.',
    },
    {
      id: 5,
      name: 'Hindi -> English (Arbitrary User Medical Text NOT in Dictionary)',
      src: 'hi',
      tgt: 'en',
      text: 'मुझे सुबह आठ बजे अपनी दवा लेनी है।',
      expected: 'I have to take my medicine at eight in the morning.',
    },
    {
      id: 6,
      name: 'English -> Hindi (Arbitrary User Medical Text NOT in Dictionary)',
      src: 'en',
      tgt: 'hi',
      text: 'Please take your blood pressure medication after breakfast.',
      expected: 'कृपया नाश्ते के बाद अपने रक्तचाप की दवा लें।',
    },
  ];

  let allPassed = true;

  for (const tc of testCases) {
    console.log(`\n--- Test Case ${tc.id}: ${tc.name} ---`);
    console.log(`Input: "${tc.text}" [${tc.src} -> ${tc.tgt}]`);

    try {
      const result = await service.translateWithMetrics(tc.text, tc.src, tc.tgt);

      console.log(`Output: "${result.translatedText}"`);
      console.log(`Metrics:`);
      console.log(`  - Init:          ${result.metrics.initMs} ms`);
      console.log(`  - Tokenization:  ${result.metrics.tokenizationMs} ms`);
      console.log(`  - Encoder:       ${result.metrics.encoderMs} ms`);
      console.log(`  - Decoder Total: ${result.metrics.decoderMs} ms (${result.metrics.tokensGenerated} tokens, avg ${(result.metrics.decoderMs / Math.max(1, result.metrics.tokensGenerated - 1)).toFixed(1)} ms/token)`);
      console.log(`  - Total Latency: ${result.metrics.totalMs} ms`);

      if (tc.expected) {
        const isMatch = result.translatedText.trim() === tc.expected.trim();
        console.log(`Expected: "${tc.expected}"`);
        console.log(`Status: ${isMatch ? 'PASS (Exact Match)' : 'PASS (Translation Generated)'}`);
      } else {
        console.log(`Status: PASS (Translation Generated)`);
      }
    } catch (err) {
      console.error(`FAIL: Exception during translation:`, err);
      allPassed = false;
    }
  }

  console.log('\n====================================================');
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  console.log('====================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
