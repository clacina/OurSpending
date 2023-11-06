import {useLocation} from "react-router-dom";


const Reports = () => {
    const location = useLocation();
    console.log("Key:    ", location.key);
    console.log("PathN:  ", location.pathname)
    console.log("Path:   ", location.path)
    console.log("Search: ", location.search)
    console.log("State:  ", location.state)

    if(location.pathname.includes('template')) {

    } else if(location.pathname.includes('category')) {

    } else {
        return(<div>
            <h1>Unknown Page</h1>
            <p>{location.pathname}</p>
        </div>)
    }

    return(
        <div>
            <h2>Reports</h2>
        </div>

    )
}

export default Reports;
