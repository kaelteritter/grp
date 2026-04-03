# backend/app/api/v1/endpoints/link.py

from fastapi import APIRouter
from starlette import status

from app.core.database import SessionDep
from app.schemas.link import LinkCreateSchema, LinkReadSchema, LinkUpdateSchema
from app import services

router = APIRouter(prefix="/links", tags=["links"])


@router.post("/", response_model=LinkReadSchema)
async def create_link(db: SessionDep, link_in: LinkCreateSchema):
    return await services.create_link(db, link_in)


@router.get("/", response_model=list[LinkReadSchema])
async def read_links(db: SessionDep):
    return await services.read_links(db)


@router.get("/{link_id}", response_model=LinkReadSchema)
async def read_link(db: SessionDep, link_id: int):
    return await services.read_link(db, link_id)


@router.patch("/{link_id}", response_model=LinkReadSchema)
async def update_link(db: SessionDep, link_id: int, link_in: LinkUpdateSchema):
    return await services.update_link(db, link_id, link_in)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(db: SessionDep, link_id: int):
    await services.delete_link(db, link_id)
    return None


