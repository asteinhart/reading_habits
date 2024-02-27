function drawChart() {
  console.log('chart')
var margin = {top: 20, right: 30, bottom: 30, left: 700},
    width = 1600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    padding = 0.3;
    
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

    
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("gr_js_count.csv", function(error, data) {

  // data.push({
  //   name: 'Total',
  //   end: cumulative,
  //   start: 0,
  //   class: 'total'
  // });
  

  x.domain([0, d3.max(data, function(d) { return +d.end_num; })]);
  y.domain([0, d3.max(data, function(d) { return +d.rn; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var bar = chart.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", 'bar')
      .attr('id', d => 'bar' + d.book_id)
      .attr("transform", function(d) { return "translate(" + x(d.start_num)+ ",0)"; })
      .style("fill", 'steelblue')

  bar.append("rect")
      .attr("y", function(d) { return y(d.rn); })
      .attr("height", 2)
      .attr("width", function(d) { return x(d.duration_days); });

  // bar.append("text")
  //     .attr("x", x.rangeBand() / 2)
  //     .attr("y", function(d) { return y(d.end) + 5; })
  //     .attr("dy", function(d) { return ((d.class=='negative') ? '-' : '') + ".75em" })
  //     .text(function(d) { return dollarFormatter(d.end - d.start);});

  // bar.filter(function(d) { return d.class != "total" }).append("line")
  //     .attr("class", "connector")
  //     .attr("x1", x.rangeBand() + 5 )
  //     .attr("y1", function(d) { return y(d.end) } )
  //     .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
  //     .attr("y2", function(d) { return y(d.end) } )
});
}

function main() {
  let offset = '75%';
  console.log('main')
  drawChart();

  new Waypoint({
    element: document.getElementById('step1'),
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
  })}

main();