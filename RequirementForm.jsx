
import { useState } from "react";
import {
  FilePlus2,
  Sparkles,
  Target,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import "./RequirementsForm.css";

const API_URL = "http://127.0.0.1:5000/api/requirements";

const initialForm = {
  title: "",
  description: "",
  stakeholder_value: 5,
  development_risk: 5,
  urgency: 5,
  complexity: 5,
};

function RequirementsForm() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "title" || name === "description"
        ? value
        : Number(value),
    }));

    setError("");
    setSuccess(null);
  };

  const handleReset = () => {
    setFormData(initialForm);
    setError("");
    setSuccess(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a requirement title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a requirement description.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(null);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to create requirement."
        );
      }

      setSuccess(result);
      setFormData(initialForm);
    } catch (err) {
      setError(
        err.message ||
        "Could not connect to the backend. Please check whether Flask is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const score = success?.analysis?.priority_score;
  const category = success?.analysis?.priority_category;

  return (
    <div className="requirements-form-page">
      <div className="requirements-form-header">
        <div>
          <div className="requirements-eyebrow">
            <Sparkles size={15} />
            AI-ASSISTED REQUIREMENT ANALYSIS
          </div>

          <h1>Add Requirement</h1>

          <p>
            Define a software requirement and evaluate its value,
            risk, urgency, and complexity.
          </p>
        </div>

        <div className="requirements-header-icon">
          <FilePlus2 size={25} />
        </div>
      </div>

      {error && (
        <div className="requirements-alert requirements-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="requirements-alert requirements-alert-success">
          <CheckCircle2 size={18} />

          <div>
            <strong>Requirement added successfully!</strong>

            <p>
              Your requirement has been saved and analyzed.
              {score !== undefined &&
                ` Priority score: ${Number(score).toFixed(2)}/100.`}
            </p>

            {category && (
              <span className={`requirements-success-category ${category.toLowerCase()}`}>
                {category} Priority
              </span>
            )}
          </div>
        </div>
      )}

      <form
        className="requirements-form"
        onSubmit={handleSubmit}
      >
        <section className="requirements-form-section">
          <div className="requirements-section-heading">
            <div className="requirements-section-icon">
              <FilePlus2 size={18} />
            </div>

            <div>
              <h2>Requirement Details</h2>
              <p>Provide a clear description of the requirement.</p>
            </div>
          </div>

          <div className="requirements-field">
            <label htmlFor="title">
              Requirement Title <span>*</span>
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Secure Authentication"
              value={formData.title}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div className="requirements-field">
            <label htmlFor="description">
              Requirement Description <span>*</span>
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe what the system should do and why it is needed..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />

            <div className="requirements-character-count">
              {formData.description.length} characters
            </div>
          </div>
        </section>

        <section className="requirements-form-section">
          <div className="requirements-section-heading">
            <div className="requirements-section-icon">
              <Target size={18} />
            </div>

            <div>
              <h2>Prioritization Factors</h2>
              <p>
                Rate each factor from 1 (lowest) to 10 (highest).
              </p>
            </div>
          </div>

          <div className="requirements-factor-grid">
            <div className="requirements-factor-card">
              <div className="requirements-factor-heading">
                <div className="requirements-factor-icon value-icon">
                  <Target size={18} />
                </div>

                <div>
                  <label htmlFor="stakeholder_value">
                    Stakeholder Value
                  </label>

                  <p>Business and user benefit</p>
                </div>

                <strong>{formData.stakeholder_value}/10</strong>
              </div>

              <input
                id="stakeholder_value"
                name="stakeholder_value"
                type="range"
                min="1"
                max="10"
                value={formData.stakeholder_value}
                onChange={handleChange}
              />

              <div className="requirements-range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="requirements-factor-card">
              <div className="requirements-factor-heading">
                <div className="requirements-factor-icon risk-icon">
                  <ShieldAlert size={18} />
                </div>

                <div>
                  <label htmlFor="development_risk">
                    Development Risk
                  </label>

                  <p>Technical uncertainty or risk</p>
                </div>

                <strong>{formData.development_risk}/10</strong>
              </div>

              <input
                id="development_risk"
                name="development_risk"
                type="range"
                min="1"
                max="10"
                value={formData.development_risk}
                onChange={handleChange}
              />

              <div className="requirements-range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="requirements-factor-card">
              <div className="requirements-factor-heading">
                <div className="requirements-factor-icon urgency-icon">
                  <Clock size={18} />
                </div>

                <div>
                  <label htmlFor="urgency">
                    Urgency
                  </label>

                  <p>How soon it is needed</p>
                </div>

                <strong>{formData.urgency}/10</strong>
              </div>

              <input
                id="urgency"
                name="urgency"
                type="range"
                min="1"
                max="10"
                value={formData.urgency}
                onChange={handleChange}
              />

              <div className="requirements-range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="requirements-factor-card">
              <div className="requirements-factor-heading">
                <div className="requirements-factor-icon complexity-icon">
                  <Layers size={18} />
                </div>

                <div>
                  <label htmlFor="complexity">
                    Complexity
                  </label>

                  <p>Effort needed to implement</p>
                </div>

                <strong>{formData.complexity}/10</strong>
              </div>

              <input
                id="complexity"
                name="complexity"
                type="range"
                min="1"
                max="10"
                value={formData.complexity}
                onChange={handleChange}
              />

              <div className="requirements-range-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </section>

        <div className="requirements-form-actions">
          <button
            type="button"
            className="requirements-reset-button"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="submit"
            className="requirements-submit-button"
            disabled={loading}
          >
            <Sparkles size={17} />

            {loading
              ? "Analyzing Requirement..."
              : "Analyze & Add Requirement"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequirementsForm;
