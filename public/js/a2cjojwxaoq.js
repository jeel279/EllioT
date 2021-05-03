function formatBytes(a,b=2){if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}


function checkAround(){
  console.log(0);
}

function resolver(i,startTime,e,fAr){
  var file = fAr[i];
  var timeDiff = new Date() - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 

var avg = 0;
var ic = 0;
  var seconds = Math.round(timeDiff);
    var percentage = (e.loaded / e.total) * 100;
    //$(".determinate").css("width",percentage+"%");
    $("#orig_"+i).css("width",percentage.toFixed(2)+"%");
    //$("#fileP_"+i).css("background",percentage.toFixed(2)+"%");
    var speed = (percentage / 100)*(file.size)/timeDiff;
    var lapsed = formatBytes((percentage / 100)*(file.size));
    var fsize = formatBytes(file.size);
    ic++;
    avg+=speed/ic;
    $("#tSp_"+i).html(formatBytes(speed)+"/s");
    $("#tPr_"+i).html(Math.round(percentage)+"%");
    if(Math.round(percentage)==100){
      $("#fileO_"+i).hide();
      $("#fileP_"+i).show();
      $("#fileP_"+i).removeClass("transparent");
      $("#fileP_"+i).addClass("white");
      $($("#fileP_"+i).children("i")[0]).css("color","#512DAB");
      $("#fileP_"+i).children("#fname").css("color","#512DAB");
      $("i[fid='"+i+"']").css("color","#512DAB");
      $("i[fid='"+i+"']").html("done");
    }
    //$("#prg_"+i).html(percentage.toFixed(1) + "%<br>"+lapsed+" of "+fsize+"<br>Speed : " + formatBytes(speed)+"/s<br>Time Lapsed : "+Math.floor(timeDiff)+" s");
    checkAround();
}



var xhr = Array();
var aIn = Array();
var ea = Array();
      function submit(fAr){
          $("#addFile_btn,#sendFile_btn").hide();
          for(var i=0;i<fAr.length;i++){
            $("#fileP_"+i+"").hide();
            $("#fileO_"+i+"").show();
      var formData = new FormData();
      //$(".loader_prg").css("display","block");
var file = fAr[i];
formData.append('file', file);

xhr.push(new XMLHttpRequest());

xhr[i].open('post', '/reciever/'+i, true);
aIn.push(i);
const cAIN = aIn[i];
var startTime = new Date();


xhr[i].upload.onprogress = function(e) {
  if (e.lengthComputable) {
    ea[cAIN] = e;
    resolver(xhr.indexOf(xhr[cAIN]),startTime,ea[cAIN],fAr);
    console.log("a");
  }
};

xhr[i].onerror = function(e) {
  console.log('Error');
  console.log(e);
};
xhr[i].onload = function() {
  console.log(this.statusText);
};

xhr[i].send(formData);
}
}