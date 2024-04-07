// force to top on reload
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
  fullChartStart();
};

// DROPDOWN BUTTON-------------------------------------------------------------
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    //this.classList.toggle("active");
    // idk why unicode doenst work here
    if (this.innerHTML.indexOf("▾") !== -1) {
      this.innerHTML =
        "&#9656; Click here for some additional comments about the data if interested.";
    } else {
      this.innerHTML =
        "&#9662 Click here for some additional comments about the data if interested.";
    }
    var content = document.getElementById("content");
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

// CONSTANTS-------------------------------------------------------------------

const is_mobile = window.innerWidth < 600;
const margin = { top: 30, right: 30, bottom: 30, left: 50 };
const entry = document.getElementById("entry");
const chartWidth = entry.getBoundingClientRect().width;
let height;

if (is_mobile) {
  height = window.innerHeight * 0.5;
} else {
  height = window.innerHeight * 0.66 - margin.top - margin.bottom;
}

const padding = 0.3;
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

const defaultColor = "steelblue",
  collegeColor = "#8B80F9",
  covidColor = "#D1495B",
  movingColor = defaultColor,
  nycColor = "#2A7F62",
  gradColor = "#EE964B",
  colors = [collegeColor, covidColor, movingColor, nycColor, gradColor];

const labelClasses = [
  ".bar.college",
  ".bar.covid",
  ".bar.moving",
  ".bar.nyc",
  ".bar.grad",
];

const division1 = new Date("2019-04-16"),
  division2 = new Date("2021-08-14"),
  division3 = new Date("2022-04-01"),
  division4 = new Date("2023-09-01"),
  divisions = [division1, division2, division3, division4];

const barHeight = 10,
  barHeight4 = 10,
  barHeight5 = 34,
  barHeight6 = 15,
  barHeight7 = 40;

// HELPER FUNCTIONS------------------------------------------------------------

function textClean(str) {
  clean_str = str.replace(/\s+/g, "-").toLowerCase();
  return clean_str;
}

function assignBarClass(date, divisions) {
  return date < divisions[0]
    ? "bar college"
    : date < divisions[1]
    ? "bar covid"
    : date < divisions[2]
    ? "bar moving"
    : date < divisions[3]
    ? "bar nyc"
    : "bar grad";
}

function typeColor(type) {
  return type == "nonfiction" ? "white" : covidColor;
}
function strokeColor(type) {
  return type == "nonfiction" ? covidColor : "none";
}

function strokeWidth(type) {
  return type == "nonfiction" ? "1" : "none";
}

function colorPeriods() {
  var i;
  for (i = 0; i < colors.length; i++) {
    bars = d3.selectAll(labelClasses[i]);
    //bars.transition().duration(500).style("fill", colors[i]);
    bars.style("fill", colors[i]);
  }
}

function removeAll(color = "blue") {
  d3.selectAll("*").interrupt();
  d3.selectAll(".divisions").transition().style("opacity", "0");
  d3.selectAll(".shading").transition().duration(500).style("opacity", "0");
  d3.selectAll(".periods").transition().duration(500).style("opacity", "0");
  d3.selectAll(".section").transition().duration(500).style("opacity", "0");
  d3.selectAll(".bar").attr("opacity", "1").style("stroke", "none");
  d3.selectAll("path").style("pointer-events", "none");

  if (color == "blue") {
    bars = d3.selectAll(".bar");
    bars.transition().duration(500).style("fill", "steelblue");
  } else if (color == "periods") {
    colorPeriods();
  }
}

function periodLabelsSections(text, color) {
  let id_text = "section-text-" + textClean(text);
  let id_rect = "section-rect-" + textClean(text);
  let chart = d3.select("#g-chart");

  chart
    .append("text")
    .attr("class", "section text")
    .attr("id", id_text)
    .text(text)
    .attr("x", 100)
    .attr("y", 100)
    .style("opacity", "0")
    .style("text-anchor", "middle")
    .style("fill", "white");

  var rectBox = document.getElementById(id_text).getBBox();

  chart
    .append("rect")
    .attr("class", "section rect")
    .attr("id", id_rect)
    .attr("x", rectBox.x - 5)
    .attr("y", rectBox.y)
    .attr("width", rectBox.width + 10)
    .attr("height", rectBox.height)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", color)
    .style("opacity", "0")
    .lower();
}

