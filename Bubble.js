var custom_bubble_chart = (function(d3) {
"use strict";
 
var width = 940,
height = 600,
layout_gravity = -0.01,
damper = 0.1,
nodes = [],
widthXL = 940,
heightXL = 600,
vis, force, circles, radius_scale;
 
var center = {x: width / 2, y: height / 2};

var market_centers = {
    "Enterprise Software" : {x : 20 * width / 100, y :  height / 2},
    "Mobile" : {x : 35 * width / 100, y :  height / 2},
    "E-commerce" : {x : 50 * width / 100, y :  height / 2},
    "Healthcare" : {x : 65 * width / 100, y :  height / 2},
    "Education" : {x : 80 * width / 100, y :  height / 2},
    "Games" : {x : 95 * width / 100, y :  height / 2}
    };

var fundingCat_centers = {
    "10K to 650K" : {x : 15 * width / 100, y :  height / 2},
    "650K to 2M" : {x : 25 * width / 100, y :  height / 2},
    "2M to 5M" : {x : 37 * width / 100, y :  height / 2},
    "5M to 10M" : {x : 48 * width / 100, y :  height / 2},
    "10M to 25M" : {x : 53 * width / 100, y :  height / 2},
    "25M to 100M" : {x : 67 * width / 100, y :  height / 2},
    "Over 100M" : {x : 80 * width / 100, y :  height / 2},
    };

var stage_centers = {
    "Seed" : {x : 20 * width / 100, y :  height / 2},
    "Series A" : {x : 35 * width / 100, y :  height / 2},
    "Series B" : {x : 50 * width / 100, y :  height / 2},
    "Series C" : {x : 65 * width / 100, y :  height / 2},
    "Acquired" : {x : 80 * width / 100, y :  height / 2}
    };

var employeeCat_centers = {
    "1 to 10" : {x : 20 * width / 100, y :  height / 2},
    "11 to 50" : {x : 35 * width / 100, y :  height / 2},
    "51 to 200" : {x : 50 * width / 100, y :  height / 2},
    "201 to 500" : {x : 65 * width / 100, y :  height / 2},
    "N/A" : {x : 80 * width / 100, y :  height / 2}
    };
 
var fill_color = d3.scale.ordinal()
.domain(["Start-up", "Performers", "Trenders"])
.range(["#aaa939", "#2c4870", "#9c344c"]);
 
function custom_chart(data) {
	var max_amount = d3.max(data, function(d) { return parseInt(d.Funding, 10);});

	radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([10, 65]);	 

	data.forEach(function(d){
		var node = {
			id: d.Id,
		    radius: radius_scale(parseInt(d.Funding, 10)),
		    value: d.Funding,
		    name: d.Name,
		    market: d.Market,
		    description: d.Description,
		    date: d.Joined,
		    stage: d.Stage,
		    fundCat: d.FundingCat,
		    employees: d.Employees,
		    stack: d.Stack,
		    genCat:d.GenCat,
			x: Math.random() * 900,
			y: Math.random() * 800
		};
		nodes.push(node);
	});
	 
	nodes.sort(function(a, b) {return b.value- a.value;});
	 
	vis = d3.select("#vis").append("svg")
			.attr("width", widthXL)
			.attr("height", heightXL)
			.attr("id", "svg_vis");
	 
	circles = vis.selectAll("circle")
			.data(nodes, function(d) { return d.Id;});
	 
		circles.enter().append("circle")
			.attr("r", 0)
			.attr("fill", function(d) { return fill_color(d.genCat);})
			.attr("stroke-width", 2)
			.attr("stroke", function(d) {return d3.rgb(fill_color(d.genCat)).darker();})
			.attr("id", function(d) { return "bubble_" + d.Id;})                      
			.call(d3.helper.tooltip()          
                .text(function(d, i){return (("Company Name: ").bold()+d.name)
                	+"<br>"+(("Description: ").bold()+d.description)
                	+"<br>"+(("Market: ").bold()+d.market)
                	+"<br>"+(("Funding: ").bold()+"$"+d.value +"M")
                	+"<br>"+(("Joined: ").bold()+d.date)
                	+"<br>"+(("Stage: ").bold()+d.stage)
                	+"<br>"+(("Employees: ").bold()+d.employees)
                	+"<br>"+(("Stack: ").bold()+d.stack)
//                	+"<br>"+(("Category: ").bold()+d.genCat)
				;
				})
            );
	 
		circles.transition().duration(2000).attr("r", function(d) { return d.radius; }); 
}

 
function charge(d) {
	return -Math.pow(d.radius, 2.0) / 8;
}
 
function start() {
	force = d3.layout.force()
		.nodes(nodes)
		.size([width, height]);
}

/* --------------------------------------------------------------------- Display All ------------------------------------------------------------*/
 
function display_group_all() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_center(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});

	force.start();
	display_alls();
	display_legend();
	hide_markets();
	hide_stages();
	hide_fundingCats();
	hide_employeeCats();
	
}
 
