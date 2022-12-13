import * as d3 from "d3";

import {React} from 'react';
import ReactDOM from 'react-dom/client';
import {Report} from "./components/report";

document.addEventListener("DOMContentLoaded", setup);

function setup(){
    const root = ReactDOM.createRoot(document.getElementById('report'));
    root.render(<Report />);

};

