"""
Security utilities for the Secure Website Scanner API.
Includes token validation, rate limiting, input sanitization, and security headers.
"""

import re
import hashlib
import hmac
import base64
import secrets
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime, timedelta
from urllib.parse import urlparse
import ipaddress

from fastapi import HTTPException, status, Request, Header
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from .config import settings


class SecurityUtils:
    """Main security utility class containing all security-related methods."""
    
    @staticmethod
    def validate_url(url: str) -> Tuple[bool, Optional[str]]:
        """
        Validate and sanitize URL.
        
        Args:
            url: URL to validate
            
        Returns:
            Tuple of (is_valid, sanitized_url or error_message)
        """
        if not url or not isinstance(url, str):
            return False, "URL must be a non-empty string"
        
        url = url.strip()
        
        # Check length
        if len(url) > 2048:
            return False, "URL is too long (maximum 2048 characters)"
        
        # Check for spaces
        if ' ' in url:
            return False, "URL cannot contain spaces"
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
        
        # Parse URL
        try:
            parsed = urlparse(url)
            
            # Check if it's a valid URL
            if not all([parsed.scheme, parsed.netloc]):
                return False, "Invalid URL format"
            
            # Check scheme
            if parsed.scheme not in ['http', 'https']:
                return False, "URL must use HTTP or HTTPS protocol"
            
            # Check for private/local IP addresses
            try:
                ip = ipaddress.ip_address(parsed.hostname)
                if ip.is_private or ip.is_loopback or ip.is_link_local:
                    return False, "Cannot scan private/local IP addresses"
            except ValueError:
                # Not an IP address, continue with domain validation
                pass
            
            # Check for potentially dangerous patterns
            dangerous_patterns = [
                r'\.\.',  # Directory traversal
                r'\\',    # Backslashes
                r'<.*?>',  # HTML tags
                r'javascript:',  # JavaScript protocol
                r'data:',  # Data URI
            ]
            
            for pattern in dangerous_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    return False, f"URL contains potentially dangerous pattern: {pattern}"
            
            # Check for common malicious patterns
            malicious_patterns = [
                r'@.*@',  # Multiple @ symbols
                r'//.*//',  # Multiple slashes
                r'\.exe$',  # Executable files
                r'\.dll$',  # DLL files
                r'\.php$',  # PHP files (common in attacks)
                r'\.asp$',  # ASP files
                r'\.jsp$',  # JSP files
            ]
            
            for pattern in malicious_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    return False, f"URL matches suspicious pattern: {pattern}"
            
            # Normalize URL
            normalized_url = parsed.geturl()
            
            return True, normalized_url
            
        except Exception as e:
            return False, f"Invalid URL: {str(e)}"
    
    @staticmethod
    def sanitize_input(input_string: str, max_length: int = 1000) -> str:
        """
        Sanitize user input to prevent XSS and injection attacks.
        
        Args:
            input_string: Input string to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
        """
        if not input_string:
            return ""
        
        # Convert to string
        input_string = str(input_string)
        
        # Truncate to max length
        if len(input_string) > max_length:
            input_string = input_string[:max_length]
        
        # Remove NULL characters
        input_string = input_string.replace('\x00', '')
        
        # Remove dangerous characters for XSS prevention
        dangerous_chars = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;',
            '(': '&#40;',
            ')': '&#41;',
            '`': '&#x60;',
        }
        
        for char, replacement in dangerous_chars.items():
            input_string = input_string.replace(char, replacement)
        
        # Remove control characters
        input_string = ''.join(char for char in input_string if ord(char) >= 32 or char in '\t\n\r')
        
        return input_string.strip()
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """
        Validate email address format.
        
        Args:
            email: Email address to validate
            
        Returns:
            True if email is valid, False otherwise
        """
        if not email:
            return False
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))
    
    @staticmethod
    def is_strong_password(password: str) -> Tuple[bool, List[str]]:
        """
        Check if password meets security requirements.
        
        Args:
            password: Password to check
            
        Returns:
            Tuple of (is_strong, list_of_issues)
        """
        issues = []
        
        if not password:
            issues.append("Password cannot be empty")
            return False, issues
        
        # Check length
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        
        # Check complexity
        if not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        
        if not re.search(r'[0-9]', password):
            issues.append("Password must contain at least one number")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")
        
        # Check for common passwords
        common_passwords = [
            'password', '123456', '12345678', '123456789', 'qwerty',
            'abc123', 'password1', 'admin', 'letmein', 'welcome'
        ]
        
        if password.lower() in common_passwords:
            issues.append("Password is too common")
        
        # Check for sequential characters
        if re.search(r'(.)\1{2,}', password):
            issues.append("Password contains repeated characters")
        
        # Check for keyboard patterns
        keyboard_patterns = [
            'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', '123qwe'
        ]
        
        if any(pattern in password.lower() for pattern in keyboard_patterns):
            issues.append("Password contains keyboard pattern")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """
        Generate a cryptographically secure random token.
        
        Args:
            length: Length of token in bytes
            
        Returns:
            Base64-encoded secure token
        """
        random_bytes = secrets.token_bytes(length)
        return base64.urlsafe_b64encode(random_bytes).decode()
    
    @staticmethod
    def hash_string(data: str, salt: Optional[str] = None) -> str:
        """
        Hash a string with optional salt using SHA-256.
        
        Args:
            data: String to hash
            salt: Optional salt value
            
        Returns:
            Hex-encoded hash
        """
        if salt:
            data = salt + data
        
        return hashlib.sha256(data.encode()).hexdigest()
    
    @staticmethod
    def verify_hash(data: str, hash_value: str, salt: Optional[str] = None) -> bool:
        """
        Verify a hash against a string.
        
        Args:
            data: Original string
            hash_value: Hash to verify
            salt: Salt used during hashing
            
        Returns:
            True if hash matches, False otherwise
        """
        expected_hash = SecurityUtils.hash_string(data, salt)
        return hmac.compare_digest(expected_hash, hash_value)
    
    @staticmethod
    def create_jwt_token(payload: Dict[str, Any], 
                        secret_key: str, 
                        expires_minutes: int = 60) -> str:
        """
        Create a JWT token with expiration.
        
        Args:
            payload: Token payload
            secret_key: Secret key for signing
            expires_minutes: Token expiration in minutes
            
        Returns:
            JWT token string
        """
        payload_copy = payload.copy()
        
        # Add expiration time
        expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
        payload_copy.update({"exp": expire})
        
        # Create token
        token = jwt.encode(payload_copy, secret_key, algorithm="HS256")
        
        return token
    
    @staticmethod
    def verify_jwt_token(token: str, secret_key: str) -> Dict[str, Any]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: JWT token to verify
            secret_key: Secret key for verification
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            return payload
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """
        Extract client IP address from request.
        
        Args:
            request: FastAPI Request object
            
        Returns:
            Client IP address
        """
        # Try to get IP from X-Forwarded-For header (when behind proxy)
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            # Get the first IP in the chain
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            # Fallback to request client host
            ip = request.client.host if request.client else "0.0.0.0"
        
        return ip
    
    @staticmethod
    def is_rate_limited(ip: str, action: str, window_seconds: int = 60, max_requests: int = 10) -> bool:
        """
        Simple rate limiting check for IP addresses.
        
        Args:
            ip: Client IP address
            action: Action being rate limited
            window_seconds: Time window in seconds
            max_requests: Maximum requests allowed in window
            
        Returns:
            True if rate limited, False otherwise
        """
        # This is a simple in-memory rate limiter
        # For production, use Redis-based rate limiting (implemented in rate_limiter.py)
        
        # Generate a unique key for this IP and action
        import time
        current_time = int(time.time())
        window_start = current_time - window_seconds
        
        # In production, this would use Redis
        # Here's a placeholder implementation
        return False