function move_towards_center(alpha) {
	return function(d) {
		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
	};
}
 
function display_alls() {

	d3.select("#all").classed("HighB", true).style("color", "#fff");
	d3.select("#market").classed("HighB", false).style("color", "#333333");
	d3.select("#funding").classed("HighB", false).style("color", "#333333");
	d3.select("#stage").classed("HighB", false).style("color", "#333333");
	d3.select("#employees").classed("HighB", false).style("color", "#333333");

	var alls_x = {
		"market ":  width / 2	
	};

	var alls_data = d3.keys(alls_x);

	var alls = vis.selectAll(".alls")
				.data(alls_data);


	/*--------------------------------------------------------------------------Text--------------------------------------------------------------------*/
	
	alls.enter()
		.append("text")
		.attr("class", "alls")
		.attr("x", 725)
		.attr("y", 55)
		.attr("text-anchor", "middle")
		.attr("font-weight", "bold")
		.attr("font-size", "120%")
		.text("38 companies supported by Angel List");

	alls.enter()
		.append("text")
		.attr("class", "alls")
		.attr("x", 725)
		.attr("y", 80)
		.attr("text-anchor", "middle")
		.attr("font-weight", "lighter")
		.attr("font-size", "110%")
		.text("for a total funding ");

	alls.enter()
		.append("text")
		.attr("class", "alls")
		.attr("x", 725)
		.attr("y", 105)
		.attr("text-anchor", "middle")
		.attr("font-weight", "bold")
		.attr("font-size", "120%")
		.text("of $746M");

    /*--------------------------------------------------------------------------overlapping legend circles--------------------------------------------------------------------*/

    									/*--------------------------------small----------------------------*/

    alls.enter()
	    .append("circle")
	    .attr("class", "alls")
	    .attr("r", radius_scale(parseInt(0.5)))
	    .attr("cx", 70)
	    .attr("cy", 505)
	    .attr("fill", "none")
	    .attr("stroke", "#000");

    alls.enter()
	    .append("line")
	    .attr("class", "alls")
	    .attr("x1", 70)
	    .attr("x2", 150)
	    .attr("y1", 505)
	    .attr("y2", 505)
	    .attr("stroke", "#000")
	    .style("stroke-dasharray", ("3, 3"));

    alls.enter()
    	.append("text")
		.attr("class", "alls")
		.attr("x", 160)
		.attr("y", 505)
		.text("$0.5M funding");

    									/*--------------------------------medium----------------------------*/

    alls.enter()
	    .append("circle")
	    .attr("class", "alls")
	    .attr("r", radius_scale(parseInt(10)))
	    .attr("cx", 70)
	    .attr("cy", 491)
	    .attr("fill", "none")
	    .attr("stroke", "#000");

    alls.enter()
	    .append("line")
	    .attr("class", "alls")
	    .attr("x1", 70)
	    .attr("x2", 150)
	    .attr("y1", 480)
	    .attr("y2", 480)
	    .attr("stroke", "#000")
	    .style("stroke-dasharray", ("3, 3"));

    alls.enter()
    	.append("text")
		.attr("class", "alls")
		.attr("x", 160)
		.attr("y", 480)
		.text("$10M funding");

    									/*--------------------------------large----------------------------*/

    alls.enter()
	    .append("circle")
	    .attr("class", "alls")
	    .attr("r", radius_scale(parseInt(100)))
	    .attr("cx", 70)
	    .attr("cy", 461)
	    .attr("fill", "none")
	    .attr("stroke", "#000");

    alls.enter()
	    .append("line")
	    .attr("class", "alls")
	    .attr("x1", 70)
	    .attr("x2", 150)
	    .attr("y1", 450)
	    .attr("y2", 450)
	    .attr("stroke", "#000")
	    .style("stroke-dasharray", ("3, 3"));

    alls.enter()
    	.append("text")
		.attr("class", "alls")
		.attr("x", 160)
		.attr("y", 450)
		.text("$100M funding");

}

