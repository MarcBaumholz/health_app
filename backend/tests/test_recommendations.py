from fastapi.testclient import TestClient
from app import app

def test_recommendations_without_api_key_returns_fallback():
    client = TestClient(app)
    resp = client.post(
        "/recommendations",
        json={
            "work_pattern": "8h Schreibtisch",
            "posture": "Sitzend, Rundrücken",
            "complaints": "Nackenverspannungen",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "Nacken" in data["exercises"] or data["exercises"]
    assert data["posture"]
    assert data["tips"]
