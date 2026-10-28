import re

URGENCY_TERMS = {
    "urgent", "immediately", "critical", "asap",
    "emergency", "time-sensitive", "priority"
}

RISK_TERMS = {
    "failure", "vulnerability", "security", "breach",
    "unauthorized", "risk", "attack", "threat"
}

PERFORMANCE_TERMS = {
    "fast", "performance", "latency", "response",
    "throughput", "scalable"
}

def analyze_text(text):
    words = re.findall(r"\b[a-zA-Z]+\b", text.lower())

    urgency_matches = sorted(set(words) & URGENCY_TERMS)
    risk_matches = sorted(set(words) & RISK_TERMS)
    performance_matches = sorted(set(words) & PERFORMANCE_TERMS)

    return {
        "word_count": len(words),
        "urgency_terms": urgency_matches,
        "risk_terms": risk_matches,
        "performance_terms": performance_matches
    }