function hide_alls() {
	var alls = vis.selectAll(".alls").remove();
}

/* --------------------------------------------------------------------- Display Legends ------------------------------------------------------------*/
function display_legend() {

	var legend_x ={
		"Start-up": 3 * width / 50,
		"Performers": 12 * width / 50,
		"Trenders": 23 * width / 50
	};

	var legend_y ={
		"Start-up": 48 * height/50,
		"Performers": 48 * height/50,
		"Trenders": 48 * height/50
	};

	var legend_data = d3.keys(legend_x);

	var legend = vis.selectAll(".legend")
				.data(legend_data);
	 
		legend.enter()
    	.append("text")
		.attr("class", "legend")
		.attr("x", function(d) { return legend_x[d]; } )
		.attr("y", function(d) { return legend_y[d]; } )
		.text(function(d) { return d;});
    									/*--------------------------------Start-up----------------------------*/	 
    legend.enter()
	    .append("circle")
	    .attr("class", "legend")
	    .attr("r", 10)
	    .attr("cx", 30)
	    .attr("cy", 570)
	    .attr("fill", "#aaa939");
										/*--------------------------------Performers----------------------------*/
    legend.enter()
	    .append("circle")
	    .attr("class", "legend")
	    .attr("r", 10)
	    .attr("cx", 200)
	    .attr("cy", 570)
	    .attr("fill", "#2c4870");
										/*--------------------------------Trenders----------------------------*/
    legend.enter()
	    .append("circle")
	    .attr("class", "legend")
	    .attr("r", 10)
	    .attr("cx", 410)
	    .attr("cy", 570)
	    .attr("fill", "#9c344c");
										
}

/* --------------------------------------------------------------------- Display Market ------------------------------------------------------------*/

function display_by_market() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_market(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});

	force.start();
	display_markets();
	hide_alls();
	hide_stages();
	hide_fundingCats();
	hide_employeeCats();
	
}
 
function move_towards_market(alpha) {
	return function(d) {
		var target = market_centers[d.market];
		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
	};
}
 
function display_markets() {

	d3.select("#all").classed("HighB", false).style("color", "#333333");
	d3.select("#market").classed("HighB", true).style("color", "#fff");
	d3.select("#funding").classed("HighB", false).style("color", "#333333");
	d3.select("#stage").classed("HighB", false).style("color", "#333333");
	d3.select("#employees").classed("HighB", false).style("color", "#333333");
	

	var markets_x = {
		"market ":  width / 2	
	};

	var markets_data = d3.keys(markets_x);

	var markets = vis.selectAll(".markets")
				.data(markets_data);

/*--------------------------------------------------------------------------Text--------------------------------------------------------------------*/
	
		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 7 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Enterprise Software");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 7 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("16 enterprises");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 18 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Mobile");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 18 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("9 enterprises");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 27 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("E-commerce");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 27 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("9 enterprises");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 35 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Healthcare");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 35 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("2 enterprises");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 44 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Education");

		markets.enter().append("text")
			.attr("class", "markets")
			.attr("x", 44 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("1 enterprise");

}
 
