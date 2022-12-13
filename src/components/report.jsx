import {ListContainer} from "./listContainer";
import {Map} from "./map";
import {useEffect, useState} from "react";
import {OpenMeteoModule} from "../api/weather";

const openMeteoModule = new OpenMeteoModule();

function Report() {
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

export {Report};