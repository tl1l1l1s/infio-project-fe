export const API_BASE_URL = "http://localhost:8080";

async function request(method, path, { params, body, headers } = {}) {
  const url = buildUrl(path, params);
  const isFormData = body instanceof FormData;

  const options = {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  };

  if (body !== undefined) {
    options.body = typeof body === "string" || isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || "요청에 실패했습니다.");
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}

function buildUrl(path, params) {
  const url = new URL(path, API_BASE_URL);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  return url.toString();
}

export const api = {
  get: (path, options) => request("GET", path, options),
  post: (path, options) => request("POST", path, options),
  patch: (path, options) => request("PATCH", path, options),
  delete: (path, options) => request("DELETE", path, options),
};
