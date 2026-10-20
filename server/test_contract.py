"""Run against a running local service: python server/test_contract.py."""
import unittest
import requests

BASE = 'http://127.0.0.1:7861'


class ModelAPIContract(unittest.TestCase):
    def test_rejects_invalid_image(self):
        response = requests.post(BASE+'/api/models', files={'image': ('fake.png', b'not an image', 'image/png')}, timeout=15)
        self.assertEqual(response.status_code, 400)

    def test_unknown_job_and_traversal(self):
        self.assertEqual(requests.get(BASE+'/api/jobs/'+'0'*32, timeout=10).status_code, 404)
        self.assertEqual(requests.get(BASE+'/api/jobs/not-a-job', timeout=10).status_code, 404)

    def test_pages_origin_allowed(self):
        response = requests.options(BASE+'/api/models', headers={'Origin': 'https://zyz90421034-art.github.io', 'Access-Control-Request-Method': 'POST'}, timeout=10)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['access-control-allow-origin'], 'https://zyz90421034-art.github.io')

    def test_unrelated_origin_not_allowed(self):
        response = requests.options(BASE+'/api/models', headers={'Origin': 'https://unrelated.invalid', 'Access-Control-Request-Method': 'POST'}, timeout=10)
        self.assertNotIn('access-control-allow-origin', response.headers)


if __name__ == '__main__':
    unittest.main()
