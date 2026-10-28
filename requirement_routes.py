from flask import Blueprint, request, jsonify

from requirements_manager import (
    add_requirement,
    get_all_requirements,
    get_requirement,
    update_requirement,
    delete_requirement,
)

from services.analysis_service import analyze_requirement


requirement_bp = Blueprint(
    "requirement_bp",
    __name__,
    url_prefix="/api/requirements"
)


@requirement_bp.route("", methods=["GET"])
def get_requirements():
    requirements = get_all_requirements()
    return jsonify(requirements), 200


@requirement_bp.route("", methods=["POST"])
def create_requirement_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request data is required"}), 400

    required_fields = [
        "title",
        "description",
        "stakeholder_value",
        "development_risk",
        "urgency",
        "complexity",
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    requirement = add_requirement(data)

    analysis = analyze_requirement(requirement)

    return jsonify({
        "message": "Requirement created successfully",
        "requirement": requirement,
        "analysis": analysis
    }), 201


@requirement_bp.route("/<int:requirement_id>", methods=["GET"])
def get_requirement_route(requirement_id):
    requirement = get_requirement(requirement_id)

    if not requirement:
        return jsonify({"error": "Requirement not found"}), 404

    return jsonify(requirement), 200


@requirement_bp.route("/<int:requirement_id>", methods=["PUT"])
def edit_requirement(requirement_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request data is required"}), 400

    requirement = update_requirement(requirement_id, data)

    if not requirement:
        return jsonify({"error": "Requirement not found"}), 404

    return jsonify({
        "message": "Requirement updated successfully",
        "requirement": requirement
    }), 200


@requirement_bp.route("/<int:requirement_id>", methods=["DELETE"])
def remove_requirement(requirement_id):
    deleted = delete_requirement(requirement_id)

    if not deleted:
        return jsonify({"error": "Requirement not found"}), 404

    return jsonify({
        "message": "Requirement deleted successfully"
    }), 200


@requirement_bp.route(
    "/<int:requirement_id>/analyze",
    methods=["POST"]
)
def analyze_existing_requirement(requirement_id):
    requirement = get_requirement(requirement_id)

    if not requirement:
        return jsonify({"error": "Requirement not found"}), 404

    analysis = analyze_requirement(requirement)

    return jsonify({
        "message": "Requirement analyzed successfully",
        "requirement": requirement,
        "analysis": analysis
    }), 200