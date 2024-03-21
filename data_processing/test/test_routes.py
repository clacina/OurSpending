import sys

# append the path of the
# parent directory
sys.path.append("..")

from data_processing.app import app

# @pytest.mark.parametrize("num, output",[(1,11),(2,22),(3,35),(4,44)])
# def test_multiplication_11(num, output):


def test_root():
    response = app.test_client().get("/")
    assert response.status_code == 200
    assert response.text == 'Hello World'


def test_import():
    """
    @app.post('/import')
    @app.input(LoadSchema, location='json')
    @app.doc(tags=['Batches'])
    def load_datafiles(payload):
    """
    response = app.test_client().post('/import', data={"batch_id": 8})
    assert response.status_code == 200, response.text


def test_process():
    """
    @app.route('/process', methods=['POST'])
    @app.doc(tags=['Batches'])
    @app.input(ProcessSchema, location='json')
    def process_a_transaction_batch(json_data):
    """
    response = app.test_client().post('/process', json={"batch_id": 11, "notes": "Transaction Batch 11"})
    assert response.status_code == 200, response.text


def test_template_report():
    """
    @app.route('/templatereport/<batch_id>')
    @app.doc(tags=['Reports'])
    def template_report(batch_id: int):
        return f"Creating template report for batch {batch_id}"
    """
    response = app.test_client().get('/templatereport')
    assert response.status_code == 200, response.text


def test_category_report():
    """
    @app.route('/categoryreport/<batch_id>')
    @app.doc(tags=['Reports'])
    def category_report(batch_id: int):
        return f"Creating a category report for processed batch: {batch_id}"
    """
    response = app.test_client().get('/categoryreport')
    assert response.status_code == 200, response.text


def test_rerun_processed_batch():
    """
    @app.post("/processed_batch/<batch_id>/rerun")
    @app.doc(tags=['Actions'])
    async def rereun_processed_batch(batch_id: int):
        return f"Rerunning batch {batch_id}"
    """
    response = app.test_client().get('/processed_batch/<batch_id>/rerun')
    assert response.status_code == 200, response.text


def test_apply_template():
    """
    @app.post("/processed_batch/<batch_id>/apply_template/<template_id>")
    @app.doc(tags=['Actions'])
    async def apply_template(batch_id: int, template_id: int):
    """
    response = app.test_client().post('/processed_batch/<batch_id>/apply_template/<template_id>')
    assert response.status_code == 200, response.text


def test_match_qualifiers():
    """
    @app.post("/processed_batch/<batch_id>/match_qualifiers/")
    @app.doc(tags=['Actions'])
    async def find_qualifier_matches(batch_id: int):
    """
    response = app.test_client().post('/processed_batch/<batch_id>/match_qualifiers')
    assert response.status_code == 200, response.text
