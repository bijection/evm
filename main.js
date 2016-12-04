var levels = 9

var video = document.createElement('video');

var canvas,

	signalPyr,
	procPyr1,
	procpyr2,

	pyr1Attenuation,
	pyr2Attenuation,

	spatialAmpFactors,

	videoAspectRatio,

	mouseOnVideo,
	splitScreenProportion;


function setVideoSource(source, onDimensionsReady){

	onDimensionsReady = onDimensionsReady || function(){}

	try {
	    var attempts = 0;
	    var readyListener = function(event) {
	        findVideoSize();
	    };
	    var findVideoSize = function() {
	        if(video.videoWidth > 0 && video.videoHeight > 0) {
	            video.removeEventListener('loadeddata', readyListener);
	            onDimensionsReadyWrap()
	        } else {
	            if(attempts < 10) {
	                attempts++;
	                setTimeout(findVideoSize, 200);
	            } else {
	                onDimensionsReadyWrap()
	            }
	        }
	    };

	    var onDimensionsReadyWrap = function(){
	    	videoAspectRatio = video.videoWidth / video.videoHeight
            onDimensionsReady(video.videoWidth, video.videoHeight);
	    }
		

		if(source == 'webcam'){
			compatibility.getUserMedia({video: true}, function(stream) {
			    try {
			        video.src = compatibility.URL.createObjectURL(stream);
			    } catch (error) {
			        video.src = stream;
			    }
			    setTimeout(function() {
			        video.play();
			    }, 500);
			}, function (error) {
				video.src = 'face.mp4'
				video.loop = 'loop'
			    video.autoplay = 'autoplay'				
			});
		} else {
			video.src = source
			video.loop = 'loop'
		    video.autoplay = 'autoplay'
		}

	    video.addEventListener('loadeddata', readyListener);

	} catch (error) {}

}


function tick() {
    compatibility.requestAnimationFrame(tick);
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        signalPyr.applyIm(video)


        var total = 0, count = 0;
        for(var k = 0; k < procPyr1.levels.length ; k++){
        	for (var i = 0; i < procPyr1.levels[k].ctx.realdata.length; i+=4) {
				procPyr1.levels[k].ctx.realdata[i]   = procPyr1.levels[k].ctx.realdata[i]  * (1 - pyr1Attenuation) +  pyr1Attenuation * signalPyr.levels[k].ctx.realdata[i] 
				procPyr1.levels[k].ctx.realdata[i+1] = procPyr1.levels[k].ctx.realdata[i+1] * (1 - pyr1Attenuation)  + pyr1Attenuation * signalPyr.levels[k].ctx.realdata[i+1] 
				procPyr1.levels[k].ctx.realdata[i+2] = procPyr1.levels[k].ctx.realdata[i+2] * (1 - pyr1Attenuation)  + pyr1Attenuation * signalPyr.levels[k].ctx.realdata[i+2] 

				procpyr2.levels[k].ctx.realdata[i]   = procpyr2.levels[k].ctx.realdata[i]  * (1 - pyr2Attenuation) +  pyr2Attenuation * signalPyr.levels[k].ctx.realdata[i]
				procpyr2.levels[k].ctx.realdata[i+1] = procpyr2.levels[k].ctx.realdata[i+1] * (1 - pyr2Attenuation)  + pyr2Attenuation * signalPyr.levels[k].ctx.realdata[i+1] 
				procpyr2.levels[k].ctx.realdata[i+2] = procpyr2.levels[k].ctx.realdata[i+2] * (1 - pyr2Attenuation)  + pyr2Attenuation * signalPyr.levels[k].ctx.realdata[i+2] 

				signalPyr.levels[k].ctx.realdata[i]    += spatialAmpFactors[k] * ( - procPyr1.levels[k].ctx.realdata[i] + procpyr2.levels[k].ctx.realdata[i])
				signalPyr.levels[k].ctx.realdata[i+1]  += spatialAmpFactors[k] * ( - procPyr1.levels[k].ctx.realdata[i+1] + procpyr2.levels[k].ctx.realdata[i+1])
				signalPyr.levels[k].ctx.realdata[i+2]  += spatialAmpFactors[k] * ( - procPyr1.levels[k].ctx.realdata[i+2] + procpyr2.levels[k].ctx.realdata[i+2])
			}	
        }

        procPyr1.levels[procPyr1.levels.length - 1].canvas = signalPyr.levels[procPyr1.levels.length - 1].canvas
		
        signalPyr.pyrUp()
    }

	// ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    
    // if(mouseOnVideo){
	    signalPyr.levels[0].ctx.drawImage(
	    	video, 
	    	video.videoWidth*splitScreenProportion, 0, video.videoWidth*(1-splitScreenProportion), video.videoHeight, 
	    	canvas.width*splitScreenProportion, 0, canvas.width*(1-splitScreenProportion), canvas.height)    	
    // }
}

