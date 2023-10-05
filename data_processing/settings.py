"""
settings.py - Code for confguring data structures for analysis.
"""
import os.path

from data_processing.processors import *
import data_processing.db_utils as db_utils
""" -------------------------- Entry Point ----------------------------- """


debug_processors = False


class ConfigurationData:
    def __init__(self):
        self.institution_id = None
        self.templates = list()


class DataManager:
    """Essentially a collection of templates that we run the data files 'through'."""

    def __init__(self):
        conn = db_utils.db_access.connect_to_db()
        self.conn = conn

        # Lookup Tables
        self.categories = db_utils.db_access.load_categories()
        self.tags = db_utils.db_access.load_tags()
        self.qualifiers = db_utils.db_access.load_qualifiers()

        # Data
        self.entity_tags = db_utils.load_template_tags()
        self.entity_qualifiers = db_utils.load_template_qualifiers()
        self.institutions = db_utils.db_access.load_institutions()
        self.templates = db_utils.load_templates()

        self.populate_entities()

    def populate_entities(self):
        for entry in self.templates:
            eid = entry.id
            for eq in self.entity_qualifiers:
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
  3 | CONE_VISA     | Capital One Visa
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
    try:
        inst_id = [x[0] for x in config.institutions if x[2] == institution_name][0]
    except Exception as e:
        print(f"Failed to find institution: {institution_name}")
        raise e
    inst_config = build_config_for_institution(config, inst_id)
    inst_proc = processor(datafile, inst_config)
    return inst_proc


def create_configs_with_data(source="./datafiles"):
    all_processors = list()
    cwd = os.getcwd()
    # -------------------
    if debug_processors:
        if os.path.isfile(f"{source}/CapitalOne.csv"):
            cap = configure_processor(
                institution_name="Capital One Visa",
                datafile=f"{source}/CapitalOne.csv",
                processor=CapitalOne,
                config=data_mgr,
            )
            all_processors.append(cap)
        return all_processors
    # -------------------

    if os.path.isfile(f"{source}/CapitalOne.csv"):
        cap = configure_processor(
            institution_name="Capital One Visa",
            datafile=f"{source}/CapitalOne.csv",
            processor=CapitalOne,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/Chase.csv"):
        cap = configure_processor(
            institution_name="Chase Visa",
            datafile=f"{source}/Chase.csv",
            processor=Chase,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/PayPalCC.csv"):
        cap = configure_processor(
            institution_name="PayPal",
            datafile=f"{source}/PayPalCC.csv",
            processor=PayPal,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/HomeDepot.csv"):
        cap = configure_processor(
            institution_name="Home Depot",
            datafile=f"{source}/HomeDepot.csv",
            processor=HomeDepot,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/WellsChecking.csv"):
        cap = configure_processor(
            institution_name="Wellsfargo Checking",
            datafile=f"{source}/WellsChecking.csv",
            processor=WellsfargoChecking,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/WellsCreditCard.csv"):
        cap = configure_processor(
            institution_name="Wellsfargo Visa",
            datafile=f"{source}/WellsCreditCard.csv",
            processor=WellsfargoVisa,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/SoundChecking-House.csv"):
        cap = configure_processor(
            institution_name="Sound Checking - House",
            datafile=f"{source}/SoundChecking-House.csv",
            processor=SoundChecking,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/SoundChecking-Christa.csv"):
        cap = configure_processor(
            institution_name="Sound Checking - Christa",
            datafile=f"{source}/SoundChecking-Christa.csv",
            processor=SoundCheckingChrista,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/SoundVisa.csv"):
        cap = configure_processor(
            institution_name="Sound Visa",
            datafile=f"{source}/SoundVisa.csv",
            processor=SoundVisa,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/CareCredit.csv"):
        cap = configure_processor(
            institution_name="Care Credit",
            datafile=f"{source}/CareCredit.csv",
            processor=CareCredit,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/Lowes.csv"):
        cap = configure_processor(
            institution_name="Lowes",
            datafile=f"{source}/Lowes.csv",
            processor=Lowes,
            config=data_mgr,
        )
        all_processors.append(cap)

    if os.path.isfile(f"{source}/Amazon_Chris/Retail.OrderHistory.1.csv"):
        cap = configure_processor(
            institution_name="Amazon Chris",
            processor=AmazonRetail,
            config=data_mgr,
            datafile=f"{source}/Amazon_Chris/Retail.OrderHistory.1.csv",
        )
        all_processors.append(cap)

    return all_processors


def create_configs():
    all_processors = list()

    # -------------------
    if debug_processors:
        cap = configure_processor(
            institution_name="Capital One Visa",
            processor=CapitalOne,
            config=data_mgr,
            datafile=None,
        )
        all_processors.append(cap)
        return all_processors
    # -------------------

    cap = configure_processor(
        institution_name="Capital One Visa",
        processor=CapitalOne,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Chase Visa", processor=Chase, config=data_mgr, datafile=None
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="PayPal", processor=PayPal, config=data_mgr, datafile=None
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Home Depot",
        processor=HomeDepot,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Wellsfargo Checking",
        processor=WellsfargoChecking,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Wellsfargo Visa",
        processor=WellsfargoVisa,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Sound Checking - House",
        processor=SoundChecking,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Sound Checking - Christa",
        processor=SoundCheckingChrista,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Sound Visa",
        processor=SoundVisa,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Care Credit",
        processor=CareCredit,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Lowes", processor=Lowes, config=data_mgr, datafile=None
    )
    all_processors.append(cap)

    cap = configure_processor(
        institution_name="Amazon Chris",
        processor=AmazonRetail,
        config=data_mgr,
        datafile=None,
    )
    all_processors.append(cap)

    return all_processors
