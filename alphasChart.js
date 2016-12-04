function alphasChart(selector, inset, width, height, levels, onChangeCallback){

	width -= inset.left + inset.right
    height -= inset.top + inset.bottom
    
    var initialposition = {
    	x:width/2,
    	y:height/10*4
    }

	var stride = width / (levels-1);

	var svg = d3.select(selector).append("svg")
	    .attr("width", width + inset.left + inset.right)
	    .attr("height", height + inset.top + inset.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + inset.left + "," + inset.top + ")");

	var container = svg.append("g");


	var x = d3.scale.linear() .range([0, width]);
    var y = d3.scale.linear() .range([height, 0]);

    y.domain([0, 100])

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(1)
        .tickFormat(function(x){
        	return x<.5 ? 
        		'small things':'big things'
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(1);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);



	var bars = container.append("g")
	    .attr("class", "bar")
	  	.selectAll("line")
	    .data(d3.range(1,levels))
	  	.enter().append("line")
	    .attr("x1", function(d) { return d*stride; })
	    .attr("y1", height)
	    .attr("x2", function(d) { return d*stride; })
	    .attr("y2", 100);

	var dropoffLine = container.append('line')
		.attr({x1: 0, y1: height, class: 'drop' })

	var flatLine = container.append('line')
		.attr({x2: width, class: 'flat'})

	var dot = container.append("g")
		.attr("class", "dot")
		.selectAll("circle")
		.data([initialposition])
		.enter().append("circle")
		.attr("r", 6)
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.call(d3.behavior.drag().on("drag", dragged));

	function clamp(v, min, max){
		return Math.max(Math.min(v, max), min)
	}	

	function dragged(d) {
		d3.event && d3.select(this)
			.attr("cx", d.x = clamp(d3.event.x, 0, width))
			.attr("cy", d.y = clamp(d3.event.y, 0, height))

		dropoffLine.attr({x2:d.x, y2:d.y})
		flatLine.attr({x1: d.x, y1:d.y, y2:d.y})

		bars.attr("y2", function(i){
			return Math.max(height - i*(height - d.y)/d.x*stride, d.y)
		})

		onChangeCallback({
			alphas: bars[0].map(function (slider){
				return y.invert(d3.select(slider).attr("y2"))
			}),
			proportion: d.x/stride
		})
	}

	dragged(initialposition)
}