import requests
from fastapi import HTTPException
from ..core.config import settings

class SafeBrowsingScanner:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.api_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    
    async def scan_url(self, url: str) -> dict:
        """Scan URL using Google Safe Browsing API"""
        try:
            # Prepare request body
            request_body = {
                "client": {
                    "clientId": "secure-website-scanner",
                    "clientVersion": "1.0.0"
                },
                "threatInfo": {
                    "threatTypes": [
                        "MALWARE",
                        "SOCIAL_ENGINEERING",
                        "UNWANTED_SOFTWARE",
                        "POTENTIALLY_HARMFUL_APPLICATION"
                    ],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}]
                }
            }
            
            # Make API call
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                json=request_body,
                timeout=10
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Google API error: {response.text}"
                )
            
            data = response.json()
            
            # Format response
            if "matches" in data and data["matches"]:
                return {
                    "status": "dangerous",
                    "matches": data["matches"],
                    "threats_found": len(data["matches"])
                }
            else:
                return {
                    "status": "safe",
                    "matches": [],
                    "threats_found": 0
                }
                
        except requests.exceptions.Timeout:
            raise HTTPException(
                status_code=408,
                detail="Scan timeout - please try again"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Scan failed: {str(e)}"
            )