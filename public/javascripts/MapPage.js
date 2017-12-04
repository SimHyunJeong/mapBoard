// 화면에 표시될 팝업
var popup;

// ajax에 사용할 json데이터
var jsonPacket;

// leaflet.js
var map;
var tileLayer;

// 가로는 타일 크기 이상 범위지정이 되는데 세로는 타일의 크기 이상 지정이 안된다
//var mapBoundStart = L.latLng(-10000, -500);
//var mapBoundEnd = L.latLng(10000, 500);
//var mapBounds = L.latLngBounds(mapBoundStart, mapBoundEnd);
//map.setMaxBounds(mapBounds);

function init(){
	// 사이드 메뉴 토글
	$('#show_sidebar').click(function(){
		$('.ui.sidebar').sidebar('toggle');
	});

	map = L.map('map').setView([0, 0], 1);

	// 범위 지정 -- 안하면 지도가 반복적으로 나오지만 지도마다 좌표가 다르다
	var layerBoundStart = L.latLng(-85, -180);
	var layerBoundEnd = L.latLng(85, 180);
	var layerBounds = L.latLngBounds(layerBoundStart, layerBoundEnd);

	tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		bounds : layerBounds
	});

	popup = L.popup({ closeButton : false, maxWidth : 'auto' });
	
	tileLayer.addTo(map);

	jsonPacket = { command : 'LOAD_CONTENTS' };
	sendAjax('post', '/contentAction', jsonPacket, 'application/x-www-form-urlencoded', makeMarkers);	

	map.on('click', onMapClick);
	map.on('mousemove', onMouseMove);
}

function makeMarkers(result){
	// 마커 클러스터 : 마커 병합해서 숫자로 표시해주는 기능
	var markers = new L.MarkerClusterGroup();
	var markersList = [];

	var receive = JSON.parse(result);
	if (receive.command != "SUCCESSFUL") {
		alert("Something wrong on your post. Please contact to server manager.");
		return;
	}
	else{
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

function onMapClick(e) {
	var lat = e.latlng.lat;
	var lng = e.latlng.lng;
	
	if( lat > 85 || lat < -85 || lng > 180 || lng < -180 ){
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
		command : 'SELECT_CONTENT',
		content_idx : e.target.title
	};
	popup.setLatLng(e.target._latlng);

	sendAjax('post', '/contentAction', jsonPacket, 'application/x-www-form-urlencoded', showContentPopup);
}

function showContentPopup(result){
	popup.setContent(result);
	popup.openOn(map);
	
	loadImages();
	
	var uid = document.getElementById("userId").innerHTML;
	var author = document.getElementById("popup_id").innerHTML;

	if (uid == author) {
		document.getElementById("edit_button").type = 'button';
		document.getElementById("delete_button").type = 'button';
	}

	loadComments();
}

function loadImages(){
	jsonPacket = {
		command : 'LOAD_IMAGES',
		p_content_idx : document.getElementById('popup_idx').innerHTML
	}
	
	sendAjax('post', '/loadImagesAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(data){
		var rows = JSON.parse(data);
		var imageDiv = document.getElementById("popup_image");
		var downloadDiv = document.getElementById("popup_download");

		for(var i = 0; i < rows.length; i++){
			var url = '/showImageAction' + '?file_name=' + rows[i].file_name;
			imageDiv.innerHTML += '<img style="width : 100%;" src="' + url + '"/>';	
		}
		for(var i = 0; i < rows.length; i++){
			var url = '/downloadImage' + '?' + 'file_name=' + rows[i].file_name + '&' + 'original_name=' + rows[i].original_name;
			downloadDiv.innerHTML += '<a href="' + url + '">' + rows[i].original_name + '</a>';
			downloadDiv.innerHTML += '<br>';
		}
	});
}

function loadComments(){
	jsonPacket = {
		command : 'LOAD_COMMENTS',
		content_idx : document.getElementById('popup_idx').innerHTML
	}

	sendAjax('post', '/commentAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var rows = JSON.parse(result);
		var comments = makeComments(rows);		
		var commentsHtml = makeCommentsHtml(comments);

		document.getElementById('popup_comment').innerHTML = commentsHtml;

		addCommentsComment(comments);

		if (uid == author) {
			document.getElementById("edit_button").type = 'button';
			document.getElementById("delete_button").type = 'button';
		}
	});
}

function addCommentsComment(comments){
	var commentKeys = Object.keys(comments);

	for(var i = 0; i < commentKeys.length; i++){
		var row = comments[i].row;
		var depth = row.depth;

		if(depth == 1){
			var comments_group = document.getElementById('comments_group' + comments[i].row.group_no);
			comments_group.innerHTML += comments[i].html;
		}
	}
}