class SecurityHeaders:
    """Class for managing security HTTP headers."""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """
        Get a dictionary of security headers to add to responses.
        
        Returns:
            Dictionary of security headers
        """
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https://safebrowsing.googleapis.com; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            ),
            "Permissions-Policy": (
                "camera=(), "
                "microphone=(), "
                "geolocation=(), "
                "payment=()"
            )
        }
        
        return headers
    
    @staticmethod
    def add_security_headers(request: Request, call_next):
        """
        FastAPI middleware to add security headers.
        
        Args:
            request: FastAPI Request object
            call_next: Next middleware/endpoint
            
        Returns:
            Response with security headers added
        """
        response = call_next(request)
        
        # Add security headers
        for header, value in SecurityHeaders.get_security_headers().items():
            response.headers[header] = value
        
        return response


class InputValidator:
    """Class for validating various types of input."""
    
    @staticmethod
    def validate_domain(domain: str) -> bool:
        """
        Validate domain name.
        
        Args:
            domain: Domain name to validate
            
        Returns:
            True if domain is valid, False otherwise
        """
        if not domain:
            return False
        
        # Simple domain validation regex
        domain_regex = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
        
        return bool(re.match(domain_regex, domain))
    
    @staticmethod
    def validate_ip_address(ip: str) -> bool:
        """
        Validate IP address.
        
        Args:
            ip: IP address to validate
            
        Returns:
            True if IP is valid, False otherwise
        """
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def is_safe_filename(filename: str) -> bool:
        """
        Check if filename is safe (prevents path traversal).
        
        Args:
            filename: Filename to check
            
        Returns:
            True if filename is safe, False otherwise
        """
        if not filename:
            return False
        
        # Check for path traversal attempts
        dangerous_patterns = [
            '..',
            '/',
            '\\',
            ':',
            '*',
            '?',
            '"',
            '<',
            '>',
            '|'
        ]
        
        return not any(pattern in filename for pattern in dangerous_patterns)
    
    @staticmethod
    def sanitize_sql_input(input_string: str) -> str:
        """
        Basic SQL injection prevention.
        
        Args:
            input_string: Input string to sanitize
            
        Returns:
            Sanitized string
        """
        if not input_string:
            return ""
        
        # Remove common SQL injection patterns
        sql_patterns = [
            r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)',
            r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
            r'(\-\-|\#)',  # SQL comments
            r'(\bWAITFOR\s+DELAY\b)',
            r'(\bSLEEP\s*\(\d+\))',
            r'(\bBENCHMARK\s*\(\d+)',
        ]
        
        for pattern in sql_patterns:
            input_string = re.sub(pattern, '', input_string, flags=re.IGNORECASE)
        
        return input_string


