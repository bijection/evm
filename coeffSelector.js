function coeffSelector(selector, inset, width, height, coeffCallback) {
    var MIN  = 0
    var TWICEFRAMERATE = 60
    var MAX = Math.PI/5

    width -= inset.left + inset.right,
    height -= inset.top + inset.bottom;

    var svg = d3.select(selector).append("svg")
        .attr("width", width + inset.left + inset.right)
        .attr("height", height + inset.top + inset.bottom)
        .append("g")
        .attr("transform", "translate(" + inset.left + "," + inset.top + ")");


    var data = [];

    for(var i = MIN; i < MAX; i += 0.01){
        data.push({ q: i, p: f(i, y0, z0) })
    }

    var alphaBetaWidth = width/3
    var alphaBetaOffset = (width - alphaBetaWidth)

    var x = d3.scale.linear() .range([0, width]);
    var y = d3.scale.linear() .range([height, 0]);
    // x.domain(d3.extent(data, function(d) { return d.q; }));
    // y.domain(d3.extent(data, function(d) { return d.p; }));
    x.domain([MIN, MAX])
    y.domain([MIN, 1])


    var xMini = d3.scale.linear() .range([0, alphaBetaWidth]);
    var yMini = d3.scale.linear() .range([0, alphaBetaWidth]);

    // var xAxisMini = d3.svg.axis()
    //     .scale(xMini)
    //     .orient("top")
    //     .ticks(1);

    // var yAxisMini = d3.svg.axis()
    //     .scale(yMini)
    //     .orient("left")
    //     .ticks(1);


    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(" + alphaBetaOffset + ",0)")
    //     .call(xAxisMini);

    // svg.append("g")
    //     .attr("transform", "translate(" + alphaBetaOffset + ",000)")
    //     .attr("class", "y axis")
    //     .call(yAxisMini);



    // var alphaBeta = svg.append('circle')
    //     .attr('r', 6)
    //     .attr("transform", "translate(" + alphaBetaOffset + ",000)")
    //     .attr('cx', xMini(y0))
    //     .attr('cy', yMini(z0))
    //     .call(d3.behavior.drag().on('drag', changeAlphaBeta))



    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(a){
            return Math.floor(a/Math.PI * TWICEFRAMERATE)
        })
        .ticks(2);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(1);

    var line = d3.svg.line()
        .x(function(d) { return x(d.q); })
        .y(function(d) { return y(d.p); });




    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var plot = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


    var realcircle = svg.append('circle')
        .attr('r', 6)
        .attr('fill', 'green')
        .attr('cx', x(x0))
        .attr('cy', y(f(x0, y0, z0)))
        .call(d3.behavior.drag().on('drag', change))



    function changeAlphaBeta(){
        y0 = xMini.invert(d3.event.x- alphaBetaOffset)
        z0 = yMini.invert(d3.event.y)

        for(var i = 0; i < 10; i++){
            x0 -= g(x0, y0, z0) / dgdx(x0, y0, z0)
        }

        updatePlots()
    }


    function change(){
        var target = d3.select(this)
        target
            .attr('cx', d3.event.x)
            .attr('cy', d3.event.y)

        for(var k = 0; k < 40; k++){ // do a max of 20 iterations
            var dx = x0 - x.invert(d3.event.x),
                dy = y.invert(d3.event.y) - f(x0, y0, z0);

            var step = 0.01
            var mag = Math.sqrt(dx * dx + dy * dy)
            if(mag < step) break;

            var nyz = move(x0, y0, z0, 
                dx / mag * step, 
                dy / mag * step)
        
            y0 = nyz[0]
            z0 = nyz[1]
            // a single iteration of newton's method
            x0 -= g(x0, y0, z0) / dgdx(x0, y0, z0)
        }
        updatePlots()
    }


    function updatePlots(){
        if(isNaN(x0) || isNaN(y0) || isNaN(z0)){
            y0 = 0.568
            z0 = 0.192
            x0 = 0.2
        }
        realcircle
            .attr('cx', x(x0))
            .attr('cy', y(f(x0, y0, z0)))

        // alphaBeta
        //     .attr('cx', xMini(y0))
        //     .attr('cy', yMini(z0))

        var data = [];
        for(var i = MIN; i < MAX; i += 0.01){
            data.push({ q: i, p: f(i, y0, z0) })
        }

        plot.datum(data).attr("d", line)

        coeffCallback({
            c1: y0,
            c2: z0,
            f: x0,
            amp: f(x0, y0, z0)
        })

    }

    updatePlots()

}