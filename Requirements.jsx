
import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit,
  RefreshCw,
  FileText,
  AlertCircle,
} from "lucide-react";
import "./Requirements.css";

const API_URL = "http://127.0.0.1:5000/api/requirements";

function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch requirements.");
      }

      const data = await response.json();
      setRequirements(Array.isArray(data) ? data : data.requirements || []);
    } catch (err) {
      setError(err.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const getScore = (requirement) =>
    requirement.analysis?.priority_score ??
    requirement.priority_score ??
    0;

  const getPriority = (requirement) =>
    requirement.analysis?.priority_category ??
    requirement.priority_category ??
    "Unanalyzed";

  const filteredRequirements = requirements.filter((requirement) => {
    const matchesSearch =
      requirement.title?.toLowerCase().includes(search.toLowerCase()) ||
      requirement.description?.toLowerCase().includes(search.toLowerCase());

    const priority = getPriority(requirement);

    const matchesPriority =
      priorityFilter === "All" || priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this requirement?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete requirement.");
      }

      setRequirements((previous) =>
        previous.filter((requirement) => requirement.id !== id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete requirement.");
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "unanalyzed";
    }
  };

  return (
    <div className="requirements-page">
      <div className="requirements-header">
        <div>
          <span className="requirements-eyebrow">REQUIREMENT MANAGEMENT</span>
          <h1>Requirements</h1>
          <p>
            Manage, review, and prioritize your software requirements.
          </p>
        </div>

        <button
          className="requirements-refresh"
          onClick={fetchRequirements}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="requirements-summary">
        <div className="requirements-summary-card">
          <span>Total Requirements</span>
          <strong>{requirements.length}</strong>
        </div>

        <div className="requirements-summary-card">
          <span>High Priority</span>
          <strong>
            {requirements.filter((item) => getPriority(item) === "High").length}
          </strong>
        </div>

        <div className="requirements-summary-card">
          <span>Medium Priority</span>
          <strong>
            {requirements.filter((item) => getPriority(item) === "Medium").length}
          </strong>
        </div>

        <div className="requirements-summary-card">
          <span>Low Priority</span>
          <strong>
            {requirements.filter((item) => getPriority(item) === "Low").length}
          </strong>
        </div>
      </div>

      <div className="requirements-toolbar">
        <div className="requirements-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search requirements..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="All">All priorities</option>
          <option value="High">High priority</option>
          <option value="Medium">Medium priority</option>
          <option value="Low">Low priority</option>
          <option value="Unanalyzed">Unanalyzed</option>
        </select>
      </div>

      {error && (
        <div className="requirements-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="requirements-loading">
          <RefreshCw size={22} className="requirements-spinner" />
          Loading requirements...
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="requirements-empty">
          <FileText size={36} />
          <h3>No requirements found</h3>
          <p>
            {requirements.length === 0
              ? "Add a requirement to begin prioritizing your project."
              : "Try changing your search or priority filter."}
          </p>
        </div>
      ) : (
        <div className="requirements-table-wrapper">
          <table className="requirements-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Stakeholder Value</th>
                <th>Development Risk</th>
                <th>Urgency</th>
                <th>Complexity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequirements.map((requirement) => (
                <tr key={requirement.id}>
                  <td className="requirement-title-cell">
                    <strong>{requirement.title}</strong>
                    <p>{requirement.description}</p>
                  </td>

                  <td>
                    <span
                      className={`requirement-priority ${getPriorityClass(
                        getPriority(requirement)
                      )}`}
                    >
                      {getPriority(requirement)}
                    </span>
                  </td>

                  <td>
                    <strong>{getScore(requirement)}</strong>
                  </td>

                  <td>{requirement.stakeholder_value ?? "—"}/10</td>
                  <td>{requirement.development_risk ?? "—"}/10</td>
                  <td>{requirement.urgency ?? "—"}/10</td>
                  <td>{requirement.complexity ?? "—"}/10</td>

                  <td>
                    <div className="requirements-actions">
                      <button
                        title="Edit requirement"
                        className="requirements-edit-button"
                        onClick={() =>
                          window.alert(
                            "Connect this action to your edit requirement page."
                          )
                        }
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Delete requirement"
                        className="requirements-delete-button"
                        onClick={() => handleDelete(requirement.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="requirements-footer">
        Showing {filteredRequirements.length} of {requirements.length} requirements
      </div>
    </div>
  );
}

export default Requirements;
