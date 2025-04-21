import axios from "axios";

// Define types for our API responses
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  rank: string;
}

export interface UserStats {
  user_id: number;
  total_attempts: number;
  total_completed_levels: number;
  total_score: number;
  time_spent: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface UserProgress {
  user_id: number;
  level_id: number;
  is_completed: boolean;
  score: number;
  attempts: number;
  last_updated: string;
  level: Level;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  earned_at: string;
}

export interface ProfileData {
  user: User;
  stats: UserStats;
  progress: UserProgress[];
  achievements: Achievement[];
}

// API function to get profile data
export const fetchProfileData = async (): Promise<ProfileData> => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/profile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Failed to load profile data. Please try again later.");
  }
};
