import { CircleFlag } from 'react-circle-flags'

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
            <CircleFlag countryCode={props.city.country_code.toLowerCase()} width='20' height='20'/>
            {` ${props.city.name} `}
            <small className='smallText'>{(props.city.country ? props.city.country : '')
            + (props.city.admin1 ? ' ' + props.city.admin1 : '')}</small>
        </li>
    );
};

export {ListContainer}