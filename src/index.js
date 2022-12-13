import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {OpenMeteoModule} from "./api/weather";
import * as d3 from "d3";
import logos from "circle-flags/flags/*.svg";

const openMeteoModule = new OpenMeteoModule();

function SearchBox() {
    const [placeName, setPlaceName] = useState('');
    const [showList, setShowList] = useState(false);
    const [showTemp, setShowTemp] = useState(false);
    const [longitude, setLongitude] = useState(0.0);
    const [latitude, setLatitude] = useState(0.0);
    const [cities, setCities] = useState([]);
    const [clickCheck, setClickCheck] = useState(false);
    const [data, setData] = useState({});

    const searchTemp = (lat,long,name) => {
        openMeteoModule.getTemperature(lat,long).then(res=>{
            res.name = name;
            console.log('test1');
            setData(res);
            setPlaceName(name);
            setShowTemp(true);
            setShowList(false);
            setLongitude(long);
            setLatitude(lat);
            setClickCheck(true);
        });
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            if (clickCheck) searchTemp(latitude,longitude,placeName);
            else if (cities.length !== 0) searchTemp(cities[0].latitude,cities[0].longitude,cities[0].name);
        }
    };

    const handleClick = () => {
        setShowList(true);
    };

    const handleTextChange = (e) => {
        setPlaceName(e.target.value);
        openMeteoModule.getCities(e.target.value)
            .then(res=>{
                if (res !== undefined) {
                    setCities(res);
                }
            });
        setShowList(true);
        setClickCheck(false);
    };

    const handleBtnClick = () => {
        if (clickCheck) searchTemp(latitude,longitude,placeName);
            else if (cities.length !== 0) searchTemp(cities[0].latitude,cities[0].longitude,cities[0].name);
    };

    useEffect(()=>{
        document.onclick = (e) => {
            if (!document.getElementById('area').contains(e.target))
                setShowList(false);
        };
    },[]);
    
    return(
        <div className='weather-report' id='report'>
            <div className="search-box" id="area">
                <div className="search-line">
                    <input type="text" id="place" placeholder='Type City Name'
                        onClick={handleClick} value={placeName} onChange={handleTextChange} onKeyUp={handleKeyUp}/>
                    <input id="btn" type="button" value="See temperature" onClick={handleBtnClick}/>
                </div> 
                {showList && <ListContainer place={placeName} cities={cities}
                    handleStates={{searchTemp}}/>}
            </div>
            {showTemp && <Map data={data}/>}
        </div>
    );
};

function ListContainer(props) {
    const result = props.cities.map(city=><ListItem key={city.id.toString()}
                city={city} handleStates={props.handleStates}/>);

    return (<div id="listContainer">{result.length !== 0 ? <ul>{result}</ul>:null}</div>);
};

function ListItem(props) {
    return(
        <li className='option' onClick={()=>{props.handleStates.searchTemp(props.city.latitude,
                                                                            props.city.longitude,
                                                                            props.city.name)}}>
            <img src={logos[props.city.country_code.toLowerCase()]} width='20'/>
            {` ${props.city.name} `}
            <small className='smallText'>{(props.city.country ? props.city.country : '') 
                + (props.city.admin1 ? ' ' + props.city.admin1 : '')}</small>
        </li>
    );
};

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
    console.log('test2');
    const margin = { left: 120, right: 120, top: 60, bottom: 30 };
    const width = 900, height = 400;
    const containerRef = useRef(null);
    const ticks = 8;
    const data = props.data, name = props.data.name;
    
    useEffect(()=> {
        d3.select(containerRef.current).select('svg').remove();
        const dates = timeToMs(data);
        const d = getDataStructure(data);
        const svg = d3.select(containerRef.current)
        .append("svg")
        .attr('class','weatherBox')
        .attr("viewBox", [0, 0, width, height]);
        
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
        <div className="mapContainer map" ref={containerRef}>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('report'));
root.render(<SearchBox />);

