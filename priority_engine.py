def analyze_requirement(data):
    stakeholder_value = int(data["stakeholder_value"])
    development_risk = int(data["development_risk"])
    urgency = int(data["urgency"])
    complexity = int(data["complexity"])

    # Normalize the inputs to the 0–10 scale.
    value = max(0, min(10, stakeholder_value))
    risk = max(0, min(10, development_risk))
    urgency = max(0, min(10, urgency))
    complexity = max(0, min(10, complexity))

    # Higher value and urgency increase priority.
    # Higher risk and complexity reduce priority.
    score = (
        value * 0.40 +
        urgency * 0.30 +
        (10 - risk) * 0.20 +
        (10 - complexity) * 0.10
    ) * 10

    score = round(score, 2)

    if score >= 75:
        category = "High"
    elif score >= 50:
        category = "Medium"
    else:
        category = "Low"

    explanation = (
        f"This requirement received a score of {score}/100. "
        f"Stakeholder value is {value}/10, urgency is {urgency}/10, "
        f"development risk is {risk}/10, and complexity is {complexity}/10. "
        f"It is classified as {category} priority."
    )

    if category == "High":
        recommendation = (
            "Consider implementing this requirement early, "
            "while reviewing its development risks."
        )
    elif category == "Medium":
        recommendation = (
            "Plan this requirement according to available resources "
            "and its dependencies."
        )
    else:
        recommendation = (
            "Consider scheduling this requirement after higher-priority "
            "items or reviewing its business value."
        )

    return {
        "priority_score": score,
        "priority_category": category,
        "ai_explanation": explanation,
        "recommendation": recommendation
    }