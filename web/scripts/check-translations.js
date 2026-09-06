const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const webRoot = path.resolve(__dirname, '..');
const transFile = path.join(webRoot, 'app/i18n/translations.ts');

console.log('🔍 Checking MitraCare Website Multilingual Architecture...\n');

// 1. Transpile translations.ts and load TRANSLATIONS
const transTs = fs.readFileSync(transFile, 'utf8');
const transJs = ts.transpileModule(transTs, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleObj = { exports: {} };
const evalFn = new Function('module', 'exports', 'require', transJs);
evalFn(moduleObj, moduleObj.exports, () => ({}));
const { TRANSLATIONS } = moduleObj.exports;

if (!TRANSLATIONS) {
  console.error('❌ Failed to load TRANSLATIONS object from translations.ts');
  process.exit(1);
}

const languages = Object.keys(TRANSLATIONS);
console.log(`✅ Loaded ${languages.length} languages: ${languages.join(', ')}`);

// Helper to flatten nested object into dot-notation paths
function getLeafPaths(obj, prefix = '') {
  let paths = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      paths = paths.concat(getLeafPaths(val, fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

function getNested(obj, pathStr) {
  const parts = pathStr.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return undefined;
    }
  }
  return curr;
}

const enKeys = getLeafPaths(TRANSLATIONS.en);
console.log(`✅ Reference dictionary (en) contains ${enKeys.length} translation keys.`);

// 2. Check translation completeness across all 23 languages
let dictionaryErrors = 0;
languages.forEach(lang => {
  const missing = [];
  enKeys.forEach(key => {
    const val = getNested(TRANSLATIONS[lang], key);
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Language [${lang}] is missing ${missing.length} keys:\n   - ` + missing.slice(0, 5).join('\n   - '));
    dictionaryErrors += missing.length;
  }
});

if (dictionaryErrors === 0) {
  console.log(`✅ All ${languages.length} languages have 100% complete translation dictionaries.\n`);
} else {
  console.error(`\n❌ Total missing keys in translation dictionaries: ${dictionaryErrors}`);
}

// 3. Scan app files for t() calls and verify they exist in dictionary
function getAllFiles(dir, ext = '.tsx', fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFiles(filePath, ext, fileList);
    } else if (file.endsWith(ext) || file.endsWith('.ts')) {
      // Exclude translation definitions themselves
      if (!filePath.includes('i18n') && !filePath.includes('node_modules') && !filePath.includes('.next')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const appFiles = getAllFiles(path.join(webRoot, 'app'));
console.log(`🔍 Scanning ${appFiles.length} application files for translation integrity...`);

let codeCallErrors = 0;
appFiles.forEach(file => {
  const relPath = path.relative(webRoot, file);
  const content = fs.readFileSync(file, 'utf8');
  const tRegex = /t\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    const enVal = getNested(TRANSLATIONS.en, key);
    if (!enVal) {
      console.error(`❌ ${relPath}: Translation key '${key}' does not exist in translations.ts!`);
      codeCallErrors++;
    }
  }
});

if (codeCallErrors === 0) {
  console.log(`✅ All t('key') calls in application code reference valid keys.\n`);
}

// 4. Hardcoded User-Facing JSX/TSX String Detection
console.log('🔍 Scanning for hardcoded user-facing JSX/TSX strings...');

const IGNORED_EXACT_STRINGS = new Set([
  'MitraCare',
  'MitraCare AI',
  'MITRACARE',
  'RTL',
  'LTR',
  '·', '•', '→', '←', '↑', '↓', '/', '|', '-', '+', '*', ':', '...', '©',
  '24/7', '99.9%', '100%', '100+', '10k+', '50k+', '150+',
  '••••••••••••'
]);

function isIgnoredOrTechnicalText(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (IGNORED_EXACT_STRINGS.has(trimmed)) return true;
  // Pure punctuation, numbers, math, and symbols (e.g. "© 2026", "24/7", "→", "/")
  if (/^[0-9\s\p{P}\p{S}]+$/u.test(trimmed)) return true;
  // Very short strings (1-2 chars) that are not words
  if (trimmed.length <= 2 && !/^[A-Za-z]{2}$/.test(trimmed)) return true;
  // Brand / copyright lines
  if (/^©\s*\d{4}.*MitraCare/i.test(trimmed)) return true;
  if (trimmed.replace(/MitraCare/gi, '').trim() === '') return true;
  // URLs and Email addresses
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return true;
  // Must contain English letters to be considered an English text string
  if (!/[a-zA-Z]/.test(trimmed)) return true;
  return false;
}

const userFacingProps = new Set(['placeholder', 'aria-label', 'title']);
let hardcodedStringErrors = 0;

// Scan website TSX files and internationalized components
const tsxFiles = appFiles.filter(f => {
  if (!f.endsWith('.tsx')) return false;
  // Always include public/website pages, shared components, and any file using useLanguage
  const rel = path.relative(webRoot, f).replace(/\\/g, '/');
  if (rel.startsWith('app/components') || rel === 'app/page.tsx' || rel.startsWith('app/login') || rel.startsWith('app/register') || rel.startsWith('app/forgot-password') || rel.startsWith('app/reset-password')) {
    return true;
  }
  const content = fs.readFileSync(f, 'utf8');
  return content.includes('useLanguage');
});

tsxFiles.forEach(file => {
  const relPath = path.relative(webRoot, file);
  const sourceText = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node) {
    // 1. Raw JSX Text nodes: <h2>New Healthcare Features</h2>, <button>Continue</button>, <p>Some text</p>
    if (ts.isJsxText(node)) {
      const text = node.text;
      if (!isIgnoredOrTechnicalText(text)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.error(`❌ [Hardcoded JSX Text] ${relPath}:${line + 1}:${character + 1}`);
        console.error(`   Found: "${text.trim()}"`);
        console.error(`   Fix:   Replace with {t("section.key")} from translations.ts\n`);
        hardcodedStringErrors++;
      }
    }

    // 2. User-facing JSX attributes: placeholder="Search...", aria-label="...", title="..."
    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.text;
      if (userFacingProps.has(attrName) && node.initializer && ts.isStringLiteral(node.initializer)) {
        const text = node.initializer.text;
        if (!isIgnoredOrTechnicalText(text)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          console.error(`❌ [Hardcoded Prop: ${attrName}] ${relPath}:${line + 1}:${character + 1}`);
          console.error(`   Found: ${attrName}="${text.trim()}"`);
          console.error(`   Fix:   Replace with ${attrName}={t("section.key")} from translations.ts\n`);
          hardcodedStringErrors++;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

if (hardcodedStringErrors === 0) {
  console.log(`✅ No hardcoded user-facing JSX/TSX strings detected.\n`);
}

// 5. Overall result
const totalErrors = dictionaryErrors + codeCallErrors + hardcodedStringErrors;
if (totalErrors === 0) {
  console.log('🎉 [PASS] Translation system is 100% consistent, complete, and verified across all 23 languages.');
  process.exit(0);
} else {
  console.error(`🚨 [FAIL] Found ${totalErrors} issue(s) (${dictionaryErrors} dictionary errors, ${codeCallErrors} missing keys, ${hardcodedStringErrors} hardcoded strings).`);
  console.error('   Please resolve all issues before committing.');
  process.exit(1);
}
