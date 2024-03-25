// dropdown button
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    //this.classList.toggle("active");
    // idk why unicode doenst work here
    if (this.innerHTML.indexOf("▼") !== -1) {
      this.innerHTML =
        "&#9654 Some comments about the data for those interested.";
    } else {
      this.innerHTML =
        "&#x25BC Some comments about the data for those interested.";
    }
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

const margin = { top: 30, right: 30, bottom: 30, left: 50 },
      chartWidth = 900;
      width = 720 - margin.left - margin.right;
      height = 500 - margin.top - margin.bottom;
      padding = 0.3;

// colors 
let defaultColor = "steelblue"
const colorScale = d3.scaleLinear().domain([0, 500]).range(["red", "green"]);

const summers = [
  {
    start: "2016-06-01",
    end: "2016-09-15",
  },
  {
    start: "2017-06-01",
    end: "2017-09-15",
  },
];

const collegeColor = "#8B80F9"
      covidColor = "#D1495B"
      movingColor = "#2A7F62"
      nycColor = "#EE964B"
      gradColor = "#F95738"
      colors = [collegeColor, covidColor, movingColor, nycColor, gradColor];
      labelClasses = [".bar.college",".bar.covid",".bar.moving",".bar.nyc",".bar.grad"];
      nonfictionColor = "#58A4B0"
      fictionColor = "#F7C4A5"


const division1 = new Date("2019-04-16");
      division2 = new Date("2021-08-14");
      division3 = new Date("2022-04-01");
      division4 = new Date("2023-09-01");
      divisions = [division1, division2, division3, division4];

function assignBarClass(date, divisions) {
    return date < divisions[0] ? "bar college"
    : date < divisions[1] ? "bar covid"
    : date < divisions[2] ? "bar moving"
    : date < divisions[3] ? "bar nyc"
    : "bar grad";
}

function typeColor(type) {
  return type == 'nonfiction' ? nonfictionColor : fictionColor;
}

function colorPeriods() {
  var i;
  for (i = 0; i < colors.length; i++) {
    bars = d3.selectAll(labelClasses[i])
    //bars.transition().duration(500).style("fill", colors[i]);
    bars.style("fill", colors[i]);
    
}};


function removeAll(color="blue") {
  d3.selectAll(".divisions").transition().style("opacity", "0");
  d3.selectAll(".shading").transition().duration(500).style("opacity", "0");
  d3.selectAll(".periods").transition().duration(500).style("opacity", "0");
  // why two lines?
  if (color == "blue") {
    bars = d3.selectAll(".bar")
    bars.transition().duration(500).style("fill", "steelblue");
  //bars.style("fill", "steelblue")
  } else if (color == "periods") {
    colorPeriods()
  };
  d3.selectAll("path").style("pointer-events", "none")
}

// function addBookText() {
//   d3.csv("data/gr_js_count.csv", function (error, data) {
  
//   book = d3.select("#malcom-x")
//     .data(data)
//     .filter(function(d) { return d.book_id !== "92057"; })
//     .enter()
//     .html( "<b> Book Title:</b> " +
//     d.title +
//     "</br>" +
//     "<b> Author:</b> " +
//     d.author_last +
//     " " +
//     d.author_first +
//     "</br>" +
//     "<b>Date Started:</b> " +
//     d.start_tooltip +
//     "</br>" +
//     "<b> Date Finished: </b>" +
//     d.end_tooltip +
//     "</br>" +
//     "<b> Reading Duration:</b> " +
//     d.duration_days +
//     "</br>" +
//     "<b> Rating:</b> " +
//     d.my_rating +
//     "/5")
// })}



