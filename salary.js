var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 960 - margin.left - margin.right*1.5,
    height = 500 - margin.top - margin.bottom;


var x = d3.scale.ordinal().rangeRoundBands([0, width-20], .4);

var y = d3.scale.linear().range([height-20, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);



var svg = d3.select("#BarChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom*2)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left*1.5 + "," + margin.top + ")");

d3.csv("salary.csv", function(error, data) {

    data.forEach(function(d) {
        d.stack = +d.Stack;
        d.value = +d.Salary;
    });
	
  x.domain(data.map(function(d) { return d.Stack; }));
  y.domain([0, 100000]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value ($)");

  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .style("fill", "#2c4870")
      .attr("x", function(d) { return x(d.Stack); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.Salary); })
      .attr("height", function(d) { return height - y(d.Salary); })
      .append("svg:title")
      .text(function(d){ return (("Salary: $") +d.Salary/1000 + "K");});

      d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", false).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { return b.Salary - a.Salary; }
        : function(a, b) { return d3.ascending(a.Stack, b.Stack); })
        .map(function(d) { return d.Stack; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.Stack) - x0(b.Stack); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.Stack); });

    transition.select(".x.axis")
        .call(xAxis)
        .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" )
      .selectAll("g")
        .delay(delay);
  }

});