// MOBILE CHANGES-------------------------------------------------------------

if (is_mobile) {
  text =
    'Let\'s zoom into five different time periods to further explore my reading over the years: <span class="college-text">College</span>, \
    <span class="covid-text">COVID-19</span>, <span class="moving-text">Moving</span>, <span class="nyc-text">NYC</span>, and \
    <span class="grad-text">Grad School</span>.';
  document.getElementById("step1c-text").innerHTML = text;

  text =
    "That brings us to the end of our journey. Thank you for following \
    along as I explored my reading over the last few years.";
  document.getElementById("step8-text").innerHTML = text;

  text =
    "Scroll along below as I explore my reading over the last eight years. \
    (<em>For the best experience, view on Desktop.</em>)";
  document.getElementById("scroll-start-text").innerHTML = text;

  // remove scoller that gives tooltip
  document.getElementById("step1b").style.display = "none";
}

// CHART FUNCTIONS-------------------------------------------------------------

// starting chart
function fullChartStart() {
  var chart = d3
    .select(".chartContainer")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "g-chart")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("width", chartWidth - margin.left - margin.right);

  // create a tooltip
  var Tooltip = d3
    .select(".chartContainer")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0")
    .style("stroke", "none")
    .style("left", "0")
    .style("top", "0");

  // Three function that change the tooltip when user hover / move / leave a voronoi cell
  var mouseover = function (d) {
    if (d) {
      // avoids console error when cursor goes off chart

      // show tooltip and update html
      Tooltip.style("opacity", 1) // show opacity only if there is a found data element
        .html(
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
            d.duration_days +
            " days" +
            "</br>" +
            "<b> Rating:</b> " +
            d.my_rating +
            "/5"
        );

      // highlight bar corresponding to the voronoi path
      const id = "#bar-" + String(d.book_id);
      d3.select(id).style("stroke", "black");
    }
  };
  var mousemove = function () {
    // console.log(d3.event);
    // console.log(d3.event.pageX);
    const mouseOnLeftSide = d3.event.pageX / window.innerWidth <= 0.5;
    if (mouseOnLeftSide) {
      Tooltip.style("left", d3.mouse(this)[0] + 100 + "px");
    } else {
      const tooltipWidth = document
        .querySelector(".tooltip")
        .getBoundingClientRect().width;
      Tooltip.style("left", d3.mouse(this)[0] - tooltipWidth + 25 + "px");
    }
    Tooltip.style("top", d3.mouse(this)[1] - 500 + "px");
  };
  var mouseleave = function (d) {
    Tooltip.style("opacity", 0);
    if (d) {
      // prevent console error caused by voronoi side effects
      id = "#bar-" + String(d.book_id);
      d3.select(id).style("stroke", "none");
    }
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

    x = d3
      .scaleTime()
      .range([0, chartWidth - margin.left - margin.right])
      .domain([minDate, maxDate]);
    y = d3.scaleLinear().range([height, 0]).domain([0, totalRead]);

    //tooltip
    const voronoi = d3.Delaunay.from(
      data,
      (d) => (x(d.date_read) + x(d.date_start)) / 2,
      (d) => y(d.rn)
    ).voronoi([0, 0, chartWidth, height]);

    chart
      .append("g")
      .attr("class", "voronoiWrapper")
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("opacity", 0.5)
      // .attr("stroke", "#ff1493") // Show overlay for debugging
      .attr("fill", "none")
      .style("pointer-events", "none")
      .attr("d", (d, i) => voronoi.renderCell(i));

    // add axes
    chart
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));
    chart.append("g").attr("id", "y-axis").call(d3.axisLeft(y));

    chart
      .append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .style("writing-mode", "vertical-lr")
      .attr("transform", "rotate(180)")
      .attr("y", -height / 2)
      .attr("x", 40)
      .text("Cumulative Books Read Since 2016");

    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", (d) => assignBarClass(d.date_start, divisions))
      .attr("id", (d) => "bar-" + d.book_id)
      .attr("transform", (d) => "translate(" + x(d.date_start) + ",0)")
      .style("fill", defaultColor)
      .style("stroke-width", "2px")
      .append("rect")
      .transition()
      .duration(1500)
      .attr("y", (d) => y(d.rn + 2))
      .attr("height", barHeight)
      .attr("width", (d) => x(d.date_read) - x(d.date_start));

    // allow tooltip to be enabled on top of bar
    d3.selectAll(".voronoiWrapper").raise();

    // add tooltip
    chart
      .selectAll("path")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // add divisions and labels for periods
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

    const textPosition = 105;

    function periodLabels(position, text, color) {
      if (position === 0) {
        positionAttr = x(divisions[position]) / 2;
      } else if (position === 4) {
        positionAttr = (x(maxDate) + x(divisions[position - 1])) / 2;
      } else {
        positionAttr =
          (x(divisions[position]) + x(divisions[position - 1])) / 2;
      }

      id = "period-" + position;
      if (position !== 4) {
        chart
          .append("text")
          .attr("class", "periods text")
          .attr("id", id)
          .text(text)
          .attr("x", positionAttr)
          .attr("y", y(textPosition))
          .style("opacity", "0")
          .style("text-anchor", "middle");

        var rectBox = document.getElementById(id).getBBox();

        chart
          .append("rect")
          .attr("class", "periods rect")
          .attr("x", rectBox.x - 5)
          .attr("y", rectBox.y)
          .attr("width", rectBox.width + 10)
          .attr("height", rectBox.height)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", color)
          .lower();
      } else {
        chart
          .append("text")
          .attr("class", "periods text")
          .attr("id", id)
          .text(text)
          .attr("x", positionAttr)
          .attr("y", y(textPosition))
          .style("opacity", "0")
          .style("text-anchor", "middle")
          .style("writing-mode", "tb");

        var rectBox = document.getElementById(id).getBBox();

        chart
          .append("rect")
          .attr("class", "periods rect")
          .attr("x", rectBox.x)
          .attr("y", rectBox.y - 5)
          .attr("width", rectBox.width)
          .attr("height", rectBox.height + 10)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", color)
          .style("opacity", "0")
          .lower();
      }
    }

    periodLabels(0, "College", collegeColor);
    periodLabels(1, "COVID-19", covidColor);
    periodLabels(2, "Moving", movingColor);
    periodLabels(3, "NYC", nycColor);
    periodLabels(4, "Grad School", gradColor);

    periodLabelsSections("College", collegeColor);
    periodLabelsSections("COVID-19", covidColor);
    periodLabelsSections("Moving", movingColor);
    periodLabelsSections("NYC", nycColor);
    periodLabelsSections("Grad School", gradColor);
  });
}

