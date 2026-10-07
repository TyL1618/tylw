// 驗證 exam/exams/*.json，加密答案欄位，並重新產生 exam/exams/index.json
// 用法：node exam/tools/build.mjs               驗證 + 加密新考卷 + 產生 index.json
//       node exam/tools/build.mjs --check       只驗證，不寫任何檔案
//       node exam/tools/build.mjs --decode 0915 把已加密的考卷還原成明文，輸出到 exam/exams-plain/（不會被 git 提交）
//
// 加密只是輕度混淆（base64）：目的是讓學生打開 JSON 時不會直接看到明文答案，
// 不是真正的安全機制。答案、中譯、解析三個欄位會被收進一個 "secret" 欄位。
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const examRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const examsDir = join(examRoot, 'exams');
const plainDir = join(examRoot, 'exams-plain');
const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');

const CATEGORIES = ['單字', '片語', '文法'];
const EXAM_KEYS = ['id', 'title', 'scope', 'questionCount', 'shuffleQuestions', 'shuffleOptions', 'questions', 'secret'];
const Q_KEYS = ['id', 'category', 'sentence', 'options', 'answer', 'zh', 'note'];

/* ---------- 加密／解密 ---------- */

const b64encode = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
const b64decode = (s) => JSON.parse(Buffer.from(s, 'base64').toString('utf8'));

function encodeExam(exam) {
  const out = { id: exam.id, title: exam.title, scope: exam.scope, questionCount: exam.questionCount };
  for (const k of ['shuffleQuestions', 'shuffleOptions']) if (k in exam) out[k] = exam[k];
  out.questions = exam.questions.map((q) => {
    const o = { id: q.id };
    if ('category' in q) o.category = q.category;
    o.sentence = q.sentence;
    o.options = q.options;
    return o;
  });
  out.secret = b64encode(exam.questions.map((q) => ({ answer: q.answer, zh: q.zh, note: q.note })));
  return out;
}

// 把有 secret 的考卷還原成完整明文結構；失敗時丟出 Error
function decodeExam(exam) {
  const sec = b64decode(exam.secret);
  if (!Array.isArray(sec) || !Array.isArray(exam.questions) || sec.length !== exam.questions.length) {
    throw new Error('secret 內的題數與 questions 不符');
  }
  const out = { ...exam };
  delete out.secret;
  out.questions = exam.questions.map((q, i) => {
    const o = { id: q.id };
    if ('category' in q) o.category = q.category;
    o.sentence = q.sentence;
    o.options = q.options;
    o.answer = sec[i].answer;
    o.zh = sec[i].zh;
    o.note = sec[i].note;
    return o;
  });
  return out;
}

/* ---------- --decode <id> ---------- */

const di = argv.indexOf('--decode');
if (di !== -1) {
  const id = argv[di + 1];
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    console.error('用法：node exam/tools/build.mjs --decode <考卷id>');
    process.exit(1);
  }
  const src = join(examsDir, `${id}.json`);
  if (!existsSync(src)) {
    console.error(`找不到 ${src}`);
    process.exit(1);
  }
  const exam = JSON.parse(readFileSync(src, 'utf8'));
  const plain = 'secret' in exam ? decodeExam(exam) : exam;
  mkdirSync(plainDir, { recursive: true });
  const dest = join(plainDir, `${id}.json`);
  writeFileSync(dest, JSON.stringify(plain, null, 2) + '\n', 'utf8');
  console.log(`✓ 已還原成明文：${dest}`);
  console.log('  修改後把檔案複製回 exam/exams/ 覆蓋，再執行一次 build.mjs 即可重新加密。');
  process.exit(0);
}

/* ---------- 驗證 ---------- */

const errors = [];
const warnings = [];
const err = (file, where, msg) => errors.push(`${file}${where ? ` ${where}` : ''}：${msg}`);
const warn = (file, where, msg) => warnings.push(`${file}${where ? ` ${where}` : ''}：${msg}`);

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isInt = (v) => Number.isInteger(v);

