import {ListContainer} from "./listContainer";
import {Map} from "./map";
import React, {useEffect, useState, useRef} from "react";
import {OpenMeteoModule} from "../api/weather";

const openMeteoModule = new OpenMeteoModule();

function Report(){
    const [showList, setShowList] = useState(false);
    const [showTemp, setShowTemp] = useState(false);
    const [longitude, setLongitude] = useState(0.0);
    const [latitude, setLatitude] = useState(0.0);
    const [cities, setCities] = useState([]);
    const [clickCheck, setClickCheck] = useState(false);
    const [data, setData] = useState({});
    let nameRef = useRef(null);

    const searchTemp = (lat,long,name) => {
        openMeteoModule.getTemperature(lat,long).then(res=>{
            res.name = name;
            nameRef.current.value = name;
            setData(res);
            setShowTemp(true);
            setShowList(false);
            setLongitude(long);
            setLatitude(lat);
            setClickCheck(true);
        });
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            if (clickCheck) searchTemp(latitude,longitude,nameRef.current.value);
            else if (cities.length !== 0) searchTemp(cities[0].latitude,cities[0].longitude,cities[0].name);
        }
        else {
            nameRef.current.value = e.target.value;
            openMeteoModule.getCities(e.target.value)
                .then(res=>{
                    if (res !== undefined) {
                        setCities(res);
                    }
                });
            setShowList(true);
            setClickCheck(false);
        }
    };

    const handleClick = () => {
        setShowList(true);
    };

    const handleBtnClick = () => {
        if (clickCheck) searchTemp(latitude,longitude,nameRef.current.value);
        else if (cities.length !== 0) searchTemp(cities[0].latitude,cities[0].longitude,cities[0].name);
    };

    useEffect(()=>{
        document.onclick = (e) => {
            if (!document.getElementById('area').contains(e.target))
                setShowList(false);
        };
    },[]);

    return(
        <div className='report' id='result'>
            <div className="search-box" id="area">
                <div className="search-line">
                    <input type="text" id="place" placeholder='Type City Name'
                           onClick={handleClick} ref={nameRef} onKeyUp={handleKeyUp}/>
                    <input id="btn" type="button" value="See temperature" onClick={handleBtnClick}/>
                </div>
                {showList && <ListContainer cities={cities} handleStates={{searchTemp}}/>}
            </div>
             {showTemp && <Map data={data}/>}
        </div>
    );
}

export {Report};