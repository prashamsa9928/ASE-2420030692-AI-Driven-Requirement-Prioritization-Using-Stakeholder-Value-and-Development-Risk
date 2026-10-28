
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  BrainCircuit,
  ChartNoAxesCombined,
  FlaskConical,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Activity,
} from "lucide-react";

import {
  getRequirements,
  createRequirement,
  deleteRequirement,
  getAnalytics,
} from "./services/api";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import "./App.css";

const initialForm = {
  title: "",
  description: "",
  stakeholder_value: 7,
  development_risk: 5,
  urgency: 5,
  complexity: 5,
};

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Requirements", icon: ListChecks },
  { label: "AI Analysis", icon: BrainCircuit },
  { label: "Analytics", icon: ChartNoAxesCombined },
  { label: "What-if Analysis", icon: FlaskConical },
];

const chartColors = ["#a78bfa", "#60a5fa", "#34d399"];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [requirements, setRequirements] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [requirementData, analyticsData] = await Promise.all([
        getRequirements(),
        getAnalytics(),
      ]);

      setRequirements(Array.isArray(requirementData) ? requirementData : []);
      setAnalytics(analyticsData || {});
    } catch (err) {
      setError(err.message || "Unable to load project data.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createRequirement(form);
      setForm(initialForm);

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save requirement.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRequirement(id);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to delete requirement.");
    }
  }

  const filteredRequirements = requirements.filter((requirement) =>
    (requirement.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [
    { name: "High", value: analytics.high_priority || 0 },
    { name: "Medium", value: analytics.medium_priority || 0 },
    { name: "Low", value: analytics.low_priority || 0 },
  ];

  const analyzedCount = requirements.filter(
    (item) => item.analysis?.priority_category
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <BrainCircuit size={23} />
          </div>

          <div>
            <h2>PrioritAI</h2>
            <span>Requirement Intelligence</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`nav-item ${page === item.label ? "active" : ""}`}
              onClick={() => setPage(item.label)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />

            <div>
              <strong>PrioritAI System</strong>
              <small>Requirement Intelligence</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              REQUIREMENT INTELLIGENCE PLATFORM
            </span>
            <h1>{page}</h1>
          </div>

          <div className="topbar-right">
            <div className="avatar">P</div>

            <div className="profile-text">
              <strong>Project Workspace</strong>
              <span>ASE Course Project</span>
            </div>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-tag">
              <ShieldCheck size={13} />
              REQUIREMENT PRIORITIZATION
            </span>

            <h2>
              Make smarter decisions.
              <br />
              Build what matters.
            </h2>

            <p>
              Prioritize software requirements using stakeholder value,
              development risk, urgency, and complexity.
            </p>
          </div>

          <div className="welcome-art">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="orb-core">
              <BrainCircuit size={34} />
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon={<ListChecks size={20} />}
            color="purple"
            label="Total Requirements"
            value={analytics.total_requirements ?? requirements.length}
          />

          <StatCard
            icon={<ChartNoAxesCombined size={20} />}
            color="blue"
            label="High Priority"
            value={analytics.high_priority ?? 0}
          />

          <StatCard
            icon={<BrainCircuit size={20} />}
            color="orange"
            label="Medium Priority"
            value={analytics.medium_priority ?? 0}
          />

          <StatCard
            icon={<ShieldCheck size={20} />}
            color="green"
            label="Low Priority"
            value={analytics.low_priority ?? 0}
          />
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">REQUIREMENT INPUT</span>
                <h3>Add a requirement</h3>
              </div>

              <div className="panel-icon purple-icon">
                <Plus size={20} />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="requirement-title">Requirement title</label>
              <input
                id="requirement-title"
                required
                value={form.title}
                placeholder="e.g. Secure user authentication"
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <label htmlFor="requirement-description">Description</label>
              <textarea
                id="requirement-description"
                required
                rows={3}
                value={form.description}
                placeholder="Describe the requirement..."
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <RangeField
                label="Stakeholder Value"
                value={form.stakeholder_value}
                onChange={(value) =>
                  setForm({ ...form, stakeholder_value: value })
                }
              />

              <RangeField
                label="Development Risk"
                value={form.development_risk}
                onChange={(value) =>
                  setForm({ ...form, development_risk: value })
                }
              />

              <RangeField
                label="Urgency"
                value={form.urgency}
                onChange={(value) =>
                  setForm({ ...form, urgency: value })
                }
              />

              <RangeField
                label="Complexity"
                value={form.complexity}
                onChange={(value) =>
                  setForm({ ...form, complexity: value })
                }
              />

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                <Sparkles size={17} />
                {loading ? "Analyzing..." : "Analyze & Add Requirement"}
              </button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PRIORITY DISTRIBUTION</span>
                <h3>Requirements overview</h3>
              </div>

              <button
                className="icon-button"
                onClick={loadData}
                title="Refresh data"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-legend">
                {chartData.map((entry, index) => (
                  <div key={entry.name}>
                    <span
                      className="legend-dot"
                      style={{ background: chartColors[index] }}
                    />
                    {entry.name}
                    <strong>{entry.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel requirements-panel">
          <div className="panel-heading requirements-heading">
            <div>
              <span className="eyebrow">REQUIREMENT REGISTER</span>
              <h3>Prioritized requirements</h3>
            </div>

            <div className="search-box">
              <Search size={15} />
              <input
                value={search}
                placeholder="Search requirements"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredRequirements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ListChecks size={28} />
              </div>

              <h4>No requirements yet</h4>
              <p>Add your first requirement using the form above.</p>
            </div>
          ) : (
            filteredRequirements.map((requirement) => (
              <RequirementRow
                key={requirement.id}
                requirement={requirement}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>

        <section className="bottom-summary">
          <div>
            <Activity size={18} />
            <span>AI analyzed requirements</span>
          </div>

          <strong>{analyzedCount} / {requirements.length}</strong>

          <span className="summary-caption">
            Analysis status
          </span>
        </section>

        <footer className="footer">
          <span>PrioritAI · Requirement Intelligence Platform</span>
          <span>ASE Course Project</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RangeField({ label, value, onChange }) {
  return (
    <div className="range-field">
      <div className="range-label">
        <label>{label}</label>
        <strong>
          {value}
          <span>/10</span>
        </strong>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function RequirementRow({ requirement, onDelete }) {
  const analysis = requirement.analysis || {};
  const category = analysis.priority_category || "Unanalyzed";
  const score = analysis.priority_score ?? "—";
  const categoryClass = category.toLowerCase();

  return (
    <div className="requirement-row">
      <div className="requirement-main">
        <div className="requirement-bullet">
          <BrainCircuit size={18} />
        </div>

        <div>
          <h4>{requirement.title}</h4>
          <p>{requirement.description}</p>

          <div className="requirement-meta">
            <span>Value: {requirement.stakeholder_value}/10</span>
            <span>Risk: {requirement.development_risk}/10</span>
            <span>Urgency: {requirement.urgency}/10</span>
            <span>Complexity: {requirement.complexity}/10</span>
          </div>
        </div>
      </div>

      <div className="requirement-actions">
        <div>
          <strong className="score">{score}</strong>
          <span className="score-label">SCORE</span>
        </div>

        <span className={`priority-badge ${categoryClass}`}>
          {category}
        </span>

        <button
          className="icon-button delete-button"
          onClick={() => onDelete(requirement.id)}
          title="Delete requirement"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
