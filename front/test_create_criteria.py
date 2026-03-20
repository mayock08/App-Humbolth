
import urllib.request
import json

url = "http://localhost:5246/api/CourseGrading/criteria"
# Replace with a valid course ID from your system.
# I'll use 169 based on previous logs, or fetch one first.
course_id = 169 

payload = {
    "courseId": course_id,
    "componentType": "Test Criteria",
    "weightPercentage": 10.0,
    "description": "Test Description"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json'
})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
