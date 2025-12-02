import { client } from "./client";

// GET /articles/{articleId}/comments
export async function fetchComments(articleId, params) {
  const response = await client.get(`/articles/${articleId}/comments`, { params });
  return response.data;
}

// POST /articles/{articleId}/comments
export async function createComment(articleId, payload) {
  const response = await client.post(`/articles/${articleId}/comments`, payload);
  return response.data;
}

// PATCH /articles/{articleId}/comments/{commentId}
export async function updateComment(articleId, commentId, payload) {
  const response = await client.patch(`/articles/${articleId}/comments/${commentId}`, payload);
  return response.data;
}

// DELETE /articles/{articleId}/comments/{commentId}
export async function deleteComment(articleId, commentId) {
  const response = await client.delete(`/articles/${articleId}/comments/${commentId}`);
  return response.data;
}
