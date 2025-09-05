import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/cards";
import githubService from "@/lib/github-service";
import { Repository, User } from "@/lib/interfaces/github";
import { Clock, GitFork, Lock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

const Repositories = () => {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>('');
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [perPage] = useState(20);
    const [totalRepos, setTotalRepos] = useState<number | null>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchRepositories = async () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsLoading(true);
            try {
                const currentUser: User | null = githubService.getUser();
                if (currentUser) {
                    const total = (currentUser.public_repos ?? 0) + (currentUser.total_private_repos ?? 0);
                    setTotalRepos(total);
                }
                const { items, hasNextPage } = await githubService.getRepositoriesPaged({ page, perPage });
                setRepositories(items);
                setHasNextPage(hasNextPage);
            } catch (error) {
                setError('Failed to fetch repositories');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRepositories();
    }, [page]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Your Repositories</h1>
                <div className="flex items-center space-x-4">
                    <form onSubmit={(e) => e.preventDefault()} className="relative">
                        <Input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filter repositories..."
                            className="w-64"
                        />
                    </form>
                    {totalRepos !== null && (
                        <span className="text-sm text-muted-foreground">
                            Total {totalRepos} repos · Page {page}{totalRepos ? ` / ${Math.max(1, Math.ceil(totalRepos / perPage))}` : ''}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page}</span>
                    {isLoading && (
                        <span className="inline-flex items-center" aria-live="polite" aria-busy="true">
                            <span className="h-4 w-4 animate-spin border-2 border-muted-foreground border-t-transparent rounded-full" />
                            <span className="sr-only">Loading</span>
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNextPage || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {repositories
                    .filter((r) => {
                        if (!query.trim()) return true;
                        const q = query.toLowerCase();
                        return (
                            r.name.toLowerCase().includes(q) ||
                            (r.description?.toLowerCase().includes(q) ?? false) ||
                            r.full_name.toLowerCase().includes(q)
                        );
                    })
                    .map((repo) => (
                    <Card key={repo.id} className="hover:shadow-md transition-shadow h-full">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg overflow-hidden min-w-0">
                                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                            <Link
                                                to={`/repository/${repo.full_name}`}
                                                className="text-accent hover:underline truncate block max-w-full flex-1 min-w-0"
                                                title={repo.full_name}
                                            >
                                                {repo.name}
                                            </Link>
                                            {repo.private && (
                                                <Lock className="shrink-0 h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardTitle>
                                    <CardDescription
                                        className="mt-1 line-clamp-2"
                                        title={repo.description || 'No description provided'}
                                    >
                                        {repo.description || 'No description provided'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {repo.language && (
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                                            {repo.language}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 mr-1" />
                                        {repo.stargazers_count}
                                    </div>
                                    <div className="flex items-center">
                                        <GitFork className="h-4 w-4 mr-1" />
                                        {repo.forks_count}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {repositories.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No repositories found</p>
                </div>
            )}
            {repositories.length === 0 && isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-4 bg-secondary rounded w-3/4"></div>
                                <div className="h-3 bg-secondary rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-3 bg-secondary rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );


}

export default Repositories;
