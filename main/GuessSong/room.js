document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const roomId = window.location.hash.substring(1);
    
    if (username && roomId) {
        document.getElementById('room-id-title').textContent = `房間號碼: ${roomId}`;
    
        const playerList = document.getElementById('player-list');
        const listItem = document.createElement('li');
        listItem.textContent = `${username} - 0 分`;
        playerList.appendChild(listItem);
    } else {
        alert('錯誤: 房間號或使用者名稱缺失');
        window.location.href = 'index.html';
    }
});
