function createRoom() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        const roomId = generateRoomId();
        localStorage.setItem('username', username);
        localStorage.setItem('roomId', roomId);
        window.location.href = `room.html#${roomId}`;
    } else {
        alert('請輸入使用者名稱');
    }
}

function joinRoom() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        const roomId = prompt("請輸入房間號碼:");
        if (roomId) {
            localStorage.setItem('username', username);
            localStorage.setItem('roomId', roomId);
            window.location.href = `room.html#${roomId}`;
        }
    } else {
        alert('請輸入使用者名稱');
    }
}

function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
