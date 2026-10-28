
from flask import Flask, request, jsonify
from flask_cors import CORS

from requirements_manager import (
    add_requirement,
    get_all_requirements,
    get_requirement,
    update_requirement,
    delete_requirement,
)

from services.analysis_service import (
    analyze_and_update_requirement,
    get_latest_analysis,
)

from services.priority_engine import analyze_requirement

from database import get_connection


app = Flask(__name__)
CORS(app)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "application": "PrioritAI",
        "status": "healthy"
    }), 200


# --------------------------------------------------
# VALIDATE REQUIREMENT INPUT
# --------------------------------------------------

def validate_requirement(data):
    required_fields = [
        "title",
        "description",
        "stakeholder_value",
        "development_risk",
        "urgency",
        "complexity",
    ]

    if not isinstance(data, dict):
        return "Request body must be valid JSON."

    for field in required_fields:
        if field not in data:
            return f"Missing field: {field}"

    if not isinstance(data["title"], str) or not data["title"].strip():
        return "Title cannot be empty."

    if not isinstance(data["description"], str) or not data["description"].strip():
        return "Description cannot be empty."

    numeric_fields = [
        "stakeholder_value",
        "development_risk",
        "urgency",
        "complexity",
    ]

    for field in numeric_fields:
        try:
            value = int(data[field])
        except (ValueError, TypeError):
            return f"{field} must be an integer from 1 to 10."

        if value < 1 or value > 10:
            return f"{field} must be from 1 to 10."

        data[field] = value

    data["title"] = data["title"].strip()
    data["description"] = data["description"].strip()

    return None


# --------------------------------------------------
# CREATE REQUIREMENT
# --------------------------------------------------

@app.route("/api/requirements", methods=["POST"])
def create_requirement():
    data = request.get_json(silent=True)

    error = validate_requirement(data)

    if error:
        return jsonify({"error": error}), 400

    try:
        requirement = add_requirement(data)

        analysis = analyze_and_update_requirement(requirement)

        requirement["analysis"] = analysis

        return jsonify({
            "message": "Requirement created successfully",
            "requirement": requirement,
            "analysis": analysis,
        }), 201

    except Exception as error:
        app.logger.exception("Error creating requirement")

        return jsonify({
            "error": "Failed to create requirement",
            "details": str(error),
        }), 500


# --------------------------------------------------
# GET ALL REQUIREMENTS
# --------------------------------------------------

@app.route("/api/requirements", methods=["GET"])
def list_requirements():
    try:
        requirements = get_all_requirements()

        for requirement in requirements:
            requirement["analysis"] = get_latest_analysis(
                requirement["id"]
            )

        return jsonify(requirements), 200

    except Exception as error:
        app.logger.exception("Error fetching requirements")

        return jsonify({
            "error": "Failed to fetch requirements",
            "details": str(error),
        }), 500


# --------------------------------------------------
# GET REQUIREMENT BY ID
# --------------------------------------------------

@app.route("/api/requirements/<int:requirement_id>", methods=["GET"])
def retrieve_requirement(requirement_id):
    try:
        requirement = get_requirement(requirement_id)

        if not requirement:
            return jsonify({
                "error": "Requirement not found"
            }), 404

        requirement["analysis"] = get_latest_analysis(
            requirement_id
        )

        return jsonify(requirement), 200

    except Exception as error:
        app.logger.exception("Error fetching requirement")

        return jsonify({
            "error": "Failed to fetch requirement",
            "details": str(error),
        }), 500


# --------------------------------------------------
# UPDATE REQUIREMENT
# --------------------------------------------------

@app.route("/api/requirements/<int:requirement_id>", methods=["PUT"])
def edit_requirement(requirement_id):
    data = request.get_json(silent=True)

    error = validate_requirement(data)

    if error:
        return jsonify({"error": error}), 400

    try:
        requirement = update_requirement(
            requirement_id,
            data
        )

        if not requirement:
            return jsonify({
                "error": "Requirement not found"
            }), 404

        analysis = analyze_and_update_requirement(
            requirement
        )

        requirement["analysis"] = analysis

        return jsonify({
            "message": "Requirement updated successfully",
            "requirement": requirement,
            "analysis": analysis,
        }), 200

    except Exception as error:
        app.logger.exception("Error updating requirement")

        return jsonify({
            "error": "Failed to update requirement",
            "details": str(error),
        }), 500


# --------------------------------------------------
# DELETE REQUIREMENT
# --------------------------------------------------

@app.route("/api/requirements/<int:requirement_id>", methods=["DELETE"])
def remove_requirement(requirement_id):
    try:
        deleted = delete_requirement(requirement_id)

        if not deleted:
            return jsonify({
                "error": "Requirement not found"
            }), 404

        return jsonify({
            "message": "Requirement deleted successfully"
        }), 200

    except Exception as error:
        app.logger.exception("Error deleting requirement")

        return jsonify({
            "error": "Failed to delete requirement",
            "details": str(error),
        }), 500


