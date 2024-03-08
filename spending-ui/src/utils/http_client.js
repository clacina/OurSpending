
const send = async (url, method, headers, body) => {
    console.log("Types: " + typeof method + " " + typeof headers)
    const requestOptions = {
        method: method,
        headers: headers,
    };

    if(body !== null) {
        requestOptions["body"] = JSON.stringify(body);
        console.log("Body: ", body);
    }

    console.log("Sending to URL: ", url);
    console.log("Sending Data: ", requestOptions);
    try {
        const response = await fetch(url, requestOptions);
        console.log("Resp: ", response);
        const str = await response.json();
        console.log("HttpClient-Response: ", str);
        return str;
    } catch (error) {
        console.error("ERROR: ", error);
    }
}

export default send;
