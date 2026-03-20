
import urllib.request
import json

base_url = "http://localhost:5246/api"

try:
    # 1. Get all teachers
    print("Fetching teachers...")
    with urllib.request.urlopen(f"{base_url}/Teachers") as response:
        teachers = json.loads(response.read())
        
        for t in teachers:
            print(f"Teacher: {t['fullName']} (ID: {t['id']})")
            courses = t.get('courses', [])
            print(f"  Courses: {len(courses)}")
            for c in courses:
                print(f"    - ID: {c['id']}, Name: {c['name']}, Grade: '{c['grade']}', PeriodId: {c.get('periodId')}")
                
except Exception as e:
    print(f"Error: {e}")
