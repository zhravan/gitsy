import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/cards";
import githubService from "@/lib/github-service";
import { Repository } from "@/lib/interfaces/github";
import { Clock, GitFork, Lock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';

const Repositories = () => {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>('');

    useEffect(() => {
        const fetchRepositories = async () => {
            try {
                const repositories = await githubService.getRepositories();
                setRepositories(repositories);
            } catch (error) {
                setError('Failed to fetch repositories');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRepositories();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Your Repositories</h1>
                <div className="grid gap-4">
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
            </div>
        )
    }

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
                <p className="text-muted-foreground">{repositories.length} repositories</p>
            </div>

            <div className="grid gap-4">
                {repositories.map((repo) => (
                    <Card key={repo.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">
                                        <Link
                                            to={`/repository/${repo.full_name}`}
                                            className="text-accent hover:underline"
                                        >
                                            {repo.name}
                                        </Link>
                                        {repo.private && (
                                            <Lock className="inline ml-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {repo.description || 'No description provided'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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

            {repositories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No repositories found</p>
                </div>
            )}
        </div>
    );


}

export default Repositories;
