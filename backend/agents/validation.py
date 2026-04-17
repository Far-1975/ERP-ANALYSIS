def validate_result(result: dict) -> dict:
    """
    Validation agent: ensures the result is complete and well-formed.
    Adds fallbacks for any missing required fields.
    """
    erp_name = result.get("erp", "Unknown ERP")

    # Ensure required fields
    result.setdefault("erp", erp_name)
    result.setdefault("lastUpdated", "2024-01-01")
    result.setdefault("integrationTypes", ["REST"])
    result.setdefault("apis", [])
    result.setdefault("auth", [])
    result.setdefault("webhooks", [])
    result.setdefault("deploymentSteps", [])
    result.setdefault("customizationInfo", {})
    result.setdefault("sources", [])

    # Validate API endpoints
    validated_apis = []
    for api in result.get("apis", []):
        if not isinstance(api, dict):
            continue
        api.setdefault("name", "Unnamed Endpoint")
        api.setdefault("method", "GET")
        api.setdefault("endpoint", "/api/endpoint")
        api.setdefault("description", "API endpoint")
        api.setdefault("auth", "Bearer Token")
        api.setdefault("headers", {"Authorization": "Bearer {token}"})
        api.setdefault("params", {})
        api.setdefault("requestBody", {})
        api.setdefault("response", {"status": "success"})
        api.setdefault("statusCode", "200")
        api.setdefault("errorExample", {"error": "Bad Request", "code": 400})
        api.setdefault("curlExample", f'curl -X {api["method"]} "{api["endpoint"]}"')
        api.setdefault("jsExample", f'fetch("{api["endpoint"]}")')
        api.setdefault("pythonExample", f'requests.{api["method"].lower()}("{api["endpoint"]}")')
        validated_apis.append(api)

    result["apis"] = validated_apis

    # Validate auth methods
    validated_auth = []
    for auth in result.get("auth", []):
        if not isinstance(auth, dict):
            continue
        auth.setdefault("type", "OAuth 2.0")
        auth.setdefault("description", "Authentication method")
        auth.setdefault("tokenUrl", None)
        auth.setdefault("steps", [])
        auth.setdefault("example", "Authorization: Bearer {token}")
        validated_auth.append(auth)

    result["auth"] = validated_auth

    # Validate webhooks
    validated_webhooks = []
    for wh in result.get("webhooks", []):
        if not isinstance(wh, dict):
            continue
        wh.setdefault("name", "Webhooks")
        wh.setdefault("description", "Event-driven webhooks")
        wh.setdefault("available", False)
        wh.setdefault("events", [])
        wh.setdefault("payloadSample", {})
        validated_webhooks.append(wh)

    result["webhooks"] = validated_webhooks

    # Validate deployment steps
    validated_steps = []
    for step in result.get("deploymentSteps", []):
        if not isinstance(step, dict):
            continue
        step.setdefault("step", len(validated_steps) + 1)
        step.setdefault("title", f"Step {step['step']}")
        step.setdefault("description", "Integration step")
        step.setdefault("config", None)
        validated_steps.append(step)

    result["deploymentSteps"] = validated_steps

    return result
