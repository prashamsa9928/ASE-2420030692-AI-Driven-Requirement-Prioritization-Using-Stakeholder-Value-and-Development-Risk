
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Search,
  Target,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Tag,
} from "lucide-react";
import "./AIAnalysis.css";

const API_URL = "http://127.0.0.1:5000/api/requirements";

function getPriorityScore(requirement) {
  return Number(
    requirement.analysis?.priority_score ??
    requirement.priority_score ??
    0
  );
}

function getPriorityCategory(requirement) {
  return (
    requirement.analysis?.priority_category ??
    requirement.priority_category ??
    "Low"
  );
}

function AIAnalysis() {
  const [requirements, setRequirements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch requirements.");
      }

      const data = await response.json();

      const sortedData = [...data].sort(
        (a, b) => getPriorityScore(b) - getPriorityScore(a)
      );

      setRequirements(sortedData);

      if (sortedData.length > 0) {
        setSelectedId((currentId) => {
          const exists = sortedData.some(
            (requirement) => String(requirement.id) === String(currentId)
          );

          return exists ? currentId : String(sortedData[0].id);
        });
      } else {
        setSelectedId("");
      }
    } catch (err) {
      setError(err.message || "Unable to load AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const selectedRequirement = requirements.find(
    (requirement) => String(requirement.id) === String(selectedId)
  );

  const analysis = selectedRequirement?.analysis || {};

  const score = selectedRequirement
    ? getPriorityScore(selectedRequirement)
    : 0;

  const category = selectedRequirement
    ? getPriorityCategory(selectedRequirement)
    : "Low";

  const filteredRequirements = requirements.filter((requirement) => {
    const title = requirement.title?.toLowerCase() || "";
    const description = requirement.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return title.includes(search) || description.includes(search);
  });

  const handleAnalyze = async () => {
    if (!selectedRequirement) return;

    try {
      setAnalyzing(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${selectedRequirement.id}/analyze`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to analyze requirement."
        );
      }

      await fetchRequirements();
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getCategoryClass = (priorityCategory) => {
    if (priorityCategory === "High") return "ai-category-high";
    if (priorityCategory === "Medium") return "ai-category-medium";
    return "ai-category-low";
  };

  const getScoreClass = (priorityScore) => {
    if (priorityScore >= 75) return "ai-score-high";
    if (priorityScore >= 50) return "ai-score-medium";
    return "ai-score-low";
  };

  const getKeywords = () => {
    const keywords = analysis.nlp_keywords;

    if (!keywords) return [];

    if (Array.isArray(keywords)) {
      return keywords;
    }

    if (Array.isArray(keywords.keywords)) {
      return keywords.keywords;
    }

    if (Array.isArray(keywords.risk_terms)) {
      return keywords.risk_terms;
    }

    if (Array.isArray(keywords.urgency_terms)) {
      return keywords.urgency_terms;
    }

    return [];
  };

  const keywords = getKeywords();

  return (
    <div className="ai-analysis-page">
      <div className="ai-analysis-header">
        <div>
          <div className="ai-analysis-eyebrow">
            <BrainCircuit size={16} />
            INTELLIGENT REQUIREMENT ANALYSIS
          </div>

          <h1>AI Analysis</h1>

          <p>
            Analyze requirements using prioritization logic,
            machine learning predictions, and NLP insights.
          </p>
        </div>

        <button
          className="ai-refresh-button"
          onClick={fetchRequirements}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="ai-analysis-error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="ai-analysis-layout">
        <section className="ai-requirements-panel">
          <div className="ai-panel-heading">
            <div>
              <h2>Requirements</h2>
              <p>Select a requirement to analyze.</p>
            </div>

            <span className="ai-requirement-count">
              {requirements.length}
            </span>
          </div>

          <div className="ai-requirement-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="ai-panel-empty">
              <RefreshCw size={21} className="ai-loading-icon" />
              <p>Loading requirements...</p>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="ai-panel-empty">
              <Target size={25} />
              <p>No requirements found.</p>
            </div>
          ) : (
            <div className="ai-requirement-items">
              {filteredRequirements.map((requirement) => {
                const isSelected =
                  String(requirement.id) === String(selectedId);

                const requirementScore =
                  getPriorityScore(requirement);

                const requirementCategory =
                  getPriorityCategory(requirement);

                return (
                  <button
                    key={requirement.id}
                    className={[
                      "ai-requirement-item",
                      isSelected ? "ai-requirement-selected" : "",
                    ].join(" ")}
                    onClick={() => setSelectedId(String(requirement.id))}
                  >
                    <div className="ai-requirement-item-top">
                      <span className="ai-requirement-id">
                        REQ-{String(requirement.id).padStart(3, "0")}
                      </span>

                      <span
                        className={`ai-requirement-item-category ${getCategoryClass(requirementCategory)}`}
                      >
                        {requirementCategory}
                      </span>
                    </div>

                    <h3>{requirement.title}</h3>

                    <div className="ai-requirement-item-bottom">
                      <span>Priority Score</span>

                      <strong>
                        {requirementScore.toFixed(2)}/100
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="ai-analysis-results">
          {!selectedRequirement ? (
            <div className="ai-analysis-empty">
              <BrainCircuit size={38} />
              <h2>No Requirement Selected</h2>
              <p>
                Add a requirement or select one from the list
                to view its AI analysis.
              </p>
            </div>
          ) : (
            <>
              <div className="ai-results-title">
                <div>
                  <span className="ai-results-label">
                    REQUIREMENT ANALYSIS
                  </span>

                  <h2>{selectedRequirement.title}</h2>

                  <p>{selectedRequirement.description}</p>
                </div>

                <button
                  className="ai-analyze-button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  <Sparkles size={16} />

                  {analyzing
                    ? "Analyzing..."
                    : "Re-analyze"}
                </button>
              </div>

              <div className="ai-score-cards">
                <div className="ai-score-card">
                  <div className="ai-score-card-top">
                    <span>Priority Score</span>
                    <Target size={18} />
                  </div>

                  <div className={`ai-score-value ${getScoreClass(score)}`}>
                    {score.toFixed(2)}
                    <span>/100</span>
                  </div>

                  <div className="ai-score-progress">
                    <div
                      className={`ai-score-progress-fill ${getScoreClass(score)}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, score))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="ai-score-card">
                  <div className="ai-score-card-top">
                    <span>Priority Category</span>
                    <ShieldAlert size={18} />
                  </div>

                  <div
                    className={`ai-category-value ${getCategoryClass(category)}`}
                  >
                    {category}
                  </div>

                  <p>Based on calculated priority score</p>
                </div>

                <div className="ai-score-card">
                  <div className="ai-score-card-top">
                    <span>ML Prediction</span>
                    <BrainCircuit size={18} />
                  </div>

                  <div className="ai-ml-value">
                    {analysis.ml_prediction || "N/A"}
                  </div>

                  <p>
                    {analysis.ml_confidence !== undefined &&
                    analysis.ml_confidence !== null
                      ? `Confidence: ${(
                          Number(analysis.ml_confidence) * 100
                        ).toFixed(1)}%`
                      : "Model prediction"}
                  </p>
                </div>
              </div>

              <div className="ai-analysis-card">
                <div className="ai-analysis-card-heading">
                  <div className="ai-analysis-card-icon explanation-icon">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <h3>AI Explanation</h3>
                    <p>Why this requirement received its score</p>
                  </div>
                </div>

                <p className="ai-analysis-text">
                  {analysis.ai_explanation ||
                    "No explanation is available. Re-analyze the requirement to generate an analysis."}
                </p>
              </div>

              <div className="ai-analysis-card">
                <div className="ai-analysis-card-heading">
                  <div className="ai-analysis-card-icon recommendation-icon">
                    <Lightbulb size={18} />
                  </div>

                  <div>
                    <h3>Recommendation</h3>
                    <p>Suggested action for the development team</p>
                  </div>
                </div>

                <p className="ai-analysis-text">
                  {analysis.recommendation ||
                    "No recommendation is available yet."}
                </p>
              </div>

              <div className="ai-analysis-card">
                <div className="ai-analysis-card-heading">
                  <div className="ai-analysis-card-icon nlp-icon">
                    <Tag size={18} />
                  </div>

                  <div>
                    <h3>NLP Insights</h3>
                    <p>Keywords detected in the requirement text</p>
                  </div>
                </div>

                {keywords.length > 0 ? (
                  <div className="ai-keywords">
                    {keywords.map((keyword, index) => (
                      <span key={`${keyword}-${index}`}>
                        {typeof keyword === "string"
                          ? keyword
                          : keyword.term || keyword.word || JSON.stringify(keyword)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="ai-analysis-text">
                    {analysis.nlp_keywords
                      ? "NLP analysis is available, but no keyword list was returned."
                      : "No NLP keyword data is available. Re-analyze the requirement."}
                  </p>
                )}
              </div>

              <div className="ai-analysis-card">
                <div className="ai-analysis-card-heading">
                  <div className="ai-analysis-card-icon factors-icon">
                    <Layers size={18} />
                  </div>

                  <div>
                    <h3>Requirement Factors</h3>
                    <p>Inputs used for prioritization</p>
                  </div>
                </div>

                <div className="ai-factor-grid">
                  <div>
                    <span>Stakeholder Value</span>
                    <strong>
                      {selectedRequirement.stakeholder_value}/10
                    </strong>
                  </div>

                  <div>
                    <span>Development Risk</span>
                    <strong>
                      {selectedRequirement.development_risk}/10
                    </strong>
                  </div>

                  <div>
                    <span>Urgency</span>
                    <strong>
                      {selectedRequirement.urgency}/10
                    </strong>
                  </div>

                  <div>
                    <span>Complexity</span>
                    <strong>
                      {selectedRequirement.complexity}/10
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AIAnalysis;
