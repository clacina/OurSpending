import logging

from flask import Flask, request
from data_processing import db_utils
import sys
from typing import Optional, List
from data_processing import settings
from data_processing.logger import setup_rich_logger

setup_rich_logger()
app = Flask(__name__)


@app.route('/')
def root():
    return 'Hello World'


def process_transaction_files(source: Optional[str] = "./datafiles", debug_processors: Optional[bool] = False):
    """
    Create a processing batch
    :return:
    """
    batch_id = db_utils.create_transaction_batch()
    processors = settings.create_configs_with_data(source=source, debug_processors=debug_processors)
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
        "Enter the batch to process (enter 'q' to exit, 'r' to run a new batch, 'd' to run a new debug batch):"
    )

    if batch_id == "q":
        sys.exit(1)
    elif batch_id == "r":  # run new batch
        batch_id = process_transaction_files()
    elif batch_id == "d":  # run new batch
        batch_id = process_transaction_files(debug_processors=True)
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


@app.route('/load', methods=['POST'])
def load_datafiles():
    """Load activity reports for processing."""
    logging.info(f"Loading data files...{request.json}")
    # print(f"Got source: {source}")
    # batch_id = process_transaction_files(source=source)
    # print(f"Batch Created: {batch_id}")

    return 'Create batch 333'


@app.route('/process/<batch_id>')
def process_a_transaction_batch(batch_id: int):
    """Analyze a loaded batch of transactions."""
    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id)
    logging.info(
        f"Running transaction batch: {batch_id} into processing batch: {processed_batch_id}"
    )
    all_processors = settings.create_configs()

    for bank in all_processors:
        bank.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)

    return "Process load complete"


# @app.route('/templatereport')
# def template_report(batch_id: Optional[int] = None):
#     if not batch_id:
#         batch_id = present_processed_batch_menu_select()
#
#     """Generate a Template Verification Report from a Processed Batch"""
#     report_data = reports.ReportData()
#     report_data.categories = db_utils.db_access.load_categories()
#     report_data.tags = db_utils.db_access.load_tags()
#     report_data.institutions = db_utils.db_access.load_institutions()
#     all_processors = settings.create_configs()
#
#     for bank in all_processors:
#         bank.analyze_data(processed_batch_id=batch_id)
#
#     reports.Reporting(report_data).template_verification_report(
#         all_processors,
#         "report_output/template_verification.html",
#         include_extras=True,
#         include_spending=True,
#     )
#
#
# @app.route('/categoryreport')
# def category_report(batch_id: Optional[int] = None):
#     """Generate a Category Breakdown Report"""
#     if not batch_id:
#         batch_id = present_processed_batch_menu_select()
#
#     report_data = reports.ReportData()
#     report_data.categories = db_utils.db_access.load_categories()
#     report_data.tags = db_utils.db_access.load_tags()
#     report_data.institutions = db_utils.db_access.load_institutions()
#     all_processors = settings.create_configs()
#
#     for bank in all_processors:
#         bank.analyze_data(processed_batch_id=batch_id)
#
#     reports.Reporting(report_data).category_verification_report(
#         all_processors,
#         "report_output/categories.html",
#     )


if __name__ == '__main__':
    app.run(host="0.0.0.0")