function fullChartStart() {
  var chart = d3
    .select(".chart")
    .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("id", "g-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("width", chartWidth);

  // create a tooltip
 


  var Tooltip = d3
    .select(".chart")
    .append("div")
    .style("opacity", "0")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "relative");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    Tooltip.style("opacity", 1);
    id = "#bar-" +  String(d.book_id)
    d3.select(id).style("stroke", "black").style("opacity", 1);
  };

  function tooltipSide(mouse) {
    if (mouse + 800 > window.innerWidth) {
      tooltipEdit = -200
    } else {
      tooltipEdit = 50
    }
    return mouse + tooltipEdit
    };

  var mousemove = function (d) {
    Tooltip.html(
      "<b> Book Title:</b> " +
        d.title +
        "</br>" +
        "<b> Author:</b> " +
        d.author_last +
        " " +
        d.author_first +
        "</br>" +
        "<b>Date Started:</b> " +
        d.start_tooltip +
        "</br>" +
        "<b> Date Finished: </b>" +
        d.end_tooltip +
        "</br>" +
        "<b> Reading Duration:</b> " +
        d.duration_days + " days" + 
        "</br>" +
        "<b> Rating:</b> " +
        d.my_rating +
        "/5"
    )
      .style("left", tooltipSide(d3.mouse(this)[0])+ "px")
      .style("top", d3.mouse(this)[1] - 500 + "px");
    };
  var mouseleave = function (d) {
    Tooltip.style("opacity", 0);
    id = "#bar-" +  String(d.book_id)
    d3.select(id).style("stroke", "none").style("opacity", 1);
  };

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var parseDate = d3.timeParse("%Y-%m-%d");

    data.forEach(function (d) {
      // parse strings into date object or numbers
      d.start_tooltip = d.date_start;
      d.end_tooltip = d.date_read;
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn;
      d.start_tooltip;
      d.my_rating = +d.my_rating;
      d.n_pages = +d.n_pages;
    });

    const minDate = d3.min(data, (d) => d.date_start);
    const maxDate = d3.max(data, (d) => d.date_read);
    const totalRead = d3.max(data, function (d) {
      return d.rn;
    });
    const barHeight = 10;

    x = d3.scaleTime().range([0, chartWidth]).domain([minDate, maxDate]);
    y = d3.scaleLinear().range([height, 0]).domain([0, totalRead]);

    //tooltip 
    const voronoi = d3.Delaunay
    .from(
      data,
      (d) => ((x(d.date_read)+x(d.date_start))/2),
      (d) => y(d.rn)
    ).voronoi(
      [0,
      0, 
      chartWidth, 
      height]);
    console.log(voronoi)
    
    chart.append("g")
      .attr("class", "voronoiWrapper")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .attr("opacity", 0.5)
        // .attr("stroke", "#ff1493") // Show overlay for debugging
        .attr("fill", "none")
        .style("pointer-events", "none")
        .attr("d", (d,i) => voronoi.renderCell(i))

    let xAxis = chart
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    let yAxis = chart.append("g")
          .attr("id", "y-axis")
          .call(d3.axisLeft(y));

    chart.append("text")
          .attr("class", "y-label")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .style("writing-mode", "vertical-lr")
          .attr("transform", "rotate(180)")
          .attr("y", -height/2)
          .attr("x", 40)
          .text("Cumulative Books Read Since 2016")

    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", (d) => assignBarClass(d.date_start,divisions))
      .attr("id", (d) => "bar-" + d.book_id)
      .attr("transform", function (d) {
        return "translate(" + x(d.date_start) + ",0)";
      })
      .style("fill", "steelblue")
      //.style('fill', d => colorScale(d.n_pages))
      .append("rect")
        .transition()
        .duration(1500)
        .attr("y", function (d) {
          return y(+d.rn) - barHeight / 2;
        })
        .attr("height", barHeight)
        .attr("width", function (d) {
          return x(d.date_read) - x(d.date_start);
        });

    // so on top of bar is good for tooltip
    d3.selectAll(".voronoiWrapper").raise()    

    chart
      .selectAll("path")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    for (const division of divisions) {
      chart
        .append("line")
        .transition()
        .attr("class", "divisions")
        .attr("x1", x(division))
        .attr("y1", 0)
        .attr("x2", x(division))
        .attr("y2", height)
        .style("stroke-width", 2)
        .style("stroke", "black")
        .style("stroke-dasharray", "3, 3")
        .style("fill", "none")
        .style("opacity", "0");
    }

    let textPosition = 105

    function periodLabels(position, text, color) {
      if (position === 0) {
        positionAttr =  x(divisions[position])/2
      } else if (position === 4) {
        positionAttr = (x(maxDate) + x(divisions[position-1]))/2
      } else {
        positionAttr = (x(divisions[position])+x(divisions[position-1]))/2
      }

      id = "period-" + position
      if (position !== 4) {
        chart
          .append("text")
          .attr("class", "periods text")
          .attr("id" , id)
          .text(text)
          .attr("x", positionAttr)
          .attr("y", y(textPosition))
          .style("opacity" , "0")
          .style("text-anchor", "middle")

        var rectBox = document.getElementById(id).getBBox()

        chart.append('rect')
          .attr("class", "periods rect")
          .attr("x", rectBox.x-5)
          .attr("y", rectBox.y)
          .attr("width", rectBox.width+10)
          .attr("height", rectBox.height)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", color)
          .lower()

      } else {
        chart
          .append("text")
          .attr("class", "periods text")
          .attr("id" , id)
          .text(text)
          .attr("x", positionAttr)
          .attr("y", y(textPosition))
          .style("opacity" , "0")
          .style("text-anchor", "middle")
          .style("writing-mode", "tb")

        var rectBox = document.getElementById(id).getBBox()

        chart.append('rect')
          .attr("class", "periods rect")
          .attr("x", rectBox.x)
          .attr("y", rectBox.y-5)
          .attr("width", rectBox.width)
          .attr("height", rectBox.height+10)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", color)
          .style("opacity" , "0")
          .lower()
      }
      }

    periodLabels(0,"College", collegeColor);
    periodLabels(1,"COVID-19", covidColor);
    periodLabels(2,"Moving", movingColor);
    periodLabels(3,"NYC", nycColor);
    periodLabels(4,"Grad School", gradColor);
  });
}

