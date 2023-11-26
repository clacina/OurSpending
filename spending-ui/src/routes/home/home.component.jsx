import {useContext, useEffect} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";

const Home = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    useEffect(() => {
        console.log("Start");
        setSectionTitle('Home');
    }, []);

    return(
        <div>
        </div>
    )
}

export default Home;
