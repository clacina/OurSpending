import os.path
from pathlib import Path
from data_processing import db_utils
from data_processing import settings
# from reports import reports

p = Path("")

datafile_path = p.resolve()
print(f"Datafile: {datafile_path}")
processing_path = Path('../../rest_api').resolve()
datafile_path = os.path.join(processing_path, 'datafiles')

# report_data = reports.ReportData()
# report_data.categories = db_utils.db_access.load_categories()
# report_data.tags = db_utils.db_access.load_tags()
# report_data.institutions = db_utils.db_access.load_institutions()


def dump_results(processor):
    credit_results = {}
    debit_results = {}

    for key, v in processor.spending.items():
        hint = processor.entities[key]['hint']
        if processor.entities[key]["credit"]:
            if hint not in credit_results:
                credit_results[hint] = list()
            credit_results[hint] = credit_results[hint] + v
        else:
            if hint not in debit_results:
                debit_results[hint] = list()
            debit_results[hint] = debit_results[hint] + v

    myKeys = list(debit_results.keys())
    myKeys.sort()
    sorted_dict = {i: debit_results[i] for i in myKeys}
    debit_results = sorted_dict

    myKeys = list(credit_results.keys())
    myKeys.sort()
    sorted_dict = {i: credit_results[i] for i in myKeys}
    credit_results = sorted_dict

    print("\n\n\n------------Results-------------\n")
    print("Credits")
    for k, v in credit_results.items():
        print(f"{k} - {len(v)}")

    print("\nDebits")
    for k, v in debit_results.items():
        print(f"{k} - {len(v)}")


def test_base_infra():
    cap = settings.configure_processor(
        institution_name="Wellsfargo Checking",
        processor=settings.WellsfargoChecking,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)


def test_paypal_base():
    cap = settings.configure_processor(
        institution_name="PayPal",
        processor=settings.PayPal,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)


def test_carecredit_base():
    cap = settings.configure_processor(
        institution_name="Care Credit",
        processor=settings.CareCredit,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)


def test_sound_checking_base():
    cap = settings.configure_processor(
        institution_name="Sound Checking - House",
        processor=settings.SoundChecking,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)


def test_sound_checking_visa_base():
    cap = settings.configure_processor(
        institution_name="Sound Visa",
        processor=settings.SoundVisa,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)


def test_sound_checking_christa_base():
    cap = settings.configure_processor(
        institution_name="Sound Checking - Christa",
        processor=settings.SoundCheckingChrista,
        config=settings.data_mgr,
        datafile=None,
    )

    reports.Reporting(report_data).category_verification_report(
        [cap],
        "report_output/categories.html",
    )

    dump_results(cap)