function fullChartRefresh() {
  // full refresh
  d3.selectAll("rect").attr("pointer-events", "auto");
  d3.csv("data/gr_js_count.csv", function (error, data) {
    var chart = d3.select(".chart");
    var parseDate = d3.timeParse("%Y-%m-%d");

    data.forEach(function (d) {
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn;
    });
    const maxDate = d3.max(data, (d) => d.date_read);
    const minDate = d3.min(data, (d) => d.date_start);
    const totalRead = d3.max(data, function (d) {
      return d.rn;
    });

    // Update X axis
    x = d3.scaleTime().range([0, chartWidth]).domain([minDate, maxDate]);
    y = d3.scaleLinear().range([height, 0]).domain([0, totalRead]);

    chart
      .select("#x-axis")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));

    // Update chart
    var bars = chart.selectAll(".bar").data(data);

    bars
      .enter()
      .append("g")
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("transform", function (d) {
        return "translate(" + x(d.date_start) + ",0)";
      })
      .selectAll("rect")
      .attr("y", function (d) {
        return y(d.rn);
      })
      .attr("height", 4)
      .attr("width", function (d) {
        return x(d.date_read) - x(d.date_start);
      });
  });
}

function panChart(startDate, endDate, barHeight, nyc = null) {
  var chart = d3.select(".chart");

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var parseDate = d3.timeParse("%Y-%m-%d");
    fil = data.filter(function (d) {
      return (
        (parseDate(d.date_start) > startDate) &
        (parseDate(d.date_read) <= endDate)
      );
    });
    console.log(fil);

    data.forEach(function (d) {
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn;
    });
    const maxDate = d3.max(fil, (d) => d.date_read);
    const minDate = d3.min(fil, (d) => d.date_start);
    const minBook = d3.min(fil, (d) => d.rn);
    const maxBook = d3.max(fil, (d) => d.rn);
    console.log(maxDate, minDate);

    // Update X axis
    x = d3.scaleTime().range([0, chartWidth]).domain([minDate, maxDate]);

    chart
      .select("#x-axis")
      .transition()
      .duration(1000)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat("%b %Y"))
      );

    // Update Y axis
    var y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([minBook - 1, maxBook + 1]);

    chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));

    // Update chart
    var bars = chart.selectAll(".bar").data(data);

    // bars
    // .filter(function(d) {
    //   return parseDate(d.date_start) > startDate & parseDate(d.date_read) <=  endDate;
    //       }).exit().remove()

    bars
      .transition()
      .duration(1000)
      .attr("transform", function (d) {
        return "translate(" + x(d.date_start) + ",0)";
      })
      .selectAll("rect")
      .attr("y", function (d) {
        return y(d.rn);
      })
      .attr("height", barHeight)
      .attr("width", function (d) {
        return x(d.date_read) - x(d.date_start);
      });

    //d3.select("#svg").attr('clip-path', 'url(#clip)')

    // exit_bars = chart.selectAll('.bar')
    //     .data(fil)
    //     .exit().remove()

    if (nyc === true) {
      d3.select("#g-chart")
        .append("rect")
        .attr("class", "shading nyc")
        .attr("x", x(new Date("2022-08-07")))
        .attr("y", 0)
        .attr("width", x(new Date("2022-12-29")) - x(new Date("2022-08-07")))
        .attr("height", height)
        .attr("opacity", "0")
        .attr("fill", "#cfd1d3")
        .lower();

      d3.select(".shading.nyc").transition().delay(500).attr("opacity", 0.2);
    }
  });
}
function summer2016() {
  d3.selectAll("rect").attr("pointer-events", "none");

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var chart = d3.select("#g-chart");
    var parseDate = d3.timeParse("%Y-%m-%d");
    startDate = new Date("2016-09-15");

    fil = data.filter(function (d) {
      return parseDate(d.date_start) <= startDate;
    });

    data.forEach(function (d) {
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn;
    });
    const maxDate = d3.max(fil, (d) => d.date_read);
    const minDate = d3.min(fil, (d) => d.date_start);

    // Update X axis
    var x = d3.scaleTime().range([0, chartWidth]).domain([minDate, maxDate]);

    chart
      .select("#x-axis")
      .transition()
      .duration(1000)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat("%b %Y"))
      );

    // Update Y axis
    let y = d3.scaleLinear().range([height, 0]).domain([0, 18]);

    chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));

    chart
      .append("rect")
      .attr("class", "shading summer-16")
      .attr("x", x(new Date("2016-06-23")))
      .attr("y", 0)
      .attr("width", x(new Date("2016-08-26")) - x(new Date("2016-06-23")))
      .attr("height", height)
      .attr("opacity", "0")
      .attr("fill", collegeColor)
      .lower();

    d3.select(".shading.summer-16")
      .transition()
      .duration(1000)
      .attr("opacity", 0.2);

    // Update chart
    var bars = chart.selectAll(".bar").data(data);

    bars
      .transition()
      .duration(1000)
      .attr("transform", function (d) {
        return "translate(" + x(d.date_start) + ",0)";
      })
      .selectAll("rect")
      .attr("y", function (d) {
        return y(d.rn);
      })
      .attr("height", 20)
      .attr("width", function (d) {
        return x(d.date_read) - x(d.date_start);
      });

    bars.exit().remove();
  });
}

