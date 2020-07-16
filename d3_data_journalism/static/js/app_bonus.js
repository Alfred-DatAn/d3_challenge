function init(){
    //remove svg if existing
    let isSvg = d3.select("#scatter").select("svg");
    if (!isSvg.empty()){
        isSvg.remove();
    }

    //svg size
    let svgWidth = d3.select("#scatter").node().getBoundingClientRect().width;
    let svgHeight = svgWidth

    //margins
    let margin = {
        top: 50,
        right: 50,
        bottom: 90,
        left: 80
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

    //default x and y axis
    let chosenXAxis = "poverty";
    let chosenYAxis = "healthcare";

    //-------------------------------------------
    //function for updating x-scale
    function xScale(pobData, chosenXAxis) {
        // create scales
        let xLinearScale = d3.scaleLinear()
          .domain([d3.min(pobData, d => d[chosenXAxis]) * 0.8, 
            d3.max(pobData, d => d[chosenXAxis]) * 1.1])
          .range([0, chartWidth]);
      
        return xLinearScale;  
    }

    //function for updating xAxis var 
    function renderXAxes(newXScale, xAxis) {
        let bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
          .duration(1000)
          .call(bottomAxis);
    
        return xAxis;
    }

    //function for updating y-scale
    function yScale(pobData, chosenYAxis) {
        // create scales
        let yLinearScale = d3.scaleLinear()
          .domain([d3.min(pobData, d => d[chosenYAxis]) * 0.8, 
            d3.max(pobData, d => d[chosenYAxis]) * 1.1])
          .range([chartHeight, 0]);
      
        return yLinearScale;
    }

    //function for updating yAxis var 
    function renderYAxes(newYScale, yAxis) {
        let leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
          .duration(1000)
          .call(leftAxis);
    
        return yAxis;
    }

    //--------------------------------------
    //function for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))

      return circlesGroup;
    }

    //function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        let xlabel;
        if (chosenXAxis === "poverty") {
          xlabel = "Poverty (%):";
        }
        else if(chosenXAxis === "income"){
          xlabel = "Income ($):";
        }
        else{
            xlabel = "Age"
        }

        let ylabel;
        if (chosenYAxis === "healthcare") {
          ylabel = "Healthcare (%):";
        }
        else if(chosenYAxis === "obesity"){
          ylabel = "Obesity (%):";
        }
        else{
            ylabel = "Smokes"
        }
    
        var toolTip = d3.tip()
          .attr("class", "d3-tip")
          .offset([80, -60])
          .html(function(d) {
            return (`${ylabel}: ${d[chosenYAxis]} <br> ${xlabel}: ${d[chosenXAxis]}`);
          });
      
        circlesGroup.call(toolTip);
      
        circlesGroup.on("mouseover", function(data) {
          toolTip.show(data);
        })
          // onmouseout event
          .on("mouseout", function(data, index) { //Can i remove "index"?
            toolTip.hide(data);
          });
      
        return circlesGroup;
    }

    //------------------------------------------------
    //retrieve data and create scatter plot
    d3.csv("static/data/data.csv").then(function(pobData){
        pobData.forEach(function(dat){
            dat.healthcare = +dat.healthcare;
            dat.poverty = +dat.poverty;
            dat.obesity = +dat.obesity;
            dat.smokes = +dat.smokes;
            dat.age = +dat.age;
            dat.income = +dat.income;
        });

        //xlinearscale function
        let xLinearScale = xScale(pobData, chosenXAxis);

        //ylinearscale function
        let yLinearScale = yScale(pobData, chosenYAxis);


        //create initial axis functions
        let bottomAxis = d3.axisBottom(xLinearScale);
        let leftAxis = d3.axisLeft(yLinearScale);

        //append x axis
        let xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        //append y axis
        let yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        //append initial circles
        let circlesGroup = chartGroup.selectAll("circle")
            .data(pobData)
            .enter()
            .append("circle")
            .attr("class", "stateCircle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis])) //I must change this too for transforming y axis
            .attr("r", 17)
            .attr("opacity", "0.7");

        //create group for x-axis labels
        let xlabelGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        let povertyLabel = xlabelGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") //value for event listener
            .classed("active", true)
            .text("Poverty (%)");

        let incomeLabel = xlabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") //value for event listener
        .classed("inactive", true)
        .text("Income ($)");

        let ageLabel = xlabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") //value for event listener
        .classed("inactive", true)
        .text("Age");

        //-------------------------------------
        //create group for y-axis labels
        let ylabelGroup = chartGroup.append("g")
            .attr("transform", `translate(${0 - margin.left * 1.1}, ${chartHeight / 2})`)

        let healthcareLabel = ylabelGroup.append("text")
        .attr('transform', 'rotate(-90)')
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Healthcare (%)");

        let obesityLabel = ylabelGroup.append("text")
        .attr('transform', 'rotate(-90)')
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)");

        let smokesLabel = ylabelGroup.append("text")
        .attr('transform', 'rotate(-90)')
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

        //--------------------------------
        let statesGroup = chartGroup.append("text")
            .selectAll("tspan")
             .data(pobData)
             .enter()
             .append("tspan")
             .attr("class", "stateText")
             .attr("x", d => xLinearScale(d[chosenXAxis]))
             .attr("y", d => yLinearScale(d[chosenYAxis]) +4)
             .text(d => d.abbr);

        function renderStates(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
            statesGroup.transition()
              .duration(1000)
              .attr("x", d => newXScale(d[chosenXAxis]))
              .attr("y", d => newYScale(d[chosenYAxis]) +4)
        
            return statesGroup;
        }

        //update Tooltip
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // x labels event listener
        xlabelGroup.selectAll("text")
            .on("click", function(){
                let value = d3.select(this).attr("value");
                if (value !== chosenXAxis){
                    chosenXAxis = value;

                    //update x scale based on new value
                    xLinearScale = xScale(pobData, chosenXAxis);

                    //update x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    //update circles
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    //update tooltips
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //update states locations
                    statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                    //change bold text for x labels
                    if (chosenXAxis === "poverty"){
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true)
                    }
                    else if (chosenXAxis === "income"){
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false)
                    }
                    else{
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true)
                    }
                }
            });

        // y labels event listener
        ylabelGroup.selectAll("text")
            .on("click", function(){
                let value = d3.select(this).attr("value");
                if (value !== chosenYAxis){
                    chosenYAxis = value;

                    //update y scale based on new value
                    yLinearScale = yScale(pobData, chosenYAxis);

                    //update y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    //update circles
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    //update tooltips
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //update states locations
                    statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    //change bold text for x labels
                    if (chosenYAxis === "healthcare"){
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true)
                    }
                    else if (chosenYAxis === "obesity"){
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true)
                    }
                    else{
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true)
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false)
                    }
                }
            });

    });
}

init();

d3.select(window).on("resize", init);