class RequestValidator:
    """Class for validating HTTP requests."""
    
    @staticmethod
    async def validate_request_size(request: Request, max_size_mb: int = 10) -> bool:
        """
        Validate request size doesn't exceed limit.
        
        Args:
            request: FastAPI Request object
            max_size_mb: Maximum size in megabytes
            
        Returns:
            True if request size is valid, False otherwise
        """
        content_length = request.headers.get("content-length")
        
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
            return size_mb <= max_size_mb
        
        return True
    
    @staticmethod
    def validate_user_agent(user_agent: Optional[str]) -> bool:
        """
        Validate User-Agent header.
        
        Args:
            user_agent: User-Agent header value
            
        Returns:
            True if User-Agent is valid, False otherwise
        """
        if not user_agent:
            return False
        
        # Check minimum and maximum length
        if len(user_agent) < 5 or len(user_agent) > 500:
            return False
        
        # Check for suspicious patterns
        suspicious_patterns = [
            'sqlmap',
            'nikto',
            'nessus',
            'metasploit',
            'wget',
            'curl',
            'python-requests',
            'go-http-client',
            'java/',
            'scan',
            'crawler',
            'bot',
            'spider'
        ]
        
        # Allow browser-like user agents
        browser_indicators = [
            'mozilla',
            'chrome',
            'safari',
            'firefox',
            'edge',
            'opera'
        ]
        
        # If it looks like a browser, allow it
        if any(indicator in user_agent.lower() for indicator in browser_indicators):
            return True
        
        # Check for suspicious patterns
        if any(pattern in user_agent.lower() for pattern in suspicious_patterns):
            return False
        
        return True
    
    @staticmethod
    def validate_origin_header(origin: Optional[str], allowed_origins: List[str]) -> bool:
        """
        Validate Origin header for CORS.
        
        Args:
            origin: Origin header value
            allowed_origins: List of allowed origins
            
        Returns:
            True if origin is valid, False otherwise
        """
        if not origin:
            return True  # No origin header, continue
        
        # Check if origin is in allowed list
        if origin in allowed_origins:
            return True
        
        # Check for wildcard patterns
        for allowed in allowed_origins:
            if allowed == "*":
                return True
            if allowed.startswith("*."):
                # Wildcard subdomain matching
                domain = allowed[2:]
                if origin.endswith(domain):
                    return True
        
        return False


class CSRFProtection:
    """CSRF (Cross-Site Request Forgery) protection utilities."""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """
        Generate a CSRF token.
        
        Returns:
            CSRF token
        """
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str, stored_token: str) -> bool:
        """
        Validate CSRF token.
        
        Args:
            token: Token from request
            stored_token: Token stored in session
            
        Returns:
            True if tokens match, False otherwise
        """
        return hmac.compare_digest(token, stored_token)


# Create singleton instances
security_utils = SecurityUtils()
security_headers = SecurityHeaders()
input_validator = InputValidator()
request_validator = RequestValidator()
csrf_protection = CSRFProtection()


# Export commonly used functions and classes
__all__ = [
    "security_utils",
    "security_headers", 
    "input_validator",
    "request_validator",
    "csrf_protection",
    "SecurityUtils",
    "SecurityHeaders",
    "InputValidator",
    "RequestValidator",
    "CSRFProtection"
]