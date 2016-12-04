var Pyramid = (function(){
	function sub2ndfrom1st(d1,d2){
		for (var i = 0; i < d1.length; i+=4) {
			d1[i] -= d2[i]
			d1[i+1] -= d2[i+1]
			d1[i+2] -= d2[i+2]
		}
	}

	function add2ndto1st(d1,d2){
		for (var i = 0; i < d1.length; i+=4) {
			d1[i] += d2[i]
			d1[i+1] += d2[i+1]
			d1[i+2] += d2[i+2]
		}
	}

	function replace1stwith2nd(d1,d2){
		for (var i = d1.length - 1; i >= 0; i--) {
			d1[i] = d2[i]
		}
	}

	function pyramid(W,H,num_deep){
	    var p = []
	    for (var i = 0; i < num_deep; i++) {
	        var canvas = document.createElement('canvas')
	        canvas.width = W
	        canvas.height = H
	        // canvas.style.width = W/2
	        // canvas.style.height = H/2

	        var ctx = canvas.getContext('2d')
	        ctx.realdata = new Float32Array(ctx.getImageData(0,0,canvas.width, canvas.height).data)
	        
	        p.push({canvas: canvas, ctx:ctx})
	        
	        W/=2
	        H/=2
	    }
	
		function pyrDown(){
		    p.forEach(function(level, i){
		    	if(i+1<p.length){
		    		var nextlevel = p[i+1]

			    	nextlevel.ctx.drawImage(level.canvas, 0,0, nextlevel.canvas.width, nextlevel.canvas.height)
			    	var highfreq = level.ctx.getImageData(0,0,level.canvas.width, level.canvas.height)

			    	level.ctx.drawImage(nextlevel.canvas, 0,0, level.canvas.width, level.canvas.height)
			    	var lowfreq = level.ctx.getImageData(0,0,level.canvas.width, level.canvas.height)

			    	replace1stwith2nd(level.ctx.realdata, highfreq.data)
			    	sub2ndfrom1st(level.ctx.realdata, lowfreq.data)
			    	sub2ndfrom1st(highfreq.data, lowfreq.data)

			    	level.ctx.putImageData(highfreq,0,0)
		    	}
		    	else {
		    		level.ctx.realdata = level.ctx.getImageData(0,0,level.canvas.width, level.canvas.height).data
		    	}
		    })
		}

		function pyrUp(){

			//in case realdata was modified
			var bottomlevel = p[p.length-1]
			var bottomdata = bottomlevel.ctx.getImageData(0,0,bottomlevel.canvas.width, bottomlevel.canvas.height)
			replace1stwith2nd(bottomdata.data, bottomlevel.ctx.realdata)
			// if(Math.random()>.99) console.log(bottomdata)
			bottomlevel.ctx.putImageData(bottomdata,0,0)

		    for (var i = p.length-1; i >= 0; i--) {
		    	if(i > 0){
		    		var level = p[i]
		    		var prevlevel = p[i-1]

			    	var highfreq = prevlevel.ctx.realdata

			    	prevlevel.ctx.drawImage(level.canvas, 0,0, prevlevel.canvas.width, prevlevel.canvas.height)

			    	var lowfreq = prevlevel.ctx.getImageData(0,0,prevlevel.canvas.width, prevlevel.canvas.height)

			    	add2ndto1st(lowfreq.data, highfreq)

			    	prevlevel.ctx.putImageData(lowfreq,0,0)

		    	}
		    }
		}

		function applyIm(image){
			p[0].ctx.drawImage(image, 0,0, p[0].canvas.width, p[0].canvas.height)
			pyrDown()
		}

		return {
			pyrDown: pyrDown,
			pyrUp: pyrUp,
			applyIm: applyIm,
			levels: p
		}
	}

	return pyramid
	
})()