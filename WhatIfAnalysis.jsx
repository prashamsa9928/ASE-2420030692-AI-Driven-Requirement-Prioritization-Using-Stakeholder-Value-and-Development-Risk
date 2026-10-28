
import { useEffect, useState } from "react";
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import "./WhatIfAnalysis.css";

const API_URL = "http://127.0.0.1:5000/api";

const FACTORS = [
  {
    key: "stakeholder_value",
    label: "Stakeholder Value",
    description: "Business and user value",
    color: "#8b5cf6",
  },
  {
    key: "development_risk",
    label: "Development Risk",
    description: "Risk associated with implementation",
    color: "#f59e0b",
  },
  {
    key: "urgency",
    label: "Urgency",
    description: "How soon the requirement is needed",
    color: "#ef4444",
  },
  {
    key: "complexity",
    label: "Complexity",
    description: "Implementation difficulty",
    color: "#06b6d4",
  },
];

function getScore(requirement) {
  return (
    requirement?.analysis?.priority_score ??
    requirement?.priority_score ??
    0
  );
}

function getCategory(requirement) {
  return (
    requirement?.analysis?.priority_category ??
    requirement?.priority_category ??
    "Unanalyzed"
  );
}

function WhatIfAnalysis() {
  const [requirements, setRequirements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [original, setOriginal] = useState(null);
  const [scenario, setScenario] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/requirements`);

        if (!response.ok) {
          throw new Error("Could not load requirements.");
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : data.requirements || [];

        setRequirements(items);

        if (items.length > 0) {
          setSelectedId(String(items[0].id));
          loadRequirement(items[0]);
        }
      } catch (err) {
        setError(err.message || "Failed to load requirements.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  const loadRequirement = (requirement) => {
    setOriginal(requirement);

    const values = {};

    FACTORS.forEach(({ key }) => {
      values[key] = Number(requirement[key] ?? 5);
    });

    setScenario(values);
    setResult(null);
    setError("");
  };

  const handleRequirementChange = (event) => {
    const id = event.target.value;

    setSelectedId(id);

    const requirement = requirements.find(
      (item) => String(item.id) === id
    );

    if (requirement) {
      loadRequirement(requirement);
    }
  };

  const handleFactorChange = (key, value) => {
    setScenario((previous) => ({
      ...previous,
      [key]: Number(value),
    }));

    setResult(null);
  };

  const resetScenario = () => {
    if (original) {
      loadRequirement(original);
    }
  };

  const runAnalysis = async () => {
    if (!original) return;

    try {
      setAnalyzing(true);
      setError("");
      setResult(null);

      const response = await fetch(`${API_URL}/what-if`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement_id: Number(selectedId),
          ...scenario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "What-if analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to run scenario.");
    } finally {
      setAnalyzing(false);
    }
  };

  const originalScore = getScore(original);

  const predictedScore =
    result?.predicted_score ??
    result?.what_if_score ??
    result?.priority_score ??
    result?.analysis?.priority_score;

  const scoreDifference =
    predictedScore !== undefined
      ? Number(predictedScore) - Number(originalScore)
      : 0;

  const category =
    result?.predicted_category ??
    result?.what_if_category ??
    result?.priority_category ??
    result?.analysis?.priority_category;

  const categoryClass = (value) =>
    String(value || "unanalyzed").toLowerCase();

  if (loading) {
    return (
      <div className="whatif-loading">
        <FlaskConical size={24} />
        Loading scenario analysis...
      </div>
    );
  }

  return (
    <div className="whatif-page">
      <div className="whatif-header">
        <div>
          <span className="whatif-eyebrow">
            PRIORITAI INTELLIGENCE
          </span>

          <h1>What-If Analysis</h1>

          <p>
            Explore how changing requirement factors can influence
            priority before making project decisions.
          </p>
        </div>

        <div className="whatif-header-icon">
          <FlaskConical size={28} />
        </div>
      </div>

      {error && (
        <div className="whatif-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {requirements.length === 0 ? (
        <div className="whatif-empty">
          <h3>No requirements available</h3>
          <p>
            Add a requirement before running a scenario.
          </p>
        </div>
      ) : (
        <>
          <div className="whatif-requirement-select">
            <label htmlFor="whatif-requirement">
              Select Requirement
            </label>

            <select
              id="whatif-requirement"
              value={selectedId}
              onChange={handleRequirementChange}
            >
              {requirements.map((requirement) => (
                <option
                  key={requirement.id}
                  value={requirement.id}
                >
                  {requirement.title}
                </option>
              ))}
            </select>

            {original && (
              <p>{original.description}</p>
            )}
          </div>

          <div className="whatif-workspace">
            <section className="whatif-factors">
              <div className="whatif-section-heading">
                <div>
                  <h2>Scenario Variables</h2>
                  <p>
                    Adjust the values to explore a different scenario.
                  </p>
                </div>

                <button
                  className="whatif-reset-button"
                  onClick={resetScenario}
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </div>

              {FACTORS.map((factor) => (
                <div
                  className="whatif-factor"
                  key={factor.key}
                >
                  <div className="whatif-factor-heading">
                    <div>
                      <strong>{factor.label}</strong>
                      <span>{factor.description}</span>
                    </div>

                    <strong className="whatif-factor-value">
                      {scenario[factor.key] ?? 5}
                      <small>/10</small>
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={scenario[factor.key] ?? 5}
                    onChange={(event) =>
                      handleFactorChange(
                        factor.key,
                        event.target.value
                      )
                    }
                    style={{
                      accentColor: factor.color,
                    }}
                  />

                  <div className="whatif-range-labels">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ))}

              <button
                className="whatif-run-button"
                onClick={runAnalysis}
                disabled={analyzing || !original}
              >
                {analyzing ? (
                  <>
                    <FlaskConical size={18} />
                    Analyzing Scenario...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Run What-If Analysis
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </section>

            <section className="whatif-results">
              <div className="whatif-section-heading">
                <div>
                  <h2>Scenario Outcome</h2>
                  <p>
                    Compare the original and predicted priority.
                  </p>
                </div>
              </div>

              <div className="whatif-score-cards">
                <div className="whatif-score-card">
                  <span>Original Score</span>

                  <strong>{originalScore}</strong>

                  <span
                    className={`whatif-category ${categoryClass(
                      getCategory(original)
                    )}`}
                  >
                    {getCategory(original)}
                  </span>
                </div>

                <div className="whatif-score-arrow">
                  <ArrowRight size={22} />
                </div>

                <div className="whatif-score-card predicted">
                  <span>Predicted Score</span>

                  <strong>
                    {predictedScore !== undefined
                      ? Number(predictedScore).toFixed(1)
                      : "—"}
                  </strong>

                  {category && (
                    <span
                      className={`whatif-category ${categoryClass(
                        category
                      )}`}
                    >
                      {category}
                    </span>
                  )}
                </div>
              </div>

              {result && predictedScore !== undefined && (
                <div
                  className={`whatif-difference ${
                    scoreDifference >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {scoreDifference >= 0 ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}

                  <div>
                    <strong>
                      {scoreDifference >= 0 ? "+" : ""}
                      {scoreDifference.toFixed(1)} points
                    </strong>

                    <span>
                      {scoreDifference > 0
                        ? "Priority increased"
                        : scoreDifference < 0
                        ? "Priority decreased"
                        : "Priority remained unchanged"}
                    </span>
                  </div>
                </div>
              )}

              {!result && (
                <div className="whatif-result-placeholder">
                  <FlaskConical size={32} />

                  <h3>Ready to explore?</h3>

                  <p>
                    Adjust the scenario variables and run the
                    analysis to see how the requirement priority
                    changes.
                  </p>
                </div>
              )}

              {result?.explanation && (
                <div className="whatif-explanation">
                  <h3>AI Analysis</h3>
                  <p>{result.explanation}</p>
                </div>
              )}

              {result?.recommendation && (
                <div className="whatif-recommendation">
                  <h3>Recommendation</h3>
                  <p>{result.recommendation}</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default WhatIfAnalysis;
