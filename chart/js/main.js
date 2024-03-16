// dropdown button
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}





const margin = {top: 20, right: 30, bottom: 30, left: 30},
      chartWidth = 900
      height = 400 - margin.top - margin.bottom,
      padding = 0.3;

const summers = [{
        start: "2016-06-01",
        end: "2016-09-15"},
        {
          start: "2017-06-01",
          end: "2017-09-15"
        },
        {
          start: "2018-06-01",
          end: "2018-09-15"
        },
    ];

var data = d3.csv("data/gr_js_count.csv")

const colorScale = d3
  .scaleLinear()
  .domain([0, 500])
  .range(['red', 'green'])

function fullChartStart() {

  var chart = d3.select(".chart")
  .append('svg')
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("id", "g-chart")
    .attr("transform", "translate(" + (margin.right) + "," + margin.top + ")")
    .attr("width", chartWidth);

  // create a tooltip
  var Tooltip = d3.select(".chart")
    .append("div")
      .style("opacity", "0")
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", 'relative')

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html("<b> Book Title:</b> " + d.title + "</br>" + "<b> Author:</b> " + d.author_last +  " " + d.author_first +  "</br>" +"<b>Date Started:</b> " 
            + d.start_tooltip +"</br>" + "<b> Date Finished: </b>" + d.end_tooltip + "</br>"+ "<b> Reading Duration:</b> " + d.duration_days + "</br>"+ "<b> Rating:</b> " + d.my_rating +"/5")
      .style("left", (d3.mouse(this)[0]+300) + "px")
      .style("top", (d3.mouse(this)[1]-500) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 1)
  }

d3.csv("data/gr_js_count.csv", function(error, data) {

  var parseDate = d3.timeParse("%Y-%m-%d")

  data.forEach(function(d){
    // parse strings into date object or numbers
    d.start_tooltip = d.date_start
    d.end_tooltip = d.date_read
    d.date_start = parseDate(d.date_start);
    d.date_read = parseDate(d.date_read);
    d.rn = +d.rn
    d.start_tooltip
    d.my_rating = +d.my_rating
    d.n_pages = +d.n_pages
  })

  const minDate = d3.min(data, d => d.date_start);
  const maxDate = d3.max(data, d => d.date_read);
  const totalRead = d3.max(data, function(d) { return d.rn; })
  const barHeight = 10
  const division1 = new Date("2019-04-16")
  const division2 = new Date("2021-08-01")
  const division3 = new Date("2022-03-07")
  const division4 = new Date("2023-09-01")
  var divisions = [division1, division2, division3,  division4]


  x = d3.scaleTime()
    .range([0, chartWidth - margin.right])
    .domain([minDate, maxDate])
  y = d3.scaleLinear()
    .range([height, 0])
    .domain([0,totalRead])

  let xAxis = chart.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%Y")));
  
  let yAxis = chart.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(y));

  chart.selectAll(".bar")
       .data(data)
     .enter().append("g")
       .attr("class", 'bar')
       .attr('id', d => 'bar-' + d.book_id)
       .attr("transform", function(d) { return "translate(" + x(d.date_start)+ ",0)"; })
       .style('fill', 'steelblue')
       //.style('fill', d => colorScale(d.n_pages))
     .append("rect")
      .transition()
      .duration(1500)
      .attr("y", function(d) { return (y(+d.rn)-barHeight/2); })
      .attr("height", barHeight)
      .attr("width", function(d) { return (x(d.date_read) - x(d.date_start)); })
  
  chart.selectAll('.bar')
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)


  for (const division of divisions) {
    chart.append("line")
      .transition()
      .attr("class", "divisions")
      .attr("x1", x(division))  //<<== change your code here
      .attr("y1", 0)
      .attr("x2", x(division))  //<<== and here
      .attr("y2", height)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("stroke-dasharray", ("3, 3")) 
      .style("fill", "none")
      .style("opacity", "0");
      }

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

