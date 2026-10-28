
import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Target,
  RefreshCw,
  Search,
} from "lucide-react";
import "./PriorityOrder.css";

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

function PriorityOrder() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("highest");

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch requirements.");
      }

      const data = await response.json();

      const sortedData = [...data].sort((a, b) => {
        return getPriorityScore(b) - getPriorityScore(a);
      });

      setRequirements(sortedData);
    } catch (err) {
      setError(err.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const filteredRequirements = requirements
    .filter((requirement) => {
      const title = requirement.title?.toLowerCase() || "";
      const description = requirement.description?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return title.includes(search) || description.includes(search);
    })
    .sort((a, b) => {
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);

      return sortOrder === "highest"
        ? scoreB - scoreA
        : scoreA - scoreB;
    });

  const highPriority = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "High"
  ).length;

  const mediumPriority = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "Medium"
  ).length;

  const lowPriority = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "Low"
  ).length;

  const getCategoryClass = (category) => {
    if (category === "High") return "priority-high";
    if (category === "Medium") return "priority-medium";
    return "priority-low";
  };

  const getScoreClass = (score) => {
    if (score >= 75) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  return (
    <div className="priority-order-page">
      <div className="priority-header">
        <div>
          <div className="priority-eyebrow">
            <ArrowDownWideNarrow size={16} />
            REQUIREMENT MANAGEMENT
          </div>

          <h1>Priority Order</h1>

          <p>
            View, compare, and organize requirements based on their
            AI-assisted priority scores.
          </p>
        </div>

        <button
          className="priority-refresh-button"
          onClick={fetchRequirements}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="priority-summary">
        <div className="priority-summary-card">
          <div className="summary-icon summary-total">
            <Target size={20} />
          </div>

          <div>
            <span>Total Requirements</span>
            <h2>{requirements.length}</h2>
          </div>
        </div>

        <div className="priority-summary-card">
          <div className="summary-icon summary-high">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>High Priority</span>
            <h2>{highPriority}</h2>
          </div>
        </div>

        <div className="priority-summary-card">
          <div className="summary-icon summary-medium">
            <Clock size={20} />
          </div>

          <div>
            <span>Medium Priority</span>
            <h2>{mediumPriority}</h2>
          </div>
        </div>

        <div className="priority-summary-card">
          <div className="summary-icon summary-low">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Low Priority</span>
            <h2>{lowPriority}</h2>
          </div>
        </div>
      </div>

      <div className="priority-list-section">
        <div className="priority-list-heading">
          <div>
            <h2>Ranked Requirements</h2>
            <p>
              Requirements are ranked by their calculated priority score.
            </p>
          </div>

          <div className="priority-controls">
            <div className="priority-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <button
              className="priority-sort-button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "highest" ? "lowest" : "highest"
                )
              }
            >
              <ArrowUpDown size={16} />
              {sortOrder === "highest" ? "Highest first" : "Lowest first"}
            </button>
          </div>
        </div>

        {error && (
          <div className="priority-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="priority-empty">
            <RefreshCw size={22} className="priority-loading-icon" />
            <p>Loading requirements...</p>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="priority-empty">
            <Target size={30} />
            <h3>No requirements found</h3>
            <p>
              Add a requirement or try a different search.
            </p>
          </div>
        ) : (
          <div className="priority-table-wrapper">
            <table className="priority-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Requirement</th>
                  <th>Priority Score</th>
                  <th>Category</th>
                  <th>Stakeholder Value</th>
                  <th>Development Risk</th>
                  <th>Urgency</th>
                  <th>Complexity</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequirements.map((requirement, index) => {
                  const score = getPriorityScore(requirement);
                  const category = getPriorityCategory(requirement);

                  return (
                    <tr key={requirement.id}>
                      <td>
                        <span className="priority-rank">
                          #{index + 1}
                        </span>
                      </td>

                      <td>
                        <div className="priority-requirement-title">
                          {requirement.title}
                        </div>

                        <div className="priority-requirement-description">
                          {requirement.description}
                        </div>
                      </td>

                      <td>
                        <div className={`priority-score ${getScoreClass(score)}`}>
                          <strong>{score.toFixed(2)}</strong>
                          <span>/100</span>
                        </div>
                      </td>

                      <td>
                        <span className={`priority-category ${getCategoryClass(category)}`}>
                          {category}
                        </span>
                      </td>

                      <td>{requirement.stakeholder_value}/10</td>
                      <td>{requirement.development_risk}/10</td>
                      <td>{requirement.urgency}/10</td>
                      <td>{requirement.complexity}/10</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriorityOrder;