function collegeChart() {
  var chart = d3.select("#g-chart");

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var parseDate = d3.timeParse("%Y-%m-%d");
    endDate = new Date("2019-06-01");
    fil = data.filter(function (d) {
      return parseDate(d.date_start) <= endDate;
    });

    data.forEach(function (d) {
      // parse strings into date object or numbers
      d.date_start = parseDate(d.date_start);
      d.date_read = parseDate(d.date_read);
      d.rn = +d.rn;
    });
    const maxDate = d3.max(fil, (d) => d.date_read);
    const minDate = d3.min(fil, (d) => d.date_start);

    // Update X axis
    x = d3.scaleTime().range([0, chartWidth]).domain([minDate, maxDate]);

    chart
      .select("#x-axis")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

    // Update Y axis
    let y = d3.scaleLinear().range([height, 0]).domain([0, 40]);

    chart.select("#y-axis").transition().duration(1000).call(d3.axisLeft(y));

    //shading
    var parseDate = d3.timeParse("%Y-%m-%d");

    summers.forEach(function (d) {
      d.start = parseDate(d.start);
      d.end = parseDate(d.end);
    });

    console.log("summer");
    console.log(summers[0].start);

    chart
      .append("rect")
      .attr("class", "shading college")
      .attr("x", x(minDate))
      .attr("y", 0)
      .attr("width", x(new Date("2017-09-18")) - x(minDate))
      .attr("height", height)
      .attr("opacity", 0)
      .attr("fill", "#DBD8FD")
      .lower();

    // chart.append("text")
    //     .attr('id', 'college-1')
    //     .attr("x", '10')
    //     .attr("y", 30)
    //     .attr("dy", ".35em")
    //     .text('1 book per week')

    // chart.append("text")
    //     .attr('id', 'college-2')
    //     .attr("x", x(new Date("2017-09-18")))
    //     .attr("y", height - 30)
    //     .attr("dy", ".35em")
    //     .text('0.1 book per week')

    chart
      .append("rect")
      .attr("class", "shading college")
      .attr("x", x(new Date("2017-09-18")))
      .attr("y", 0)
      .attr("width", x(new Date("2019-06-01")) - x(new Date("2017-09-18")))
      .attr("height", height)
      .attr("opacity", 0)
      .attr("fill", "#e1e2e3")
      .lower();

    d3.selectAll(".shading.college")
      .transition()
      .delay(500)
      .duration(1000)
      .attr("opacity", 0.5);

    // Update chart
    var bars = chart.selectAll(".bar").data(data);

    bars
      .enter()
      .append("g")
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("transform", function (d) {
        return "translate(" + x(d.date_start) + ",0)";
      })
      .selectAll("rect")
      .attr("y", function (d) {
        return y(d.rn);
      })
      .attr("height", 15)
      .attr("width", function (d) {
        return x(d.date_read) - x(d.date_start);
      });

  });

}