function fullChartRefresh() {
  // full refresh
  d3.selectAll("rect").attr("pointer-events", "auto");
  d3.csv("data/gr_js_count.csv", function(error, data) {
    var chart = d3.select(".chart")
    var parseDate = d3.timeParse("%Y-%m-%d")

    data.forEach(function(d){
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn
    })
    const maxDate = d3.max(data, d => d.date_read);
    const minDate = d3.min(data, d => d.date_start);
    const totalRead = d3.max(data, function(d) { return d.rn; })


    // Update X axis
    x = d3.scaleTime()
      .range([0, chartWidth - margin.right])
      .domain([minDate, maxDate])
    y = d3.scaleLinear()
      .range([height, 0])
      .domain([0,totalRead])

    chart.select("#x-axis")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%Y")));
  
    chart.select("#y-axis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

              // Update chart
  var bars = chart.selectAll('.bar')
    .data(data)

  bars
    .enter()
    .append("g")
    .merge(bars)
    .transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + x(d.date_start)+ ",0)"; })
    .selectAll("rect")
      .attr("y", function(d) { return y(d.rn); })
      .attr("height", 4)
      .attr("width", function(d) { return (x(d.date_read) - x(d.date_start));});
})}

function panChart(startDate,endDate, barHeight) {
  var chart = d3.select(".chart")

  d3.csv("data/gr_js_count.csv", function(error, data) {
      var parseDate = d3.timeParse("%Y-%m-%d")
      fil = data.filter(function(d) { return parseDate(d.date_start) > startDate & parseDate(d.date_read) <=  endDate});
      console.log(fil)
  
      data.forEach(function(d){
        // parse strings into date object or numbers
        d.date_start = parseDate(d.date_start);
        d.date_read = parseDate(d.date_read);
        d.rn = +d.rn
      })
      const maxDate = d3.max(fil, d => d.date_read);
      const minDate = d3.min(fil, d => d.date_start);
      const minBook = d3.min(fil, d => d.rn);
      const maxBook = d3.max(fil, d => d.rn);
      console.log(maxDate, minDate)

      // Update X axis
      var x = d3.scaleTime()
      .range([0, chartWidth - margin.right])
      .domain([minDate, maxDate])
  
      chart.select("#x-axis")
        .transition().duration(1000)
        .call(d3.axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat("%b %Y")))
      
      // Update Y axis
      var y = d3.scaleLinear()
      .range([height, 0])
      .domain([minBook,maxBook])
  
      chart.select("#y-axis")
        .transition().duration(1000)
        .call(d3.axisLeft(y));
      
      // Update chart
      var bars = chart.selectAll('.bar').data(data)
      

      // bars
      // .filter(function(d) {
      //   return parseDate(d.date_start) > startDate & parseDate(d.date_read) <=  endDate;
      //       }).exit().remove()

      bars
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + x(d.date_start)+ ",0)"; })
        .selectAll("rect")
          .attr("y", function(d) { return y(d.rn); })
          .attr("height", barHeight)
          .attr("width", function(d) { return (x(d.date_read) - x(d.date_start));});

      //d3.select("#svg").attr('clip-path', 'url(#clip)')


      // exit_bars = chart.selectAll('.bar')
      //     .data(fil)
      //     .exit().remove()
      })

     

}
function summer2016() {

  d3.selectAll("rect").attr("pointer-events", "none");

  d3.csv("data/gr_js_count.csv", function(error, data) {
    var chart = d3.select(".chart")
    var parseDate = d3.timeParse("%Y-%m-%d")
    startDate = new Date("2016-09-15")

    fil = data.filter(function(d) { return parseDate(d.date_start) <= startDate});

    data.forEach(function(d){
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn
    })
    const maxDate = d3.max(fil, d => d.date_read);
    const minDate = d3.min(fil, d => d.date_start);

    // Update X axis
    var x = d3.scaleTime()
    .range([0, chartWidth - margin.right])
    .domain([minDate, maxDate])

    chart.select("#x-axis")
      .transition().duration(1000)
      .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%b %Y")))
    
    // Update Y axis
    let y = d3.scaleLinear()
    .range([height, 0])
    .domain([1,18])

    chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));

    // Update chart
    var bars = chart.selectAll('.bar')
      .data(data)

    bars
      .transition()
      .duration(1000)
      .attr("transform", function(d) { return "translate(" + x(d.date_start)+ ",0)"; })
      .selectAll("rect")
        .attr("y", function(d) { return y(d.rn); })
        .attr("height", 20)
        .attr("width", function(d) { return (x(d.date_read) - x(d.date_start));});

    bars
      .exit().remove();
    })
}

