import { client } from "./client";

// GET /articles
export async function fetchArticles(params) {
  const response = await client.get("/articles", { params });
  return response.data;
}

// GET /articles/{articleId}
export async function fetchArticle(articleId) {
  const response = await client.get(`/articles/${articleId}`);
  return response.data;
}

// POST /articles
export async function createArticle(payload, imageFile) {
  const formData = new FormData();
  formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await client.post("/articles", formData);
  return response.data;
}

// PATCH /articles/{articleId}
export async function updateArticle(articleId, payload, imageFile) {
  const formData = new FormData();
  formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await client.patch(`/articles/${articleId}`, formData);
  return response.data;
}

// DELETE /articles/{articleId}
export async function deleteArticle(articleId) {
  const response = await client.delete(`/articles/${articleId}`);
  return response.data;
}
