import React, { useState } from "react";
import {
  FaGithub,
  FaUsers,
  FaStar,
  FaBook,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { ContributionsChart } from "../components/Layout/charts/ContributionsChart";
import { LanguagesChart } from "../components/Layout/charts/LanguagesChart";

interface UserInfo {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  followers: number;
  hireable?: boolean;
  location?: string;
  twitter_username?: string;
  blog?: string;
  following: number;
}

interface UserData {
  userInfo: UserInfo;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  contributionsChartData: { date: string; commits: number }[];
  languagesData: { name: string; value: number }[];
}

export default function Main() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFromApi = async (
    endpoint: string,
    params: Record<string, string>,
  ) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/github/${endpoint}?${queryString}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  };

  const fetchUserStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUserData(null);

    try {
      const userInfo = await fetchFromApi("userInfo", { username, token });
      const repos = await fetchFromApi("userRepos", { username, token });
      const contributions = await fetchFromApi("userContributions", {
        username,
        token,
      });

      const totalStars = repos.reduce(
        (sum: number, repo: { stargazers_count: number }) =>
          sum + repo.stargazers_count,
        0,
      );
      const totalForks = repos.reduce(
        (sum: number, repo: { forks_count: number }) => sum + repo.forks_count,
        0,
      );

      const languagesData = repos.reduce(
        (acc: Record<string, number>, repo: { language: string }) => {
          if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      setUserData({
        userInfo,
        totalRepos: repos.length,
        totalStars,
        totalForks,
        contributionsChartData: contributions,
        languagesData: Object.entries(languagesData).map(([name, value]) => ({
          name,
          value: Number(value),
        })),
      });

      toast.success("User data fetched successfully!");
    } catch (error) {
      toast.error(
        `Error fetching data: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8">
      <Toaster position="top-right" />
      <motion.h1
        className="text-4xl font-extrabold text-center mb-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaGithub className="inline-block mr-2" />
        GitHub Statistics Viewer
      </motion.h1>
      <motion.h1
        className="text-2xl font-medium text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Your method to seeing your stats!
      </motion.h1>

      <div className="max-w-lg mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Enter GitHub Details
        </h2>
        <p className="text-gray-600 mb-4">
          Provide a username and optional token to fetch stats
        </p>
        <form onSubmit={fetchUserStats} className="space-y-4">
          <input
            type="text"
            placeholder="GitHub Username"
            className="w-full p-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="GitHub Token (optional)"
            className="w-full p-3 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch User"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {userData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="p-6 relative">
              <div className="flex items-center gap-6">
                <img
                  src={userData.userInfo.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userData.userInfo.name || userData.userInfo.login}
                  </h2>
                  <p className="text-gray-600">{userData.userInfo.bio}</p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <FaCalendarAlt /> Joined on{" "}
                    {new Date(
                      userData.userInfo.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* GitHub Link */}
              <div
                onClick={() =>
                  window.open(
                    `https://github.com/${userData.userInfo.login}`,
                    "_blank",
                  )
                }
                className="absolute top-4 right-4 text-purple-500 hover:text-purple-700 transition-colors cursor-pointer"
                title="Go to GitHub Profile"
              >
                <FaGithub className="text-2xl" />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {userData.userInfo.location && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {userData.userInfo.location}
                  </p>
                )}
                {userData.userInfo.blog && (
                  <div
                    onClick={() =>
                      window.open(userData.userInfo.blog, "_blank")
                    }
                    className="flex items-center gap-2 text-black hover:text-blue-700 cursor-pointer"
                    title="Visit Blog"
                  >
                    <span className="font-semibold">Site:</span>{" "}
                    {userData.userInfo.blog}
                  </div>
                )}
                {userData.userInfo.twitter_username && (
                  <div
                    onClick={() =>
                      window.open(
                        `https://twitter.com/${userData.userInfo.twitter_username}`,
                        "_blank",
                      )
                    }
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Visit Twitter"
                  >
                    <span className="font-semibold">Twitter (formally X):</span>{" "}
                    @{userData.userInfo.twitter_username}
                  </div>
                )}
                {userData.userInfo.hireable !== null && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Available for Hire:</span>{" "}
                    {userData.userInfo.hireable ? "Yes" : "No"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div
                className="bg-purple-100 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  window.open(
                    `https://github.com/${username}?tab=followers`,
                    "_blank",
                  )
                }
              >
                <FaUsers className="text-4xl text-black mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-800">
                  {userData.userInfo.followers}
                </p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div
                className="bg-purple-100 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  window.open(
                    `https://github.com/${username}?tab=following`,
                    "_blank",
                  )
                }
              >
                <FaUsers className="text-4xl text-black mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-800">
                  {userData.userInfo.following}
                </p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
              <div
                className="bg-purple-100 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  window.open(
                    `https://github.com/${username}?tab=repositories`,
                    "_blank",
                  )
                }
              >
                <FaBook className="text-4xl text-black mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-800">
                  {userData.totalRepos}
                </p>
                <p className="text-sm text-gray-600">Repositories</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <FaStar className="text-4xl text-black mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-800">
                  {userData.totalStars}
                </p>
                <p className="text-sm text-gray-600">Stars Recieved</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Commit Activity
                </h3>
                <div className="h-64">
                  <ContributionsChart data={userData.contributionsChartData} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Top Languages
                </h3>
                <div className="h-64">
                  <LanguagesChart data={userData.languagesData} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Language Distribution
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userData.languagesData.map((lang) => (
                    <span
                      key={lang.name}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {lang.name}: {lang.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
