import { client } from "./client";

// GET /users
export async function fetchUsers() {
  const response = await client.get("/users");
  return response.data;
}

// POST /users
export async function registerUser(payload) {
  const response = await client.post("/users", payload);
  return response.data;
}

// PATCH /users
export async function updateUser(payload, profileImage) {
  const formData = new FormData();
  formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (profileImage) {
    formData.append("profileImage", profileImage);
  }
  const response = await client.patch("/users", formData);
  return response.data;
}

// PATCH /users/password
export async function updatePassword(payload) {
  const response = await client.patch("/users/password", payload);
  return response.data;
}

// DELETE /users
export async function deleteUser() {
  const response = await client.delete("/users");
  return response.data;
}