const barHeight4 = 10;
barHeight5 = 34;
barHeight6 = 15;
barHeight7 = 40;

function main() {
  let offset = "80%";
  console.log("main");
  fullChartStart();
  //addBookText();

  // fade in chart
  new Waypoint({
    element: document.getElementById("step1"),
    handler: function (direction) {
      if (direction == "down") {
        removeAll();
        console.log("show chart");
        d3.select(".chartContainer")
          .transition()
          .duration(1000)
          .style("opacity", "1");
      } else {
        console.log("rm chart");
        d3.select(".chartContainer")
          .transition()
          .duration(1000)
          .style("opacity", "0");
      }
    },
    offset: "100%",
  });

    // highlight two book 
    new Waypoint({
      element: document.getElementById("step1a"),
      handler: function (direction) {
        if (direction == "down") {
        d3.selectAll(".bar")
        .transition().duration(500)
        .style("fill", "#CFDEEC")
        d3.selectAll("#bar-6149,#bar-41940285")
          .transition().duration(500)
          .style("fill", "steelblue")
      } else {
        removeAll()
      }
    },
      offset: offset,
    });

  // reset
  new Waypoint({
    element: document.getElementById("step1b"),
    handler: function () {
        removeAll()
        d3.selectAll("path").style("pointer-events", "all")
    },
    offset: offset,
  });

  // add lines for periods
  new Waypoint({
    element: document.getElementById("step1c"),
    handler: function () {
      removeAll(color = "periods")
      d3.selectAll(".divisions")
        .transition()
        .duration(1000)
        .style("opacity", "1");
      d3.selectAll(".periods")
        .transition()
        .duration(1000)
        .style("opacity", "1");
    },
    offset: offset,
  });

  // zoom into 2019
  new Waypoint({
    element: document.getElementById("step2"),
    handler: function (direction) {
      if (direction == "down") {
        // 2 summer 2016
        removeAll(color="periods");
        summer2016();
      } else {
        fullChartRefresh();
        removeAll();
      }
    },
    offset: offset,
  });

  // highlight summer books
  new Waypoint({
    element: document.getElementById("malcolm-x"),
    handler: function () {
        d3.selectAll(".bar")
        .transition().duration(500)
        .style("fill", "#DBD8FD")
        d3.selectAll("#bar-20342617,#bar-92057")
          .transition().duration(500)
          .style("fill", collegeColor)
    },
    offset: "60%",
  });

  // move to all of college and color summers
  new Waypoint({
    element: document.getElementById("step3"),
    handler: function (direction) {
      if (direction == "down") {
        //  3 college years
        removeAll(color="periods");
        collegeChart();
      } else {
        //
        summer2016();
        removeAll();
      }
    },
    offset: offset,
  });

  // post college / covid (summer 2019 to fall 2021)
  new Waypoint({
    element: document.getElementById("step4"),
    handler: function (direction) {
      if (direction == "down") {
        // 4 Post College / COVID
        removeAll(color="periods");
        startDate = new Date("2019-07-01");
        endDate = new Date("2021-08-14");
        panChart(startDate, endDate, barHeight4);
      } else {
        //  3 college years
        collegeChart();
      }
    },
    offset: offset,
  });

  // type coloring
  new Waypoint({
    element: document.getElementById("step4a"),
    handler: function () {
        d3.selectAll(".bar").transition().duration(500).style('fill', d => typeColor(d.type))
      },
    offset: offset,
  });

  // type coloring
  new Waypoint({
    element: document.getElementById("step4a"),
    handler: function () {
      // do nothing with these for now
      //d3.selectAll("#bar-41949311, #bar-55145261, #bar-55421550")
      },
    offset: offset,
  });

  // move to NYC slow down fall 21 to spring 22
  new Waypoint({
    element: document.getElementById("step5"),
    handler: function (direction) {
      if (direction == "down") {
        // 5 Move to NYC
        removeAll(color="periods");
        startDate = new Date("2021-08-14");
        endDate = new Date("2022-04-01");
        panChart(startDate, endDate, barHeight5);
      } else {
        // 4 Post College / COVID
        startDate = new Date("2019-07-01");
        endDate = new Date("2021-08-14");
        panChart(startDate, endDate, barHeight4);
      }
    },
    offset: offset,
  });

  // NYC pickup spring 22 to Fall 23 grad school
  new Waypoint({
    element: document.getElementById("step6"),
    handler: function (direction) {
      if (direction == "down") {
        // 6 NYC
        removeAll(color="periods");
        startDate = new Date("2022-04-01");
        endDate = new Date("2023-09-01");
        panChart(startDate, endDate, barHeight6, (nyc = true));
      } else {
        // 5 Move to NYC
        removeAll();
        startDate = new Date("2021-08-14");
        endDate = new Date("2022-04-01");
        panChart(startDate, endDate, barHeight5);
      }
    },
    offset: offset,
  });

  // start grad school
  new Waypoint({
    element: document.getElementById("step7"),
    handler: function (direction) {
      if (direction == "down") {
        // 7 start grad school
        removeAll(color="periods");
        startDate = new Date("2023-09-01");
        endDate = new Date("2024-01-26");
        panChart(startDate, endDate, barHeight7);
      } else {
        // 6 NYC
        startDate = new Date("2022-03-07");
        endDate = new Date("2023-09-01");
        panChart(startDate, endDate, barHeight6, (nyc = true));
      }
    },
    offset: offset,
  });

  // total at end
  new Waypoint({
    element: document.getElementById("step8"),
    handler: function (direction) {
      if (direction == "down") {
        // 8 total
        fullChartRefresh();
        removeAll(color="periods");
        d3.selectAll("path").style("pointer-events", "all")
      } else {
        // 7 start grad school
        startDate = new Date("2023-09-01");
        endDate = new Date("2024-01-26");
        panChart(startDate, endDate, barHeight7);
      }
    },
    offset: offset,
  });

  new Waypoint({
    element: document.getElementById("stepLast"),
    handler: function () {
      removeAll(color="periods");
      d3.selectAll("path").style("pointer-events", "all")
    },
    offset: offset,
  });

}

main();
