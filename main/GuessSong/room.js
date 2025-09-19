const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const roomId = window.location.hash.substring(1);

    if (username && roomId) {
        socket.emit('joinRoom', { username, roomId });

        socket.on('updateRoomInfo', (roomInfo) => {
            // 更新房間信息，例如玩家列表等
            console.log('Room Info:', roomInfo);
        });

        // 其他你的邏輯...
    }
});
