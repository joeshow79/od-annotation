/**
 * 业务相关的JS处理代码
*/
sampleCount = 0;
$(function(){
    $('#total').text(sampleCount);
    loadSamplePic();
    $('#side_left').click(function(){
		loadLastSample();
    });
    $('#side_right').click(function(){
		strTagSelection= $("input[name='radio_region']:checked").val();
        if (strTagSelection == 'nolabel' || strTagSelection == ''){
            layer.msg('请先进行标注!');
            return;
        }
		else{
			$('#btn_save').click();

			loadSamplePic();
		}
    });
	/*
    $(document).keyup(function(event){
      if (event.keyCode === 37){//left
        $('#side_left').click();
      }else if(event.keyCode === 39){//right
        $('#side_right').click();
      }
    });
    $('#jump_page').keypress(function(e){
        if(e.keyCode==13){
            var indexStr = $(this).val();
            index = parseInt(indexStr);
            loadSamplePic();
        }
    });*/
    $('#btn_save').click(function(){
        strTagSelection = '';
		strTagSelection= $("input[name='radio_region']:checked").val();
        if (strTagSelection == 'nolabel' || strTagSelection == ''){
            layer.msg('请先进行标注');
            return;
        }
        saveRegionInfo(strTagSelection);
        $('#cur_loc').html('');
		//jasonj
    });
    get_labels();
    $('#radio-type').click(function(){
        $(document).focus();
    });
	$('#changeuser').attr("onclick","javascript:show_enterUserNameDIV(); return false;"); 
    $('#userEnter').keypress(function(e){
		if(e.keyCode == 13 || e.keyCode == 27){
			change_and_display_user_name(e.keyCode)
		}
    });
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
    $.ajax({
		type : "GET",
		dataType : "json",
		//TODO: TASK NAME: VISION
		url : "/api/annotation/labels?task_name=vision&time="+Date.parse(new Date()),
		beforeSend:function(){
		},
		success : function(result){
		    if(result.message=='success'){
		        var html = '标注类型：';
		        index = 0;
		        for (var i in result.data){
		            var id = 'region_'+result.data[i].name;
		            var value = result.data[i].name;
		            var text = result.data[i].desc;
		            if(index==0){
						html += '<div class="row" style="text-align:left">';
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" checked="checked" id="'+id+'" value="'+value+'">';
		            }else{
						if ( value == "-" ){
							html+='</div>' 
							html += '<div class="row" style="text-align:left">';
						}
						else{
							html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'">';
						}
		            }
					if ( value != "-" ){
						html += ' '+text+'</label>';
						index++;
					}
		        }
                $('#radio-type').html(html);
		    }
		},
		error: function(){
		}
	});
}

function loadLastSample(){
	img_name = previous_img_name ;
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
	$("input[name='radio_region']").eq(0).prop("checked",true);
}

function loadSamplePic(){
    $.ajax({
		type : "GET",
		dataType : "json",
		//TODO: TASK NAME
		//url : "/api/annotation/next?task_name=vision",
		url : "/api/annotation/next?task_name=vision&time="+Date.parse(new Date()),
		beforeSend:function(){
		},
		success : function(result){
			previous_img_name = img_name;
			img_name = result['img_name'];
			sample_count=result['sample_count'];
			if (img_name.replace(/(^\s*)|(\s*$)/g, "").length ==0){
				layer.msg('没有更多图像!');
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
			$("input[name='radio_region']").eq(0).prop("checked",true);

		},
		error: function(){
		}
	});

}

function saveRegionInfo(tagResult){
    $.ajax({
		type : "POST",
		dataType : "json",
		url : "/api/annotation/save?"+new Date(),
		//TODO: TASK NAME
		data : {'tags':tagResult, 'img_name':img_name,'task_name':'vision','user_name':user_name},
		beforeSend:function(){
		},
		success : function(result){
		    //layer.msg(result.message);
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
