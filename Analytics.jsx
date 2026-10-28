
import { useEffect, useState } from "react";
import {
  RefreshCw,
  ChartNoAxesCombined,
  Target,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import "./Analytics.css";

const API_URL = "http://127.0.0.1:5000/api/analytics";
const REQUIREMENTS_URL = "http://127.0.0.1:5000/api/requirements";

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  primary: "#6366f1",
  secondary: "#8b5cf6",
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsResponse, requirementsResponse] =
        await Promise.all([
          fetch(API_URL),
          fetch(REQUIREMENTS_URL),
        ]);

      if (!analyticsResponse.ok) {
        throw new Error("Unable to fetch analytics.");
      }

      if (!requirementsResponse.ok) {
        throw new Error("Unable to fetch requirements.");
      }

      const analyticsData = await analyticsResponse.json();
      const requirementsData = await requirementsResponse.json();

      setAnalytics(analyticsData);
      setRequirements(requirementsData);
    } catch (err) {
      setError(
        err.message ||
        "Could not connect to the analytics backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const priorityData = analytics
    ? [
        {
          name: "High",
          value: Number(analytics.high_priority || 0),
          color: COLORS.high,
        },
        {
          name: "Medium",
          value: Number(analytics.medium_priority || 0),
          color: COLORS.medium,
        },
        {
          name: "Low",
          value: Number(analytics.low_priority || 0),
          color: COLORS.low,
        },
      ]
    : [];

  const factorData = [
    {
      name: "Stakeholder Value",
      value: Number(analytics?.average_stakeholder_value || 0),
      color: COLORS.primary,
    },
    {
      name: "Development Risk",
      value: Number(analytics?.average_development_risk || 0),
      color: COLORS.secondary,
    },
  ];

  const scoreData = requirements.map((requirement) => ({
    name:
      requirement.title?.length > 18
        ? requirement.title.substring(0, 18) + "..."
        : requirement.title,
    score: Number(
      requirement.analysis?.priority_score ??
      requirement.priority_score ??
      0
    ),
  }));

  const getCategory = (requirement) =>
    requirement.analysis?.priority_category ??
    requirement.priority_category ??
    "Low";

  const highCount = requirements.filter(
    (requirement) => getCategory(requirement) === "High"
  ).length;

  const mediumCount = requirements.filter(
    (requirement) => getCategory(requirement) === "Medium"
  ).length;

  const lowCount = requirements.filter(
    (requirement) => getCategory(requirement) === "Low"
  ).length;

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw size={25} className="analytics-loading-icon" />
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <div className="analytics-eyebrow">
            <ChartNoAxesCombined size={16} />
            PROJECT INSIGHTS
          </div>

          <h1>Analytics</h1>

          <p>
            Monitor requirement priorities, risk levels,
            and project-wide prioritization insights.
          </p>
        </div>

        <button
          className="analytics-refresh-button"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="analytics-error">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      <div className="analytics-metrics-grid">
        <div className="analytics-metric-card">
          <div className="analytics-metric-top">
            <span>Total Requirements</span>
            <div className="analytics-metric-icon metric-total">
              <Target size={19} />
            </div>
          </div>

          <h2>{analytics?.total_requirements || 0}</h2>

          <p>Requirements registered</p>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-top">
            <span>Average Priority Score</span>
            <div className="analytics-metric-icon metric-score">
              <TrendingUp size={19} />
            </div>
          </div>

          <h2>
            {Number(
              analytics?.average_priority_score || 0
            ).toFixed(2)}
          </h2>

          <p>Out of 100 points</p>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-top">
            <span>High Priority</span>
            <div className="analytics-metric-icon metric-high">
              <AlertTriangle size={19} />
            </div>
          </div>

          <h2>{analytics?.high_priority || 0}</h2>

          <p>Requirements needing attention</p>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-top">
            <span>Average Risk</span>
            <div className="analytics-metric-icon metric-risk">
              <ShieldCheck size={19} />
            </div>
          </div>

          <h2>
            {Number(
              analytics?.average_development_risk || 0
            ).toFixed(2)}
            <span className="analytics-out-of">/10</span>
          </h2>

          <p>Development risk level</p>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <section className="analytics-chart-card">
          <div className="analytics-chart-heading">
            <div>
              <h2>Priority Distribution</h2>
              <p>Requirements across priority categories</p>
            </div>

            <div className="analytics-chart-icon">
              <PieChartIcon size={18} />
            </div>
          </div>

          <div className="analytics-pie-container">
            {priorityData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {priorityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-chart-empty">
                <PieChartIcon size={30} />
                <p>No priority data available</p>
              </div>
            )}
          </div>

          <div className="analytics-chart-legend">
            {priorityData.map((item) => (
              <div key={item.name}>
                <span
                  className="analytics-legend-dot"
                  style={{ background: item.color }}
                />

                <span>{item.name}</span>

                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-chart-card">
          <div className="analytics-chart-heading">
            <div>
              <h2>Average Factors</h2>
              <p>Stakeholder value and development risk</p>
            </div>

            <div className="analytics-chart-icon">
              <Activity size={18} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={factorData}
              margin={{
                top: 20,
                right: 15,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Average"
                radius={[7, 7, 0, 0]}
                barSize={55}
              >
                {factorData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="analytics-chart-card analytics-score-chart">
        <div className="analytics-chart-heading">
          <div>
            <h2>Requirement Priority Scores</h2>
            <p>Compare calculated priority scores across requirements</p>
          </div>

          <div className="analytics-chart-icon">
            <BarChart3 size={18} />
          </div>
        </div>

        {scoreData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={scoreData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 35,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="score"
                name="Priority Score"
                fill={COLORS.primary}
                radius={[6, 6, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="analytics-chart-empty">
            <BarChart3 size={30} />
            <p>Add requirements to view priority scores.</p>
          </div>
        )}
      </section>

      <section className="analytics-priority-overview">
        <div className="analytics-overview-heading">
          <h2>Priority Overview</h2>
          <p>Current requirement classification</p>
        </div>

        <div className="analytics-overview-grid">
          <div className="analytics-overview-item">
            <span className="analytics-overview-dot overview-high" />
            <div>
              <span>High Priority</span>
              <strong>{highCount}</strong>
            </div>
          </div>

          <div className="analytics-overview-item">
            <span className="analytics-overview-dot overview-medium" />
            <div>
              <span>Medium Priority</span>
              <strong>{mediumCount}</strong>
            </div>
          </div>

          <div className="analytics-overview-item">
            <span className="analytics-overview-dot overview-low" />
            <div>
              <span>Low Priority</span>
              <strong>{lowCount}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
