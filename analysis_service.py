import json

from database import get_connection
from services.ml_service import predict_priority
from services.priority_engine import analyze_requirement
from services.nlp_service import analyze_text


def analyze_and_update_requirement(requirement):

    # Generate rule-based priority analysis
    analysis = analyze_requirement(requirement)

    # Generate ML prediction
    ml_result = predict_priority(requirement)

    # Generate NLP text analysis
    combined_text = (
        requirement["title"] + " " +
        requirement["description"]
    )

    text_analysis = analyze_text(combined_text)

    # Add ML results to the analysis
    if ml_result:
        analysis["ml_prediction"] = ml_result["prediction"]
        analysis["ml_confidence"] = ml_result["confidence"]
    else:
        analysis["ml_prediction"] = None
        analysis["ml_confidence"] = None

    # Store analysis in PostgreSQL
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO requirement_analysis (
            requirement_id,
            priority_score,
            priority_category,
            ml_prediction,
            nlp_keywords,
            ai_explanation,
            recommendation
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (
        requirement["id"],
        analysis["priority_score"],
        analysis["priority_category"],
        analysis["ml_prediction"],
        json.dumps(text_analysis),
        analysis["ai_explanation"],
        analysis["recommendation"]
    ))

    analysis_id = cursor.fetchone()[0]

    connection.commit()

    cursor.close()
    connection.close()

    # Return complete analysis
    analysis["analysis_id"] = analysis_id
    analysis["text_analysis"] = text_analysis

    return analysis


def get_latest_analysis(requirement_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, priority_score, priority_category,
               ml_prediction, nlp_keywords, ai_explanation,
               recommendation, analyzed_at
        FROM requirement_analysis
        WHERE requirement_id = %s
        ORDER BY analyzed_at DESC, id DESC
        LIMIT 1;
    """, (requirement_id,))

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if not row:
        return None

    return {
        "analysis_id": row[0],
        "priority_score": float(row[1]),
        "priority_category": row[2],
        "ml_prediction": row[3],
        "nlp_keywords": row[4],
        "ai_explanation": row[5],
        "recommendation": row[6],
        "analyzed_at": row[7].isoformat() if row[7] else None
    }