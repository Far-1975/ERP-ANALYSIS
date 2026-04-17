import re
import time
import requests
from bs4 import BeautifulSoup
from typing import Generator
from urllib.parse import urljoin, urlparse

try:
    from duckduckgo_search import DDGS
    DDGS_AVAILABLE = True
except Exception:
    DDGS_AVAILABLE = False


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

TIMEOUT = 10


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Level 1: Multi-engine web search using DuckDuckGo."""
    results = []

    # Try DuckDuckGo search
    if DDGS_AVAILABLE:
        try:
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=max_results):
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("href", ""),
                        "snippet": r.get("body", ""),
                    })
            if results:
                return results
        except Exception:
            pass

    # Fallback: Try direct URL construction for known patterns
    try:
        # Use DuckDuckGo HTML interface as backup
        search_url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
        resp = requests.get(search_url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for link in soup.select(".result__a")[:max_results]:
                href = link.get("href", "")
                if href.startswith("//duckduckgo.com/l/?uddg="):
                    # Decode the redirect URL
                    import urllib.parse
                    parsed = urllib.parse.urlparse(href)
                    params = urllib.parse.parse_qs(parsed.query)
                    real_url = params.get("uddg", [href])[0]
                    real_url = urllib.parse.unquote(real_url)
                    results.append({
                        "title": link.get_text(strip=True),
                        "url": real_url,
                        "snippet": "",
                    })
    except Exception:
        pass

    return results


def filter_official_sources(results: list[dict], erp_name: str, parent_website: str) -> list[str]:
    """Level 2: Domain filtering - keep only official/trusted sources."""
    erp_lower = erp_name.lower().replace(" ", "")
    trusted_urls = []

    # Keywords that indicate official developer docs
    official_keywords = [
        "developer", "docs", "api", "documentation", "help",
        "support", "guide", "portal", "reference", "community",
    ]

    # Domain from parent website
    parent_domain = ""
    if parent_website:
        try:
            parsed = urlparse(parent_website if "://" in parent_website else f"https://{parent_website}")
            parent_domain = parsed.netloc.replace("www.", "")
        except Exception:
            parent_domain = parent_website

    seen = set()
    for r in results:
        url = r.get("url", "")
        if not url or not url.startswith("http"):
            continue
        if url in seen:
            continue

        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

            # Prioritize: parent website domain, official ERP domains, keyword matches
            is_official = (
                parent_domain and parent_domain in domain
                or erp_lower in domain
                or any(kw in domain for kw in official_keywords)
                or any(kw in parsed.path.lower() for kw in official_keywords)
            )

            if is_official:
                trusted_urls.append(url)
                seen.add(url)
        except Exception:
            continue

    # If nothing found, take top results anyway
    if not trusted_urls:
        for r in results:
            url = r.get("url", "")
            if url and url.startswith("http") and url not in seen:
                trusted_urls.append(url)
                seen.add(url)

    return trusted_urls[:8]


def fetch_page(url: str) -> str:
    """Fetch a single page and return its text content."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "lxml")
            # Remove script/style
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            return soup.get_text(separator="\n", strip=True)
    except Exception:
        pass
    return ""


def find_sub_links(url: str, patterns: list[str]) -> list[str]:
    """Level 3: Deep crawl - find relevant sub-links on a page."""
    sub_links = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.text, "lxml")
        base = f"{urlparse(url).scheme}://{urlparse(url).netloc}"

        seen = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            full_url = urljoin(url, href)
            if full_url in seen:
                continue

            path_lower = urlparse(full_url).path.lower()
            if any(pat in path_lower for pat in patterns):
                sub_links.append(full_url)
                seen.add(full_url)

            if len(sub_links) >= 15:
                break
    except Exception:
        pass
    return sub_links


def extract_content_from_urls(
    urls: list[str],
    erp_name: str,
    patterns: list[str],
    depth: int = 2,
    log_fn=None,
) -> list[dict]:
    """
    Levels 3 & 4: Deep crawl and content extraction.
    Returns list of {url, content} dicts.
    """
    collected = []
    visited = set()

    def crawl(url_list: list[str], current_depth: int):
        if current_depth <= 0:
            return
        for url in url_list:
            if url in visited or len(collected) >= 20:
                break
            visited.add(url)

            if log_fn:
                log_fn(f"Crawling: {url}")

            content = fetch_page(url)
            if content and len(content) > 200:
                collected.append({"url": url, "content": content[:8000]})

            if current_depth > 1:
                sub_links = find_sub_links(url, patterns)
                time.sleep(0.3)
                crawl(sub_links[:5], current_depth - 1)

    crawl(urls, depth)
    return collected


def multi_level_search(
    plan: dict,
    log_fn=None,
) -> list[dict]:
    """
    Execute the full multi-level search pipeline.
    Returns list of {url, content} dicts.
    """
    erp_name = plan["erp_name"]
    queries = plan["search_queries"]
    patterns = plan["priority_patterns"]
    priority_domains = plan.get("priority_domains", [])
    depth = plan.get("crawl_depth", 2)

    all_urls = []

    # Add priority domains first
    for domain in priority_domains:
        url = domain if domain.startswith("http") else f"https://{domain}"
        all_urls.append(url)

    # Level 1: Search
    if log_fn:
        log_fn("Level 1: Performing targeted web searches...")

    for query in queries[:3]:
        if log_fn:
            log_fn(f"Searching: {query}")
        results = search_web(query, max_results=5)
        for r in results:
            url = r.get("url", "")
            if url:
                all_urls.append(url)
        time.sleep(0.5)

    # Level 2: Filter
    if log_fn:
        log_fn("Level 2: Filtering official sources...")
    parent_website = plan.get("priority_domains", [""])[0] if plan.get("priority_domains") else ""
    filtered_urls = filter_official_sources(
        [{"url": u} for u in all_urls],
        erp_name,
        parent_website,
    )

    if log_fn:
        log_fn(f"Found {len(filtered_urls)} trusted sources to crawl")

    # Levels 3 & 4: Deep crawl and extract
    if log_fn:
        log_fn("Level 3-4: Deep crawling and extracting content...")
    collected = extract_content_from_urls(filtered_urls, erp_name, patterns, depth, log_fn)

    return collected
