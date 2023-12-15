import {createContext, useEffect, useState} from "react";
import send from "../utils/http_client";

export const TagsContext = createContext({
    tags: [],
    setTags: () => null,
});


const tagColors = [
    '#00B8D9',
    '#0052CC',
    '#5243AA',
    '#FF5630',
    '#FF8B00',
    '#FFC400',
    '#36B37E',
    '#00875A',
    '#253858',
    '#666666',
    "#7F0000",
    "#CC0000",
    "#FF4444",
    "#FFF4F4",
    "#FFB2B2",
    "#995100",
    "#CC6C00",
    "#FF8800",
    "#FFBB33",
    "#FFE564",
    "#2C4C00",
    "#436500",
    "#669900",
    "#99CC00",
    "#99CC00",
    "#3C1451",
    "#6B238E",
    "#9933CC",
    "#AA66CC",
    "#BC93D1",
    "#004C66",
    "#007299",
    "#0099CC",
    "#33B5E5",
    "#8ED5F0",
    "#660033",
    "#B20058",
    "#E50072",
    "#FF3298",
    "#FF7FBF",
]


export const TagsProvider = ({children}) => {
    const [tagsMap, setTagsMap] = useState([]);
    const [update, setUpdate] = useState(true);

    const getTags = async () => {
        const url = 'http://localhost:8000/resources/tags'
        const data = await fetch(url, { method: 'GET' })
        var str = await data.json();
        return(str);
    };

    const getRandomColor = () => {
        // Create a random index
        const randomIndex = Math.floor(Math.random() * tagColors.length);

        // Get the random item
        return tagColors[randomIndex];
    }

    const addTag = async (value) => {
        const body = {
            'value': value,
            'notes': '',
            'color': getRandomColor()
        }
        const headers = {'Content-Type': 'application/json'}
        const url = 'http://localhost:8000/resources/tags';
        const method = 'POST'
        const request = await send({url}, {method}, {headers}, {body});
        console.log("New tag: ", request);
        setUpdate(true);
        return(request.id);
    }

    const queryTags = (tag_list) => {
        const tags = []

        tagsMap.forEach((tag) => {
            if(tag.id in tag_list) {
                tags.push(tag);
            }
        })

        return tags;
    }

    useEffect(() => {
        try {
            console.log("TagsContext - loading tags");
            getTags().then((res) => setTagsMap(res));
            setUpdate(false);
        } catch (e) {
            console.log("Error fetching database content: ", e);
        }
    }, [update===true]);

    const value = {tagsMap, setTagsMap, addTag, queryTags};
    return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
};
