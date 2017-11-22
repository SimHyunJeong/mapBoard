
// 사이드 메뉴 토글
$('#show_sidebar').click(function(){
	$('.ui.sidebar').sidebar('toggle');
});

// 기본 뷰 전세계
var map = L.map('map').setView([0, 0], 1);

// 마커 클러스터 : 마커 병합해서 숫자로 표시해주는 기능
var markers = new L.MarkerClusterGroup();
var markersList = [];

// 범위 지정 -- 안하면 지도가 반복적으로 나오지만 지도마다 좌표가 다르다
var layerBoundStart = L.latLng(-85, -180);
var layerBoundEnd = L.latLng(85, 180);
var layerBounds = L.latLngBounds(layerBoundStart, layerBoundEnd);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	bounds : layerBounds
}).addTo(map);

//var mapBoundStart = L.latLng(-10000, -500);
//var mapBoundEnd = L.latLng(10000, 500);
//var mapBounds = L.latLngBounds(mapBoundStart, mapBoundEnd);

//map.setMaxBounds(mapBounds);
map.on('click', onMapClick);
map.on('mousemove', onMouseMove);

var jsonPacket;

jsonPacket = {
	command : "LOAD_CONTENTS"
};
sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded', makeMarkers);

function makeMarkers(result){
	var receive = JSON.parse(result);
	if (receive.command != "SUCCESSFUL") {
		alert("Something wrong on your post. Please contact to server manager.");
		return;
	}

	var rows = receive.rows;
	
	for(var i = 0; i < rows.length; i++){
		var lat = rows[i].lat;
		var lng = rows[i].lng;
	
		var marker = L.marker(L.latLng(lat, lng));
		marker.title = rows[i].content_idx;
		marker.on('click', onMarkerClick);
	
		markersList.push(marker);
		markers.addLayer(marker);
	}

	map.addLayer(markers);
}

function onMouseMove(e){
	var lat = e.latlng.lat;
	var lng = e.latlng.lng;
	
	if( lat > 85 || lat < -85 || lng > 180 || lng < -180 ){
		return;
	}

	document.getElementById("lat").value = lat;
	document.getElementById("lng").value = lng;
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

	sendAjax('get', '/createContentPopup')
	.done(function(data){
		popup.setContent(data);
	});
	
	popup.openOn(map);
}

function onMarkerClick(e){
	jsonPacket = {
		command : "SELECT_CONTENT",
		content_idx : e.target.title
	}
	popup.setLatLng(e.target._latlng);

	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded', showContentPopup);
}

function showContentPopup(result){
	popup.setContent(result);
	popup.openOn(map);
	
	var uid = document.getElementById("userId").innerHTML;
	var author = document.getElementById("popup_id").innerHTML;

	if (uid == author) {
		document.getElementById("edit_button").type = 'button';
		document.getElementById("delete_button").type = 'button';
	}

	jsonPacket.command = "SELECT_COMMENT";
	jsonPacket.content_idx = document.getElementById('popup_idx').innerHTML;

	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var rows = JSON.parse(result);
		var html = popup.getContent();
		popup.setContent(html + makeCommentsHtml(rows));
	
		if (uid == author) {
			document.getElementById("edit_button").type = 'button';
			document.getElementById("delete_button").type = 'button';
		}
	});
}

function makeCommentsHtml(rows){
	if(rows.length == 0){
		return "";
	}
	var html = '<br>';
	
	html += '<div style="padding : 15px; border : 1px solid black; overflow : scroll; height : 150px;">';
	for(var i = 0; i < rows.length; i++){
		html += '<div id="' + rows[i].comment_idx + '" ' + 
				'onclick="onCommentClick(this)">';
		html += '<input id="group_no" type="hidden" value="' + rows[i].group_no + '"/>';
		html += '<label>';

		for(var j = 0; j < rows[i].depth; j++){
			if(j == rows[i].depth-1){
				html += '└';
			}
			html += '&nbsp&nbsp&nbsp';
		}
		html += rows[i].user_id + ' : ';
		html += rows[i].comment;
		html += '</label>';
		html += '<div style="text-align : right;">';
		html += rows[i].datetime;
		html += '</div>';
		html += '<textarea id="comments_comment' + rows[i].comment_idx + 
		'" style="display:none; overflow:auto; width:60%; height:20px;" maxlength="99"></textarea>' + 
		'<input type="hidden" id="comments_write_button' + rows[i].comment_idx + '" ' + 
		'value="Write" style="width : 30%;" onclick="onPopupWriteClick(2, this)" class="ui primary button">' + 
		'<br>';
		html += '</div>';

		//console.log("comment_idx : " + rows[i].comment_idx);
	}
	html += '</div>';

	return html;
}

