from app.services.profile import (
    create_profile,
    read_profile,
    read_profiles,
    update_profile,
    delete_profile
)

from app.services.country import (
    create_country,
    read_country,
    read_countries,
    update_country,
    delete_country
)

from app.services.region import (
    create_region,
    read_region,
    read_regions,
    update_region,
    delete_region
)

from app.services.location import (
    create_location,
    read_location,
    read_locations,
    update_location,
    delete_location
)

from app.services.platform import (
    create_platform,
    read_platform,
    read_platforms,
    update_platform,
    delete_platform
)

from app.services.link import (
    create_link,
    read_link,
    read_links,
    update_link,
    delete_link
)

from app.services.photo import (
    create_photo,
    read_photo,
    read_photos,
    update_photo,
    delete_photo,
    set_avatar,
    create_photos,
    delete_photos,
)

from app.services.address import (
    create_address,
    read_address,
    read_addresses,
    update_address,
    delete_address
)

from app.services.company import (
    create_company,
    read_company,
    read_companies,
    update_company,
    delete_company
)

from app.services.profession import (
    create_profession,
    read_profession,
    read_professions,
    update_profession,
    delete_profession,
    add_profession_to_profile,
    get_profile_professions,
    remove_profession_from_profile,
)

from app.services.video import (
    create_video,
    read_video,
    read_videos,
    update_video,
    delete_video,
    set_cover
)

__all__ = [
    # Profile
    "create_profile",
    "read_profile",
    "read_profiles",
    "update_profile",
    "delete_profile",
    # Country
    "create_country",
    "read_country",
    "read_countries",
    "update_country",
    "delete_country",
    # Region
    "create_region",
    "read_region",
    "read_regions",
    "update_region",
    "delete_region",
    # Location
    "create_location",
    "read_location",
    "read_locations",
    "update_location",
    "delete_location",
    # Platform
    "create_platform",
    "read_platform",
    "read_platforms",
    "update_platform",
    "delete_platform",
    # Link
    "create_link",
    "read_link",
    "read_links",
    "update_link",
    "delete_link",
    # Photo
    "create_photo",
    "read_photo",
    "read_photos",
    "update_photo",
    "delete_photo",
    "set_avatar",
    "create_photos",
    "delete_photos",
    # Address
    "create_address",
    "read_address",
    "read_addresses",
    "update_address",
    "delete_address",
    # Company
    "create_company",
    "read_company",
    "read_companies",
    "update_company",
    "delete_company",
    # Profession
    "create_profession",
    "read_profession",
    "read_professions",
    "update_profession",
    "delete_profession",
    "add_profession_to_profile",
    "get_profile_professions",
    "remove_profession_from_profile",
    # Video
    "create_video",
    "read_video",
    "read_videos",
    "update_video",
    "delete_video",
    "set_cover",
]