# --------------------------------------------------
# ANALYZE REQUIREMENT
# --------------------------------------------------

@app.route(
    "/api/requirements/<int:requirement_id>/analyze",
    methods=["POST"]
)
def analyze_existing_requirement(requirement_id):
    try:
        requirement = get_requirement(requirement_id)

        if not requirement:
            return jsonify({
                "error": "Requirement not found"
            }), 404

        analysis = analyze_and_update_requirement(
            requirement
        )

        return jsonify({
            "message": "Analysis completed successfully",
            "requirement": requirement,
            "analysis": analysis,
        }), 200

    except Exception as error:
        app.logger.exception("Error analyzing requirement")

        return jsonify({
            "error": "Failed to analyze requirement",
            "details": str(error),
        }), 500


# --------------------------------------------------
# ANALYTICS
# --------------------------------------------------

@app.route("/api/analytics", methods=["GET"])
def analytics():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                COUNT(DISTINCT r.id),
                COALESCE(AVG(ra.priority_score), 0),

                COUNT(DISTINCT r.id) FILTER (
                    WHERE ra.priority_category = 'High'
                ),

                COUNT(DISTINCT r.id) FILTER (
                    WHERE ra.priority_category = 'Medium'
                ),

                COUNT(DISTINCT r.id) FILTER (
                    WHERE ra.priority_category = 'Low'
                ),

                COALESCE(AVG(r.development_risk), 0),
                COALESCE(AVG(r.stakeholder_value), 0),
                COALESCE(AVG(r.urgency), 0),
                COALESCE(AVG(r.complexity), 0)

            FROM requirements r

            LEFT JOIN LATERAL (
                SELECT
                    priority_score,
                    priority_category

                FROM requirement_analysis

                WHERE requirement_id = r.id

                ORDER BY analyzed_at DESC, id DESC

                LIMIT 1
            ) ra ON TRUE;
        """)

        row = cursor.fetchone()

        return jsonify({
            "total_requirements": row[0],
            "average_priority_score": round(float(row[1]), 2),
            "high_priority": row[2],
            "medium_priority": row[3],
            "low_priority": row[4],
            "average_development_risk": round(float(row[5]), 2),
            "average_stakeholder_value": round(float(row[6]), 2),
            "average_urgency": round(float(row[7]), 2),
            "average_complexity": round(float(row[8]), 2),
        }), 200

    except Exception as error:
        app.logger.exception("Error retrieving analytics")

        return jsonify({
            "error": "Failed to retrieve analytics",
            "details": str(error),
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# --------------------------------------------------
# WHAT-IF ANALYSIS
# --------------------------------------------------

@app.route("/api/what-if", methods=["POST"])
def what_if():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be valid JSON"
        }), 400

    requirement_id = data.get("requirement_id")

    if requirement_id is None:
        return jsonify({
            "error": "requirement_id is required"
        }), 400

    try:
        requirement_id = int(requirement_id)
    except (ValueError, TypeError):
        return jsonify({
            "error": "requirement_id must be an integer"
        }), 400

    original_requirement = get_requirement(requirement_id)

    if not original_requirement:
        return jsonify({
            "error": "Requirement not found"
        }), 404

    scenario = original_requirement.copy()

    numeric_fields = [
        "stakeholder_value",
        "development_risk",
        "urgency",
        "complexity",
    ]

    for field in numeric_fields:
        if field in data:
            try:
                value = int(data[field])
            except (ValueError, TypeError):
                return jsonify({
                    "error": f"{field} must be an integer from 1 to 10"
                }), 400

            if value < 1 or value > 10:
                return jsonify({
                    "error": f"{field} must be from 1 to 10"
                }), 400

            scenario[field] = value

    try:
        baseline = analyze_requirement(
            original_requirement
        )

        predicted = analyze_requirement(
            scenario
        )

        baseline_score = baseline["priority_score"]
        predicted_score = predicted["priority_score"]

        score_difference = round(
            predicted_score - baseline_score,
            2
        )

        return jsonify({
            "requirement_id": requirement_id,
            "requirement_title": original_requirement.get("title"),
            "original_score": baseline_score,
            "original_category": baseline["priority_category"],
            "predicted_score": predicted_score,
            "predicted_category": predicted["priority_category"],
            "score_difference": score_difference,
            "explanation": predicted.get("explanation", ""),
            "recommendation": predicted.get("recommendation", ""),
            "scenario": {
                field: scenario[field]
                for field in numeric_fields
            },
        }), 200

    except Exception as error:
        app.logger.exception("Error running what-if analysis")

        return jsonify({
            "error": "Failed to run what-if analysis",
            "details": str(error),
        }), 500


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