// full chart from any zoom in.
function fullChartRefresh() {
  d3.selectAll("rect").attr("pointer-events", "auto");
  d3.csv("data/gr_js_count.csv", function (error, data) {
    var chart = d3.select(".chartContainer");
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
    x = d3
      .scaleTime()
      .range([0, chartWidth - margin.left - margin.right])
      .domain([minDate, maxDate]);
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
      .attr("transform", (d) => "translate(" + x(d.date_start) + ",0)")
      .selectAll("rect")
      .attr("y", (d) => y(d.rn + 2))
      .attr("height", barHeight)
      .attr("width", (d) => x(d.date_read) - x(d.date_start));
  });
}

// zoom into a specific part of the chart
function panChart(startDate, endDate, barHeight, nyc = null) {
  var chart = d3.select(".chartContainer");

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var parseDate = d3.timeParse("%Y-%m-%d");
    fil = data.filter(function (d) {
      return (
        (parseDate(d.date_start) > startDate) &
        (parseDate(d.date_read) <= endDate)
      );
    });

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

    // Update X axis
    x = d3
      .scaleTime()
      .range([0, chartWidth - margin.left - margin.right])
      .domain([minDate, maxDate]);

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

    bars
      .transition()
      .duration(1000)
      .attr("transform", (d) => "translate(" + x(d.date_start) + ",0)")
      .selectAll("rect")
      .attr("y", (d) => y(d.rn))
      .attr("height", barHeight)
      .attr("width", (d) => x(d.date_read) - x(d.date_start));

    if (nyc === true) {
      // chart
      //   .append("rect")
      //   .attr("class", "shading summer-16")
      //   .attr("x", x(new Date("2016-06-23")))
      //   .attr("y", y(142))
      //   .attr("width", x(new Date("2016-08-26")) - x(new Date("2016-06-23")))
      //   .attr("y", y(142))
      //   .attr("opacity", "0")
      //   .attr("fill", "none")
      //   .attr("stroke", "black")
      //   .attr("stroke-width", "3")
      //   .attr("stroke-dasharray","5 10")
      //   .lower();

      d3.select("#g-chart")
        .append("rect")
        .attr("class", "shading nyc")
        .attr("x", x(new Date("2022-08-07")))
        .attr("y", y(142))
        .attr("width", x(new Date("2022-12-29")) - x(new Date("2022-08-07")))
        .attr("height", y(138) - y(142))
        .attr("opacity", "1")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "3")
        .attr("stroke-dasharray", "5 10")
        .lower();

      d3.select(".shading.nyc").transition().delay(500).attr("opacity", 0.4);
    }
  });
}

