function onLoginClick(){
	var form = document.getElementById("loginForm");
	var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/;

	if(form.id.value == ""){
		alert("id is empty");
	}
	else if(regExp.test(form.id.value)){
		alert("can't use special character");
	}
	else if(form.pw.value == ""){
		alert("password id empty");
	}
	else{
		form.submit();
	}
}