function collegeChart() {
  var chart = d3.select(".chart")

  d3.csv("data/gr_js_count.csv", function(error, data) {
      var parseDate = d3.timeParse("%Y-%m-%d")
      endDate = new Date("2019-04-16")
      fil = data.filter(function(d) { return parseDate(d.date_start) <= endDate});
  
      data.forEach(function(d){
        // parse strings into date object or numbers
        d.date_start = parseDate(d.date_start);
        d.date_read = parseDate(d.date_read);
        d.rn = +d.rn
      })
      const maxDate = d3.max(fil, d => d.date_read);
      const minDate = d3.min(fil, d => d.date_start);
  
      // Update X axis
      x = d3.scaleTime()
      .range([0, chartWidth - margin.right])
      .domain([minDate, maxDate])
  
      chart.select("#x-axis")
        .transition().duration(1000)
        .call(d3.axisBottom(x)
          .tickFormat(d3.timeFormat("%b %Y")))
      
      // Update Y axis
      let y = d3.scaleLinear()
      .range([height, 0])
      .domain([0,40])
  
      chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));
  
        //shading
      var parseDate = d3.timeParse("%Y-%m-%d");

      summers.forEach(function (d) {
          d.start = parseDate(d.start);
          d.end = parseDate(d.end);
        })

        console.log("summer")
        console.log(summers[0].start)

        d3.select("#g-chart").selectAll(".shading")   
          .data(summers)
          .enter()
          .append("rect")
            .attr("class", "shading")
            .attr("x", function(d) { return x(d.start); })
            .attr("y", 0)
            .attr("width", function(d) { return (x(d.end)- x(d.start)); })
            .attr("height", height)
            .attr("opacity", 0)
            .attr("fill", "#a3cdf0")

        d3.selectAll(".shading").transition().delay(500).duration(1500).attr("opacity", 0.2)   
        
        // Update chart
        var bars = chart.selectAll('.bar')
        .data(data)

      bars
        .enter()
        .append("g")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + x(d.date_start)+ ",0)"; })
        .selectAll("rect")
          .attr("y", function(d) { return y(d.rn); })
          .attr("height", 15)
          .attr("width", function(d) { return (x(d.date_read) - x(d.date_start));});
      })
}

const barHeight4 = 10
      barHeight5 = 25
      barHeight6 = 15
      barHeight7 = 25
      

