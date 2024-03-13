"""
settings.py - Code for confguring data structures for analysis.
"""
from flask import current_app
import data_processing.db_utils as db_utils
""" -------------------------- Entry Point ----------------------------- """


class ConfigurationData:
    def __init__(self):
        self.institution_id = None
        self.templates = list()
        self.data_descriptions = {}


class DataManager:
    """Essentially a collection of templates that we run the data files 'through'."""

    def __init__(self):
        conn = db_utils.db_access.connect_to_db()
        self.conn = conn

        # Lookup Tables
        self.categories = db_utils.db_access.load_categories()
        self.tags = db_utils.db_access.load_tags()
        self.qualifiers = db_utils.db_access.load_qualifiers()
        self.data_descriptions = db_utils.load_column_descriptions()

        # Data
        self.entity_tags = db_utils.load_template_tags()
        self.entity_qualifiers = db_utils.load_template_qualifiers()
        self.institutions = db_utils.db_access.load_institutions()
        self.templates = db_utils.load_templates()

        self.populate_entities()

    def populate_entities(self):
        """ Very inefficient - total brute force method """
        log_once = True
        for entry in self.templates:
            eid = entry.id
            for eq in self.entity_qualifiers:
                if log_once:
                    # current_app.logger.info(f"qualifier: {eq}")
                    log_once = False

                if eq.template_id == eid:
                    # found a qualifier for this entity
                    try:
                        eq_text = [
                            x[1] for x in self.qualifiers if x[0] == eq.qualifier_id
                        ][0]
                        entry.qualifiers.append(eq_text)
                    except Exception as e:
                        print(f"Error matching qualifier {eq.qualifier_id}")
                        raise e

            for et in self.entity_tags:
                if et.template_id == eid:
                    try:
                        et_text = [x[1] for x in self.tags if x[0] == et.tag_id][0]
                        entry.tags.append(et_text)
                    except Exception as e:
                        print(f"Error matching tag {et.tag_id}")
                        raise e


# Populate in other code
data_mgr = DataManager()


"""
lacinaslair=# select * from institutions;
 id |      key      |           name
----+---------------+--------------------------
  1 | WLS_CHK       | Wellsfargo Checking
  2 | WLS_VISA      | Wellsfargo Visa
  3 | CAP_VISA      | Capital One Visa
  4 | CH_VISA       | Chase Visa
  5 | HD            | Home Depot
  6 | PP            | PayPal
  7 | LWS           | Lowes
  8 | SND_CHK_HOUSE | Sound Checking - House
  9 | SND_CHK       | Sound Checking - Christa
 10 | SND_VISA      | Sound Visa
 11 | CC            | Care Credit
(11 rows)
"""


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
    for d in config.column_definitions:
        """
        id, institution_id, column_number, column_name, column_type, is_description, is_amount, data_id, is_transaction_date 
        """
        if d[1] == institution_id:
            new_config.column_definitions = d
            current_app.logger.info(f"Column Definitions for {institution_id}: {new_config.column_definitions}")
            break

    return new_config


def configure_processor(institution_name, datafile, processor, config):
    """
    Find the institution_id for the specified institution name, then
    build the template config for that institution, finally create
    the Processor object that will load the data file specified
    :param institution_name: Name of institution - must match db entries
    :param datafile: Datafile that will be processed - can be None
    :param processor: Type of processor to create
    :param config: All configuration data
    :return: a derived object from ProcessorBase and the processor type passed
    """
    current_app.logger.info("In Config Processor")
    try:
        inst_id = [x[0] for x in config.institutions if x[2] == institution_name][0]
    except Exception as e:
        print(f"Failed to find institution: {institution_name}")
        raise e
    inst_config = build_config_for_institution(config, inst_id)
    inst_proc = processor(datafile, inst_config)
    return inst_proc
