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
})();