function main() {
  let offset = '80%';
  console.log('main')
  fullChartStart();

  // fade in chart
  new Waypoint({
    element: document.getElementById('intro-chart'),
    handler: function(direction) {
      if (direction == 'down') {
        console.log('show chart')
        d3.select('.chartContainer')
        .transition()
        .duration(1000)
        .style("opacity", '1')
    } else {
      console.log('rm chart')
      d3.select('.chartContainer')
      .transition()
      .duration(1000)
      .style("opacity", '0')
    }
        },
    offset: offset
  });
  // add lines for periods
  new Waypoint({
    element: document.getElementById('step1a'),
    handler: function(direction) {
      if (direction == 'down') {
        d3.selectAll('.divisions')
        .transition()
        .duration(1000)
        .style("opacity", '1')
    } else {
        d3.selectAll('.divisions')
        .transition()
        .duration(1000)
        .style("opacity", '0')
      }
        },
    offset: offset
  });

  step1a

  // zoom into 2019
  new Waypoint({
    element: document.getElementById('step2'),
    handler: function(direction) {
      if (direction == 'down') {
        // 2 summer 2016
        d3.selectAll('.divisions')
        //.transition()
        .style("opacity", '0')
        summer2016();
      } else {
        fullChartRefresh();
      }},
              offset: offset
        });

  // move to all of college and color summers
  new Waypoint({
    element: document.getElementById('step3'),
    handler: function(direction) {
      if (direction == 'down') {
          //  3 college years
          collegeChart();
      } else {
          //
          summer2016();
          d3.selectAll(".shading").transition().duration(500).attr("opacity", 0);
      }},
      offset: offset
    });

  // post college / covid (summer 2019 to fall 2021)
  new Waypoint({
    element: document.getElementById('step4'),
    handler: function(direction) {
      if (direction == 'down') {
          // 4 Post College / COVID
          d3.selectAll(".shading").transition().duration(500).attr("opacity", 0);
          startDate = new Date("2019-07-01")
          endDate = new Date("2021-08-01")
          panChart(startDate, endDate, barHeight4);
      } else {
          //  3 college years
          collegeChart();
      }},
      offset: offset
    });

  // move to NYC slow down fall 21 to spring 22
  new Waypoint({
    element: document.getElementById('step5'),
    handler: function(direction) {
      if (direction == 'down') {
        // 5 Move to NYC
        startDate = new Date("2021-08-01")
        endDate = new Date("2022-03-07")
        panChart(startDate, endDate, barHeight5);
      } else {
        // 4 Post College / COVID
        startDate = new Date("2019-07-01")
        endDate = new Date("2021-08-01")
        panChart(startDate, endDate, barHeight4);
      }},
      offset: offset
    });

  // NYC pickup spring 22 to Fall 23 grad school
  new Waypoint({
    element: document.getElementById('step6'),
    handler: function(direction) {
      if (direction == 'down') {
        // 6 NYC
        startDate = new Date("2022-03-07")
        endDate = new Date("2023-09-01")
        panChart(startDate, endDate, barHeight6);
      } else {
        // 5 Move to NYC
        startDate = new Date("2021-08-01")
        endDate = new Date("2022-03-07")
        panChart(startDate, endDate, barHeight5);
      }},
      offset: offset
    });

  // start grad school
  new Waypoint({
    element: document.getElementById('step7'),
    handler: function(direction) {
      if (direction == 'down') {
        // 7 start grad school
        startDate = new Date("2023-09-01")
        endDate = new Date("2024-01-26")
        panChart(startDate, endDate, barHeight7);
      } else {
        // 6 NYC
        startDate = new Date("2022-03-07")
        endDate = new Date("2023-09-01")
        panChart(startDate, endDate, barHeight6);
      }},
      offset: offset
    });


  // total at end
  new Waypoint({
    element: document.getElementById('step8'),
    handler: function(direction) {
      if (direction == 'down') {
        // 8 total
        fullChartRefresh();
      } else {
        // 7 start grad school
        startDate = new Date("2023-09-01")
        endDate = new Date("2024-01-26")
        panChart(startDate, endDate, barHeight7);
      }},
      offset: offset
    });



  new Waypoint({
    element: document.getElementById('outro'),
    handler: function(direction) {
      if (direction == 'down') {
        console.log('show chart')
        d3.select('.chartContainer')
        .transition()
        .duration(1000)
        .style("opacity", '0')
    } else {
      console.log('rm chart')
      d3.select('.chartContainer')
      .transition()
      .duration(1000)
      .style("opacity", '1')
    }
        },
    offset: offset
  });
}


main();