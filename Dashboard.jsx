import { useState } from "react";
import { LayoutDashboard, ListChecks, Brain, TrendingUp, Plus } from "lucide-react";

function Dashboard() {
  const [requirements, setRequirements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(5);
  const [risk, setRisk] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [complexity, setComplexity] = useState(5);

  const calculateScore = () => {
    return (
      0.4 * value +
      0.3 * urgency +
      0.2 * (11 - risk) +
      0.1 * (11 - complexity)
    ).toFixed(2);
  };

  const addRequirement = () => {
    if (!title.trim()) {
      alert("Please enter a requirement title");
      return;
    }

    const score = Number(calculateScore());

    const priority =
      score >= 7.5 ? "High" : score >= 5 ? "Medium" : "Low";

    const newRequirement = {
      id: Date.now(),
      title,
      description,
      value,
      risk,
      urgency,
      complexity,
      score,
      priority,
    };

    setRequirements((prev) => [...prev, newRequirement]);

    setTitle("");
    setDescription("");
    setValue(5);
    setRisk(5);
    setUrgency(5);
    setComplexity(5);
  };

  const highPriority = requirements.filter(
    (r) => r.priority === "High"
  ).length;

  const mediumPriority = requirements.filter(
    (r) => r.priority === "Medium"
  ).length;

  const lowPriority = requirements.filter(
    (r) => r.priority === "Low"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>PrioritAI</h2>

        <div className="nav-item active">
          <LayoutDashboard size={20} />
          Dashboard
        </div>

        <div className="nav-item">
          <ListChecks size={20} />
          Requirements
        </div>

        <div className="nav-item">
          <Brain size={20} />
          AI Analysis
        </div>

        <div className="nav-item">
          <TrendingUp size={20} />
          Analytics
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Requirement Prioritization</h1>
            <p>AI-driven decision support for software requirements</p>
          </div>

          <span className="status">● System Ready</span>
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total Requirements</p>
            <h2>{requirements.length}</h2>
          </div>

          <div className="stat-card">
            <p>High Priority</p>
            <h2>{highPriority}</h2>
          </div>

          <div className="stat-card">
            <p>Medium Priority</p>
            <h2>{mediumPriority}</h2>
          </div>

          <div className="stat-card">
            <p>Low Priority</p>
            <h2>{lowPriority}</h2>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <h2>
              <Plus size={20} /> Add Requirement
            </h2>

            <label>Requirement Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Secure User Authentication"
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the requirement..."
            />

            <label>Stakeholder Value: {value}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />

            <label>Development Risk: {risk}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
            />

            <label>Urgency: {urgency}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
            />

            <label>Complexity: {complexity}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
            />

            <button className="primary-button" onClick={addRequirement}>
              Analyze & Add Requirement
            </button>
          </div>

          <div className="panel">
            <h2>Priority Distribution</h2>

            <div className="priority-row">
              <span>High</span>
              <div className="bar">
                <div
                  className="bar-high"
                  style={{
                    width: requirements.length
                      ? `${(highPriority / requirements.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <strong>{highPriority}</strong>
            </div>

            <div className="priority-row">
              <span>Medium</span>
              <div className="bar">
                <div
                  className="bar-medium"
                  style={{
                    width: requirements.length
                      ? `${(mediumPriority / requirements.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <strong>{mediumPriority}</strong>
            </div>

            <div className="priority-row">
              <span>Low</span>
              <div className="bar">
                <div
                  className="bar-low"
                  style={{
                    width: requirements.length
                      ? `${(lowPriority / requirements.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <strong>{lowPriority}</strong>
            </div>

            <div className="ai-box">
              <Brain size={24} />
              <div>
                <h3>AI Prioritization</h3>
                <p>
                  Requirements are scored using stakeholder value, urgency,
                  development risk, and complexity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel requirements-panel">
          <h2>Requirements List</h2>

          {requirements.length === 0 ? (
            <p className="empty-message">
              No requirements added yet. Add your first requirement above.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Score</th>
                    <th>Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {requirements
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((requirement) => (
                      <tr key={requirement.id}>
                        <td>
                          <strong>{requirement.title}</strong>
                          <p>{requirement.description}</p>
                        </td>
                        <td>{requirement.score}</td>
                        <td>
                          <span
                            className={`priority-badge ${requirement.priority.toLowerCase()}`}
                          >
                            {requirement.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;