function onPopupSaveClick() { 
	jsonPacket = {
		command : "INSERT_CONTENT",
		user_id : document.getElementById("userId").innerHTML,
		title : document.getElementById('title').value,
		content : document.getElementById('content').value,
		lat : popup.getLatLng().lat,
		lng : popup.getLatLng().lng
	};
	
	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded', uploadImage);
}

function uploadImage(result){
	var receive = JSON.parse(result);

	if (receive.command == "SUCCESSFUL") {	
		var form = document.getElementById('fileupload');
		var formData = new FormData(form);
		
		if(form.filename.value == ''){
			location.reload();			
			return;
		}

		formData.append('p_content_idx', receive.content_idx);

		sendAjax('post', '/upload', formData, 'multipart/form-data');

		alert("Your image has been upload successfully.");
		location.reload();
	}
	else {
		alert("Something wrong on your post. Please contact to server manager.");
	}	
}

function onPopupCloseClick() {
	map.closePopup();
}

function onPopupDeleteClick() {
	jsonPacket = {
		command : "DELETE_CONTENT",
		content_idx : document.getElementById("popup_idx").innerHTML		
	}

	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your post has been deleted successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		location.reload();				
	});
}

function onPopupUpdateClick(){
	jsonPacket = {
		command : 'UPDATE_CONTENT',
		title : document.getElementById('popup_edit_title').value,
		content : document.getElementById('popup_edit_content').value,
		content_idx : document.getElementById("popup_edit_idx").innerHTML	
	}

	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your post has been updated successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		location.reload();				
	});
}

function onPopupEditClick() {
	var title = document.getElementById("popup_title").innerHTML;
	var content = document.getElementById("popup_content").innerHTML;
	var content_idx = document.getElementById("popup_idx").innerHTML;

	sendAjax('get', '/editContentPopup')
	.done(function(result){
		popup.setContent(result);
		document.getElementById("popup_edit_title").value = title;
		document.getElementById("popup_edit_content").value = content;
		document.getElementById("popup_edit_idx").innerHTML = content_idx;
	});

	popup.openOn(map);
}

function onPopupWriteClick(check, clickedObj){
	// 댓글
	if(check == 1){
		jsonPacket = {
			command : 'INSERT_COMMENT',
			p_content_idx : document.getElementById("popup_idx").innerHTML,
			p_comment_idx : null,
			user_id : document.getElementById("userId").innerHTML,
			comment : document.getElementById('popup_comment').value,
			depth : 0,
			group_no : null
		}
	}
	// 대댓글
	else if(check == 2){
		jsonPacket = {
			command : 'INSERT_COMMENT',
			p_content_idx : document.getElementById("popup_idx").innerHTML,
			p_comment_idx : null,
			user_id : document.getElementById("userId").innerHTML,
			comment : document.getElementById('comments_comment' + clickedObj.parentNode.id).value,
			depth : 1,
			group_no : clickedObj.parentNode.firstChild.value
		}
	}
	
	sendAjax('post', '/mapAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your comment has been created successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		location.reload();				
	});
}

function onCommentClick(clickedObj){
	//alert(clickedObj.id);
	document.getElementById('comments_comment' + clickedObj.id).style.display = "block";
	document.getElementById('comments_write_button' + clickedObj.id).type = "button";
}

function sendAjax(type, url, data, enctype, successFunction, errorFunction){
	if(errorFunction == undefined){
		errorFunction = function(result) {
			alert(result.status + " : " + result.description);
		};
	}

	switch(enctype){
		case 'multipart/form-data' : {			
			return $.ajax({
				type : type,
				url : url,
				data : data,
				enctype : 'multipart/form-data',
				processData: false,
				contentType: false,
				success : successFunction,
				error : errorFunction
			});
			break;
		}
		default : {			
			return $.ajax({
				type : type,
				url : url,
				data : data,
				enctype : 'application/x-www-form-urlencoded',
				success : successFunction,
				error : errorFunction
			});
			break;
		}
	}

	function showObject(obj){
		var str = '';
		for(key in obj){
			str += key + '=' + obj[key] + '\n';
		}
		alert(str);
	}
}