function hide_markets() {
	var markets = vis.selectAll(".markets").remove();
}

 
/* --------------------------------------------------------------------- Display fundingCat ------------------------------------------------------------*/

function display_by_fundingCat() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_fundingCat(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});

	force.start();
	display_fundingCats();
	hide_alls();
	hide_markets();
	hide_stages();
	hide_employeeCats();
	
}
 
function move_towards_fundingCat(alpha) {
	return function(d) {
		var target = fundingCat_centers[d.fundCat];
		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
	};
}
 
function display_fundingCats() {

	d3.select("#all").classed("HighB", false).style("color", "#333333");
	d3.select("#market").classed("HighB", false).style("color", "#333333");
	d3.select("#funding").classed("HighB", true).style("color", "#fff");
	d3.select("#stage").classed("HighB", false).style("color", "#333333");
	d3.select("#employees").classed("HighB", false).style("color", "#333333");
	

	var fundingCats_x = {
		"fundingCat ":  width / 2	
	};

	var fundingCats_data = d3.keys(fundingCats_x);

	var fundingCats = vis.selectAll(".fundingCats")
				.data(fundingCats_data);

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 4 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[10K - 650K]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 4 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("10 enterprises");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 10 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[650K - 2M]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 10 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("8 enterprises");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 16 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[2M - 5M]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 16 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("5 enterprises");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 24 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[10M - 25M]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 24 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("2 enterprises");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 34 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[25M - 100M]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 34 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("10 enterprises");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 45 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[Over 100M]");

		fundingCats.enter().append("text")
			.attr("class", "fundingCats")
			.attr("x", 45 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("2 enterprises");

}
 
function hide_fundingCats() {
	var fundingCats = vis.selectAll(".fundingCats").remove();
}


/* --------------------------------------------------------------------- Display Stage ------------------------------------------------------------*/

function display_by_stage() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_stage(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});

	force.start();
	display_stages();
	hide_alls();
	hide_markets();
	hide_fundingCats();
	hide_employeeCats();
	
}
 
function move_towards_stage(alpha) {
	return function(d) {
		var target = stage_centers[d.stage];
		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
	};
}
 
function display_stages() {

	d3.select("#all").classed("HighB", false).style("color", "#333333");
	d3.select("#market").classed("HighB", false).style("color", "#333333");
	d3.select("#funding").classed("HighB", false).style("color", "#333333");
	d3.select("#stage").classed("HighB", true).style("color", "#fff");
	d3.select("#employees").classed("HighB", false).style("color", "#333333");
	

	var stages_x = {
		"stage ":  width / 2	
	};

	var stages_data = d3.keys(stages_x);

	var stages = vis.selectAll(".stages")
				.data(stages_data);

/*--------------------------------------------------------------------------Text--------------------------------------------------------------------*/
	
		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 6 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Seed");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 6 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("23 enterprises");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 15 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Series A");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 15 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("2 enterprises");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 24 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Series B");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 24 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("5 enterprises");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 36 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Series C");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 36 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("6 enterprises");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 46 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("Acquired");

		stages.enter().append("text")
			.attr("class", "stages")
			.attr("x", 46 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("1 enterprise");


}
 
function hide_stages() {
	var stages = vis.selectAll(".stages").remove();
}


/* --------------------------------------------------------------------- Display EmployeeCat ------------------------------------------------------------*/

function display_by_employeeCat() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_employeeCat(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});

	force.start();
	display_employeeCats();
	hide_alls();
	hide_markets();
	hide_stages();
	hide_fundingCats();
	
}
 
function move_towards_employeeCat(alpha) {
	return function(d) {
		var target = employeeCat_centers[d.employees];
		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
	};
}
 
