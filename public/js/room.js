'use strict';

var meeting;
var host = HOST_ADDRESS; // HOST_ADDRESS gets injected into room.ejs from the server side when it is rendered

$( document ).ready(function() {
	/////////////////////////////////
	// CREATE MEETING
	/////////////////////////////////
	meeting = new Meeting(host);
	
	meeting.onLocalVideo(function(stream) {
	        //alert(stream.getVideoTracks().length);
	        // document.querySelector('#localVideo').src = window.URL.createObjectURL(stream);
			document.querySelector('#localVideo').srcObject = stream;
	        
	        $("#micMenu").on("click",function callback(e) {
				toggleMic();
    		});
    		
    		$("#videoMenu").on("click",function callback(e) {
				toggleVideo();
    		});

			$("#localVideo").prop('muted', true);

	    }
	);
	
	meeting.onRemoteVideo(function(stream, participantID) {
	        addRemoteVideo(stream, participantID);  
	    }
	);
	
	meeting.onParticipantHangup(function(participantID) {
			// Someone just left the meeting. Remove the participants video
			removeRemoteVideo(participantID);
		}
	);
    
    meeting.onChatReady(function() {
			console.log("Chat is ready");
	    }
	);
	
    var room = window.location.pathname.match(/([^\/]*)\/*$/)[1];
	meeting.joinRoom(room);

}); // end of document.ready
 
function addRemoteVideo(stream, participantID) {
    var $videoBox = $("<div class='videoWrap' id='"+participantID+"'></div>");
    var $video = $("<video class='videoBox' autoplay></video>");
    // $video.attr({"src": window.URL.createObjectURL(stream), "autoplay": "autoplay"});
	// $video.attr({ "autoplay": "autoplay"});
	// $video.attr({"srcObject":  stream, "autoplay": "autoplay"});
	// $video.srcObject = stream;
	
    $videoBox.append($video);
	$("#videosWrapper").append($videoBox);

	adjustVideoSize();
	// var rr = document.querySelector('#'+participantID); 
	// rr.srcObject = stream;
	// $video.attr('src', stream);
	// $video.attr({"src":  stream, "autoplay": "autoplay"});
	// $('#'+participantID+" video").src=stream;
	// $('#'+participantID +" video" ).css("background-color", "red");
	// $('#'+participantID +" video" ).attr('src', stream);
	
	console.log(document.getElementById('#'+participantID));
	console.log($('#'+participantID).length);
	if (document.getElementById('#'+participantID)) {
		console.log('this record already exists');
	} else {
	  console.log('this record not exists');
	}
	
	// while(document.getElementById('#'+participantID) == null) {
		// console.log('waiting.............');
	// }
	
	var v=document.getElementById(participantID).querySelectorAll(".videoBox")
	if(v.length>0){
	v[0].srcObject = stream;
	}
	// window.document.querySelector('#'+participantID +" video").srcObject = stream;
	// window.document.querySelector('#'+participantID +" video").
	// a(participantID).then(b.bind(participantID,stream));
}

var a = function(participantID) {
   	while($('#'+participantID).length == 0) {
		console.log('waiting.............');
	}
	
	 var defer = $.Deferred();

    console.log('a() called');

    setTimeout(function() {
        defer.resolve(); // When this fires, the code in a().then(/..../); is executed.
    }, 5000);

    return defer;
	
};

var b = function(participantID,stream) {
    window.document.querySelector('#'+participantID +" video").srcObject = stream;
	
};






 
function removeRemoteVideo(participantID) {
	$("#"+participantID).remove();
	adjustVideoSize();
}

function adjustVideoSize() {
	var numOfVideos = $(".videoWrap").length; 
	if (numOfVideos>2) {
		var $container = $("#videosWrapper");
		var newWidth;
		for (var i=1; i<=numOfVideos; i++) {
			newWidth = $container.width()/i;
			
			// check if we can start a new row
			var scale = newWidth/$(".videoWrap").width();
			var newHeight = $(".videoWrap").height()*scale;
			var columns = Math.ceil($container.width()/newWidth);
			var rows = numOfVideos/columns;
			
			if ((newHeight*rows) <= $container.height()) {
				break;
			}
		}
		
		var percent = (newWidth/$container.width())*100;
		$(".videoWrap").css("width", percent-5+"%");
		$(".videoWrap").css("height", "auto"); 

		
		//var numOfColumns = Math.ceil(Math.sqrt(numOfVideos));
		var numOfColumns;
		for (var i=2; i<=numOfVideos; i++) {
			if (numOfVideos % i === 0) {
				numOfColumns = i;
				break;
			}
		}
	    $('#videosWrapper').find("br").remove();
		$('.videoWrap:nth-child('+numOfColumns+'n)').after("<br>");
	} else if (numOfVideos == 2) {
		$(".videoWrap").width('auto');
		$("#localVideoWrap").css("width", 20+"%");
		$('#videosWrapper').find("br").remove();
	} else {
		$("#localVideoWrap").width('auto');
		$('#videosWrapper').find("br").remove();
	}
}