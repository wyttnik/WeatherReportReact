import React from 'react';
import ReactDOM from 'react-dom/client';
import {Report} from "./components/report";

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const root = ReactDOM.createRoot(document.getElementById('report'));
    const element = <Report />;
    root.render(element);

}