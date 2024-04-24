"""
    Specific routes for Template Manipulation
"""
from __future__ import annotations

import logging
from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException, status, Body, Request
from pydantic import BaseModel

import rest_api.models as models
from common.db_access import DBAccess
from rest_api.models import CategoryModel
from rest_api.models import QualifierModel
from rest_api.models import TagModel
from rest_api.template_models import (
    TemplateDetailModel,
    TemplatesDetailReportBuilder,
    TemplateReportModel,
    TemplateDetailReportBuilder,
    SingleTemplateReportBuilder,
)

router = APIRouter()
db_access = DBAccess()


""" ---------- Templates -------------------------------------------------------------------------"""


@router.get(
    "/templates",
    summary="Get list of available templates. May restrict the search by Institution",
    response_model=List[TemplateDetailModel],
    description="Test of route description",
    response_description="Test of response description",
    tags=["Templates"]
)
async def query_templates(institution_id: Optional[int] = Query(-1)):
    """
    :param institution_id: Institution id.
    NOTE: this text will show up in the docs
    """
    query_result = db_access.query_templates_by_institution(institution_id)
    if query_result:
        return TemplatesDetailReportBuilder(query_result).process()
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unable to find templates for institution: {institution_id}",
        )


@router.post(
    "/templates",
    summary="Add a new template for a given institution",
    status_code=status.HTTP_201_CREATED,
    response_model=TemplateDetailModel,
    tags=["Templates"]
)
async def add_template(info: Request = None):
    template = await info.json()
    logging.info(f"Template: {template}")
    template_id = db_access.create_template(
        institution_id=template['institution_id'],
        category_id=template['category_id'],
        is_credit=template['is_credit'],
        hint=template['hint'],
        notes=template['notes'],
        qualifiers=template['qualifiers'],
        tags=template['tags'],
    )

    query_result = db_access.query_templates_by_id(template_id)
    if query_result:
        return TemplateDetailReportBuilder(query_result).process()


@router.get(
    "/template/{template_id}",
    summary="Get details for a specific template.",
    response_model=TemplateDetailModel,
    tags=["Templates"]
)
async def get_template(template_id: int):
    query_result = db_access.query_templates_by_id(template_id)
    if query_result:
        return TemplateDetailReportBuilder(query_result).process()
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Unable to find template with id: {template_id}",
    )


@router.put(
    "/template/{template_id}",
    summary="Update a specific template",
    response_model=TemplateDetailModel,
    tags=["Templates"]
)
def update_template(template_id: int, template: TemplateReportModel = Body(...)):
    query_result = db_access.query_templates_by_id(template_id)
    if not query_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    existing_template = SingleTemplateReportBuilder(query_result).process()
    update_data = template.dict(exclude_unset=True)
    new_template = existing_template.copy(update=update_data)

    # Store updated template in database
    logging.info({
        "message": "Modifying template",
        "original": existing_template,
        "updated ": new_template
    })

    new_template.category = models.CategoryModel(
        id=query_result[0][11],
        value=query_result[0][12]
    )
    if hasattr(template, 'category') and template.category:
        new_template.category = models.CategoryModel(
            id=template.category.id,
            value=''
        )
    if template.tags:
        new_template.tags = template.tags
    # logging.info(f"New Template: {new_template}")
    db_access.update_template(new_template)

    return new_template


class TemplateUpdate(BaseModel):
    institution_id: int | None = None
    category: CategoryModel | None = None
    credit: bool | None = None
    tags: List[TagModel] | None = None
    qualifiers: List[QualifierModel] | None = None
    hint: str | None = None
    notes: str | None = None


@router.patch(
    "/template/{template_id}",
    summary="Update the category for a specific template",
    response_model=TemplateDetailModel,
    tags=["Templates"]
)
def patch_template(template_id: int,
                   template: TemplateUpdate):
    logging.info("\n\n\n------------------Patching template")
    query_result = db_access.query_templates_by_id(template_id)
    if not query_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unable to find template with id: {template_id}",
        )

    logging.info(f"Query Result: {query_result}")
    logging.info(f"Patch Parameters: {template}")

    existing_template = SingleTemplateReportBuilder(query_result).process()

    update_data = template.dict(exclude_unset=True)
    # logging.info(f"Update_data: {update_data}")
    new_template = existing_template.copy(update=update_data)

    # Store updated template in database
    logging.info({
        "message": "Modifying template",
        "original": existing_template,
        "updated ": new_template
    })

    if hasattr(template, 'category') and template.category is not None:
        new_template.category = models.CategoryModel(
            id=template.category.id,
            value=template.category.value
        )
    if template.tags:
        # logging.info(f"Tags: {template.tags}")
        new_template.tags = template.tags

    # logging.info(f"New Template: {new_template}")
    db_access.update_template(new_template)

    return new_template


@router.get(
    "/template_qualifiers",
    summary="Get list of template qualifiers.",
    response_model=List[models.TemplateQualifierModel],
    tags=["Templates"]
)
async def query_template_qualifiers():
    query_result = db_access.query_templates_qualifiers()
    response = []
    for row in query_result:
        entry = models.TemplateQualifierModel(
            template_id=row[0],
            qualifier_id=row[1],
            data_column=row[2])
        response.append(entry)
    return response


@router.get(
    "/template_qualifier_details",
    summary="Get list of template qualifiers with associated details.",
    response_model=List[models.TemplateQualifierDetailModel],
    tags=["Templates"]
)
async def query_template_qualifier_details():
    query_result = db_access.query_template_qualifier_details()
    """
    template_id, qualifier_id, data_column, q.id, q.value, q.institution_id
    """
    response = []
    for row in query_result:
        entry = models.TemplateQualifierDetailModel(
            id=row[3],
            template_id=row[0],
            qualifier_id=row[1],
            data_column=row[2],
            institution_id=row[5],
            value=row[4])
        response.append(entry)
    return response
