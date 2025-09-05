import { User, Repository } from "./interfaces/github";

class GithubService {
  private baseUrl: string;
  private token: string;
  private user: User | null;

  constructor(baseUrl: string, token: string, initialUser: User | null = null) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.user = initialUser;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("github_token", token);
  }

  clearToken() {
    this.token = "";
    localStorage.removeItem("github_token");
    this.user = null;
    localStorage.removeItem("github_user");
  }

  isAuthenticated() {
    return !!this.token;
  }

  private async request<T>(endpoint: string): Promise<T>;

  private async request<T>(
    endpoint: string,
    options: { includeResponse: true }
  ): Promise<{ data: T; response: Response }>;

  private async request<T>(
    endpoint: string,
    options?: { includeResponse?: boolean }
  ): Promise<T | { data: T; response: Response }> {
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

    const json = (await response.json()) as T;
    if (options?.includeResponse) {
      return { data: json, response };
    }
    return json;
  }

  async getCurrentUser(): Promise<User> {
    const user = await this.request<User>("/user");
    this.setUser(user);
    return user;
  }

  async getRepositories(username?: string): Promise<Repository[]> {
    const endpoint = username ? `/users/${username}/repos` : "/user/repos";
    return this.request<Repository[]>(`${endpoint}?sort=updated&per_page=50`);
  }

  async getRepositoriesPaged(options?: {
    username?: string;
    page?: number;
    perPage?: number;
  }): Promise<{
    items: Repository[];
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const username = options?.username;
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 20;
    const endpoint = username ? `/users/${username}/repos` : "/user/repos";
    const { data: items, response } = await this.request<Repository[]>(
      `${endpoint}?sort=updated&per_page=${perPage}&page=${page}`,
      { includeResponse: true }
    );
    const link = response.headers.get("Link") || response.headers.get("link");
    const hasNextPage = !!(link && link.includes('rel="next"'));
    const hasPrevPage = page > 1;
    return { items, hasNextPage, hasPrevPage };
  }

  setUser(user: User) {
    this.user = user;
    try {
      localStorage.setItem("github_user", JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  }

  getUser(): User | null {
    if (this.user) return this.user;
    try {
      const raw = localStorage.getItem("github_user");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      this.user = parsed;
      return parsed;
    } catch {
      return null;
    }
  }
}

const BASE_URL = "https://api.github.com";
let INITIAL_TOKEN = "";
let INITIAL_USER: User | null = null;
try {
  if (typeof window !== "undefined" && window?.localStorage) {
    INITIAL_TOKEN = localStorage.getItem("github_token") ?? "";
    const userRaw = localStorage.getItem("github_user");
    if (userRaw) {
      try {
        INITIAL_USER = JSON.parse(userRaw) as User;
      } catch {
        INITIAL_USER = null;
      }
    }
  }
} catch {
  INITIAL_TOKEN = "";
  INITIAL_USER = null;
}

export const githubService = new GithubService(
  BASE_URL,
  INITIAL_TOKEN,
  INITIAL_USER
);
export { GithubService };
export default githubService;
