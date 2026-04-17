import json
import os
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from agents.orchestrator import orchestrate

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)

PORT = int(os.environ.get("FLASK_PORT", 5000))


@app.route("/api/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok"})


@app.route("/api/erp/analyze", methods=["POST"])
def analyze_erp():
    """Non-streaming analysis endpoint."""
    try:
        data = request.get_json()
        if not data or not data.get("erpName"):
            return jsonify({"error": "erpName is required"}), 400

        result = orchestrate(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/erp/stream", methods=["POST"])
def stream_erp_analysis():
    """Streaming analysis with real-time log events."""
    try:
        data = request.get_json()
        if not data or not data.get("erpName"):
            return jsonify({"error": "erpName is required"}), 400

        def generate():
            logs = []

            def log_fn(msg: str):
                logs.append(msg)
                event = json.dumps({"type": "log", "message": msg})
                yield f"data: {event}\n\n"

            # Generator-based orchestration with streaming logs
            erp_name = data.get("erpName", "")
            parent_website = data.get("parentWebsite", "")
            business_type = data.get("businessIntegrationType", "SCM")
            prompt = data.get("prompt", "")

            from agents.planning import plan_research
            from agents.research import multi_level_search
            from agents.reasoning import reason_and_synthesize
            from agents.validation import validate_result

            def log(msg):
                event_data = json.dumps({"type": "log", "message": msg})
                return f"data: {event_data}\n\n"

            # Stage 1: Planning
            yield log(f"[Planning Agent] Analyzing ERP: {erp_name}")
            yield log(f"[Planning Agent] Business type: {business_type}")
            plan = plan_research(erp_name, parent_website, business_type, prompt)
            yield log(f"[Planning Agent] Strategy: {len(plan['search_queries'])} queries, {len(plan['priority_domains'])} domains")

            # Stage 2: Research
            yield log("[Research Agent] Starting multi-level web search...")
            yield log("[Research Agent] Level 1: Executing targeted search queries...")

            collected_data = []

            def research_log(msg):
                collected_data.append(("log", msg))

            # Run research synchronously collecting logs
            from agents.research import (
                search_web, filter_official_sources,
                extract_content_from_urls, find_sub_links
            )
            import time

            queries = plan["search_queries"]
            patterns = plan["priority_patterns"]
            priority_domains = plan.get("priority_domains", [])

            all_urls = []
            for domain in priority_domains:
                url = domain if domain.startswith("http") else f"https://{domain}"
                all_urls.append(url)

            for query in queries[:3]:
                yield log(f"[Research Agent] Searching: {query}")
                results = search_web(query, max_results=5)
                for r in results:
                    u = r.get("url", "")
                    if u:
                        all_urls.append(u)
                time.sleep(0.3)

            yield log(f"[Research Agent] Level 2: Filtering {len(all_urls)} discovered URLs...")
            parent_site = priority_domains[0] if priority_domains else ""
            filtered_urls = filter_official_sources(
                [{"url": u} for u in all_urls], erp_name, parent_site
            )
            yield log(f"[Research Agent] Kept {len(filtered_urls)} official sources")

            yield log("[Research Agent] Level 3-4: Deep crawling and content extraction...")
            collected = []
            visited = set()

            def crawl_with_log(url_list, depth):
                for url in url_list:
                    if url in visited or len(collected) >= 15:
                        break
                    visited.add(url)
                    from agents.research import fetch_page
                    content = fetch_page(url)
                    if content and len(content) > 200:
                        collected.append({"url": url, "content": content[:8000]})

                    if depth > 1:
                        sub = find_sub_links(url, patterns)
                        time.sleep(0.2)
                        crawl_with_log(sub[:3], depth - 1)

            for url in filtered_urls[:6]:
                yield log(f"[Research Agent] Crawling: {url[:60]}...")
                if url not in visited:
                    visited.add(url)
                    from agents.research import fetch_page
                    content = fetch_page(url)
                    if content and len(content) > 200:
                        collected.append({"url": url, "content": content[:8000]})
                    sub = find_sub_links(url, patterns)
                    time.sleep(0.2)
                    for sub_url in sub[:3]:
                        if sub_url not in visited and len(collected) < 15:
                            visited.add(sub_url)
                            yield log(f"[Research Agent] Deep crawling: {sub_url[:60]}...")
                            sc = fetch_page(sub_url)
                            if sc and len(sc) > 200:
                                collected.append({"url": sub_url, "content": sc[:8000]})

            yield log(f"[Research Agent] Level 5: Cleaning and deduplicating {len(collected)} pages...")

            # Stage 3: Reasoning
            yield log("[Reasoning Agent] Level 6: LLM reasoning and synthesis...")
            yield log("[Reasoning Agent] Extracting API endpoints...")
            yield log("[Reasoning Agent] Identifying authentication methods...")
            yield log("[Reasoning Agent] Analyzing webhook configurations...")
            yield log("[Reasoning Agent] Building deployment integration flow...")

            result = reason_and_synthesize(collected, plan)
            yield log(f"[Reasoning Agent] Extracted {len(result.get('apis', []))} API endpoints")
            yield log(f"[Reasoning Agent] Found {len(result.get('auth', []))} authentication methods")
            yield log(f"[Reasoning Agent] Detected {len(result.get('webhooks', []))} webhook configurations")
            yield log(f"[Reasoning Agent] Integration types: {', '.join(result.get('integrationTypes', []))}")

            # Stage 4: Validation
            yield log("[Validation Agent] Validating and normalizing results...")
            result = validate_result(result)
            yield log(f"[Validation Agent] Validated: {len(result['apis'])} APIs ready")
            yield log("[Orchestrator] Analysis complete! Rendering dashboard...")

            # Final result
            final_event = json.dumps({"type": "result", "data": result})
            yield f"data: {final_event}\n\n"
            yield "data: {\"type\": \"done\"}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
