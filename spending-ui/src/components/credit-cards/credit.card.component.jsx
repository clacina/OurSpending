import {useContext, useEffect, useState} from "react";
import {StaticDataContext} from "../../contexts/static_data.context";

const CreditCards = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log("Start");
        setSectionTitle('Credit Cards');
        setIsLoaded(true);

        // if (processedBatches.length > 0) {
        //     setIsLoaded(true);
        //     console.log(processedBatches);
        // } else {
        //     console.info("No definitions yet");
        // }
    }, []);

    if(isLoaded) {
        return (
            <div>
                Credit Cards
            </div>
        );
    }
}

export default CreditCards;