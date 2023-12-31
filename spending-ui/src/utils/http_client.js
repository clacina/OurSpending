
const send = async ({url}, {method}, {headers}, {body}) => {
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
    const response = await fetch(url, requestOptions);
    const str = await response.json();
    console.log("HttpClient-Response: ", str);
    return str;
}

export default send;
