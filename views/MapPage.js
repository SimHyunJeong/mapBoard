$('#show-sidebar').click(function(){
    $('.ui.sidebar').sidebar('toggle');
});

// 기본 뷰 대한민국
//var map = L.map('map').setView([36.5, 127.5], 7);
var map = L.map('map').setView([0, 0], 1);

// 범위 지정 -- 안하면 지도가 반복적으로 나오지만 지도마다 좌표가 다르다
var boundStart = L.latLng(-85, -180);
var boundEnd = L.latLng(85, 180);
var myBounds = L.latLngBounds(boundStart, boundEnd);
            
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    bounds : myBounds,
    minZoom : 1
}).addTo(map);

map.on('click', onMapClick);
map.on('mousemove', onMouseMove);

var rows = JSON.parse('<%- JSON.stringify(contents) %>');
            
for(var i = 0; i < rows.length; i++){
    var lat = rows[i].lat;
    var lng = rows[i].lng;

    var marker = L.marker(L.latLng(lat, lng)).addTo(map);
    marker.on('click', onMarkerClick);
}

function httpReqAndRes(msg, url) {
    var req = getXmlHttpRequest();
    req.open('post', url, false);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(msg);

    return JSON.parse(req.responseText);
}

function getXmlHttpRequest(){
    var req;

    if( window.XMLHttpRequest ){
        req = new XMLHttpRequest();
    } 
    else if( window.ActiveXObject ){
        // 옛날 IE를 위한 코드
        req = new ActiveXObject("Microsoft.XMLHTTP");      
    }

    return req;
}

function onMouseMove(e){
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    
    if( lat > 85 || lat < -85 || lng > 180 || lng < -180 ){
        return;
    }

    var inputLat = document.getElementById("lat");
    var inputLng = document.getElementById("lng");

    inputLat.value = e.latlng.lat;
    inputLng.value = e.latlng.lng;
}

var popup = L.popup({ closeButton: false });

function onMapClick(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    
    if( lat > 85 || lat < -85 || lng > 180 || lng < -180 ){
        alert("out of map");
        return;
    }

    popup.setLatLng(e.latlng);
    popup.setContent(
        '<strong>Title : </strong>' + 
        '</br>' + 
        '<input style="width : 100%;" type="text" id="title" maxLength="40" size="40" name="id" value="">' + 
        '</br></br>' + 
        '<strong>Context : </strong>' + 
        '</br>' + 
        '<textarea style="overflow:auto; width:300px; height:75px;" name="textarea" id="content" rows="5" cols="40"></textarea>' + 
        '</br></br>' + 
        '<input type="button" style="width : 30%;" onclick="onPopupSaveClick()" class="ui primary button" value="Save">' + 
        '<input type="button" style="width : 30%;" onclick="onPopupCloseClick()" class="ui secondary button" value="Close">', 
        { closeOnClick: false }
    )

    popup.openOn(map);
}

function onMarkerClick(e){
    var jsonPacket = {
        command : "",
        content_idx : 0,
        user_id : "",
        title : "",
        content : "",
        lat : 0,
        lng : 0,
        datetime : ""
    };
    
    jsonPacket.command = "SELECT";
    jsonPacket.lat = e.latlng.lat;
    jsonPacket.lng = e.latlng.lng;
    
    var receive = httpReqAndRes(JSON.stringify(jsonPacket), '/mapAction');
    
    if (receive.command != "SUCCESSFUL") {
        alert("Something wrong on your post. Please contact to server manager.");
        return;
    }
    
    popup.setLatLng(e.latlng);

    var popupHTML = '<strong>Idx : </strong>' + 
                    '<label id="popup_idx">' + receive.content_idx + '</label>' + 
                    '</br>' + 
                    '<strong>Title : </strong>' + 
                    '<label id="popup_title">' + receive.title + '</label>' + 
                    '</br>' + 
                    '<strong>User : </strong>' + 
                    '<label id="popup_id">' + receive.user_id + '</label>' + 
                    '</br></br>' + 
                    '<strong>Content</strong>' + 
                    '</br>' + 
                    '<div id="popup_content" style="overflow:auto; width:300px; height:75px;">' + receive.content + '</div>' + 
                    '</br>' + 
                    '<strong>Updated time : </strong>' + 
                    '<label id="popup_datetime">' + receive.datetime + '</label>';

    if (document.getElementById("userId").innerHTML == receive.user_id) {
        popupHTML += '</br></br>' + 
                    '<button type="button" style="width : 30%;" onclick="onPopupEditClick()" class="ui primary button">Edit</button>' + 
                    '<button type="button" style="width : 30%;" onclick="onPopupDeleteClick()" class="ui secondary button">Delete</button>' + 
                    '<button type="button" style="width : 30%;" onclick="onPopupCloseClick()" class="ui secondary button">Close</button>';
    }
    else {
        popupHTML += '</br></br>' + 
                    '<button type="button" style="width : 30%;" onclick="onPopupCloseClick()" class="ui secondary button">Close</button>'
    }
    
    popup.setContent(popupHTML);

    popup.openOn(map);
}

