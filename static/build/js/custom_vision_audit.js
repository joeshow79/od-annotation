/**
 * 业务相关的JS处理代码
*/
sampleCount = 0;
$(function(){
    get_labels().then(function (result) {
	    if(result.message=='success'){
	        var html = '标注类型：';
	        index = 0;
	        for (var i in result.data){
	            var id = 'region_'+result.data[i].name;
	            var value = result.data[i].name;
	            var text = result.data[i].desc;
	            if(index==0){
					html += '<div class="row" style="text-align:left">';
	                html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'" disabled="true">';
	            }else{
					if ( value == "-" ){
						html+='</div>' 
						html += '<div class="row" style="text-align:left">';
					}
					else{
						html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'" disabled="true">';
					}
	            }
				if ( value != "-" ){
					html += ' '+text+'</label>';
					index++;
				}
	        }
            $('#radio-type').html(html);
		    loadSamplePic();
	    }
	})

    $('#total').text(sampleCount);


    $('#side_left').click(function(){
		loadLastSample();
    });

    $('#side_right').click(function(){
		loadSamplePic();
    });

    $('#btn_save').click(function(){
		if(user_name == '' || user_name == 'anonymous'){
            layer.msg('请先登录!');
            return;
		}

        saveRegionInfo("");
    });

    $('#radio-type').click(function(){
        $(document).focus();
    });

	$('#changeuser').attr("onclick","javascript:show_enterUserNameDIV(); return false;"); 

    $('#userEnter').keypress(function(e){
		if(e.keyCode == 13 || e.keyCode == 27){
			change_and_display_user_name(e.keyCode)
		}
    });

	document.onkeydown = function(e){  

		var ev = document.all ? window.event : e;

		if(ev.keyCode==13) {

			// 如（ev.ctrlKey && ev.keyCode==13）为ctrl+Center 触发
			//要处理的事件
			$('#btn_save').click();
		}
	};

	init_user_name();
});

function show_enterUserNameDIV() {
    // This function simply swaps the divs to show the "change_and_display_user_name" div
    $("#display_user").hide();
    $("#enterUserName").show();
    // put the cursor inside the text box
    document.getElementById('userEnter').focus();
    document.getElementById('userEnter').select();

    return false;
}

function change_and_display_user_name(c) {
    // Shows the entered name.
    // c is the key that produced getting out of the text box.
    // only change the username is the user pressed "enter" -> c==13
	if (c==13){
        username = $("#userEnter").val();
    
        if (username.length==0) {
            username = get_cookie("username");
        }   
    
        set_cookie("username",username);
        $("#usernametxt").text(username);
		user_name=username;
    }

    $("#display_user").show();
    $("#enterUserName").hide();
}

function init_user_name() {
    // The first time we get the username will give preference to the username passed
    //   in the URL as it might come from the LabelMe browser.

	username = get_cookie("username");
	if (!username || (username.length==0)) {
		username = "anonymous";
    }
    
    if (username=="null") {username = "anonymous";}
    
	user_name=username;
    set_cookie("username",username);
    $("#usernametxt").text(username);
}

function get_cookie(c_name) {
  if (document.cookie.length>0) {
    c_start=document.cookie.indexOf(c_name + "=");
    if (c_start!=-1) {
      c_start=c_start + c_name.length+1;
      c_end=document.cookie.indexOf(";",c_start);
      if (c_end==-1) c_end=document.cookie.length;
      return unescape(document.cookie.substring(c_start,c_end));
    }
  }
  return null
}

function set_cookie(c_name,value,expiredays) {
  var exdate=new Date();
  exdate.setDate(expiredays);
  document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : "; expires="+exdate);
}


function get_labels(){
    return $.ajax({
		type : "GET",
		dataType : "json",
		//TODO: TASK NAME: VISION
		url : "/api/annotation/labels?task_name=vision&time="+Date.parse(new Date())
	})
}

function loadLastSample(){
	img_name = previous_img_name ;
	current_label_selection = previous_label_selection;

	if (img_name.replace(/(^\s*)|(\s*$)/g, "").length ==0){
		layer.msg('没有上一张图像!');
	}
	else{
		url = "/api/annotation/sample?time="+Date.parse(new Date())+"&img_name="+img_name ;
		$('#img').attr({"src":url});
		$('#total').html(sample_count);
		$('#cur_id').html(img_name);
		$('.box').remove();
		$('#cur_loc').html('');
	}
		
	//Resume to initial label status
	$(":radio[name='radio_region'][value='" + current_label_selection + "']").prop("checked", "checked");

}

function loadSamplePic(){
    $.ajax({
		type : "GET",
		dataType : "json",
		//TODO: TASK NAME
		url : "/api/annotation/auditnext?task_name=vision&time="+Date.parse(new Date()),
		beforeSend:function(){
		},
		success : function(result){
			previous_img_name = img_name;
			img_name = result['img_name'];
			previous_label_selection = current_label_selection ;
			current_label_selection = result['category'];
			sample_count=result['sample_count'];
			owner_id=result['owner'];
			label_time=result['finished_time']

			if (img_name.replace(/(^\s*)|(\s*$)/g, "").length ==0){
				layer.msg('没有更多图像!');
			}
			else{
				url = "/api/annotation/sample?time="+Date.parse(new Date())+"&img_name="+img_name ;
				$('#img').attr({"src":url});
				$('#total').html(sample_count);
				$('#cur_id').html(img_name);
				$('#owner_id').html(owner_id);
				$('#label_time').html(label_time);
				$('.box').remove();
				$('#cur_loc').html('');
			}
		
			$(":radio[name='radio_region'][value='" + current_label_selection + "']").prop("checked", true);
		},
		error: function(){
		}
	});

}

function saveRegionInfo(tagResult){
    $.ajax({
		type : "POST",
		dataType : "json",
		url : "/api/annotation/auditsave?"+new Date(),
		//TODO: TASK NAME
		data : {'tags':tagResult, 'img_name':img_name,'task_name':'vision','user_name':user_name},
		beforeSend:function(){
		},
		success : function(result){
			$('#cur_loc').html('');
			loadSamplePic();
		},
		error: function(){
		}
	});
}

function isPassword(str) {
	var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}/;
	return reg.test(str);
}

//时间戳转换成八位日期
function format2Date(uData){
	var myDate = new Date(uData);
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	return year + '-' + month + '-' + day;
}

//时间戳转换成时间字符串
function format2Time(uData){
	var myDate = new Date(uData);
	var year = myDate.getFullYear();
	var month = myDate.getMonth() + 1;
	var day = myDate.getDate();
	var hour = myDate.getHours();
	var minute = myDate.getMinutes();
	var second = myDate.getSeconds();
	return year + '-' + month + '-' + day+' '+hour+':'+minute+':'+second;
}

function PrefixInteger(num, length) {
 return (Array(length).join('0') + num).slice(-length);
}
