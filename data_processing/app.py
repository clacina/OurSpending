import logging
import os

from flask import Flask, request
from data_processing import db_utils
import sys
from data_processing import settings
from data_processing.logger import setup_rich_logger
from data_processing.processors import select_processor_from_file, select_processors_from_batch
from data_processing.settings import data_mgr
from data_processing.settings import ConfigurationData

setup_rich_logger()
app = Flask(__name__)


@app.route('/')
def root():
    return 'Hello World'


def build_config_for_institution(config, institution_id):
    """
    Look through main template list and filter by the specified id
    :param config:
    :param institution_id:
    :return: new ConfigurationData object matching the specified id
    """
    new_config = ConfigurationData()
    new_config.institution_id = institution_id
    for e in config.templates:
        if e.institution_id == institution_id:
            new_config.templates.append(e)

    return new_config


def configure_processor(datafile, processor_class, institution_id):
    """
    Find the institution_id for the specified institution name, then
    build the template config for that institution, finally create
    the Processor object that will load the data file specified
    :param datafile: Datafile that will be processed - can be None
    :param processor_class: String name of processor to create
    :institution_id: Id from institutions table matching the processor type
    :return: a derived object from ProcessorBase and the processor type passed
    """
    class_ = getattr(sys.modules['data_processing.processors'], processor_class, None)
    processor = class_(datafile)

    processor.institution_id = institution_id
    inst_config = build_config_for_institution(data_mgr, processor.institution_id)
    processor.config = inst_config

    return processor


def create_batch(processors, notes=None):
    transactions_processed = 0
    batch_id = None

    for account in processors:
        print(f"Loading data for account: {account.name}")
        if not batch_id:
            batch_id = db_utils.create_transaction_batch()

    update_batch(processors, batch_id, notes)

    if not notes:
        notes = f"{len(processors)} Processors, {transactions_processed} Transactions"

    db_utils.update_batch_info(batch_id, notes)
    return batch_id


def update_batch(processors, batch_id, notes):
    # remove any transactions from the specified batch that are from the processors id
    transactions_processed = 0
    for account in processors:
        db_utils.override_batch_transactions(account.institution_id, account.transactions, batch_id)
        account.process_transactions(batch_id)

        transactions_processed += len(account.transactions)
        db_utils.add_transaction_batch_content(filename=account.datafile,
                                               institution_id=account.institution_id,
                                               file_date=account.file_date,
                                               batch_id=batch_id, notes=notes)

    if not notes:
        notes = f"{len(processors)} Processors, {transactions_processed} Transactions"


def load_source_file(datafile):
    """
    returns: a processor with the data from the specified file loaded
              or None if no matching processor could be found
    """
    if not os.path.exists(datafile):
        print(f"Error: File {datafile} not found.")
        return None
    # Figure out which processor / institution this file represents
    processor_class = select_processor_from_file(datafile)
    if processor_class:
        # we found the processor, but we need the institution id
        institution_id = db_utils.find_institution_from_class(processor_class)
        cp = configure_processor(
            datafile=datafile,
            processor_class=processor_class,
            institution_id=institution_id
        )
        return cp
    return None


def load_sources(source, file):
    """
    Load either a source folder or a single file
    :param source: source folder designation
    :param file: single file path
    :return: list of configured processors with their normalized transactions
    """
    data = []

    if source:  # load folder
        for subdir, dirs, files in os.walk(source):
            for f in files:
                filepath = os.path.join(subdir, f)
                data.append(load_source_file(filepath))
    elif file:  # single file
        data.append(load_source_file(file))
    else:
        print(f"Error loading sources, not source specified: {source}, {file}")

    return data


# ---------------------------------- Command Line Interface Handling (CLI) ------------------------------------


@app.route('/import', methods=['POST'])
def load_datafiles():
    """Load activity reports for processing."""
    logging.info(f"Loading data files...{request.json}")
    payload = request.json

    source = payload.get('source', None)
    fileentry = payload.get('file', None)
    override = payload.get('override', None)
    notes = payload.get('notes', None)

    """Load activity reports for processing."""
    print(f"Got source: {source}, file: {fileentry}, override: {override}, notes: {notes}")
    processors = load_sources(source, fileentry)
    if not override:
        batch_id = create_batch(processors, notes)
        print(f"Batch Created: {batch_id}")
    else:
        update_batch(processors, override, notes)
        print(f"Updated Batch: {override}")

    return 'Create batch 333'


@app.route('/process', methods=['POST'])
def process_a_transaction_batch():
    payload = request.json

    batch_id = payload.get('batch_id', None)
    notes = payload.get('notes', None)

    processed_batch_id = db_utils.create_process_batch(transaction_batch_id=batch_id, notes=notes)
    print(
        f"Running transaction batch: {batch_id} into processing batch: {processed_batch_id}"
    )

    # Create a list of processors from the specified batch
    all_processors = select_processors_from_batch(batch_id)

    # Now build our list of processors from the above institution list
    for processor_info in all_processors:
        cp = configure_processor(
            datafile=None,
            processor_class=processor_info[0],
            institution_id=processor_info[1][0]
        )

        cp.match_templates(batch_id=batch_id, processed_batch_id=processed_batch_id)
    return f"Process load complete.  New Processed batch: {processed_batch_id}"


@app.route('/process/<batch_id>', methods=['DELETE'])
def delete_a_transaction_batch(batch_id: int):
    # Delete this batch id
    db_utils.delete_processed_batch(batch_id)
    return f"Deleting Processed Batch: {batch_id}"


@app.route('/templatereport/<batch_id>')
def template_report(batch_id: int):
    return f"Creating template report for batch {batch_id}"

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


@app.route('/categoryreport/<batch_id>')
def category_report(batch_id: int):
    """Generate a Category Breakdown Report"""
    return f"Creating a category report for processed batch: {batch_id}"
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
