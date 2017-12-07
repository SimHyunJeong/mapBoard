var chatRooms = {};

module.exports = function(io){
    io.on('connection', function(socket){ // 웹소켓 연결 시
        console.log('Socket initiated!');
        
        socket.on('chat', function(data){ //클라이언트에서 chatToServer 이벤트 요청 시
            console.log('Socket : ' + data);
            io.emit('chat', data);
        });

        socket.on('login', function(data){
            if(chatRooms[data.country] == undefined){
                chatRooms[data.country] = [data.socketId];                
            }
            else{
                chatRooms[data.country].push(data.socketId);
            }
        });

        socket.on('disconnect', function(){
            var index;
            var room;
            var rooms = Object.keys(chatRooms);

            for(var i = 0; i < rooms.length; i++){
                var members = chatRooms[rooms[i]];
                for(var j = 0; j < members.length; j++){
                    if(members[j] == socket.id){
                        index = j;
                        room = rooms[i];
                    }
                }
            }
            chatRooms[room].splice(index, 1);
        });
    });
};
