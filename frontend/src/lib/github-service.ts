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
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/user");
  }

  async getRepositories(): Promise<Repository[]> {
    return this.request<Repository[]>("/user/repos");
  }
}

const BASE_URL = "https://api.github.com";
const INITIAL_TOKEN =
  typeof window !== "undefined"
    ? localStorage.getItem("github_token") ?? ""
    : "";

export const githubService = new GithubService(BASE_URL, INITIAL_TOKEN);
export { GithubService };
export default githubService;
