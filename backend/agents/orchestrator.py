from .planning import plan_research
from .research import multi_level_search
from .reasoning import reason_and_synthesize
from .validation import validate_result
from typing import Generator


def orchestrate(request_data: dict, log_fn=None) -> dict:
    """
    Main orchestrator: coordinates all agents to produce the final result.
    """
    erp_name = request_data.get("erpName", "")
    parent_website = request_data.get("parentWebsite", "")
    business_type = request_data.get("businessIntegrationType", "SCM")
    prompt = request_data.get("prompt", "")

    def log(msg: str):
        if log_fn:
            log_fn(msg)

    # Stage 1: Planning
    log(f"[Planning Agent] Analyzing request for: {erp_name}")
    log(f"[Planning Agent] Business type: {business_type}")
    log(f"[Planning Agent] Building research strategy...")
    plan = plan_research(erp_name, parent_website, business_type, prompt)
    log(f"[Planning Agent] Generated {len(plan['search_queries'])} search queries")
    log(f"[Planning Agent] Targeting {len(plan['priority_domains'])} priority domains")

    # Stage 2: Research
    log("[Research Agent] Starting multi-level web search...")
    log("[Research Agent] Level 1: Targeted search queries...")
    collected = multi_level_search(plan, log_fn=log)
    log(f"[Research Agent] Collected content from {len(collected)} pages")

    # Stage 3: Reasoning
    log("[Reasoning Agent] Extracting and synthesizing data...")
    log("[Reasoning Agent] Parsing API endpoints from content...")
    log("[Reasoning Agent] Identifying authentication methods...")
    log("[Reasoning Agent] Analyzing webhook configurations...")
    log("[Reasoning Agent] Building deployment flow...")
    result = reason_and_synthesize(collected, plan)
    log(f"[Reasoning Agent] Found {len(result.get('apis', []))} API endpoints")
    log(f"[Reasoning Agent] Found {len(result.get('auth', []))} auth methods")
    log(f"[Reasoning Agent] Found {len(result.get('webhooks', []))} webhook configs")

    # Stage 4: Validation
    log("[Validation Agent] Validating and cleaning results...")
    result = validate_result(result)
    log(f"[Validation Agent] Final result: {len(result['apis'])} APIs, {len(result['auth'])} auth methods")
    log("[Orchestrator] Analysis complete!")

    return result
