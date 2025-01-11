import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = "https://api.github.com";

async function fetchWithAuth(url: string, token?: string) {
  const headers: Record<string, string> = token ? { Authorization: `token ${token}` } : {};
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return response.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, token } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const userInfo = await fetchWithAuth(`${API_BASE_URL}/users/${username}`, token as string);
    res.status(200).json(userInfo);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
}