function makecontrols(w, h){
	coeffSelector('#coefs .vis', {

	    top: 30,
	    right: 10,
	    bottom: 30,
	    left: 20

	}, w, h, function(x){
		// console.log(x)

		var hz = Math.round(x.f/2 / (Math.PI / 30)*10)/10
		
		document.querySelector('.hz').innerText = hz + 'Hz'
		document.querySelector('.hz').style['animation-duration'] = 1/hz + 's'
		document.querySelector('.times').innerText = Math.round(x.amp*10)/10

	  	pyr1Attenuation = x.c1
		pyr2Attenuation = x.c2
	})

	alphasChart('#spatialAmpFactors .vis', {
	    
	    top: 30,
	    right: 50,
	    bottom: 30,
	    left: 50

	}, w, h, levels+1, function(x){
		
		spatialAmpFactors = x.alphas
		document.querySelector('.proportion').innerText = w/Math.pow(2,Math.floor(levels - x.proportion))+'px'
		document.querySelector('.small').innerText = Math.floor(spatialAmpFactors[0])
		document.querySelector('.big').innerText = Math.floor(spatialAmpFactors[levels-1])
		document.querySelector('.biggest').innerText = Math.floor(spatialAmpFactors[levels-1])

	})
}


(function makeresizebar(){
	
	var startheight, starty
	var display = document.getElementById('display')

	var onmove = function(e){
		var height = startheight + e.clientY - starty
		display.style.height = height
		canvas.style.height = height
		canvas.style.width = height * videoAspectRatio
	}

	var onend = function(e){
		document.removeEventListener('mousemove', onmove)
		document.removeEventListener('mouseup', onend)
		
		document.body.style.cursor = 'auto'
	}

	document.getElementById('resize').addEventListener('mousedown',function(e){
		e.preventDefault()
		starty = e.clientY
		startheight = canvas.getBoundingClientRect().height
		document.addEventListener('mousemove', onmove)
		document.addEventListener('mouseup', onend)

		document.body.style.cursor = 'row-resize'
	})
	
})()

var tabs = (function maketabs(){
	var tabs = [
		{
			name: 'Live Webcam',
			source: 'webcam'
		},
		{
			name: 'Face',
			source: 'face.mp4'
		},
		{
			name: 'Baby',
			source: 'baby.mp4'
		}
	]

	tabs.forEach(function(tabobj){

		var el = document.createElement('span')

		el.className = 'tab'
		el.innerHTML = tabobj.name
		tabobj.el = el

		tabobj.makeActive = function(){
			tabs.forEach(function(t){
				t.el.className = 'tab'
			})

			el.className = 'active tab'
		}

		el.addEventListener('click', function() {

			tabobj.makeActive()

			setVideoSource(tabobj.source, function(){
				canvas.style.width = canvas.getBoundingClientRect().height*videoAspectRatio
			})

		})

		document.getElementById('tabs').appendChild(el)

	})

	return tabs

})()

setVideoSource('webcam', function(w,h){

	tabs[0].makeActive()

	signalPyr = Pyramid(w,h,levels)
	procPyr1 = Pyramid(w,h,levels)
	procpyr2 = Pyramid(w,h,levels)

	canvas = signalPyr.levels[0].canvas


	canvas.addEventListener('mouseover', function(e){
		console.log(e)
		mouseOnVideo = true
	})

	canvas.addEventListener('mouseout', function(e){
		console.log(e)
		mouseOnVideo = false
	})

	canvas.addEventListener('mousemove', function(e){
		splitScreenProportion = e.offsetX / canvas.getBoundingClientRect().width
	})

	// var bgcanvas = signalPyr.levels[1].canvas
	// bgcanvas.className = 'bgcanvas'
	// document.getElementById('display').appendChild(bgcanvas)
	document.getElementById('display').appendChild(canvas)

	canvas.style.height = 400
	canvas.style.width = 400*videoAspectRatio

	makecontrols(200, 150)

	compatibility.requestAnimationFrame(tick);
})