function display_employeeCats() {

	d3.select("#all").classed("HighB", false).style("color", "#333333");
	d3.select("#market").classed("HighB", false).style("color", "#333333");
	d3.select("#funding").classed("HighB", false).style("color", "#333333");
	d3.select("#stage").classed("HighB", false).style("color", "#333333");
	d3.select("#employees").classed("HighB", true).style("color", "#fff");
	

	var employeeCats_x = {
		"employeeCat ":  width / 2	
	};

	var employeeCats_data = d3.keys(employeeCats_x);

	var employeeCats = vis.selectAll(".employeeCats")
				.data(employeeCats_data);

/*--------------------------------------------------------------------------Text--------------------------------------------------------------------*/
	
		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 5 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[1 to 10]");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 5 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("17 enterprises");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 16 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[11 to 50]");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 16 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("11 enterprises");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 26 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[51 to 200]");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 26 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("4 enterprises");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 36 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("[201 to 500]");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 36 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("4 enterprises");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 45 * width / 50)
			.attr("y", height / 15)
			.attr("text-anchor", "middle")
			.text("N/A");

		employeeCats.enter().append("text")
			.attr("class", "employeeCats")
			.attr("x", 45 * width / 50)
			.attr("y", 3 * height / 30)
			.attr("text-anchor", "middle")
			.text("1 enterprise");

}
 
function hide_employeeCats() {
	var employeeCats = vis.selectAll(".employeeCats").remove();
}

/* --------------------------------------------------------------------- Tooltip ------------------------------------------------------------*/


 
var my_mod = {};

my_mod.init = function (_data) {
	custom_chart(_data);
	start();
};
 
my_mod.display_all = display_group_all;

my_mod.toggle_view = function(view_type) {
	if (view_type == 'market') {
		display_by_market();
	} else if (view_type == 'funding') {
		display_by_fundingCat();
	} else if (view_type == 'stage') {
		display_by_stage();
	} else if (view_type == 'employees') {
		display_by_employeeCat();
	} else {
		display_group_all();
	}
};
 
return my_mod;
})(d3); 

d3.helper = {};

d3.helper.tooltip = function(){
        var tooltipDiv;
        var bodyNode = d3.select('#vis').node();
        var attrs = {};
        var text = '';
        var styles = {};

        function tooltip(selection){

            selection.on('mouseover.tooltip', function(pD, pI){
                var name, value;
                // Clean up lost tooltips
                d3.select('#vis').selectAll('div.tooltip').remove();
                // Append tooltip
                tooltipDiv = d3.select('#vis').append('div').attr('class', 'tooltip');
                tooltipDiv.attr(attrs);
                //tooltipDiv.style(styles);
                var absoluteMousePos = d3.mouse(bodyNode);
                tooltipDiv.style({
                    left: (absoluteMousePos[0] + 100)+'px',
                    top: (absoluteMousePos[1] + 100)+'px',
                    position: 'absolute',
                    'z-index': 1001
                });
                // Add text using the accessor function, Crop text arbitrarily
                tooltipDiv.style('width', function(d, i){ return (text(pD, pI).length > 80) ? '300px' : null; })
                    .html(function(d, i){return text(pD, pI);});
            })
            .on('mousemove.tooltip', function(pD, pI){
                // Move tooltip
                var absoluteMousePos = d3.mouse(bodyNode);
                tooltipDiv.style({
                    left: (absoluteMousePos[0] + 100)+'px',
                    top: (absoluteMousePos[1] + 100)+'px'
                });
                // Keep updating the text, it could change according to position
                tooltipDiv.html(function(d, i){ return text(pD, pI); });
            })
            .on('mouseout.tooltip', function(pD, pI){
                // Remove tooltip
                tooltipDiv.remove();
            });

        }

        tooltip.attr = function(_x){
            if (!arguments.length) return attrs;
            attrs = _x;
            return this;
        };

        tooltip.style = function(_x){
            if (!arguments.length) return styles;
            styles = _x;
            return this;
        };

        tooltip.text = function(_x){
            if (!arguments.length) return text;
            text = d3.functor(_x);
            return this;
        };

        return tooltip;
    };