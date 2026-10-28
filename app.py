from flask import Flask
from flask_cors import CORS

from routes.requirement_routes import requirement_bp
from routes.analytics_routes import analytics_bp


app = Flask(__name__)
CORS(app)

app.register_blueprint(requirement_bp)
app.register_blueprint(analytics_bp)


@app.route("/api/health", methods=["GET"])
def health_check():
    return {
        "message": "PrioritAI backend is running",
        "status": "success"
    }, 200


if __name__ == "__main__":
    app.run(debug=True)