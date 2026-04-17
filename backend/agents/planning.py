import re


def plan_research(erp_name: str, parent_website: str, business_type: str, prompt: str) -> dict:
    """
    Planning agent: decides which URLs and search queries to use
    for multi-level research on the ERP system.
    """
    # Normalize ERP name
    erp_lower = erp_name.lower().replace(" ", "")
    erp_clean = erp_name.strip()

    # Generate targeted search queries
    queries = [
        f"{erp_clean} REST API documentation",
        f"{erp_clean} developer portal integration guide",
        f"{erp_clean} API authentication OAuth",
        f"{erp_clean} webhook events documentation",
        f"{erp_clean} {business_type} integration",
    ]

    # Build priority URL patterns based on known ERP patterns
    priority_patterns = [
        "developer", "api", "docs", "documentation", "integration",
        "reference", "guide", "portal", "help", "support",
        "webhook", "auth", "oauth", "sdk", "connect",
    ]

    # Determine base domains to search
    domains = [parent_website] if parent_website else []

    # Add common ERP developer portals based on name
    erp_patterns = {
        "sap": ["api.sap.com", "developers.sap.com", "help.sap.com"],
        "oracle": ["docs.oracle.com", "developer.oracle.com"],
        "netsuite": ["docs.oracle.com/netsuite", "netsuite.com/portal"],
        "salesforce": ["developer.salesforce.com", "trailhead.salesforce.com"],
        "dynamics": ["docs.microsoft.com", "learn.microsoft.com"],
        "workday": ["community.workday.com", "developer.workday.com"],
        "odoo": ["www.odoo.com/documentation", "developer.odoo.com"],
        "sage": ["developer.sage.com", "docs.sage.com"],
        "epicor": ["help.epicor.com", "developer.epicor.com"],
        "infor": ["developer.infor.com", "docs.infor.com"],
    }

    for key, urls in erp_patterns.items():
        if key in erp_lower:
            domains.extend(urls)

    plan = {
        "erp_name": erp_clean,
        "erp_lower": erp_lower,
        "business_type": business_type,
        "prompt": prompt,
        "search_queries": queries,
        "priority_domains": list(set(domains)),
        "priority_patterns": priority_patterns,
        "crawl_depth": 2,
        "max_pages_per_domain": 10,
    }

    return plan
