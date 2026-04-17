import re
import json
from datetime import date


def extract_api_endpoints(text: str, erp_name: str) -> list[dict]:
    """Extract API endpoints from raw text content."""
    apis = []
    seen_endpoints = set()

    # Pattern: HTTP method + path
    method_path = re.compile(
        r'\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+([/][^\s\n"\'<>]{3,100})',
        re.IGNORECASE
    )

    # Pattern: endpoint URLs
    url_pattern = re.compile(
        r'https?://[^\s"\'<>\n]{10,200}(?:/api|/rest|/ws|/v\d)[^\s"\'<>\n]*',
        re.IGNORECASE
    )

    # Pattern: API endpoint description blocks
    api_block = re.compile(
        r'(?:endpoint|api|route|path|url)[:\s]+([/][^\s\n"\'<>]{3,80})',
        re.IGNORECASE
    )

    matches = []
    for m in method_path.finditer(text):
        method = m.group(1).upper()
        endpoint = m.group(2)
        if endpoint not in seen_endpoints:
            seen_endpoints.add(endpoint)
            # Try to get context around match
            start = max(0, m.start() - 200)
            end = min(len(text), m.end() + 300)
            context = text[start:end]
            matches.append((method, endpoint, context))

    for method, endpoint, context in matches[:30]:
        # Try to determine a name from context
        name = infer_api_name(method, endpoint, context)
        description = infer_description(context, endpoint)
        auth = infer_auth(context)
        headers = infer_headers(context)
        params = infer_params(context, method)

        api = {
            "name": name,
            "method": method,
            "endpoint": endpoint,
            "description": description,
            "auth": auth,
            "headers": headers,
            "params": params,
            "requestBody": infer_request_body(context, method),
            "response": infer_response(context),
            "statusCode": "200",
            "errorExample": {"error": "Bad Request", "code": 400},
            "curlExample": build_curl(method, endpoint, headers, auth),
            "jsExample": build_js(method, endpoint, headers),
            "pythonExample": build_python(method, endpoint, headers),
        }
        apis.append(api)

    # If not enough found, generate standard ones based on erp name
    if len(apis) < 3:
        apis.extend(generate_standard_apis(erp_name))

    # Deduplicate
    seen = set()
    deduped = []
    for api in apis:
        key = f"{api['method']}:{api['endpoint']}"
        if key not in seen:
            seen.add(key)
            deduped.append(api)

    return deduped[:20]


def infer_api_name(method: str, endpoint: str, context: str) -> str:
    """Infer a human-readable name for an API endpoint."""
    parts = [p for p in endpoint.split("/") if p and not p.startswith("{") and not p.startswith(":")]
    if parts:
        last = parts[-1].replace("-", " ").replace("_", " ")
        method_map = {
            "GET": "Get",
            "POST": "Create",
            "PUT": "Update",
            "PATCH": "Update",
            "DELETE": "Delete",
        }
        prefix = method_map.get(method, method.capitalize())
        return f"{prefix} {last.title()}"
    return f"{method} API"


def infer_description(context: str, endpoint: str) -> str:
    """Extract a short description from surrounding context."""
    # Look for sentences near the endpoint mention
    sentences = re.split(r'[.\n]', context)
    for s in sentences:
        s = s.strip()
        if len(s) > 20 and len(s) < 200 and not s.startswith("http"):
            return s[:150]
    return f"API endpoint: {endpoint}"


def infer_auth(context: str) -> str:
    """Detect authentication type from context."""
    ctx_lower = context.lower()
    if "oauth2" in ctx_lower or "oauth 2" in ctx_lower:
        return "OAuth 2.0"
    if "bearer" in ctx_lower:
        return "Bearer Token"
    if "api key" in ctx_lower or "apikey" in ctx_lower:
        return "API Key"
    if "basic auth" in ctx_lower or "basic authentication" in ctx_lower:
        return "Basic Auth"
    if "jwt" in ctx_lower:
        return "JWT"
    return "Bearer Token"


def infer_headers(context: str) -> dict:
    """Extract headers from context."""
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if "authorization" in context.lower() or "bearer" in context.lower():
        headers["Authorization"] = "Bearer {access_token}"
    if "api-key" in context.lower() or "x-api-key" in context.lower():
        headers["X-API-Key"] = "{api_key}"
    return headers


def infer_params(context: str, method: str) -> dict:
    """Extract query parameters from context."""
    params = {}
    if method == "GET":
        # Look for common param patterns
        param_pattern = re.compile(r'[?&]([a-zA-Z_][a-zA-Z0-9_]{1,30})=', re.IGNORECASE)
        for m in param_pattern.finditer(context):
            params[m.group(1)] = "value"
    return params


