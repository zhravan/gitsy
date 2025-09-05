import { User, Repository } from "./interfaces/github";

class GithubService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("github_token", token);
  }

  clearToken() {
    this.token = "";
    localStorage.removeItem("github_token");
  }

  isAuthenticated() {
    return !!this.token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : "",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status}`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data && typeof data.message === "string") {
              errorMessage = `${errorMessage} - ${data.message}`;
            } else {
              errorMessage = `${errorMessage} - ${text}`;
            }
          } catch {
            errorMessage = `${errorMessage} - ${text}`;
          }
        }
      } catch {
        // ignore parsing errors
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/user");
  }

  async getRepositories(username?: string): Promise<Repository[]> {
    const endpoint = username ? `/users/${username}/repos` : "/user/repos";
    return this.request<Repository[]>(`${endpoint}?sort=updated&per_page=50`);
  }
}

const BASE_URL = "https://api.github.com";
let INITIAL_TOKEN = "";
try {
  if (typeof window !== "undefined" && window?.localStorage) {
    INITIAL_TOKEN = localStorage.getItem("github_token") ?? "";
  }
} catch {
  INITIAL_TOKEN = "";
}

export const githubService = new GithubService(BASE_URL, INITIAL_TOKEN);
export { GithubService };
export default githubService;
