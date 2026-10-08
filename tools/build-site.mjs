#!/usr/bin/env node
// 個人網站的靜態頁面產生器（零相依，Node 18+）
//
//   node tools/build-site.mjs           產生所有頁面、sitemap.xml、robots.txt
//   node tools/build-site.mjs --check   不寫檔：確認輸出是最新的，並檢查所有本地連結／圖片都存在
//
// 來源在 src/：
//   layout.html          全站共用的 <head>、頁首、頁尾
//   partials/*.html      可重複使用的片段（用 {{> 名稱}} 引用，例如 SVG 圖示）
//   pages/**/*.html      每頁一個檔案：最上面是 front matter（--- 包起來的 key: value），後面是頁面內容
// 輸出：依 front matter 的 out 寫到 repo 內對應位置（輸出的 HTML 要一起 commit，GitHub Pages 直接提供）。
//
// front matter 欄位：
//   out          輸出路徑（必填，例如 main/about.html）
//   title        頁面標題（會自動加上「 — 網路代號」；首頁用 title_full 覆寫）
//   （front matter 與內容裡可用 {{handle}}＝網路代號、{{real_name}}＝本名（只用羅馬拼音，不放中文全名））
//   description  給搜尋引擎與分享預覽用的一句話
//   nav          導覽列要標示哪一項：works | notes | about | contact | none
//   css / js     額外載入的樣式／腳本，逗號分隔，路徑相對於「輸出檔」
//   body_class   <body> 的 class
//   sitemap      false 則不放進 sitemap
//   root         覆寫 {{root}}（404 頁用，因為它可能在任何路徑被開啟）

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const BASE_URL = 'https://tyl1618.github.io/tylw/';
// 網站對外的名稱只改這裡。HANDLE 是網路代號（頁首、標題、頁尾都用它）；本名只在「關於」頁出現。
const HANDLE = 'TyL';
const REAL_NAME = 'Yun Long Tsai';
const SITE = HANDLE;
const OG_IMAGE = 'assets/img/og-image.png';
// Cloudflare Web Analytics 的 token（匿名、不使用 cookie）。留空就不載入統計。頁尾不放任何說明（使用者決定）。
const CF_ANALYTICS_TOKEN = 'ed0323b6706c4dc79fd3122a069a953c';
const CHECK = process.argv.includes('--check');

const NAV = [
	['works', 'main/works.html', 'Works'],
	['notes', 'main/notes.html', 'Notes'],
	['about', 'main/about.html', 'About'],
	['contact', 'main/contact.html', 'Contact'],
];

const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function walk(dir) {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

function parsePage(file) {
	const raw = read(file);
	const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) throw new Error(`${relative(ROOT, file)}: 缺少 front matter`);
	const meta = {};
	for (const line of m[1].split('\n')) {
		const i = line.indexOf(':');
		if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
	}
	if (!meta.out) throw new Error(`${relative(ROOT, file)}: front matter 缺少 out`);
	return { meta, content: m[2], src: relative(ROOT, file) };
}

const partials = {};
for (const f of walk(join(SRC, 'partials'))) partials[f.split(/[\\/]/).pop().replace(/\.html$/, '')] = read(f).trim();

const layout = read(join(SRC, 'layout.html'));

function includePartials(html, where) {
	return html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
		if (!(name in partials)) throw new Error(`${where}: 找不到 partial「${name}」`);
		return partials[name];
	});
}

function render({ meta, content, src }) {
	const out = meta.out;
	const depth = posix.dirname(out) === '.' ? 0 : posix.dirname(out).split('/').length;
	const root = meta.root ?? (depth === 0 ? './' : '../'.repeat(depth));
	const url = BASE_URL + (out === 'index.html' ? '' : out);
	const fill = (s) => String(s ?? '').replaceAll('{{handle}}', HANDLE).replaceAll('{{real_name}}', REAL_NAME);
	const title = fill(meta.title_full ?? `${meta.title} — ${SITE}`);
	const nav = NAV.map(([key, path, label]) =>
		`<a href="${root}${path}"${meta.nav === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
	const head = [
		...(meta.css ? meta.css.split(',').map((s) => `<link rel="stylesheet" href="${s.trim()}">`) : []),
	].join('\n');
	const scripts = (meta.js ? meta.js.split(',').map((s) => `<script src="${s.trim()}"></script>`) : []).join('\n');

	const vars = {
		title: esc(title), description: esc(fill(meta.description)), canonical: url, handle: HANDLE, real_name: REAL_NAME,
		og_image: BASE_URL + OG_IMAGE, root, base: BASE_URL, nav, head, scripts,
		body_class: meta.body_class ?? '', site: SITE,
		analytics: CF_ANALYTICS_TOKEN
			? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${CF_ANALYTICS_TOKEN}"}'></script>` : '',
	};
	let html = layout.replace('{{content}}', () => fill(includePartials(content, src).trim()));
	html = includePartials(html, 'layout.html');
	html = html.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in vars ? vars[k] : all));
	const left = html.match(/\{\{[^}]*\}\}/);
	if (left) throw new Error(`${src}: 有未替換的變數 ${left[0]}`);
	return { out, html: html.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim() + '\n', meta, url };
}

// ---- 產生所有輸出 ----
const pages = walk(join(SRC, 'pages')).filter((f) => f.endsWith('.html')).map(parsePage).map(render);
const outs = new Map(pages.map((p) => [p.out, p.html]));

const sitemapUrls = pages.filter((p) => p.meta.sitemap !== 'false').map((p) => p.url).sort();
outs.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
	sitemapUrls.map((u) => `\t<url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
outs.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}sitemap.xml\n`);

// ---- 檢查本地連結 ----
function checkLinks() {
	const problems = [];
	for (const p of pages) {
		const baseDir = p.meta.root ? ROOT : dirname(join(ROOT, p.out));
		const refs = [...p.html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
		for (const r of new Set(refs)) {
			if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(r) || r === '') continue;
			let target = r.split('#')[0].split('?')[0];
			if (!target) continue;
			target = target.startsWith('/tylw/') ? join(ROOT, target.slice(6)) : resolve(baseDir, target);
			if (!existsSync(target) || (statSync(target).isDirectory() && !existsSync(join(target, 'index.html')))) {
				problems.push(`${p.out}: 找不到 ${r}`);
			}
		}
	}
	return problems;
}

if (CHECK) {
	const stale = [];
	for (const [out, html] of outs) {
		const f = join(ROOT, out);
		if (!existsSync(f) || read(f) !== html) stale.push(out);
	}
	const broken = checkLinks();
	if (stale.length) console.error('✗ 以下檔案不是最新的（請執行 node tools/build-site.mjs）：\n  ' + stale.join('\n  '));
	if (broken.length) console.error('✗ 壞掉的本地連結／資源：\n  ' + broken.join('\n  '));
	if (stale.length || broken.length) process.exit(1);
	console.log(`✓ ${pages.length} 個頁面皆為最新，${outs.size} 個輸出檔，本地連結全部有效`);
} else {
	for (const [out, html] of outs) {
		const f = join(ROOT, out);
		mkdirSync(dirname(f), { recursive: true });
		writeFileSync(f, html);
	}
	const broken = checkLinks();
	console.log(`已產生 ${pages.length} 個頁面 + sitemap.xml + robots.txt`);
	if (broken.length) { console.error('⚠ 壞掉的本地連結／資源：\n  ' + broken.join('\n  ')); process.exitCode = 1; }
}