function makeComments(rows){
	if(rows.length == 0){
		return "";
	}

	var comments = {};

	for(var i = 0; i < rows.length; i++){
		var date = new Date(rows[i].datetime);
		var updateTime = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
		var html = '';

		html += '<div class="comment" id="' + rows[i].comment_idx + '">';
			html += '<input id="group_no" type="hidden" value="' + rows[i].group_no + '"/>';
			html += '<div class="content">';
				html += '<label class="author">' + rows[i].user_id + '</label>';
				html += '<div class="metadata">';
					html += '<span>' + updateTime + '</span>';
				html += '</div>'
				html += '<div class="text">'
						+ rows[i].comment 
						+ '</div>'
				html += '<div class="actions">';
				if(rows[i].depth == 0){
					html += '<a class="reply" name="' + rows[i].comment_idx + '" onclick="onReplyClick(this)">Reply</a>';
				}
				if(rows[i].user_id == document.getElementById('userId').innerHTML){
					html += '<a class="reply" onclick="onCommentDeleteClick(this)">Delete</a>'; 
				}
				html += '</div>';
				html += '<form class ui reply form>';
					html += '<div class="field">';
						html += '<textarea id="comments_comment' + rows[i].comment_idx + 
								'" style="display:none; overflow:auto; width:60%;" maxlength="99"></textarea>' + 
								'<input type="hidden" id="comments_write_button' + rows[i].comment_idx + '" ' + 
								'value="Write" style="width : 30%;" onclick="onReplyWriteClick(this)" class="ui primary button">' + 
								'<br>';
					html += '</div>';
				html += '</form>';
			html += '</div>';
			html += '<div id="comments_group' + rows[i].group_no + '" ' +  'class="comments"></div>'
		html += '</div>';

		comments[i] = { row : rows[i], html : html };
	}
	return comments;
}

function makeCommentsHtml(comments){
	if(comments == ""){
		return "";
	}

	var html = '<br>';
	
	html += '<div class="ui comments" style="padding : 15px;">';
	
	var commentKeys = Object.keys(comments);
	for(var i = 0; i < commentKeys.length; i++){
		var row = comments[i].row;
		var depth = row.depth;

		if(depth == 0){
			html += comments[i].html;
		}
	}
	html += '</div>';

	return html;
}

function onPopupSaveClick() { 
	var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
	var title = document.getElementById('title').value;
	var content = document.getElementById('content').value;
	
	if(title == ""){
		alert("title is empty");
		return;
	}
	else if( regExp.test(title) || regExp.test(content) ){
		alert("can't use special character");
		return;
	}

	jsonPacket = {
		command : 'INSERT_CONTENT',		
		user_id : document.getElementById("userId").innerHTML,
		title : title,
		content : content,
		lat : popup.getLatLng().lat,
		lng : popup.getLatLng().lng
	};
	
	sendAjax('post', '/contentAction', jsonPacket, 'application/x-www-form-urlencoded', uploadImage);
}

function uploadImage(result){
	var receive = JSON.parse(result);

	if (receive.command == "SUCCESSFUL") {	
		var form = document.getElementById('uploadForm');
		var formData = new FormData(form);
		
		if(form.uploadFiles.value == ''){
			location.reload();			
			return;
		}

		formData.append('command', 'UPLOAD_IMAGES');		
		formData.append('p_content_idx', receive.content_idx);

		sendAjax('post', '/imageAction', formData, 'multipart/form-data');

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
		command : 'DELETE_CONTENT',		
		content_idx : document.getElementById("popup_idx").innerHTML		
	};

	sendAjax('post', '/contentAction', jsonPacket, 'application/x-www-form-urlencoded')
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
		command : 'DELETE_CONTENT',		
		title : document.getElementById('popup_edit_title').value,
		content : document.getElementById('popup_edit_content').value,
		content_idx : document.getElementById("popup_edit_idx").innerHTML	
	};

	sendAjax('post', '/contentAction', jsonPacket, 'application/x-www-form-urlencoded')
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

function onPopupWriteClick(clickedObj){
	var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
	var comment = document.getElementById('popup_comment_input').value;

	if(comment == ""){
		alert("comment is empty");
		return;
	}
	else if(regExp.test(comment)){
		alert("can't use special character");
		return;
	}

	jsonPacket = {
		command : 'INSERT_COMMENT',
		p_content_idx : document.getElementById("popup_idx").innerHTML,
		p_comment_idx : null,
		user_id : document.getElementById("userId").innerHTML,
		comment : comment,
		depth : 0,
		group_no : null
	};
	
	sendAjax('post', '/commentAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your comment has been created successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		loadComments();		
	});
}

function onReplyWriteClick(clickedObj){
	var commentNode = clickedObj.parentNode.parentNode.parentNode.parentNode;
	var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;
	var comment = document.getElementById('comments_comment' + commentNode.id).value;

	if(comment == ""){
		alert("comment is empty");
		return;
	}
	else if(regExp.test(comment)){
		alert("can't use special character");
		return;
	}
	
	jsonPacket = {
		command : 'INSERT_COMMENT',
		p_content_idx : document.getElementById("popup_idx").innerHTML,
		p_comment_idx : commentNode.id,
		user_id : document.getElementById("userId").innerHTML,
		comment : document.getElementById('comments_comment' + commentNode.id).value,
		depth : 1,
		group_no : commentNode.firstChild.value
	};
	
	sendAjax('post', '/commentAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your comment has been created successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		loadComments();
	});
}

function onCommentDeleteClick(clickedObj){
	var commentNode = clickedObj.parentNode.parentNode.parentNode;
	jsonPacket = {
		command : 'DELETE_COMMENT',
		comment_idx : commentNode.id
	};
	
	sendAjax('post', '/commentAction', jsonPacket, 'application/x-www-form-urlencoded')
	.done(function(result){
		var receive = JSON.parse(result);

		if (receive.command == "SUCCESSFUL") {
			alert("Your comment has been deleted successfully.");
		}
		else {
			alert("Something wrong on your post. Please contact to server manager.");
		}

		loadComments();
	});
}

function onReplyClick(clickedObj){
	document.getElementById('comments_comment' + clickedObj.name).style.display = "block";
	document.getElementById('comments_write_button' + clickedObj.name).type = "button";
}

function sendAjax(type, url, data, enctype, successFunction, errorFunction){
	if(errorFunction == undefined){
		errorFunction = function(result) {
			alert('status : ' + result.status + " : " + result.description);
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
}