def infer_request_body(context: str, method: str) -> dict:
    """Extract request body from context."""
    if method in ("GET", "DELETE", "HEAD"):
        return {}
    # Look for JSON-like content
    json_pattern = re.compile(r'\{[^{}]{10,200}\}', re.DOTALL)
    for m in json_pattern.finditer(context):
        try:
            obj = json.loads(m.group())
            if isinstance(obj, dict) and len(obj) > 0:
                return obj
        except Exception:
            pass
    return {"field1": "value1", "field2": "value2"}


def infer_response(context: str) -> dict:
    """Extract response structure from context."""
    json_pattern = re.compile(r'\{[^{}]{10,300}\}', re.DOTALL)
    for m in json_pattern.finditer(context):
        try:
            obj = json.loads(m.group())
            if isinstance(obj, dict) and len(obj) > 0:
                return obj
        except Exception:
            pass
    return {"id": "string", "status": "success", "data": {}}


def build_curl(method: str, endpoint: str, headers: dict, auth: str) -> str:
    """Build a cURL example."""
    header_str = " \\\n  ".join(f'-H "{k}: {v}"' for k, v in headers.items())
    base = f"curl -X {method} \\\n  '{endpoint}' \\\n  {header_str}"
    return base


def build_js(method: str, endpoint: str, headers: dict) -> str:
    """Build a JavaScript fetch example."""
    headers_str = json.dumps(headers, indent=4)
    return f"""const response = await fetch('{endpoint}', {{
  method: '{method}',
  headers: {headers_str}
}});
const data = await response.json();
console.log(data);"""


def build_python(method: str, endpoint: str, headers: dict) -> str:
    """Build a Python requests example."""
    headers_str = json.dumps(headers, indent=4)
    return f"""import requests

headers = {headers_str}
response = requests.{method.lower()}('{endpoint}', headers=headers)
data = response.json()
print(data)"""


