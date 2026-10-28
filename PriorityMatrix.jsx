
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Target,
  AlertTriangle,
  ShieldCheck,
  Search,
} from "lucide-react";
import "./PriorityMatrix.css";

const API_URL = "http://127.0.0.1:5000/api/requirements";

function PriorityMatrix() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setRequirements(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const filteredRequirements = requirements.filter((requirement) => {
    const title = requirement.title?.toLowerCase() || "";
    const description = requirement.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return title.includes(search) || description.includes(search);
  });

  const getQuadrant = (requirement) => {
    const value = Number(requirement.stakeholder_value);
    const risk = Number(requirement.development_risk);

    if (value >= 6 && risk <= 5) {
      return "quick-wins";
    }

    if (value >= 6 && risk > 5) {
      return "strategic";
    }

    if (value < 6 && risk <= 5) {
      return "low-priority";
    }

    return "reconsider";
  };

  const getQuadrantLabel = (quadrant) => {
    const labels = {
      "quick-wins": "Quick Wins",
      strategic: "Strategic Projects",
      "low-priority": "Low Priority",
      reconsider: "Reconsider",
    };

    return labels[quadrant];
  };

  const quickWins = filteredRequirements.filter(
    (requirement) => getQuadrant(requirement) === "quick-wins"
  );

  const strategic = filteredRequirements.filter(
    (requirement) => getQuadrant(requirement) === "strategic"
  );

  const lowPriority = filteredRequirements.filter(
    (requirement) => getQuadrant(requirement) === "low-priority"
  );

  const reconsider = filteredRequirements.filter(
    (requirement) => getQuadrant(requirement) === "reconsider"
  );

  const renderRequirement = (requirement) => (
    <div className="matrix-requirement-card" key={requirement.id}>
      <div className="matrix-card-top">
        <span className="matrix-card-id">
          REQ-{String(requirement.id).padStart(3, "0")}
        </span>

        <span className="matrix-card-score">
          {Number(
            requirement.analysis?.priority_score ??
            requirement.priority_score ??
            0
          ).toFixed(0)}
          /100
        </span>
      </div>

      <h4>{requirement.title}</h4>

      <p>{requirement.description}</p>

      <div className="matrix-card-metrics">
        <span>
          <Target size={13} />
          Value: {requirement.stakeholder_value}/10
        </span>

        <span>
          <AlertTriangle size={13} />
          Risk: {requirement.development_risk}/10
        </span>
      </div>
    </div>
  );

  const renderQuadrant = (
    title,
    subtitle,
    className,
    items,
    icon
  ) => (
    <div className={`matrix-quadrant ${className}`}>
      <div className="matrix-quadrant-heading">
        <div className="matrix-quadrant-title">
          {icon}
          <div>
            <h3>{title}</h3>
            <span>{subtitle}</span>
          </div>
        </div>

        <span className="matrix-count">{items.length}</span>
      </div>

      <div className="matrix-quadrant-content">
        {items.length > 0 ? (
          items.map(renderRequirement)
        ) : (
          <div className="matrix-empty-quadrant">
            No requirements
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="priority-matrix-page">
      <div className="matrix-header">
        <div>
          <div className="matrix-eyebrow">
            <Target size={15} />
            PRIORITIZATION ANALYTICS
          </div>

          <h1>Priority Matrix</h1>

          <p>
            Visualize requirements by stakeholder value and development risk
            to identify strategic opportunities and quick wins.
          </p>
        </div>

        <button
          className="matrix-refresh-button"
          onClick={fetchRequirements}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="matrix-summary">
        <div className="matrix-summary-card">
          <span>Total Requirements</span>
          <h2>{requirements.length}</h2>
        </div>

        <div className="matrix-summary-card">
          <span>Quick Wins</span>
          <h2>{quickWins.length}</h2>
        </div>

        <div className="matrix-summary-card">
          <span>Strategic Projects</span>
          <h2>{strategic.length}</h2>
        </div>

        <div className="matrix-summary-card">
          <span>Low Priority</span>
          <h2>{lowPriority.length}</h2>
        </div>
      </div>

      <div className="matrix-controls">
        <div>
          <h2>Requirement Distribution</h2>
          <p>Value vs. risk classification</p>
        </div>

        <div className="matrix-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="matrix-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="matrix-loading">
          <RefreshCw size={22} />
          <p>Loading priority matrix...</p>
        </div>
      ) : (
        <div className="matrix-chart-area">
          <div className="matrix-y-axis">
            <span>HIGH VALUE</span>
            <span>STAKEHOLDER VALUE</span>
            <span>LOW VALUE</span>
          </div>

          <div className="matrix-main">
            <div className="matrix-grid">
              {renderQuadrant(
                "Strategic Projects",
                "High value · High risk",
                "matrix-strategic",
                strategic,
                <AlertTriangle size={17} />
              )}

              {renderQuadrant(
                "Quick Wins",
                "High value · Low risk",
                "matrix-quick-wins",
                quickWins,
                <ShieldCheck size={17} />
              )}

              {renderQuadrant(
                "Reconsider",
                "Low value · High risk",
                "matrix-reconsider",
                reconsider,
                <AlertTriangle size={17} />
              )}

              {renderQuadrant(
                "Low Priority",
                "Low value · Low risk",
                "matrix-low-priority",
                lowPriority,
                <Target size={17} />
              )}
            </div>

            <div className="matrix-x-axis">
              <span>LOW RISK</span>
              <span>DEVELOPMENT RISK</span>
              <span>HIGH RISK</span>
            </div>
          </div>
        </div>
      )}

      <div className="matrix-legend">
        <div>
          <span className="legend-dot legend-green" />
          Quick Wins
        </div>

        <div>
          <span className="legend-dot legend-blue" />
          Strategic Projects
        </div>

        <div>
          <span className="legend-dot legend-yellow" />
          Low Priority
        </div>

        <div>
          <span className="legend-dot legend-red" />
          Reconsider
        </div>
      </div>
    </div>
  );
}

export default PriorityMatrix;
