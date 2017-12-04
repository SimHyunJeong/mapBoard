module.exports = (io) => {
    io.on('connection', (socket) => { // 웹소켓 연결 시
        console.log('Socket initiated!');
        socket.on('chatToServer', (data) => { //클라이언트에서 chatToServer 이벤트 요청 시
            console.log('Socket : ' + data);
            io.emit('chatToClient', data);
        });
    });
};