function validDate(title) {
  const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(title);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

const files = readdirSync(examsDir)
  .filter((f) => f.endsWith('.json') && f !== 'index.json')
  .sort();

if (files.length === 0) err('exams/', '', '沒有找到任何考卷 JSON');

const entries = [];
const toEncrypt = []; // 目前還是明文的檔案
const seenIds = new Map();

for (const file of files) {
  let exam;
  try {
    exam = JSON.parse(readFileSync(join(examsDir, file), 'utf8'));
  } catch (e) {
    err(file, '', `不是合法的 JSON（${e.message}）`);
    continue;
  }
  if (exam === null || typeof exam !== 'object' || Array.isArray(exam)) {
    err(file, '', '最外層必須是物件');
    continue;
  }

  let wasEncrypted = false;
  if ('secret' in exam) {
    try {
      exam = decodeExam(exam);
      wasEncrypted = true;
    } catch (e) {
      err(file, '', `secret 解碼失敗（${e.message}）`);
      continue;
    }
  }

  for (const k of Object.keys(exam)) {
    if (!EXAM_KEYS.includes(k)) warn(file, '', `未知欄位 "${k}"（是不是打錯了？）`);
  }

  if (!isStr(exam.id) || !/^[A-Za-z0-9_-]+$/.test(exam.id)) {
    err(file, '', 'id 必須是只含英數、底線、連字號的字串');
  } else {
    if (exam.id + '.json' !== file) err(file, '', `id "${exam.id}" 必須和檔名一致（應為 ${exam.id}.json）`);
    if (seenIds.has(exam.id)) err(file, '', `id "${exam.id}" 與 ${seenIds.get(exam.id)} 重複`);
    else seenIds.set(exam.id, file);
  }
  if (!isStr(exam.title)) err(file, '', 'title 缺少或不是字串');
  else if (!validDate(exam.title)) err(file, '', `title 必須是日期格式 YYYY/MM/DD（目前是 "${exam.title}"）`);
  if (!isStr(exam.scope)) err(file, '', 'scope 缺少或不是字串');
  for (const k of ['shuffleQuestions', 'shuffleOptions']) {
    if (k in exam && typeof exam[k] !== 'boolean') err(file, '', `${k} 必須是 true 或 false`);
  }

  if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
    err(file, '', 'questions 必須是非空陣列');
    continue;
  }
  if (!isInt(exam.questionCount)) err(file, '', 'questionCount 缺少或不是整數');
  else if (exam.questionCount !== exam.questions.length) {
    err(file, '', `questionCount 是 ${exam.questionCount}，但實際有 ${exam.questions.length} 題`);
  }

  const seenQ = new Set();
  let withCat = 0;
  exam.questions.forEach((q, i) => {
    const where = `第 ${i + 1} 題`;
    if (q === null || typeof q !== 'object' || Array.isArray(q)) { err(file, where, '必須是物件'); return; }

    for (const k of Object.keys(q)) {
      if (!Q_KEYS.includes(k)) warn(file, where, `未知欄位 "${k}"`);
    }
    if (!isInt(q.id)) err(file, where, 'id 缺少或不是整數');
    else if (seenQ.has(q.id)) err(file, where, `題目 id ${q.id} 重複`);
    else seenQ.add(q.id);

    if ('category' in q) {
      withCat++;
      if (!CATEGORIES.includes(q.category)) err(file, where, `category 只能是 ${CATEGORIES.join('、')}（目前是 ${JSON.stringify(q.category)}）`);
    }

    if (!isStr(q.sentence)) err(file, where, 'sentence 缺少或不是字串');
    else {
      const runs = q.sentence.match(/_+/g) || [];
      const blanks = q.sentence.split('___').length - 1;
      if (runs.length !== 1 || runs[0] !== '___' || blanks !== 1) {
        err(file, where, `sentence 必須恰好有一個 "___"（目前底線片段：${runs.length ? runs.map((r) => `"${r}"`).join('、') : '無'}）`);
      }
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      err(file, where, `options 必須恰好 4 個（目前是 ${Array.isArray(q.options) ? q.options.length : '非陣列'} 個）`);
    } else {
      if (!q.options.every(isStr)) err(file, where, 'options 每一項都必須是非空字串');
      else if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) err(file, where, 'options 有重複的選項');
    }

    if (!isInt(q.answer) || q.answer < 0 || q.answer > 3) {
      err(file, where, `answer 必須是 0~3 的整數（目前是 ${JSON.stringify(q.answer)}）`);
    }
    if (!isStr(q.zh)) err(file, where, 'zh（中文翻譯）缺少或是空的');
    if (!isStr(q.note)) err(file, where, 'note（重點解析）缺少或是空的');
  });
  if (withCat !== 0 && withCat !== exam.questions.length) {
    warn(file, '', `只有 ${withCat}/${exam.questions.length} 題有 category；沒標的題目不會計入題型統計`);
  }

  if (isStr(exam.id) && isStr(exam.title) && isStr(exam.scope) && isInt(exam.questionCount)) {
    entries.push({
      id: exam.id,
      title: exam.title,
      scope: exam.scope,
      questionCount: exam.questionCount,
      file: `exams/${file}`
    });
  }
  if (!wasEncrypted) toEncrypt.push({ file, exam });
}

for (const w of warnings) console.warn(`⚠ ${w}`);

if (errors.length) {
  console.error(`\n✗ 發現 ${errors.length} 個問題，沒有更新 index.json、也沒有加密任何檔案：\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// 日期由新到舊；同一天的以 id 由大到小
entries.sort((a, b) => b.title.localeCompare(a.title) || b.id.localeCompare(a.id));

if (checkOnly) {
  console.log(`✓ ${entries.length} 份考卷驗證通過（--check：未寫入任何檔案）`);
  if (toEncrypt.length) {
    console.warn(`⚠ 尚未加密：${toEncrypt.map((x) => x.file).join('、')}（不加 --check 執行時會自動加密）`);
  }
} else {
  for (const { file, exam } of toEncrypt) {
    writeFileSync(join(examsDir, file), JSON.stringify(encodeExam(exam), null, 2) + '\n', 'utf8');
    console.log(`🔒 已加密 ${file}`);
  }
  writeFileSync(join(examsDir, 'index.json'), JSON.stringify({ exams: entries }, null, 2) + '\n', 'utf8');
  console.log(`✓ ${entries.length} 份考卷驗證通過，已更新 exams/index.json`);
  for (const e of entries) console.log(`  ${e.title}  ${e.id}  ${e.questionCount} 題  ${e.scope}`);
}
