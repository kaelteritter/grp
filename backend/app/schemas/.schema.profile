"""
Схема для чтения профиля с вложенными данными
{
    "id": 1,
    "first_name": "Иван",
    "middle_name": "Иванович",
    "last_name": "Иванов",
    "sex": "male",
    "hair_color": "black",
    "email": "ivan@example.com",
    "phone": "+71234567890",
    "current_location": {
        "id": 1,
        "name": "Тула",
        "region": {
            "id": 1,
            "name": "Тульская область",
            "country": {
                "id": 1,
                "name": "Россия"
            }
        }

    "employments": [
        {
            "profession_id": 1,
            "profession_name": "Программист",
            "company_id": 1,
            "company_name": "ООО Рога и Копыта",
            "start_year": 2020,
            "end_year": 2022,
            "is_current": false
        },
        {
            "profession_id": 2,
            "profession_name": "Системный администратор",
            "company_id": null,
            "company_name": null,
            "start_year": 2022,
            "end_year": null,
            "is_current": true
        }
    ],
    "links": [
        {
            "id": 1,
            "url": "https://vk.com/ivan",
            "platform": {
                "id": 1,
                "name": "VK",
                "base_url": "https://vk.com",
                "icon_url": "https://cdn.s3.com/icons/vk.png"
            }
        }
    ],
    "photos": [
        {
            "id": 1,
            "url": "https://cdn.s3.com/photos/1.jpg",
            "title": "Фото 1",
            "is_avatar": true,
            "sort_order": 0,
            "created_at": "2024",
            "rating": 8.5,
            "season": {
                "id": 1,
                "name": "Лето",
                "icon_url": "https://cdn.s3.com/icons/summer.png"
            }
            "daytime": {
                "id": 1,
                "name": "День",
                "icon_url": "https://cdn.s3.com/icons/day.png"
            }
            "event": {
                "id": 1,
                "name": "День рождения",
                "icon_url": "https://cdn.s3.com/icons/birthday.png",
        },
            "address": {
                "id": 1,
                "name": "Москва, Красная площадь",
                "latitude": 55.7539,
                "longitude": 37.6208
            }
    ],
    ...для видео аналогично фото...
    "created_at": "2024-01-01T12:00:00",
    "updated_at": "2024-01-02T12:00:00",
}
"""


SELECT  e.profile_id, 
        e.start_year, 
        e.end_year, 
        e.is_current, 
        p.name AS profession_name, 
        c.id AS company_id, 
        c.name AS company_name
FROM employments e
LEFT OUTER JOIN professions p ON e.profession_id = p.id
LEFT OUTER JOIN companies c ON e.company_id = c.id
LEFT OUTER JOIN company_addresses ca ON e.company_id = ca.company_id
WHERE e.profile_id = 2
GROUP BY p.name, company_name, e.start_year, e.end_year
ORDER BY e.is_current desc, e.start_year desc
