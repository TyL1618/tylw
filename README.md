# tylw

個人網站：作品、技術筆記、關於與聯絡。

線上網址：<https://tyl1618.github.io/tylw/>

純靜態網頁，沒有後端、沒有追蹤、沒有外部資源。頁面由 `src/` 經 `node tools/build-site.mjs` 產生（零相依，Node 18+）；本機預覽用任一靜態伺服器，例如：

```bash
python -m http.server 8000
```

開發細節（目錄結構、怎麼新增作品／筆記、設計決策、考卷系統）見 [DEVDOC.md](DEVDOC.md)。
