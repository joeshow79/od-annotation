/**
 * 业务相关的JS处理代码
*/
sampleCount = 0;
$(function(){
    $('#total').text(sampleCount);
    loadSamplePic();
    $('#side_left').click(function(){
        //$('#btn_save').click();
        //loadSamplePic();
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
    });
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
});

function get_labels(){
    $.ajax({
		type : "GET",
		dataType : "json",
		url : "/api/annotation/labels?"+new Date(),
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
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" checked="checked" id="'+id+'" value="'+value+'">';
		            }else{
		                html += '<label class="radio-inline"><input type="radio" name="radio_region" id="'+id+'" value="'+value+'">';
		            }
		            html += ' '+text+'</label>';
		            index++;
		        }
                $('#radio-type').html(html);
		    }
		},
		error: function(){
		}
	});
}

function loadSamplePic(){
    $.ajax({
		type : "GET",
		dataType : "json",
		url : "/api/annotation/next",
		beforeSend:function(){
		},
		success : function(result){
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
		data : {'tags':tagResult, 'img_name':img_name},
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
