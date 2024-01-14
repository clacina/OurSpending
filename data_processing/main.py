import os

import db_utils
import sys
from typing import Optional
from radicli import Radicli, Arg
import settings
from processors import select_processor_from_file
from settings import data_mgr

""" -------------------------- Entry Point ----------------------------- """

debug_processors = False
cli = Radicli(prog="python main.py",help="Data Load and Processing Code")


# def load_transaction_files(source: Optional[str] = "./datafiles", debug_processors: Optional[bool] = False):
#     """
#     Create a processing batch
#     :return:
#     """
#     batch_id = db_utils.create_transaction_batch()
#     processors = settings.create_configs_with_data(source=source, debug_processors=debug_processors)
#     transactions_processed = 0
#     for account in processors:
#         print(f"Loading data for account: {account.name}")
#         account.process_transactions(batch_id)
#         transactions_processed += len(account.transactions)
#     db_utils.update_batch_info(
#         batch_id, f"{len(processors)} Processors, {transactions_processed} Transactions"
#     )
#     return batch_id


@cli.command("view_batches")
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
    # elif batch_id == "r":  # run new batch
    #     batch_id = load_transaction_files()
    # elif batch_id == "d":  # run new batch
    #     batch_id = load_transaction_files(debug_processors=True)
    # elif batch_id == "l":  # just use last run
    #     batch_id = batches[-1][0]
    # else:
    #     # make sure the specified batch exists
    #     batch_id = int(batch_id)
    #     if batch_id not in [b[0] for b in batches if b[0] == batch_id]:
    #         print(f"Invalid batch id: {batch_id}")
    #         sys.exit(2)
    return batch_id


def present_processed_batch_menu_select():
    batches = db_utils.db_access.list_processed_batches()
    if not batches:
        print("No batches to analyze, run 'load'")
        sys.exit(1)

    for b in batches:
        print(f"Batch ID: {b[0]}, Ran: {b[1].strftime('%m-%d-%Y %H:%H')}, {b[2]}, Transaction Id: {b[3]}")

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


def load_source_file(datafile):
    """
    returns: a processor with the data from the specified file loaded
              or None if no matching processor could be found
    """
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


@cli.command("load",
             source=Arg("--source", "-s", help="Source Folder"),
             fileentry=Arg("--file", "-f", help="Specific File"),
             override=Arg("--override", "-o", help="Override the contents of an existing batch"),
             notes=Arg("--notes", "-n", help="Add a note to the batch record")
             )
def import_datafiles(source: Optional[str] = None,
                     fileentry: Optional[str] = None,
                     override: Optional[int] = None,
                     notes: Optional[str] = None):
    """Load activity reports for processing."""
    print(f"Got source: {source}, file: {fileentry}, override: {override}, notes: {notes}")
    processors = load_sources(source, fileentry)
    if not override:
        batch_id = create_batch(processors, notes)
        print(f"Batch Created: {batch_id}")
    else:
        update_batch(processors, override, notes)
        print(f"Updated Batch: {override}")


@cli.command("process", batch_id=Arg("--batch", help="Transaction Batch Id"))
def process_a_transaction_batch(batch_id: Optional[int] = None):
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


if __name__ == "__main__":
    cli.run()
