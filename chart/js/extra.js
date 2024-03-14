
function drawLineChart() {
    console.log('chart')
  
    let chart = d3.select(".chart")
    .append('svg')
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("id", "g-chart")
      .attr("transform", "translate(" + (margin.right) + "," + margin.top + ")")
      .attr("width", chartWidth);
  
    d3.csv("data/gr_js_count.csv", function(error, data) {
      fil = data.filter(function(d) { return d.end_num >= 900 && d.end_num <= 2000});
      //console.log(fil);
  
        // Add X axis
    let x = d3.scaleLinear()
      .range([0, chartWidth - margin.right])
      .domain([1000, 2000])
      //.domain([0, d3.max(data, function(d) { return +d.end_num; })])
    let xAxis = chart.append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  
    // Add Y axis
    let y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return +d.rn; })])
    let yAxis = chart.append("g")
      .attr("id", "y-axis")
      .call(d3.axisLeft(y));
  
    var line = d3.line()
      .x(fil => x(fil.end_num))
      .y(fil => y(fil.rn))
      //.curve(d3.curveStepBefore)
  
    chart.append("path")
      .datum(fil)
      .attr("id", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line)
  })
  };
  

  new Waypoint({
    element: document.getElementById('step2'),
    handler: function(direction) {
      if (direction == 'down') {
        console.log('Basic waypoint triggered')
        d3.selectAll(".bar")
          .transition().duration(1000)
          .style("fill", 'red')
    } 
    else {
        d3.selectAll(".bar")
          .transition().duration(1000)
          .style("fill", 'steelblue')
            }
        },
    offset: offset
  });