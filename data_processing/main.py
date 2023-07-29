import db_utils
from reports import reports
import sys
from typing import Optional, List
from radicli import Radicli, Arg
import settings

""" -------------------------- Entry Point ----------------------------- """

debug_processors = False
cli = Radicli()


def process_transaction_files(source: Optional[str] = "../datafiles"):
    """
    Create a processing batch
    :return:
    """
    batch_id = db_utils.create_transaction_batch()
    processors = settings.create_configs_with_data(source=source)
    transactions_processed = 0
    for account in processors:
        print(f"Loading data for account: {account.name}")
        account.process_transactions(batch_id)
        transactions_processed += len(account.transactions)
    db_utils.update_batch_info(
        batch_id, f"{len(processors)} Processors, {transactions_processed} Transactions"
    )
    return batch_id


def present_batch_menu_select():
    batches = db_utils.db_access.list_batches()
    if not batches:
        print("No batches to analyze, run 'load'")
        sys.exit(1)

    for b in batches:
        print(f"Batch ID: {b[0]}, Ran: {b[1].strftime('%m-%d-%Y %H:%H')}, {b[2]}")
    batch_id = input(
        "Enter the batch to process (enter 'q' to exit, 'r' to run a new batch):"
    )

    if batch_id == "q":
        sys.exit(1)
    elif batch_id == "r":  # run new batch
        batch_id = process_transaction_files()
    elif batch_id == "l":  # just use last run
        batch_id = batches[-1][0]
    else:
        # make sure the specified batch exists
        batch_id = int(batch_id)
        if batch_id not in [b[0] for b in batches if b[0] == batch_id]:
            print(f"Invalid batch id: {batch_id}")
            sys.exit(2)
    return batch_id


def present_processed_batch_menu_select():
    batches = db_utils.db_access.list_processed_batches()
    if not batches:
        print("No batches to analyze, run 'load'")
        sys.exit(1)

    for b in batches:
        print(f"Batch ID: {b[0]}, Ran: {b[1].strftime('%m-%d-%Y %H:%H')}, {b[2]}, Transacion Id: {b[3]}")
    batch_id = input(
        "Enter the batch to use (enter 'q' to exit):"
    )

    if batch_id == "q":
        sys.exit(1)
    else:
        # make sure the specified batch exists
        batch_id = int(batch_id)
        if batch_id not in [b[0] for b in batches if b[0] == batch_id]:
            print(f"Invalid batch id: {batch_id}")
            sys.exit(2)
    return batch_id


# ---------------------------------- Command Line Interface Handling (CLI) ------------------------------------


@cli.command("load", source=Arg("--source", "-s", help="Source Folder"))
def load_datafiles(source: Optional[str]):
    """Load activity reports for processing."""
    print(f"Got source: {source}")
    batch_id = process_transaction_files()
    print(f"Batch Created: {batch_id}")


@cli.command("process", batch_id=Arg("--batch", help="Transaction Batch Id"))
def process_a_tranaction_batch(batch_id: Optional[int] = None):
    """Analyze a loaded batch of transactions."""
    if not batch_id:
        batch_id = present_batch_menu_select()
    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id)
    print(
        f"Running transaction batch: {batch_id} into processing batch: {processed_batch_id}"
    )
    all_processors = settings.create_configs()

    for bank in all_processors:
        bank.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)


@cli.command("templatereport", batch_id=Arg("--batch", help="Processed Batch Id"))
def template_report(batch_id: Optional[int] = None):
    if not batch_id:
        batch_id = present_processed_batch_menu_select()

    """Generate a Template Verification Report from a Processed Batch"""
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


@cli.command("categoryreport", batch_id=Arg("--batch", help="Processed Batch Id"))
def category_report(batch_id: Optional[int] = None):
    """Generate a Category Breakdown Report"""
    if not batch_id:
        batch_id = present_processed_batch_menu_select()

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


"""
    What can we do here?
    1. Load our data files (transactions) into the db as a 'batch' - creates a batch and transaction_records
    2. Match templates to transactions in a batch - creates a processed_batch and processed_transaction_records
    3. Analyze by categories - creates spending report from a processed_batch
        group processed transactions by template and then template.category
    4. Template Matching Report on batch - shows all transactions from a given batch and the templates they are matched to
        helps find un-matched transactions to create new templates.
        Output is JSON that can be used in a visual report
    5.
    
    (1) python main load --source {source folder}
    (2) python main process
    (4) python main templatereport --batch {processed batch id}
    (3) python main categoryreport --batch {processed batch id}   
    
    
"""
if __name__ == "__main__":
    # cli.run()

    report_data = reports.ReportData()
    report_data.categories = db_utils.db_access.load_categories()
    report_data.tags = db_utils.db_access.load_tags()
    report_data.institutions = db_utils.db_access.load_institutions()
    all_processors = settings.create_configs()

    for bank in all_processors:
        bank.analyze_data(processed_batch_id=3)
        # print(json.dumps(bank.spending, indent=4))
        print(bank.__dict__)
        bank_json = {
            'name': bank.name,
            'datafile': bank.datafile,
            'transactions': bank.transactions,
            'config': bank.config,
            'unrecognized_transactions': bank.unrecognized_transactions,
            'spending': bank.spending,
            'category_breakdown': bank.category_breakdown
        }

        for tx in bank.transactions:
            print(tx.__dict__)
            ts_json = {
                'amount': tx.amount,
                'category': tx.category,
                'date': tx.date,
                'description': tx.description,
                'template_id': tx.template_id,
                'transaction_id': tx.transaction_id,
                'raw': tx.raw,
                'institution_id': tx.institution_id,
                'note': tx.note
            }

        for ut in bank.unrecognized_transactions:
            ut_json = {

            }

        for template_id, v in bank.spending.items():
            spend_json = {
                'template_id': template_id,
                'category_id': v['banking_entity'].category_id,
                'hint': v['banking_entity'].hint,
                'institution_id': v['banking_entity'].institution_id,
                'qualifiers': v['banking_entity'].qualifiers,
                'tags': v['banking_entity'].tags,
                'transactions': []
            }
            for tx in v['transactions']:
                ts_json = {
                    'amount': tx.amount,
                    'category': tx.category,
                    'date': tx.date,
                    'description': tx.description,
                    'template_id': tx.template_id,
                    'transaction_id': tx.transaction_id,
                    'raw': tx.raw,
                    'institution_id': tx.institution_id,
                    'note': tx.note
                }
                spend_json['transactions'].append(ts_json)

    # {
    #     'name': 'Care Credit',
    #     'datafile': None,
    #     'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E51F90 > , < processing.transaction_models.CareCreditTransaction object at 0x00000208457E0550 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845E52590 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845789690 > ],
    #     'config': < processing.settings.ConfigurationData object at 0x0000020845EF00D0 > ,
    #     'unrecognized_transactions': [],
    #     'spending': {
    #         1: {
    #             'banking_entity': Vet - 11 False 27 None,
    #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E51F90 > ]
    #         },
    #         2: {
    #             'banking_entity': Interest - 11 False 13 None,
    #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x00000208457E0550 > , < processing.transaction_models.CareCreditTransaction object at 0x0000020845789690 > ]
    #         },
    #         3: {
    #             'banking_entity': Payment - 11 False 16 None,
    #             'transactions': [ < processing.transaction_models.CareCreditTransaction object at 0x0000020845E52590 > ]
    #         }
    #     },
    #     'category_breakdown': {}
    # }

            # tm = TemplateMatch(
            #     template_id=
            # )
            # proc = ProcessorModel(
            #     processor_id=bank.config.institution_id,
            #     templates=templates
            # )
