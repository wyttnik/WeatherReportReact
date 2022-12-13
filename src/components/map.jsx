import * as d3 from "d3";
import {useRef, useEffect} from "react";

function roundMinutes(date) {
    
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0, 0, 0); // Reset seconds and milliseconds

    return date;
};

function getDataStructure(data) {
    const newData = [];
    for (let i = 0; i < data.hourly.time.length; i++) {
        newData[i] = {time:data.hourly.time[i],temp:data.hourly.temperature_2m[i]};
    };
    return newData;
};

function timeToMs(data) {
    return data.hourly.time.map(t=>new Date(t).getTime());
};

function Map(props) {
    console.log(props);
    const margin = { left: 120, right: 120, top: 60, bottom: 30 };
    const width = 900, height = 400;
    const containerRef = useRef(null);
    console.log(d3.select(containerRef.current));
    const ticks = 8;
    const data = props.data, name = props.data.name;
    
    useEffect(()=> {
        console.log('test3');
        console.log('testfkdokfodk');
        console.log(d3.select(containerRef.current));
        console.log(d3.select(containerRef.current).select('svg'));
        d3.select(containerRef.current).select('svg').remove();
        console.log('testAfterRemove');
        const dates = timeToMs(data);
        console.log('testDates');
        const d = getDataStructure(data);
        const svg = d3.select(containerRef.current)
        .append("svg")
        .attr('class','weatherBox')
        .attr("viewBox", [0, 0, width, height]);
        console.log('testSvg');
        
        const x_scale = d3.scaleTime().range([margin.left, width - margin.right]);
        const y_scale = d3.scaleLinear().range([height - margin.bottom - margin.top, margin.top]);
        const x_label = "Day";
        const y_label = "Temperature";
    
        // add title
        svg.append("text")
        .attr("class", "svg_title")
        .attr("x", (width - margin.right + margin.left) / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text(`${y_label} in ${name}`);
        
        // add y label
        svg.append("text")
        .attr("text-ancho", "middle")
        .attr(
        "transform",
        `translate(${margin.left - 50}, ${
            (height - margin.top - margin.bottom + 180) / 2
        }) rotate(-90)`
        )
        .style("font-size", "26px")
        .text(y_label);
    
        // add x label
        svg.append("text")
        .attr("class", "svg_title")
        .attr("x", (width - margin.right + margin.left) / 2)
        .attr("y", height - margin.bottom - margin.top + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "26px")
        .text(x_label);
    
        const start_time = (d) => new Date(d.time);
        const temperature = (d) => d.temp;
    
        const line_generator = d3.line()
        .x((d) => x_scale(start_time(d)))
        .y((d) => y_scale(temperature(d)))
        .curve(d3.curveBasis);
    
        const minMaxDates = d3.extent(d, start_time);
        // set the domain 
        x_scale.domain(minMaxDates).nice(ticks);
        y_scale.domain(d3.extent(d, temperature)).nice(ticks);
    
        // axis
        const x_axis = d3.axisBottom()
        .scale(x_scale)
        .tickPadding(10)
        .ticks(ticks)
        .tickSize(-height + margin.top * 2 + margin.bottom);
    
        const y_axis = d3.axisLeft()
        .scale(y_scale)
        .tickPadding(5)
        .ticks(ticks, ".1")
        .tickSize(-width + margin.left + margin.right);
    
        // reform x ticks so that they'll look like Month Day
        x_axis.tickFormat((d) => {
            return d.toDateString().substr(4,6);
        });
    
        // add celsius icon
        y_axis.tickFormat((d) => {
            return d + data.hourly_units.temperature_2m;
        });
    
        // add the line path
        svg.append("path")
        .datum(d)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line_generator(d));
    
        // add x axis
        svg
        .append("g")
        .style("opacity", 1)
        .style("font", "7px times")
        .attr("transform", `translate(0,${height - margin.bottom - margin.top})`)
        .call(x_axis);
    
        // add y axis
        svg
        .append("g")
        .style("font", "7px times")
        .attr("transform", `translate(${margin.left},0)`)
        .call(y_axis);

        const focus = svg
        .append('g')
        .append('circle')
        .style("fill", "blue")
        .attr("stroke", "black")
        .attr('r', 3)
        .style("opacity", 0);

        // Create the text that travels along the curve of chart
        const focusText = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");
        let x;

        

        const mouseout = () => {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
        };

        const mousemove = (event) => {
            // recover coordinate we need
            x = x_scale.invert(d3.pointer(event)[0]);
            let formatDate, curData, curTemp;
            if ((minMaxDates[0] <= x) && (x <= minMaxDates[1])) {
                focus.style("opacity", 1)
                focusText.style("opacity",1)
                let i = dates.indexOf(roundMinutes(x).getTime());
                curData = new Date(data.hourly.time[i]);
                curTemp = data.hourly.temperature_2m[i];
                formatDate = curData.toString().split(' ');
                focus
                  .attr("cx", x_scale(curData))
                  .attr("cy", y_scale(curTemp))
                focusText
                  .html(formatDate[2] + ' ' + formatDate[1] + ' ' + formatDate[4].substr(0,5) 
                    + ' ' + curTemp + data.hourly_units.temperature_2m)
                  .attr("x", x_scale(curData)+15)
                  .attr("y", y_scale(curTemp))
            }
        };

        svg
        .on('mousemove', mousemove)
        .on('mouseout', mouseout); 
    });

    return(
        <div className="mapContainer" ref={containerRef}>
        </div>
    );
};

export {Map}