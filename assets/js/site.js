// 全站共用：手機選單開關、載入圈圈（取代原本只為這兩件事載入的 jQuery）
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.querySelector('.showmenu');
	if (btn) {
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			document.body.classList.toggle('menu-show');
		});
	}
});

window.addEventListener('load', () => {
	const loading = document.getElementById('loading');
	if (loading) loading.style.display = 'none';
});
