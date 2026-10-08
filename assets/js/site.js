// 全站共用腳本（無相依套件）
(() => {
	// -1. 不給右鍵、複製、選取、拖曳（圖片也不能另存）；輸入欄位例外，才能輸入與貼上。
	//     這只能擋一般操作，擋不了檢視原始碼或截圖。
	const inField = (e) => e.target instanceof Element && !!e.target.closest('input, textarea, select');
	['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach((type) => {
		document.addEventListener(type, (e) => { if (!inField(e)) e.preventDefault(); });
	});

	// -0. 作品頁「近期／過去」切換：淡出目前這區、淡入另一區；支援方向鍵與網址 #past
	const tabs = document.querySelector('[data-tabs]');
	const stage = document.querySelector('[data-tab-stage]');
	if (tabs && stage) {
		const btns = Array.from(tabs.querySelectorAll('[role="tab"]'));
		const panelOf = (b) => document.getElementById(b.getAttribute('aria-controls'));
		let current = btns[0];
		let busy = false;
		btns.forEach((b) => { if (b !== current) panelOf(b).hidden = true; });
		const select = (btn, animate) => {
			if (btn === current || busy) return;
			const from = panelOf(current), to = panelOf(btn);
			btns.forEach((b) => { b.setAttribute('aria-selected', String(b === btn)); b.tabIndex = b === btn ? 0 : -1; });
			current = btn;
			try { history.replaceState(null, '', btn.id === 'tab-past' ? '#past' : location.pathname + location.search); } catch (e) { /* ignore */ }
			if (!animate) { from.hidden = true; to.hidden = false; return; }
			busy = true;
			stage.style.minHeight = stage.offsetHeight + 'px'; // 切換中先撐住高度，頁尾不會跳動
			from.classList.add('is-fading');
			setTimeout(() => {
				from.hidden = true; from.classList.remove('is-fading');
				to.classList.add('is-fading'); to.hidden = false;
				void to.offsetWidth;
				to.classList.remove('is-fading');
				setTimeout(() => { stage.style.minHeight = ''; busy = false; }, 240);
			}, 220);
		};
		btns.forEach((b, i) => {
			b.addEventListener('click', () => select(b, true));
			b.addEventListener('keydown', (e) => {
				const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key];
				if (n === undefined) return;
				e.preventDefault();
				const t = btns[(n + btns.length) % btns.length];
				t.focus(); select(t, true);
			});
		});
		if (location.hash === '#past') select(btns[1], false);
	}

	// -2. 預先載入：滑鼠移到（或手指碰到、鍵盤聚焦）站內連結時，先把那一頁抓進快取，點下去就幾乎瞬間換頁
	const prefetched = new Set();
	const prefetch = (e) => {
		const a = e.target instanceof Element && e.target.closest('a[href]');
		if (!a || a.target === '_blank' || a.origin !== location.origin || /^(mailto|tel):/.test(a.href)) return;
		const url = a.href.split('#')[0];
		if (url === location.href.split('#')[0] || prefetched.has(url) || /\/exam\//.test(url)) return;
		prefetched.add(url);
		const l = document.createElement('link');
		l.rel = 'prefetch'; l.href = url;
		document.head.appendChild(l);
	};
	document.addEventListener('pointerover', prefetch, { passive: true });
	document.addEventListener('touchstart', prefetch, { passive: true });
	document.addEventListener('focusin', prefetch);

	// 0. 手機版漢堡選單：點按鈕開關；點選項、按 Esc、點選單外面、放大到桌機寬度都會收起
	const navBtn = document.querySelector('.nav-toggle');
	const nav = document.getElementById('site-nav');
	if (navBtn && nav) {
		const setNav = (open) => {
			nav.classList.toggle('open', open);
			navBtn.setAttribute('aria-expanded', String(open));
			navBtn.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
		};
		navBtn.addEventListener('click', () => setNav(!nav.classList.contains('open')));
		nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); navBtn.focus(); }
		});
		document.addEventListener('click', (e) => {
			if (nav.classList.contains('open') && !nav.contains(e.target) && !navBtn.contains(e.target)) setNav(false);
		});
		window.matchMedia('(min-width: 561px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });
	}

	// 1. 捲動進場：沒有 IntersectionObserver 或偏好減少動態時，直接全部顯示
	const items = document.querySelectorAll('.reveal');
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (items.length && 'IntersectionObserver' in window && !reduce) {
		const io = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach((el) => io.observe(el));
	} else {
		items.forEach((el) => el.classList.add('in'));
	}

	// 2. Email 不直接寫在 HTML 裡，載入後才組出來（擋一般的爬蟲）
	document.querySelectorAll('[data-user][data-domain]').forEach((el) => {
		const addr = `${el.dataset.user}@${el.dataset.domain}`;
		if (el.tagName === 'A') el.href = `mailto:${addr}`;
		const label = el.querySelector('[data-mail-text]') || (el.children.length ? null : el);
		if (label) label.textContent = addr;
		// 有些電腦沒設定郵件程式，點 mailto 會沒反應：點的時候順便複製信箱，並在原處短暫顯示「已複製」
		if (el.tagName === 'A' && el.querySelector('[data-mail-text]') && navigator.clipboard) {
			el.addEventListener('click', () => {
				navigator.clipboard.writeText(addr).then(() => {
					const t = el.querySelector('[data-mail-text]');
					t.textContent = '已複製 / Copied';
					setTimeout(() => { t.textContent = addr; }, 1600);
				}, () => { /* 複製失敗就維持原狀 */ });
			});
		}
	});
	// Gmail 網頁版寫信連結（同樣由 JS 組出網址，不直接寫在 HTML）
	const first = document.querySelector('[data-user][data-domain]');
	document.querySelectorAll('[data-gmail]').forEach((el) => {
		if (first) el.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(`${first.dataset.user}@${first.dataset.domain}`)}`;
	});
	// 3. 傾斜的太陽系（首頁裝飾）：橢圓軌道、行星依真實公轉週期比例運行、近大遠小，
	//    繞到太陽後方會被遮住。預設就會動；右下角有暫停按鈕（記在這個瀏覽器），
	//    離開畫面或切到別的分頁時自動停止，不耗電。
	const solar = document.querySelector('[data-solar]');
	if (solar) {
		const NS = 'http://www.w3.org/2000/svg';
		const back = solar.querySelector('.solar-back');
		const front = solar.querySelector('.solar-front');
		const toggle = solar.querySelector('.solar-toggle');
		const K = 0.38; // 軌道扁度：短軸 / 長軸
		// 長軸半徑、星球半徑、公轉週期（秒；以地球 28 秒為基準，其餘依真實比例）、起始角度
		const planets = [
			{ rx: 52,  r: 3.4, T: 6.8,  a0: 0.9 },  // 水星（88 天）
			{ rx: 84,  r: 4.8, T: 17.3, a0: 2.7 },  // 金星（225 天）
			{ rx: 120, r: 5.4, T: 28,   a0: 4.4 },  // 地球（365 天）
			{ rx: 160, r: 4.2, T: 52.7, a0: 5.7 },  // 火星（687 天）
		].map((p) => {
			const el = document.createElementNS(NS, 'circle');
			el.setAttribute('class', 'solar-planet');
			return { ...p, el, inFront: null };
		});

		let t = 0, last = null, raf = 0, onScreen = true, paused = false;

		const draw = () => {
			for (const p of planets) {
				const th = p.a0 + (Math.PI * 2 * t) / p.T;
				const near = Math.sin(th); // -1 在遠端 … 1 在近端
				p.el.setAttribute('cx', (p.rx * Math.cos(th)).toFixed(2));
				p.el.setAttribute('cy', (p.rx * K * near).toFixed(2));
				p.el.setAttribute('r', (p.r * (1 + 0.28 * near)).toFixed(2));
				p.el.setAttribute('opacity', (0.62 + 0.38 * (near + 1) / 2).toFixed(2));
				const isFront = near > 0;
				if (isFront !== p.inFront) { (isFront ? front : back).appendChild(p.el); p.inFront = isFront; }
			}
		};

		const frame = (now) => {
			raf = 0;
			if (paused || !onScreen || document.hidden) { last = null; return; }
			if (last !== null) t += Math.min((now - last) / 1000, 0.1);
			last = now;
			draw();
			raf = requestAnimationFrame(frame);
		};
		const kick = () => {
			if (!raf && !paused && onScreen && !document.hidden) { last = null; raf = requestAnimationFrame(frame); }
		};

		const setPaused = (v, save) => {
			paused = v;
			toggle.setAttribute('aria-pressed', v ? 'true' : 'false');
			toggle.setAttribute('aria-label', v ? '播放軌道動畫' : '暫停軌道動畫');
			if (save) { try { localStorage.setItem('solar-paused', v ? '1' : '0'); } catch (e) { /* 無痕模式等 */ } }
			if (!v) kick();
		};

		let saved = null;
		try { saved = localStorage.getItem('solar-paused'); } catch (e) { /* ignore */ }
		toggle.addEventListener('click', () => setPaused(!paused, true));
		setPaused(saved === '1', false);
		draw();
		if ('IntersectionObserver' in window) {
			new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; kick(); }).observe(solar);
		}
		document.addEventListener('visibilitychange', kick);
		kick();
	}
})();