def generate_standard_apis(erp_name: str) -> list[dict]:
    """Generate standard ERP API endpoints when scraping doesn't find enough."""
    base = f"/api/v1/{erp_name.lower().replace(' ', '')}"
    standards = [
        {
            "name": f"List {erp_name} Records",
            "method": "GET",
            "endpoint": f"{base}/records",
            "description": f"Retrieve a paginated list of {erp_name} records",
            "auth": "OAuth 2.0 / Bearer Token",
            "headers": {"Authorization": "Bearer {token}", "Content-Type": "application/json"},
            "params": {"limit": "100", "offset": "0", "filter": "optional"},
            "requestBody": {},
            "response": {"records": [], "total": 0, "hasMore": False},
            "statusCode": "200",
            "errorExample": {"error": "Unauthorized", "code": 401},
            "curlExample": f'curl -X GET "{base}/records" \\\n  -H "Authorization: Bearer {{token}}"',
            "jsExample": f'const res = await fetch("{base}/records", {{\n  headers: {{ Authorization: "Bearer " + token }}\n}});\nconst data = await res.json();',
            "pythonExample": f'import requests\nres = requests.get("{base}/records", headers={{"Authorization": "Bearer " + token}})\nprint(res.json())',
        },
        {
            "name": f"Create {erp_name} Record",
            "method": "POST",
            "endpoint": f"{base}/records",
            "description": f"Create a new record in {erp_name}",
            "auth": "OAuth 2.0 / Bearer Token",
            "headers": {"Authorization": "Bearer {token}", "Content-Type": "application/json"},
            "params": {},
            "requestBody": {"name": "string", "type": "string", "attributes": {}},
            "response": {"id": "rec_123", "name": "string", "created_at": "2024-01-01"},
            "statusCode": "201",
            "errorExample": {"error": "Validation Error", "code": 400},
            "curlExample": f'curl -X POST "{base}/records" \\\n  -H "Authorization: Bearer {{token}}" \\\n  -H "Content-Type: application/json" \\\n  -d \'{{\"name\": \"test\"}}\'',
            "jsExample": f'const res = await fetch("{base}/records", {{\n  method: "POST",\n  headers: {{ Authorization: "Bearer " + token, "Content-Type": "application/json" }},\n  body: JSON.stringify({{ name: "test" }})\n}});\nconst data = await res.json();',
            "pythonExample": f'import requests\nres = requests.post("{base}/records", json={{"name": "test"}}, headers={{"Authorization": "Bearer " + token}})\nprint(res.json())',
        },
        {
            "name": f"Get {erp_name} Record",
            "method": "GET",
            "endpoint": f"{base}/records/{{id}}",
            "description": f"Retrieve a specific {erp_name} record by ID",
            "auth": "OAuth 2.0 / Bearer Token",
            "headers": {"Authorization": "Bearer {token}"},
            "params": {},
            "requestBody": {},
            "response": {"id": "rec_123", "name": "string", "data": {}},
            "statusCode": "200",
            "errorExample": {"error": "Not Found", "code": 404},
            "curlExample": f'curl -X GET "{base}/records/{{id}}" \\\n  -H "Authorization: Bearer {{token}}"',
            "jsExample": f'const res = await fetch(`{base}/records/${{id}}`, {{\n  headers: {{ Authorization: "Bearer " + token }}\n}});\nconst data = await res.json();',
            "pythonExample": f'import requests\nres = requests.get(f"{base}/records/{{id}}", headers={{"Authorization": "Bearer " + token}})\nprint(res.json())',
        },
        {
            "name": f"Update {erp_name} Record",
            "method": "PATCH",
            "endpoint": f"{base}/records/{{id}}",
            "description": f"Update an existing {erp_name} record",
            "auth": "OAuth 2.0 / Bearer Token",
            "headers": {"Authorization": "Bearer {token}", "Content-Type": "application/json"},
            "params": {},
            "requestBody": {"name": "string", "status": "active"},
            "response": {"id": "rec_123", "updated": True},
            "statusCode": "200",
            "errorExample": {"error": "Validation Error", "code": 400},
            "curlExample": f'curl -X PATCH "{base}/records/{{id}}" \\\n  -H "Authorization: Bearer {{token}}" \\\n  -d \'{{\"status\": \"active\"}}\'',
            "jsExample": f'const res = await fetch(`{base}/records/${{id}}`, {{\n  method: "PATCH",\n  headers: {{ Authorization: "Bearer " + token, "Content-Type": "application/json" }},\n  body: JSON.stringify({{ status: "active" }})\n}});\nconst data = await res.json();',
            "pythonExample": f'import requests\nres = requests.patch(f"{base}/records/{{id}}", json={{"status": "active"}}, headers={{"Authorization": "Bearer " + token}})\nprint(res.json())',
        },
        {
            "name": f"Delete {erp_name} Record",
            "method": "DELETE",
            "endpoint": f"{base}/records/{{id}}",
            "description": f"Delete a {erp_name} record by ID",
            "auth": "OAuth 2.0 / Bearer Token",
            "headers": {"Authorization": "Bearer {token}"},
            "params": {},
            "requestBody": {},
            "response": {"deleted": True},
            "statusCode": "204",
            "errorExample": {"error": "Not Found", "code": 404},
            "curlExample": f'curl -X DELETE "{base}/records/{{id}}" \\\n  -H "Authorization: Bearer {{token}}"',
            "jsExample": f'const res = await fetch(`{base}/records/${{id}}`, {{\n  method: "DELETE",\n  headers: {{ Authorization: "Bearer " + token }}\n}});',
            "pythonExample": f'import requests\nres = requests.delete(f"{base}/records/{{id}}", headers={{"Authorization": "Bearer " + token}})\nprint(res.status_code)',
        },
    ]
    return standards


