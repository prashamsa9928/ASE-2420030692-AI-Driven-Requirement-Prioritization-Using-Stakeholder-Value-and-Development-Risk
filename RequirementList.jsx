
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  FileText,
  Target,
  AlertCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import "./RequirementsList.css";

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

function RequirementsList() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

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
    } catch (err) {
      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleDelete = async (requirementId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this requirement?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(requirementId);
      setError("");

      const response = await fetch(
        `${API_URL}/${requirementId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete requirement."
        );
      }

      setRequirements((previous) =>
        previous.filter(
          (requirement) => requirement.id !== requirementId
        )
      );
    } catch (err) {
      setError(
        err.message || "Unable to delete requirement."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRequirements = requirements.filter(
    (requirement) => {
      const title = requirement.title?.toLowerCase() || "";
      const description =
        requirement.description?.toLowerCase() || "";

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        description.includes(search);

      const matchesCategory =
        filterCategory === "All" ||
        getPriorityCategory(requirement) === filterCategory;

      return matchesSearch && matchesCategory;
    }
  );

  const getCategoryClass = (category) => {
    if (category === "High") return "list-category-high";
    if (category === "Medium") return "list-category-medium";
    return "list-category-low";
  };

  const getScoreClass = (score) => {
    if (score >= 75) return "list-score-high";
    if (score >= 50) return "list-score-medium";
    return "list-score-low";
  };

  const highCount = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "High"
  ).length;

  const mediumCount = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "Medium"
  ).length;

  const lowCount = requirements.filter(
    (requirement) => getPriorityCategory(requirement) === "Low"
  ).length;

  return (
    <div className="requirements-list-page">
      <div className="requirements-list-header">
        <div>
          <div className="requirements-list-eyebrow">
            <FileText size={15} />
            REQUIREMENT MANAGEMENT
          </div>

          <h1>Requirements List</h1>

          <p>
            Manage, search, and review all analyzed software requirements.
          </p>
        </div>

        <button
          className="requirements-list-refresh"
          onClick={fetchRequirements}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="requirements-list-summary">
        <div className="requirements-list-summary-card">
          <div className="list-summary-icon list-total-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>Total Requirements</span>
            <h2>{requirements.length}</h2>
          </div>
        </div>

        <div className="requirements-list-summary-card">
          <div className="list-summary-icon list-high-icon">
            <Target size={19} />
          </div>

          <div>
            <span>High Priority</span>
            <h2>{highCount}</h2>
          </div>
        </div>

        <div className="requirements-list-summary-card">
          <div className="list-summary-icon list-medium-icon">
            <Clock size={19} />
          </div>

          <div>
            <span>Medium Priority</span>
            <h2>{mediumCount}</h2>
          </div>
        </div>

        <div className="requirements-list-summary-card">
          <div className="list-summary-icon list-low-icon">
            <ShieldCheck size={19} />
          </div>

          <div>
            <span>Low Priority</span>
            <h2>{lowCount}</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="requirements-list-error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="requirements-list-content">
        <div className="requirements-list-controls">
          <div>
            <h2>All Requirements</h2>
            <p>
              {filteredRequirements.length} requirement
              {filteredRequirements.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="requirements-list-filters">
            <div className="requirements-list-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <select
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(event.target.value)
              }
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="requirements-list-empty">
            <RefreshCw size={24} className="list-loading-icon" />
            <p>Loading requirements...</p>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="requirements-list-empty">
            <FileText size={30} />
            <h3>No requirements found</h3>
            <p>
              Add a requirement or change your search or filter.
            </p>
          </div>
        ) : (
          <div className="requirements-list-table-wrapper">
            <table className="requirements-list-table">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Priority Score</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Risk</th>
                  <th>Urgency</th>
                  <th>Complexity</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequirements.map((requirement) => {
                  const score = getPriorityScore(requirement);
                  const category =
                    getPriorityCategory(requirement);

                  return (
                    <tr key={requirement.id}>
                      <td>
                        <div className="requirements-list-title">
                          {requirement.title}
                        </div>

                        <div className="requirements-list-description">
                          {requirement.description}
                        </div>

                        <span className="requirements-list-id">
                          REQ-{String(requirement.id).padStart(3, "0")}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`requirements-list-score ${getScoreClass(score)}`}
                        >
                          {score.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`requirements-list-category ${getCategoryClass(category)}`}
                        >
                          {category}
                        </span>
                      </td>

                      <td>{requirement.stakeholder_value}/10</td>
                      <td>{requirement.development_risk}/10</td>
                      <td>{requirement.urgency}/10</td>
                      <td>{requirement.complexity}/10</td>

                      <td>
                        <button
                          className="requirements-list-delete"
                          title="Delete requirement"
                          onClick={() =>
                            handleDelete(requirement.id)
                          }
                          disabled={deletingId === requirement.id}
                        >
                          <Trash2 size={16} />

                          {deletingId === requirement.id
                            ? "Deleting..."
                            : ""}
                        </button>
                      </td>
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

export default RequirementsList;
