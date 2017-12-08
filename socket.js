var chatRooms = {};

module.exports = function(io){
    io.on('connection', function(socket){ // 웹소켓 연결 시
        console.log('Socket initiated!');
        
        socket.on('chat', function(data){ //클라이언트에서 chatToServer 이벤트 요청 시
            console.log('Socket : ' + data);
            var myRoomKey = Object.keys(chatRooms)[0];
            io.sockets.to(socket.rooms[myRoomKey]).emit('chat', data);
        });

        socket.on('login', function(data){
            if(chatRooms[data.country] == undefined){
                chatRooms[data.country] = [data.socketId];                
            }
            else{
                chatRooms[data.country].push(data.socketId);
            }
            socket.join(data.country);
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
            try{
                chatRooms[room].splice(index, 1);
                socket.leave(data.country);                
            }
            catch(exception){
                console.log(exception);
            }
        });
    });
};
