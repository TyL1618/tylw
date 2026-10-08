// 全站共用腳本（無相依套件）
(() => {
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
