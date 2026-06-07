# test_search_articles.py
import requests

r = requests.post(
    "https://64084ae02413.ngrok-free.app//api/v1/search-articles",
    headers={"Authorization": "Bearer dummy"},
    json={"days_back": 7, "max_results": 5}
)
print(r.json())
