from apiflask import Schema
from apiflask.fields import Integer, String


class LoadSchema(Schema):
    source = String(metadata={'title': 'Source Folder', 'description': 'Folder to load.'})
    fileentry = String(metadata={'title': 'File Source', 'description': 'Single file to load.'})
    override = Integer(metadata={'title': 'Batch Override', 'description': 'Replace contents of specified batch.'})
    notes = String(metadata={'title': 'Notes', 'description': 'Optional notes for this batch.'})


class ProcessSchema(Schema):
    batch_id = Integer()
    notes = String()
