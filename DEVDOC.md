# DEVDOC

## 個人網站（根目錄、`main/`）

純靜態網站，部署在 GitHub Pages：<https://tyl1618.github.io/tylw/>。**沒有外部資源**（不用 CDN、字型、圖示套件），所有頁面共用一份設計系統。
`exam/` 是獨立的線上考卷系統（見下一節），刻意不連到個人網站，個人網站也不要連過去或提到它。

### 怎麼改：改 `src/`，再執行建置

網頁的共用部分（`<head>`、頁首、頁尾）由一個零相依的小腳本產生，**輸出的 HTML 要一起 commit**（GitHub Pages 直接提供）。

```bash
node tools/build-site.mjs           # 依 src/ 產生所有頁面 + sitemap.xml + robots.txt
node tools/build-site.mjs --check   # 不寫檔：輸出是否最新、所有本地連結／圖片是否存在
```

```
src/
  layout.html            全站共用的 <head>、頁首、頁尾（SEO／分享預覽的 meta 都在這裡）
  partials/*.html        可重複使用的片段，用 {{> 名稱}} 引用（SVG 圖示、軌道動畫、作品卡片）
  pages/**/*.html        每頁一個檔案：最上面 front matter（out、title、description、nav、css、js…），後面是內容
tools/build-site.mjs     建置腳本，front matter 欄位說明寫在檔案開頭
```

- `{{root}}` 會被換成「該頁到網站根目錄」的相對路徑，所以頁面之間一律用相對路徑，本機預覽與線上行為一致。
- **不要直接改輸出的 HTML**（`index.html`、`main/*.html`、`main/notes/*`、`main/works/*.html` 等），下次建置會被蓋掉。
- `main/course-team-code.html` 不在建置範圍內：大學課程與同學合作的程式碼，紀念用，沒有任何連結指向它。

### 目錄結構（輸出）

```
index.html                 首頁
404.html  sitemap.xml  robots.txt
assets/                    全站共用素材
  css/site.css             設計系統：顏色／字型／間距都是 :root 變數，自動跟隨系統深淺色
  js/site.js               捲動進場動畫、Email 組裝（不依賴任何套件）
  img/                     favicon.svg、icon-32.png、apple-touch-icon.png、og-image.png（分享預覽圖）
    about/                 大頭照（webp）
    works/                 作品縮圖（webp，960x600）
main/
  works.html  notes.html  about.html  contact.html
  notes/                   技術筆記（一篇一個檔案）
  works/
    gs-search.html         臺灣研究所資料檢索系統
    s-des.html             S-DES 加解密（仍用 jQuery 3.7.1，自行託管；演算法檔 S_DES_.js 是課堂作業原樣）
    assets/css|js/         這兩個頁面專用的樣式與腳本
    blackjack/             二十一點（BlackJack.html 一般模式、cheat.html 作弊模式）
      assets/css/js/img/   遊戲樣式、BJ.js／BJcheat.js、撲克牌（webp，JS 以 ./assets/img/cards/XX.webp 動態引用）
exam/                      線上考卷系統（自成一格）
```

### 常見工作

- **訪客統計（Cloudflare Web Analytics，匿名、不用 cookie）**：把 token 填進 `tools/build-site.mjs` 最上面的 `CF_ANALYTICS_TOKEN` 再建置，所有頁面就會載入統計（頁尾不放任何說明）；留空則不載入。token 在 Cloudflare 後台 → Analytics & Logs → Web Analytics 取得。數字只能當粗略參考（廣告攔截器會擋掉一部分）。

