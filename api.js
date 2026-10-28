const API_URL = "http://127.0.0.1:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "API request failed");
  }

  return result;
}

export function getRequirements() {
  return request("/requirements");
}

export function createRequirement(data) {
  return request("/requirements", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateRequirement(id, data) {
  return request(`/requirements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function deleteRequirement(id) {
  return request(`/requirements/${id}`, {
    method: "DELETE"
  });
}

export function analyzeRequirement(id) {
  return request(`/requirements/${id}/analyze`, {
    method: "POST"
  });
}

export function getAnalytics() {
  return request("/analytics");
}

export function runWhatIf(data) {
  return request("/what-if", {
    method: "POST",
    body: JSON.stringify(data)
  });
}