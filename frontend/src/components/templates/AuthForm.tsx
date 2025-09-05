import { ExternalLink, Github } from "lucide-react";
import { useEffect, useState } from "react";
import type React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../atoms/cards";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { Label } from "../atoms/label";
import { Alert, AlertDescription } from "../atoms/alert";
import githubService from "@/lib/github-service";


export const AuthForm = ({ onSuccess }: { onSuccess: () => void }) => {

    const [token, setToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setToken("");

        try {
            githubService.setToken(token);
            //check if the token is valid
            await githubService.getCurrentUser();
        } catch (error) {
            setError('Invalid GitHub token. Please check your token and try again.');
            githubService.clearToken();
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        if (isLoading) {
            setIsLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Github className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">GitHub Authentication</CardTitle>
                    <CardDescription>
                        Enter your GitHub Personal Access Token to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">Personal Access Token</Label>
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Authenticating...' : 'Connect to GitHub'}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                            Don't have a Personal Access Token?
                        </p>
                        <a
                            href="https://github.com/settings/tokens/new?scopes=repo,user&description=GitClient"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-accent hover:underline"
                        >
                            Create one on GitHub
                            <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-2">
                            Required scopes: <code className="bg-secondary px-1 rounded">repo</code>, <code className="bg-secondary px-1 rounded">user</code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}