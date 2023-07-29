"""
    entities.py

    Definitions of various entity qualifiers and information.

"""


def check_for_entities(data, entities):
    # Search all entities passed in for matching qualifiers
    for entity_id, v in entities.items():
        assert isinstance(v, dict), f"Found wrong data type {type(v)}"
        qualifiers = v['qualifiers']
        match_all = v.get('match_all_qualifiers', True)  # match all by default
        check_category = v.get('check_category', False)
        found_count = 0

        for desc in qualifiers:
            if desc.upper() in data.description.upper():
                found_count += 1
            else:
                if desc.upper() in data.category.upper():
                    found_count += 1

        if found_count == len(qualifiers) or (found_count > 0 and match_all is False):
            return entity_id
    return None


def build_entity_description(key, entities):
    desc = ""
    for item in entities[key]['qualifiers']:
        desc += f"{item},"
    return desc