function onPopupSaveClick() { 
    var jsonPacket = {
        command : "",
        content_idx : 0,
        user_id : "",
        title : "",
        content : "",
        lat : 0,
        lng : 0,
        datetime : ""
    };

    jsonPacket.command = "INSERT";
    jsonPacket.user_id = document.getElementById("userId").innerHTML;
    jsonPacket.title = document.getElementById('title').value;
    jsonPacket.content = document.getElementById('content').value;
    jsonPacket.lat = popup.getLatLng().lat;
    jsonPacket.lng = popup.getLatLng().lng;

    var receive = httpReqAndRes(JSON.stringify(jsonPacket), '/mapAction');

    if (receive.command == "SUCCESSFUL") {
        alert("Your post has been Saved successfully.");
    }
    else {
        alert("Something wrong on your post. Please contact to server manager.");
    }
    
    location.reload();
}

function onPopupCloseClick() {
    map.closePopup();
}

function onPopupDeleteClick() {
    var jsonPacket = {
        command : "",
        content_idx : 0,
        user_id : "",
        title : "",
        content : "",
        lat : 0,
        lng : 0,
        datetime : ""
    };

    jsonPacket.command = "DELETE";
    jsonPacket.content_idx = document.getElementById("popup_idx").innerHTML;

    var receive = httpReqAndRes(JSON.stringify(jsonPacket), '/mapAction');

    if (receive.command == "SUCCESSFUL") {
        alert("Your post has been Deleted successfully.");
    }
    else {
        alert("Something wrong on your post. Please contact to server manager.");
    }
    
    location.reload();				
}

function onPopupUpdateClick(){
    var jsonPacket = {
        command : "",
        content_idx : 0,
        user_id : "",
        title : "",
        content : "",
        lat : 0,
        lng : 0,
        datetime : ""
    };


    jsonPacket.command = "UPDATE";
    jsonPacket.title = document.getElementById('popup_edit_title').value;
    jsonPacket.content = document.getElementById('popup_edit_content').value;
    jsonPacket.content_idx = document.getElementById("popup_edit_idx").innerHTML;


    var receive = httpReqAndRes(JSON.stringify(jsonPacket), '/mapAction');

    if (receive.command == "SUCCESSFUL") {
        alert("Your post has been Saved successfully.");
    }
    else {
        alert("Something wrong on your post. Please contact to server manager.");
    }
    
    location.reload();
}

function onPopupEditClick() {
    var title = document.getElementById("popup_title").innerHTML;
    var content = document.getElementById("popup_content").innerHTML;
    var content_idx = document.getElementById("popup_idx").innerHTML;

    popup.setContent(
        '<strong>idx : </strong>' + 
        '<label id="popup_edit_idx"></label>' +
        '</br>' + 
        '<strong>Title : </strong>' + 
        '</br>' + 
        '<input style="width : 100%;" type="text" id="popup_edit_title" maxLength="40" size="40" name="id" value="">' + 
        '</br></br>' + 
        '<strong>Context : </strong>' + 
        '</br>' + 
        '<textarea style="overflow:auto; width:300px; height:75px;" name="textarea" id="popup_edit_content" rows="5" cols="40"></textarea>' + 
        '</br></br>' + 
        '<input type="button" style="width : 30%;" onclick="onPopupUpdateClick()" class="ui primary button" value="Update">' + 
        '<input type="button" style="width : 30%;" onclick="onPopupCloseClick()" class="ui secondary button" value="Close">', 
        { closeOnClick: false }
    )

    document.getElementById("popup_edit_title").value = title;
    document.getElementById("popup_edit_content").value = content;
    document.getElementById("popup_edit_idx").innerHTML = content_idx;

    popup.openOn(map);
}