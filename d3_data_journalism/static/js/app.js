function scatterPlot() {
    d3.csv("static/data/data.csv").then(pobData =>{

        pobData.forEach(function(dat){
            dat.healthcare = +dat.healthcare;
            dat.poverty = +dat.poverty
        });
        
        //remove svg if existing
        let isSvg = d3.select("#scatter").select("svg");
        if (!isSvg.empty()){
            isSvg.remove();
        }

        let svgWidth = d3.select("#scatter").node().getBoundingClientRect().width;

        let svgHeight = svgWidth

        //margins
        let margin = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        };

        //chart area
        let chartHeight = svgHeight - margin.top - margin.bottom;
        let chartWidth = svgWidth - margin.right - margin.left;

        //create svg container
        let svg = d3.select("#scatter").append("svg")
            .attr("height", svgHeight)
            .attr("width", svgWidth);

        //create chart group
        let chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        //scale y to chart height
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(pobData, d => d.healthcare)])
            .range([chartHeight, 0]);

        //scale x to chart width
        let xScale = d3.scaleLinear()
            .domain([0, d3.max(pobData, d => d.poverty)])
            .range([0, chartWidth])

        //create axes
        let yAxis = d3.axisLeft(yScale);
        let xAxis = d3.axisBottom(xScale);

        //axis position
        chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(xAxis);

        chartGroup.append("g")
            .call(yAxis)

        //create state text
        let stateGroup = chartGroup.append("text")
            .selectAll("tspan")
             .data(pobData)
             .enter()
             .append("tspan")
             .attr("class", "stateText")
             .attr("x", d => xScale(d.poverty))
             .attr("y", d => yScale(d.healthcare) +4)
             .text(d => d.abbr);

        let abbre = pobData.map(d => d.abbr);

        //create circles
        let circleGroup = chartGroup.selectAll("circle")
            .data(pobData)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xScale(d.poverty))
            .attr("cy", d => yScale(d.healthcare))
            .attr("r", "12")
            .attr("opacity", ".5");

        // tool tip
        let toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`Healthcare (%): ${d.healthcare}<br>Poverty (%): ${d.poverty}<br>${d.abbr}`);
            });

        chartGroup.call(toolTip);

        //show and hide tooltip
        circleGroup.on("click", function(data){
            toolTip.show(data, this);
        })
            .on("mouseout", function(data){
                toolTip.hide(data);
            });

        //axis labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (svgHeight / 2))
            .attr("dy", "1em")
            .attr("class", "aText")
            .text("Healthcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + (margin.top / 1.2)})`)
            .attr("class", "aText")
            .text("Poverty (%)");

    })
}

scatterPlot();

d3.select(window).on("resize", scatterPlot);