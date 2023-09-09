from data_processing.transaction_models import *
from reports import reports
from processing import db_utils
import processing.settings as settings

settings.data_mgr = settings.DataManager()

debug_processors = True


def test_template_report():
    batch_id = 3  # processing_transaction_batch.id
    report_data = reports.ReportData()
    report_data.categories = db_utils.db_access.load_categories()
    report_data.tags = db_utils.db_access.load_tags()
    report_data.institutions = db_utils.db_access.load_institutions()
    all_processors = settings.create_configs()

    for bank in all_processors:
        bank.analyze_data(processed_batch_id=batch_id)

    reports.Reporting(report_data).template_verification_report(
        all_processors,
        "report_output/template_verification.html",
        include_extras=True,
        include_spending=True,
    )


def test_category_report():
    batch_id = 3  # processing_transaction_batch.id
    report_data = reports.ReportData()
    report_data.categories = db_utils.db_access.load_categories()
    report_data.tags = db_utils.db_access.load_tags()
    report_data.institutions = db_utils.db_access.load_institutions()
    all_processors = settings.create_configs()

    for bank in all_processors:
        bank.analyze_data(processed_batch_id=batch_id)

    reports.Reporting(report_data).category_verification_report(
        all_processors,
        "report_output/categories.html",
    )
