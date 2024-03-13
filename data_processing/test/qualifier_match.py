import requests


def qualifier_matching():
    """
    @app.post("/processed_batch/<batch_id>/match_qualifiers/")
    @app.doc(tags=['Actions'])
    async def find_qualifier_matches(batch_id: int):

    """
    """
        "qualifiers":
            qualifiers.map((item) => {
                return({"id": item.id, "value": item.value, "data_column": item.data_column})
            }),
    """
    url = 'http://192.168.1.77:8880/processed_batch/533/match_qualifiers/'
    json_data = {
        "qualifiers": [
            {
                "id": 522,
                "value": "safeway",
                "data_column": "Description"
            },
        ],
        "institution_id": 3
    }
    response = requests.post(url, json=json_data)
    print(response)


qualifier_matching()
