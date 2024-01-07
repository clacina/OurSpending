import {useContext, useEffect} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";
import './home.component.styles.css';

const Home = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    useEffect(() => {
        console.log("Start");
        setSectionTitle('Home');
    }, []);

    return(
        <div className='HomePageContainer'>
            <img src='dragon_2024.jpg' alt='Flowers'/>
        </div>
    )
}

export default Home;
