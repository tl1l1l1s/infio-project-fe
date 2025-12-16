import { client } from "./client";

export async function fetchThemes() {
  const response = await client.get("/themes");
  return response.data;
}
