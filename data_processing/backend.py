from flask import current_app
import os
import sys

import db_utils
from processors import select_processor_from_file
from settings import data_mgr
from settings import ConfigurationData


def build_config_for_institution(config, institution_id):
    """
    Look through main template list and filter by the specified id
    :param config:
    :param institution_id:
    :return: new ConfigurationData object matching the specified id
    """
    new_config = ConfigurationData()
    new_config.institution_id = institution_id
    new_config.data_descriptions = config.data_descriptions
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
    current_app.logger.info(f"ConfigProc: {processor_class}")
    class_ = getattr(sys.modules['processors'], processor_class, None)
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
