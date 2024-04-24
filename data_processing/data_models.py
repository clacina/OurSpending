

class TemplateTag:
    def __init__(self):
        self.template_id = None
        self.tag_id= None

    def parse(self, data: tuple):
        self.template_id = data[0]
        self.tag_id = data[1]

    def __repr__(self):
        return f"{self.template_id}: {self.tag_id}"


class TemplateQualifier:
    def __init__(self):
        self.template_id = None
        self.qualifier_id = None
        self.data_column = None

    def parse(self, data: tuple):
        self.template_id = data[0]
        self.qualifier_id = data[1]
        self.data_column = data[2]

    def __repr__(self):
        return f"{self.template_id} - {self.qualifier_id} - {self.data_column}"


class Entity:
    def __init__(self, inst_id=None):
        self.id = None
        self.institution_id = inst_id
        self.qualifiers = list()
        self.category_id = None
        self.credit = None
        self.tags = list()
        self.hint = None
        self.notes = None

    def parse(self, data):
        """ ONLY USED WHEN INLOADING CONFIG DATA """
        # When parsed from old json
        self.hint = data['hint']
        self.category_id = data['category']
        self.credit = data['credit']

    def parse_json_post(self, data):
        """ Parse API Request """
        self.id = data.get('template_id', None)
        self.hint = data.get('hint', None)
        self.category_id = data.get('category_id', None)
        self.credit = data.get('is_credit', None)
        self.notes = data.get('notes', None)

        # Used for creating a template from an existing entry
        if data.get('qualifier', None):
            self.qualifiers.append(data.get('qualifier'))

    def __repr__(self):
        return f"{self.hint} - {self.institution_id} {self.credit} {self.category_id}"


class BankingTemplate:
    def __init__(self, inst_id=None):
        self.id = None
        self.institution_id = inst_id
        self.qualifiers = list()
        self.category_id = None
        self.credit = None
        self.tags = list()
        self.hint = None
        self.notes = None

    def parse(self, data):
        assert len(data) == 6, f"Wrong data type: {data}"
        # Parsed from db
        self.id = data[0]
        self.institution_id = data[1]
        self.category_id = data[2]
        self.credit = data[3]
        self.hint = data[4]
        self.notes = data[5]

    def __repr__(self):
        return f"{self.hint} - {self.institution_id} {self.credit} {self.category_id} {self.notes}"