def extract_auth_methods(collected: list[dict], erp_name: str) -> list[dict]:
    """Extract authentication methods from crawled content."""
    auth_methods = []
    all_text = " ".join(d["content"] for d in collected)
    text_lower = all_text.lower()

    # OAuth 2.0
    if "oauth" in text_lower or "access_token" in text_lower:
        token_url = None
        tm = re.search(r'https?://[^\s"\'<>]+token[^\s"\'<>]*', all_text, re.IGNORECASE)
        if tm:
            token_url = tm.group()
        auth_methods.append({
            "type": "OAuth 2.0",
            "description": "Industry-standard authorization protocol for secure API access",
            "tokenUrl": token_url or f"https://accounts.{erp_name.lower().replace(' ', '')}.com/oauth2/token",
            "steps": [
                "Register your application in the developer portal",
                "Obtain client_id and client_secret",
                f"Request authorization: GET /oauth2/authorize?client_id={{client_id}}&response_type=code",
                "Exchange code for access token: POST /oauth2/token",
                "Use Bearer token in API requests: Authorization: Bearer {access_token}",
                "Refresh token before expiry using refresh_token grant",
            ],
            "example": 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...',
        })

    # API Key
    if "api key" in text_lower or "apikey" in text_lower or "x-api-key" in text_lower:
        auth_methods.append({
            "type": "API Key",
            "description": "Simple key-based authentication for server-to-server integration",
            "tokenUrl": None,
            "steps": [
                "Log into the developer portal",
                "Navigate to API Keys section",
                "Generate a new API key",
                "Store key securely (never expose in client-side code)",
                "Include key in all API requests via header",
            ],
            "example": "X-API-Key: your-api-key-here",
        })

    # Basic Auth
    if "basic auth" in text_lower or "basic authentication" in text_lower:
        auth_methods.append({
            "type": "Basic Auth",
            "description": "HTTP Basic Authentication using base64-encoded credentials",
            "tokenUrl": None,
            "steps": [
                "Encode credentials as base64(username:password)",
                "Include in Authorization header",
                "Recommended only for development/testing",
            ],
            "example": "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
        })

    # SAML
    if "saml" in text_lower:
        auth_methods.append({
            "type": "SAML 2.0",
            "description": "Security Assertion Markup Language for enterprise SSO",
            "tokenUrl": None,
            "steps": [
                "Configure Identity Provider (IdP) settings",
                "Exchange SAML metadata with service provider",
                "Implement SAML assertion handling",
                "Map user attributes to application roles",
            ],
            "example": "SAML Assertion in XML format via HTTP POST binding",
        })

    # Defaults if nothing found
    if not auth_methods:
        auth_methods = [
            {
                "type": "OAuth 2.0",
                "description": "Standard OAuth 2.0 authentication for secure API access",
                "tokenUrl": f"https://auth.{erp_name.lower().replace(' ', '')}.com/oauth/token",
                "steps": [
                    "Register application in developer portal",
                    "Obtain client credentials (client_id, client_secret)",
                    "Request access token via client_credentials or authorization_code flow",
                    "Pass Bearer token in Authorization header",
                    "Handle token refresh automatically",
                ],
                "example": "Authorization: Bearer {access_token}",
            },
            {
                "type": "API Key",
                "description": "API key authentication for simpler server-to-server access",
                "tokenUrl": None,
                "steps": [
                    "Generate API key from admin console",
                    "Store securely in environment variables",
                    "Pass via X-API-Key header or as query parameter",
                ],
                "example": "X-API-Key: {your_api_key}",
            },
        ]

    return auth_methods


def extract_webhooks(collected: list[dict], erp_name: str) -> list[dict]:
    """Extract webhook information from crawled content."""
    all_text = " ".join(d["content"] for d in collected)
    text_lower = all_text.lower()

    webhooks = []
    webhook_available = "webhook" in text_lower or "event" in text_lower

    # Common webhook events for ERP systems
    common_events = {
        "SCM": [
            "order.created", "order.updated", "order.shipped", "order.delivered",
            "inventory.updated", "inventory.low_stock", "shipment.created",
            "supplier.updated", "purchase_order.created",
        ],
        "FS": [
            "invoice.created", "invoice.paid", "invoice.overdue",
            "payment.received", "payment.failed", "account.updated",
            "transaction.created", "budget.exceeded", "report.generated",
        ],
    }

    # Extract event names from text
    event_pattern = re.compile(
        r'\b([a-z][a-z0-9_]+\.[a-z][a-z0-9_]+)\b',
        re.IGNORECASE
    )
    found_events = [m.group() for m in event_pattern.finditer(all_text) if "." in m.group()]
    found_events = list(set(found_events))[:10]

    if webhook_available:
        webhooks.append({
            "name": f"{erp_name} Event Webhooks",
            "description": f"Real-time event notifications from {erp_name} triggered on data changes",
            "available": True,
            "events": found_events if found_events else common_events.get("SCM", [])[:5],
            "payloadSample": {
                "event": "record.created",
                "timestamp": "2024-01-15T10:30:00Z",
                "data": {
                    "id": "rec_123",
                    "type": "record",
                    "attributes": {
                        "status": "active",
                        "created_at": "2024-01-15T10:30:00Z",
                    },
                },
                "metadata": {
                    "version": "1.0",
                    "source": erp_name,
                },
            },
        })
    else:
        webhooks.append({
            "name": "Webhooks",
            "description": f"Webhook support may require configuration in {erp_name} admin settings",
            "available": False,
            "events": [],
            "payloadSample": {},
        })

    return webhooks


