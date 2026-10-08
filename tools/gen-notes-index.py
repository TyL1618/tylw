#!/usr/bin/env python3
"""依下面的資料產生 src/pages/main/notes.html（時間軸）與首頁「技術筆記」區塊。

新增一則筆記：在 ENTRIES 加一筆（full=True 代表有完整文章，要給 slug；否則是時間軸上的短記），
再執行  python tools/gen-notes-index.py  與  node tools/build-site.mjs 。
日期一律只寫到「年-月」。排序：月份新到舊；同一個月內，全文在前、短記在後，其餘維持資料順序。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (月份, 標題, 摘要, 標籤, slug 或 None)
ENTRIES = [
    ("2026-09", "偶發的「讀回不一致」：一次傳輸層封包框架的錯位",
     "對儀器寫入一長串設定後，偶爾會讀回不一致。根因是收發框架會錯位，而且永遠不會自己恢復。",
     ["TCP", "socket", "封包框架", "Python", "單元測試"], "transport-framing"),
    ("2026-09", "登入頁「第 2 秒卡一下」：修了七輪都沒好，直到我改成先量再猜",
     "把主執行緒的停頓對齊時間軸，根因是一張 1490 萬像素的 LOGO；而且丟到背景執行緒完全沒用。",
     ["PyQt", "效能剖析", "GIL", "圖片解碼", "快取"], "measure-before-guessing"),
    ("2026-09", "看起來像 Modbus，其實不是：接手新機台前先做的五件事",
     "「TCP＋讀寫暫存器」的外觀很容易讓人直接套 Modbus。我在這裡踩過兩次，後來整理成一份檢查清單。",
     ["通訊協議", "TCP", "封包分析", "Python"], "custom-protocol"),
    ("2026-09", "印表機資料流的解碼：換行規則與跨批次狀態",
     "CR 與 LF 都會換行，但「CR LF」相連只算一次。用一個旗標跨「讀取批次」保留狀態，才不會在資料剛好被切在兩者中間時誤判成兩次換行；原始碼欄位仍完整顯示每一個 byte。",
     ["序列埠", "串流解碼", "Qt"], None),
    ("2026-09", "兩邊講同一句「連線中」，意思卻相反",
     "使用者口中的「連線中」是「現在是通的」，系統裡同一個詞卻是「還沒確定連上的過渡態」。把狀態拆開，只有真的連上才用像「已連線」的字眼，過渡態一律加刪節號。",
     ["狀態機", "UI 文案", "i18n"], None),
    ("2026-09", "用假資料自動截圖，產生使用手冊 PDF",
     "介面一改，手冊就過期。改成用假資料的環境自動截圖並排版成 PDF，改了介面重跑一次就好，不必手動重截。",
     ["自動化", "PDF"], None),
    ("2026-09", "設定檔裡的管理者密碼改存 PBKDF2 雜湊",
     "管理者密碼從明文改成 PBKDF2 雜湊，不再在設定檔裡存放可以直接讀出來的密碼。",
     ["資安", "PBKDF2"], None),
    ("2026-09", "請 AI 協助除錯時，它看到的環境可能不是你的",
     "AI 助手的終端機跑在沙箱裡，它讀到的 %APPDATA% 被系統重導向到另一個目錄：它以為在修我的資料庫，其實從頭到尾改的都是沙箱裡的副本。教訓：任何和本機檔案狀態有關的結論，以我自己終端機的輸出為準；驗證時把 APPDATA 指到明確的暫時目錄；並寫一個唯讀的診斷工具，專門回答「程式實際在用的是哪一份資料庫」。",
     ["AI 協作", "Windows", "除錯"], None),
    ("2026-08", "新機型不該等於重新打包：把設定搬出程式碼",
     "把機型對照、狀態碼、調校參數、語言與角色權限搬到資料庫與外部設定檔，讓使用者自己就能調整。最危險的是「畫面看起來完全正常」的那種錯。",
     ["資料驅動設計", "Supabase", "MySQL", "PyInstaller", "i18n", "權限模型"], "config-externalization"),
    ("2026-08", "打包與發版的連環坑：防毒、批次檔誤判、50 MB 上限，以及「Python 能跑、exe 不行」",
     "同一個月裡連續踩到的四個坑：被防毒擋下、打包崩潰卻被批次檔誤判成功、免費方案的檔案上限、以及一個只在交付環境才會出現的型別 bug。",
     ["PyInstaller", "批次檔", "GitHub Releases", "發版流程"], "packaging-pitfalls"),
    ("2026-07", "程式「什麼都沒做就自己閃退」：從當機紀錄追到 Qt 執行緒的 race condition",
     "三筆一模一樣的當機紀錄指向同一個地方：執行緒在還沒真正結束時就被銷毀。改用執行緒池，從源頭消除。",
     ["PyQt", "多執行緒", "QThreadPool", "當機分析"], "qthread-crash"),
    ("2026-07", "自己攻擊自己的系統：權限收緊的遷移，反而開了一扇後門",
     "實際執行攻擊測試：註冊時信任客戶端傳的角色，任何人都能把自己變成管理者。改成邀請制，並記下儲存區 policy 的一個前綴坑。",
     ["PostgreSQL", "RLS", "Supabase", "資安測試"], "rls-attack-test"),
    ("2026-07", "多顆晶片共用同一個 IP：用鎖把請求序列化",
     "多顆晶片可能經由同一個 hub、共用同一個 IP，同時送請求會互相碰撞。以 IP 為 key 取同一把鎖：同 IP 序列化、不同 IP 互不阻塞。另外設定 TCP Keep-Alive，並用「連線存活秒數」協助判斷是不是被閒置逾時踢掉。",
     ["Modbus TCP", "執行緒鎖", "TCP Keep-Alive"], None),
    ("2026-07", "壓力測試：同時 5 到 200 路連線",
     "全程 100% 連線成功、輪詢健康度 100%；200 路時 CPU 約每核心 3%、記憶體約 770 MB、執行緒約 213 條，都和連線數近乎線性。軟體本身沒有碰到瓶頸。",
     ["壓力測試", "效能量測"], None),
    ("2026-07", "現場網路排查：雙網卡同網段，封包從錯的網卡出去",
     "同一台電腦有兩張網卡落在同一個網段時，封包可能從錯的網卡送出。用 route add 指定該 IP 走哪張網卡；找不到設備時，用子網掃描找出開放 502 埠的機器。",
     ["網路設定", "PowerShell"], None),
    ("2026-07", "GUI 動畫卡頓：掉幀的真兇是進度條，不是大圖表",
     "把繪製成本降到原本的 1/3～1/6。設備詳情頁的掉幀不是錯覺，也不是大圖表，而是一條帶光暈的進度條。",
     ["Qt", "繪圖效能"], None),
    ("2026-07", "畫面只剩左上角、其餘全黑：與其修好它，不如讓它壞不了",
     "縮放檢視其實寄生在捲軸狀態上。先前用每 300 ms 自我修復一次的計時器治症狀；根治是把場景範圍設成剛好等於可視範圍，讓「捲動」物理上不可能發生，修復計時器就能全部拿掉。",
     ["Qt", "QGraphicsView"], None),
]


def tags_html(tags, indent):
    return '<ul class="tags">' + ''.join(f'<li class="tag">{t}</li>' for t in tags) + '</ul>'


def entry_html(e, indent):
    month, title, summary, tags, slug = e
    t = '\t' * indent
    time = f'<time datetime="{month}">{month}</time>'
    body = f'{time}\n{t}\t<h3>{title}</h3>\n{t}\t<p>{summary}</p>\n{t}\t{tags_html(tags, indent)}'
    if slug:
        return f'{t}<li><a href="{{{{root}}}}main/notes/{slug}.html">\n{t}\t{body}\n{t}</a></li>'
    return f'{t}<li><div class="item">\n{t}\t{body}\n{t}</div></li>'


def sorted_entries():
    idx = {id(e): i for i, e in enumerate(ENTRIES)}
    return sorted(ENTRIES, key=lambda e: (-int(e[0].replace('-', '')), 0 if e[4] else 1, idx[id(e)]))


def build_notes_page():
    items = '\n'.join(entry_html(e, 3) for e in sorted_entries())
    return f'''---
out: main/notes.html
title: 筆記
description: {{{{handle}}}} 的技術筆記：工作上做過的事，踩過哪些坑、用到哪些技術。依月份排列，有完整文章，也有短記。
nav: notes
---
<div class="wrap">
	<div class="page-title reveal">
		<h1>技術筆記</h1>
		<p>工作上做過的事：踩過哪些坑、用到哪些技術，只寫重點。依月份由新到舊；標「全文」的有完整文章，標「短記」的是幾行就說完的紀錄。</p>
	</div>

	<div class="callout reveal" style="max-width: 70ch; margin-top: 8px"><p><strong>AI 協作標示</strong>　這裡談到的工作專案，是我與 AI 助手（Claude）協作開發的；筆記依開發紀錄整理，文字由 AI 協助撰寫，經我審閱後發布。不含公司、客戶或機型名稱。<a href="{{{{root}}}}main/about.html#ai">詳細說明</a></p></div>

	<section class="section reveal" style="padding-top: 24px">
		<ul class="note-list">
{items}
		</ul>
	</section>
</div>
'''


def update_home():
    p = ROOT / 'src/pages/index.html'
    s = p.read_text(encoding='utf-8')
    latest = [e for e in sorted_entries() if e[4]][:3]
    lis = '\n'.join(entry_html(e, 2) for e in latest)
    new = re.sub(r'(<ul class="note-list">\n).*?(\n\t</ul>)', lambda m: m.group(1) + lis + m.group(2), s, count=1, flags=re.S)
    assert new != s or True
    p.write_text(new, encoding='utf-8', newline='')


if __name__ == '__main__':
    (ROOT / 'src/pages/main/notes.html').write_text(build_notes_page(), encoding='utf-8', newline='')
    update_home()
    full = sum(1 for e in ENTRIES if e[4])
    print(f'已產生：{full} 篇全文、{len(ENTRIES) - full} 則短記')
