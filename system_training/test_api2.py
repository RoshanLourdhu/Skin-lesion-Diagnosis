import requests, json, os
url = 'http://127.0.0.1:8000/analyze'
files = {'file': open(r'd:/College Projects/skin_lesion_project/system_training/test_images/input.jpg', 'rb')}
data = {
    'patient_id': '1',
    'name': 'test',
    'age': '30',
    'itching': 'n',
    'pain': 'n',
    'bleeding': 'n',
    'oozing': 'n',
    'duration': '1 month',
    'growth': 'n',
    'color_change': 'n',
    'border_change': 'n',
}
resp = requests.post(url, files=files, data=data)
print('Status:', resp.status_code)
try:
    print('JSON:', json.dumps(resp.json(), indent=2))
except Exception as e:
    print('Error parsing JSON:', e)
    print('Response text:', resp.text)
