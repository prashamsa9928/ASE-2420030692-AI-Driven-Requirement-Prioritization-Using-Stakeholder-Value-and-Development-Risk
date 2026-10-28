
from flask import Blueprint, jsonify

from database import get_connection


analytics_bp = Blueprint(
    "analytics_bp",
    __name__,
    url_prefix="/api/analytics"
)


@analytics_bp.route("", methods=["GET"])
def get_analytics():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) AS total_requirements,
                COUNT(*) FILTER (
                    WHERE priority_category = 'High'
                ) AS high_priority,
                COUNT(*) FILTER (
                    WHERE priority_category = 'Medium'
                ) AS medium_priority,
                COUNT(*) FILTER (
                    WHERE priority_category = 'Low'
                ) AS low_priority,
                AVG(priority_score) AS average_score,
                AVG(stakeholder_value) AS average_stakeholder_value,
                AVG(development_risk) AS average_development_risk,
                AVG(urgency) AS average_urgency,
                AVG(complexity) AS average_complexity
            FROM requirements
        """)

        row = cursor.fetchone()

        analytics = {
            "total_requirements": row[0] or 0,
            "high_priority": row[1] or 0,
            "medium_priority": row[2] or 0,
            "low_priority": row[3] or 0,
            "average_score": round(float(row[4] or 0), 2),
            "average_stakeholder_value": round(float(row[5] or 0), 2),
            "average_development_risk": round(float(row[6] or 0), 2),
            "average_urgency": round(float(row[7] or 0), 2),
            "average_complexity": round(float(row[8] or 0), 2),
        }

        return jsonify(analytics), 200

    except Exception as error:
        return jsonify({
            "error": "Failed to retrieve analytics",
            "details": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()