- **筆記只放業界做過的事，只寫重點**：踩過哪些坑、用到哪些技術。大學作業不放筆記（它們只在作品頁）。不寫公司、客戶、機型名稱，也不寫任何特定機台的實際封包或內部細節；**不寫牽涉對方公司行為的內容**；範例程式碼一律是示意用的。每篇文章要標出「用到的技術」標籤。建議結構：症狀／情境（通用化）→ 根因或踩過的坑 → 做法 → 結果 → 帶走的幾件事。
- **日期只寫到月份**（例如 `2026-09`），不寫到日。
- **AI 協作要明確標示**：只在筆記範圍內：每篇文章開頭用 `{{> ai-note}}`（一小行「Claude 協作 / CoDev with Claude」），筆記頁頂端同一句。**頁尾與關於頁都不放**（使用者明確說過 AI 協作只在筆記內提到就好，頁尾只留 © 與名稱）。大學時期的作品與最初版網站是手寫的，沒有 AI。
- **筆記是時間軸**：全文（有完整文章）與短記（幾行就說完）依月份由新到舊混排。清單與首頁的「技術筆記」區塊由 `tools/gen-notes-index.py` 依裡面的 `ENTRIES` 資料產生。
- **新增筆記**：①（全文才需要）複製 `src/pages/main/notes/` 裡一篇，改 front matter 與內容；②在 `tools/gen-notes-index.py` 的 `ENTRIES` 加一筆（全文給 slug，短記給 `None`）；③依序執行 `python tools/gen-notes-index.py` 與 `node tools/build-site.mjs`。
- **作品頁分兩區，用切換鈕「近期作品／過去作品」一次顯示一區**（淡出再淡入約 0.4 秒；支援方向鍵與網址 `#past`；沒有 JS 時兩區上下排列）。邏輯在 `site.js` 的 `data-tabs` 區塊。近期作品（TaiexRider、SecureChat、NeonSweep、UFO Duel、CyberMind）與過去作品（學生時期）。有與 Claude 協作的專案，卡片上有一行小字 `Co-developed with Claude`；早期無 AI 的作品不標。TaiexRider 只連 Google Play（不連網頁版、不連原始碼）。UFO Duel、CyberMind 連 Cloudflare Workers 上的線上版（`*.tyl161803.workers.dev`）。UFO Duel 的連線對戰依賴 Supabase，免費專案閒置會被暫停；單機模式不受影響。
- **新增作品**：在 `assets/img/works/` 放一張 960x600 的 webp 縮圖，在 `src/partials/` 新增 `card-xxx.html`，到 `works.html`（和首頁）引用，建置。
- **改色／字型／間距**：只動 `assets/css/site.css` 最上面的 `:root` 變數。
- **二十一點的遊戲邏輯只靠元素 ID**，改版面時 ID 與 `onclick` 要保留。

### 設計決策

- **雙語標題**：關於頁完整雙語（標題、簡介英文版、學歷、技能分類與標籤）；作品、技術筆記、聯絡與首頁區塊的標題也附英文，寫法是 `中文 <span class="en" lang="en">/ English</span>`。長篇技術筆記文章維持中文。網站上**不放中文全名**，只用羅馬拼音（`build-site.mjs` 的 `REAL_NAME`），也不寫「網路上用 TyL」這類說明。

- 深色為主、單一強調色（`#55d6aa`）、系統字型、克制的動態；支援 `prefers-color-scheme` 與 `prefers-reduced-motion`（捲動進場動畫在該設定下停用）。
- 手機版（≤560px）導覽列收成右上角漢堡選單（`.nav-toggle`，site.js 第 0 區）；沒有 JS 時退回一列直接顯示。
- 首頁太陽系（`src/partials/orbits.html` + `assets/js/site.js` 第 3 區）是 SVG 傾斜橢圓＋requestAnimationFrame：行星週期 6.8／17.3／28／52.7 秒，繞到近端變大變亮、繞到太陽後方被遮擋。**刻意不理會 `prefers-reduced-motion`**（使用者的 Windows 關閉了動畫，若遵守就永遠是靜止的），改以右下角暫停鈕滿足 WCAG 2.2.2（選擇存在 localStorage `solar-paused`）；離開畫面或分頁隱藏時自動停止。想改成遵守系統設定：在 `site.js` 初始化處，系統為 reduce 時預設 `setPaused(true, false)`。
- Email 不直接寫在 HTML，由 `site.js` 載入後組出來（擋一般爬蟲）。點 Email 會複製信箱並短暫顯示「已複製」（因為有些電腦沒設定郵件程式，mailto 會沒反應；全站又擋了複製與右鍵），聯絡頁另有「用 Gmail 網頁寫信」連結，網址同樣由 JS 組出。
- 圖片一律 WebP，並標上寬高避免版面跳動；縮圖用 `loading="lazy"`。

---

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
   cd /d "C:\Users\tyl16\Documents\Private\tylw" && node exam\tools\build.mjs && git add exam && git commit -m "Add weekly exam" && git push
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