def build_deployment_steps(erp_name: str, business_type: str, auth_methods: list[dict]) -> list[dict]:
    """Build step-by-step deployment/integration flow."""
    auth_type = auth_methods[0]["type"] if auth_methods else "OAuth 2.0"

    steps = [
        {
            "step": 1,
            "title": "Register Developer Application",
            "description": f"Access the {erp_name} developer portal and register a new application to obtain API credentials.",
            "config": f"Portal: https://developer.{erp_name.lower().replace(' ', '')}.com\nApp Type: Server-side / Integration\nScopes: read, write, {business_type.lower()}",
        },
        {
            "step": 2,
            "title": f"Configure {auth_type}",
            "description": f"Set up {auth_type} authentication flow with the credentials obtained from the developer portal.",
            "config": "CLIENT_ID=your_client_id\nCLIENT_SECRET=your_client_secret\nREDIRECT_URI=https://your-app.com/callback",
        },
        {
            "step": 3,
            "title": "Set Up Environment Variables",
            "description": "Configure your environment with the necessary connection parameters and credentials.",
            "config": f"ERP_BASE_URL=https://api.{erp_name.lower().replace(' ', '')}.com\nERP_VERSION=v1\nERP_CLIENT_ID=${{CLIENT_ID}}\nERP_CLIENT_SECRET=${{CLIENT_SECRET}}",
        },
        {
            "step": 4,
            "title": "Test API Connectivity",
            "description": "Verify the connection by calling the health check or status endpoint.",
            "config": f"curl -X GET 'https://api.{erp_name.lower().replace(' ', '')}.com/v1/status' \\\n  -H 'Authorization: Bearer ${{ACCESS_TOKEN}}'",
        },
        {
            "step": 5,
            "title": f"Implement {business_type} Integration Logic",
            "description": f"Build the core {business_type} integration flows using the extracted API endpoints.",
            "config": "- Map your data models to ERP schema\n- Implement error handling and retry logic\n- Add request/response logging\n- Set up webhook listeners",
        },
        {
            "step": 6,
            "title": "Configure Webhooks (if available)",
            "description": "Set up webhook endpoints to receive real-time notifications from the ERP system.",
            "config": "Webhook URL: https://your-app.com/webhooks/erp\nEvents: Create, Update, Delete\nSecret: Generate a secure webhook secret",
        },
        {
            "step": 7,
            "title": "Deploy and Monitor",
            "description": "Deploy your integration to production with proper monitoring and alerting.",
            "config": "- Enable structured logging\n- Set up API rate limit monitoring\n- Configure health checks\n- Implement circuit breakers for resilience",
        },
    ]
    return steps


def reason_and_synthesize(collected: list[dict], plan: dict) -> dict:
    """
    Level 6: LLM-style reasoning to synthesize all extracted data
    into a structured integration report.
    """
    erp_name = plan["erp_name"]
    business_type = plan["business_type"]

    all_text = " ".join(d["content"] for d in collected)
    sources = [d["url"] for d in collected]

    # Extract all components
    apis = extract_api_endpoints(all_text, erp_name)
    auth_methods = extract_auth_methods(collected, erp_name)
    webhooks = extract_webhooks(collected, erp_name)
    deployment_steps = build_deployment_steps(erp_name, business_type, auth_methods)

    # Determine integration types from content
    text_lower = all_text.lower()
    integration_types = []
    if "rest" in text_lower or "restful" in text_lower or "http" in text_lower:
        integration_types.append("REST")
    if "soap" in text_lower or "wsdl" in text_lower:
        integration_types.append("SOAP")
    if "graphql" in text_lower:
        integration_types.append("GraphQL")
    if "suiteql" in text_lower:
        integration_types.append("SuiteQL")
    if not integration_types:
        integration_types = ["REST", "SOAP"]

    # Customization info
    customization_info = {
        "integrationTypes": integration_types,
        "sdkAvailable": "sdk" in text_lower or "library" in text_lower,
        "sandboxEnvironment": "sandbox" in text_lower or "staging" in text_lower,
        "rateLimits": extract_rate_limits(all_text),
        "dataFormats": ["JSON"] + (["XML"] if "xml" in text_lower else []) + (["CSV"] if "csv" in text_lower else []),
        "extensionMethods": [
            "REST API Integration",
            "Webhook Event Subscriptions",
            "Custom Field Mapping",
            "Batch Processing APIs",
        ],
    }

    return {
        "erp": erp_name,
        "lastUpdated": date.today().isoformat(),
        "integrationTypes": integration_types,
        "apis": apis,
        "auth": auth_methods,
        "webhooks": webhooks,
        "deploymentSteps": deployment_steps,
        "customizationInfo": customization_info,
        "sources": sources,
    }


def extract_rate_limits(text: str) -> str:
    """Extract rate limit information from text."""
    pattern = re.compile(
        r'(\d+)\s*(?:requests?|calls?|api calls?)\s*(?:per|/)\s*(minute|hour|day|second)',
        re.IGNORECASE
    )
    m = pattern.search(text)
    if m:
        return f"{m.group(1)} per {m.group(3)}"
    return "Contact vendor for rate limit details"
