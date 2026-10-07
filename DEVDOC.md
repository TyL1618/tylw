# DEVDOC

## 線上考卷系統（`exam/`）

高職英文選擇題考卷的自動批改網頁。純靜態（原生 HTML/CSS/JS，無建置步驟、無後端），
部署在 GitHub Pages 的 `/exam/`。與本站其他頁面完全獨立，沒有任何互相連結，也不共用 CSS/JS。

### 目錄結構

```
exam/
  index.html          單頁應用：首頁（考卷列表）＋考卷頁，用 URL hash 切換（#/、#/exam/1006）
  exam.css / exam.js
  exams/
    index.json        考卷清單 —— 由工具產生，不要手動編輯
    0915.json …       每份考卷一個檔案（答案欄位已加密）
  exams-plain/        明文備份，gitignore，只在本機
  assets/
    grammar-summary.pdf   首頁的「文法講義」
  tools/build.mjs     驗證所有考卷 JSON + 重新產生 exams/index.json（Node，無相依套件）
```

### 每週新增一份考卷

1. 用另一個對話產生新考卷 JSON（格式見下），存成 `exam/exams/<id>.json`，檔名必須等於 JSON 裡的 `id`（例如 `1013.json`）。
2. 在 repo 根目錄執行：

   ```bash
   node exam/tools/build.mjs
   ```

   - 驗證通過：自動重新產生 `exam/exams/index.json`（日期由新到舊），並把新考卷的**答案、中譯、解析加密**（見下方「答案加密」）。
   - 有問題：列出「哪一份、第幾題、什麼錯誤」，且**不會**更新 index.json、也不會加密；修正後再跑一次。
   - 只想檢查不寫檔：`node exam/tools/build.mjs --check`
3. 本機預覽（`fetch` 讀 JSON，所以不能直接雙擊 html）：

   ```bash
   python -m http.server 8765 --directory exam
   ```

   開 <http://127.0.0.1:8765/>。
4. 確認沒問題後 commit、push，GitHub Pages 會自動更新。**網址是 `/exam/`**；Pages 若尚未啟用，到 repo 的 Settings → Pages 選 `master` 分支、根目錄。
   **一定要先跑過第 2 步再 commit**，否則明文答案會進到公開的 git 歷史。建議直接用這條一次做完：

   ```bash
   cd /d "C:\Users\tyl16\Documents\Private\tylw\tylw" && node exam\tools\build.mjs && git add exam && git commit -m "Add weekly exam" && git push
   ```

### 答案加密

- `answer`、`zh`、`note` 三個欄位會被收進考卷檔的 `secret` 欄位（base64），網頁載入後才還原。學生直接開 `exams/xxxx.json` 看不到明文答案。
- 這只是**輕度混淆**，不是真正的安全機制：懂技術的人還是能解開。
- 工具會自動判斷：明文檔就加密，已加密的檔案不會重複處理，所以重跑是安全的。
- 明文備份放在 `exam/exams-plain/`（已加入 `.gitignore`，只在本機，**絕不可提交**）。
- 要修改已加密的考卷：
  1. `node exam/tools/build.mjs --decode 0915` → 明文輸出到 `exam/exams-plain/0915.json`
  2. 修改後複製回 `exam/exams/0915.json` 覆蓋
  3. 再跑一次 `node exam/tools/build.mjs`，會重新加密
- 新考卷產生後，建議自己把明文也留一份在 `exam/exams-plain/`，之後要改比較方便。

### 考卷 JSON 格式

```json
{
  "id": "1006",
  "title": "2026/10/06",
  "scope": "綜合複習：單字・片語・文法",
  "questionCount": 56,
  "shuffleQuestions": false,
  "shuffleOptions": false,
  "questions": [
    {
      "id": 1,
      "category": "單字",
      "sentence": "The school was ___ in 1950 by a group of local teachers.",
      "options": ["established", "proved", "entertained", "exposed"],
      "answer": 0,
      "zh": "這所學校是在 1950 年由一群當地的老師創立的。",
      "note": "establish（vt. 創立；建立，SYN found）；本句為被動語態…"
    }
  ]
}
```

| 欄位 | 規則 |
|---|---|
| `id` | 只含英數／底線／連字號，等於檔名（慣例用 `MMDD`） |
| `title` | **日期，格式 `YYYY/MM/DD`**（網頁直接用它當標題與排序依據） |
| `scope` | 考試範圍，顯示在列表與考卷頁首 |
| `questionCount` | 必須等於 `questions` 的實際題數 |
| `shuffleQuestions` / `shuffleOptions` | 選填，預設 `false`；`true` 時每次開始作答會打散 |
| `category` | 選填，只能是 `單字`／`片語`／`文法`。整份都沒有就不顯示題型統計 |
| `sentence` | 恰好一個 `___`（三個底線） |
| `options` | 恰好 4 個、不可重複，顯示為 A/B/C/D |
| `answer` | 正確選項的索引 0~3 |
| `zh` / `note` | 中文翻譯／重點解析，不可空白 |

### 行為摘要

- 每題都選了之後「交卷」按鈕才會亮起；底部顯示進度，並列出還沒寫的題號（可點擊跳轉）。
- 交卷後留在原考卷頁：最上方顯示分數、各題型答對率與**答錯題號**（點號碼跳到該題）；
  每題標示對錯、正確答案、中譯與解析；可切換「只看錯題」、「重做一次」。
- 沒有後端、不存成績；重新整理就是重新開始。
- 基本防護（純前端，只擋一般操作）：頁面標記不可翻譯（`translate="no"`）、禁止選取文字、禁止右鍵／複製／剪下／拖曳／列印，並擋掉 Ctrl+C/A/S/P/U、F12 與開發者工具快捷鍵。手機截圖、拍照翻譯、關閉 JavaScript 等擋不住。

### 從 PDF 轉 JSON 的注意事項（舊考卷轉檔經驗）

- `pdftotext` 會把這些 PDF 的中文全部丟掉，要用 PyMuPDF（`fitz`）抽文字。
- 0915 的 PDF 用了部首相容字（⽂、⽚、⼈…），需正規化成一般漢字，但**不能**對整份文字做 NFKC（會把全形標點變半形）。
- 空格在 PDF 裡是連續空白字元，不是底線；落在句首或換行處時要特別檢查。
- PDF 的換行有時會切在英文單字中間（如 `re` / `quested`），接行後要人工確認。
