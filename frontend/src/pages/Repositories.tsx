import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/cards";
import githubService from "@/lib/github-service";
import { Repository, User } from "@/lib/interfaces/github";
import { Clock, GitFork, Lock, Star, LayoutGrid, Table as TableIcon, ArrowUpDown } from "lucide-react";
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
    const [perPage] = useState(10);
    const [totalRepos, setTotalRepos] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [view, setView] = useState<'table' | 'grid'>(() => {
        try {
            const saved = localStorage.getItem('repo_view');
            return saved === 'grid' ? 'grid' : 'table';
        } catch {
            return 'table';
        }
    });
    const [sortBy, setSortBy] = useState<'name' | 'stars' | 'forks' | 'updated' | 'language'>('updated');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

    useEffect(() => {
        try {
            localStorage.setItem('repo_view', view);
        } catch {
            // ignore storage errors
        }
    }, [view]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }
    const filteredRepos = repositories
        .filter((r) => {
            if (!query.trim()) return true;
            const q = query.toLowerCase();
            return (
                r.name.toLowerCase().includes(q) ||
                (r.description?.toLowerCase().includes(q) ?? false) ||
                r.full_name.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name) * dir;
                case 'language':
                    return (a.language || '').localeCompare(b.language || '') * dir;
                case 'stars':
                    return (a.stargazers_count - b.stargazers_count) * dir;
                case 'forks':
                    return (a.forks_count - b.forks_count) * dir;
                case 'updated':
                default:
                    return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * dir;
            }
        });
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Your Repositories</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setView((v) => v === 'table' ? 'grid' : 'table')}
                        aria-label={view === 'table' ? 'Switch to grid view' : 'Switch to table view'}
                        title={view === 'table' ? 'Switch to grid view' : 'Switch to table view'}
                    >
                        {view === 'table' ? (
                            <LayoutGrid className="h-4 w-4" />
                        ) : (
                            <TableIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>
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
                            {totalRepos} repos · Page {page}{totalRepos ? ` of ${Math.max(1, Math.ceil(totalRepos / perPage))}` : ''}
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

            {view === 'grid' ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    {filteredRepos.map((repo) => (
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
            ) : (
                <div className={`overflow-x-auto transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-b">
                            <tr>
                                <th className="text-left font-medium py-2 pr-4">
                                    <button
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        onClick={() => {
                                            setSortBy((prev) => prev === 'name' ? 'name' : 'name');
                                            setSortDir((prev) => sortBy === 'name' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
                                        }}
                                    >
                                        Name
                                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortBy === 'name' ? 'text-foreground' : ''}`} />
                                    </button>
                                </th>
                                <th className="text-left font-medium py-2 pr-4">Description</th>
                                <th className="text-left font-medium py-2 pr-4">
                                    <button
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        onClick={() => {
                                            setSortBy((prev) => prev === 'language' ? 'language' : 'language');
                                            setSortDir((prev) => sortBy === 'language' ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
                                        }}
                                    >
                                        Language
                                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortBy === 'language' ? 'text-foreground' : ''}`} />
                                    </button>
                                </th>
                                <th className="text-left font-medium py-2 pr-4">
                                    <button
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        onClick={() => {
                                            setSortBy((prev) => prev === 'stars' ? 'stars' : 'stars');
                                            setSortDir((prev) => sortBy === 'stars' ? (prev === 'asc' ? 'desc' : 'asc') : 'desc');
                                        }}
                                    >
                                        Stars
                                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortBy === 'stars' ? 'text-foreground' : ''}`} />
                                    </button>
                                </th>
                                <th className="text-left font-medium py-2 pr-4">
                                    <button
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        onClick={() => {
                                            setSortBy((prev) => prev === 'forks' ? 'forks' : 'forks');
                                            setSortDir((prev) => sortBy === 'forks' ? (prev === 'asc' ? 'desc' : 'asc') : 'desc');
                                        }}
                                    >
                                        Forks
                                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortBy === 'forks' ? 'text-foreground' : ''}`} />
                                    </button>
                                </th>
                                <th className="text-left font-medium py-2">
                                    <button
                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                        onClick={() => {
                                            setSortBy((prev) => prev === 'updated' ? 'updated' : 'updated');
                                            setSortDir((prev) => sortBy === 'updated' ? (prev === 'asc' ? 'desc' : 'asc') : 'desc');
                                        }}
                                    >
                                        Updated
                                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortBy === 'updated' ? 'text-foreground' : ''}`} />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRepos.map((repo) => (
                                <tr key={repo.id} className="border-b last:border-b-0">
                                    <td className="py-3 pr-4 max-w-[280px]">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Link
                                                to={`/repository/${repo.full_name}`}
                                                className="text-accent hover:underline truncate min-w-0"
                                                title={repo.full_name}
                                            >
                                                {repo.name}
                                            </Link>
                                            {repo.private && (
                                                <Lock className="shrink-0 h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground max-w-[420px]">
                                        <span className="truncate block" title={repo.description || 'No description provided'}>
                                            {repo.description || 'No description provided'}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">{repo.language || '-'}</td>
                                    <td className="py-3 pr-4">{repo.stargazers_count}</td>
                                    <td className="py-3 pr-4">{repo.forks_count}</td>
                                    <td className="py-3 whitespace-nowrap">{formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