// special zoom into summer 2016
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
    var x = d3
      .scaleTime()
      .range([0, chartWidth - margin.left - margin.right])
      .domain([minDate, maxDate]);

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
      .attr("y", y(17))
      .attr("width", x(new Date("2016-08-26")) - x(new Date("2016-06-23")))
      .attr("height", height - y(16))
      .attr("opacity", "0")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3")
      .attr("stroke-dasharray", "5 10")
      .lower();

    d3.select(".shading.summer-16")
      .transition()
      .duration(1000)
      .attr("opacity", 0.4);

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

// special zoom into college
function collegeChart() {
  var chart = d3.select("#g-chart");

  d3.csv("data/gr_js_count.csv", function (error, data) {
    var parseDate = d3.timeParse("%Y-%m-%d");
    endDate = division1;
    fil = data.filter(function (d) {
      return parseDate(d.date_read) <= endDate;
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
    x = d3
      .scaleTime()
      .range([0, chartWidth - margin.left - margin.right])
      .domain([minDate, maxDate]);

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

    chart
      .append("line")
      .attr("class", "divisions")
      .attr("id", "college-division")
      .attr("x1", x(new Date("2017-09-18")))
      .attr("y1", 0)
      .attr("x2", x(new Date("2017-09-18")))
      .attr("y2", height)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("stroke-dasharray", "4, 3")
      .style("opacity", "0");

    d3.select("#college-division")
      .transition()
      .duration(1000)
      .style("opacity", "0.4");

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

// WAYPOINTS-------------------------------------------------------------------

function waypoints() {
  let offset = "60%";
  // fade in chart
  new Waypoint({
    element: document.getElementById("step1"),
    handler: function (direction) {
      if (direction == "down") {
        fullChartRefresh();
        removeAll();
        d3.select(".chartContainer")
          .transition()
          .duration(1000)
          .style("opacity", "1");
      } else {
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
          .transition()
          .duration(500)
          .style("fill", "#CFDEEC");
        d3.selectAll("#bar-6149,#bar-41940285")
          .transition()
          .duration(500)
          .style("fill", "steelblue");
      } else {
        removeAll();
      }
    },
    offset: offset,
  });

  // reset
  new Waypoint({
    element: document.getElementById("step1b"),
    handler: function () {
      removeAll();
      d3.selectAll("path").style("pointer-events", "all");
    },
    offset: offset,
  });

  // add lines for periods
  new Waypoint({
    element: document.getElementById("step1c"),
    handler: function () {
      removeAll((color = "periods"));

      if (!is_mobile) {
        d3.selectAll(".periods")
          .transition()
          .duration(1000)
          .style("opacity", "1");
      }
      d3.selectAll(".divisions")
        .transition()
        .duration(1000)
        .style("opacity", "1");
    },
    offset: "75%",
  });

  // zoom into 2019
  new Waypoint({
    element: document.getElementById("step2"),
    handler: function (direction) {
      if (direction == "down") {
        // 2 summer 2016
        removeAll((color = "periods"));

        d3.select("#section-text-college")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-college")
          .transition()
          .duration(1000)
          .style("opacity", "1");

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
      d3.selectAll(".bar").transition().duration(500).style("fill", "#DBD8FD");
      d3.selectAll("#bar-20342617,#bar-92057")
        .transition()
        .duration(500)
        .style("fill", collegeColor);
    },
    offset: "30%",
  });

  // move to all of college and color summers
  new Waypoint({
    element: document.getElementById("step3"),
    handler: function (direction) {
      if (direction == "down") {
        //  3 college years
        removeAll((color = "periods"));

        d3.select("#section-text-college")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-college")
          .transition()
          .duration(1000)
          .style("opacity", "1");

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
        removeAll((color = "periods"));

        d3.select("#section-text-covid-19")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-covid-19")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        startDate = new Date("2019-04-15");
        endDate = new Date("2021-08-14");
        panChart(startDate, endDate, barHeight4);
        d3.selectAll("#bar-152504, #bar-28186015, #bar-13588394").attr(
          "opacity",
          "0"
        );
      } else {
        //  3 college years
        removeAll((color = "periods"));
        collegeChart();
      }
    },
    offset: offset,
  });

  // type coloring
  new Waypoint({
    element: document.getElementById("step4a"),
    handler: function () {
      d3.selectAll(".bar")
        .transition()
        .duration(500)
        .style("fill", (d) => typeColor(d.type))
        .style("stroke", (d) => strokeColor(d.type))
        .style("stroke-width", (d) => strokeColor(d.type));
      //.style("stroke-dasharray", (d) => strokeType(d.type));
    },
    offset: offset,
  });

  // move to NYC slow down fall 21 to spring 22
  new Waypoint({
    element: document.getElementById("step5"),
    handler: function (direction) {
      if (direction == "down") {
        // // turn off stroke borders
        // d3.selectAll(".bar").style('stroke', 'none');

        // 5 Move to NYC
        removeAll((color = "periods"));

        d3.select("#section-text-moving")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-moving")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        startDate = new Date("2021-08-14");
        endDate = new Date("2022-04-01");
        panChart(startDate, endDate, barHeight5);
        d3.select("#bar-9791").attr("opacity", "0");
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
        removeAll((color = "periods"));

        d3.select("#section-text-nyc")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-nyc")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        startDate = new Date("2022-04-01");
        endDate = new Date("2023-09-01");
        panChart(startDate, endDate, barHeight6, (nyc = true));
        d3.select("#bar-17607").attr("opacity", "0");
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
        removeAll((color = "periods"));

        d3.select("#section-text-grad-school")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        d3.select("#section-rect-grad-school")
          .transition()
          .duration(1000)
          .style("opacity", "1");

        startDate = new Date("2023-09-01");
        endDate = new Date("2024-01-26");
        panChart(startDate, endDate, barHeight7);
        d3.select("#bar-41057294").attr("opacity", "0");
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
        removeAll((color = "periods"));
        d3.selectAll("path").style("pointer-events", "all");
      } else {
        // 7 start grad school
        startDate = new Date("2023-09-01");
        endDate = new Date("2024-01-26");
        panChart(startDate, endDate, barHeight7);
        d3.selectAll("path").style("pointer-events", "none");
      }
    },
    offset: offset,
  });

  new Waypoint({
    element: document.getElementById("step8a"),
    handler: function (direction) {
      if (direction == "down") {
        d3.selectAll("path").style("pointer-events", "none");
      } else {
        d3.selectAll("path").style("pointer-events", "all");
      }
    },
    offset: offset,
  });
}

// MAIN------------------------------------------------------------------------

function main() {
  waypoints();
  fullChartStart();
}

main();
