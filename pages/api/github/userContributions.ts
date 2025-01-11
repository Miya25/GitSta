import { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = "https://api.github.com";

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: {
    commits: { sha: string }[];
  };
}

interface ContributionData {
  date: string;
  commits: number;
}

async function fetchWithAuth(url: string, token?: string) {
  const headers: Record<string, string> = token
    ? { Authorization: `token ${token}` }
    : {};
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { username, token } = req.query;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const events: GitHubEvent[] = await fetchWithAuth(
      `${API_BASE_URL}/users/${username}/events?per_page=100`,
      token as string,
    );

    const pushEvents = events.filter((event) => event.type === "PushEvent");

    const contributions = pushEvents.reduce<Record<string, number>>(
      (acc, event) => {
        const date = new Date(event.created_at).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + event.payload.commits.length;
        return acc;
      },
      {},
    );

    const contributionData: ContributionData[] = Object.entries(contributions)
      .map(([date, commits]) => ({ date, commits }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    res.status(200).json(contributionData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
}
