import { client } from "./client";

export async function login(payload) {
  const response = await client.post("/auth/login", payload);
  return response.data;
}

export async function logout() {
  const response = await client.post("/auth/logout");
  return response.data;
}
