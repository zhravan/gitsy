import { useEffect, useState } from "react";
import githubService from "@/lib/github-service";
import { User } from "@/lib/interfaces/github";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/cards";

const Profile = () => {
    const [user, setUser] = useState<User | null>(githubService.getUser());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!user && githubService.isAuthenticated()) {
                try {
                    setIsLoading(true);
                    const fresh = await githubService.getCurrentUser();
                    setUser(fresh);
                } catch (e) {
                    setError("Failed to load profile");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin border-2 border-muted-foreground border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No user data available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Profile</h1>
            </div>

            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full" />
                    <div>
                        <CardTitle className="text-xl">{user.name || user.login}</CardTitle>
                        <CardDescription>@{user.login}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                        {user.bio && <p className="text-foreground">{user.bio}</p>}
                        <div className="flex flex-wrap gap-4">
                            <span>
                                <span className="text-foreground font-medium">Public repos:</span> {user.public_repos}
                            </span>
                            {typeof user.total_private_repos === 'number' && (
                                <span>
                                    <span className="text-foreground font-medium">Private repos:</span> {user.total_private_repos}
                                </span>
                            )}
                            <span>
                                <span className="text-foreground font-medium">Followers:</span> {user.followers}
                            </span>
                            <span>
                                <span className="text-foreground font-medium">Following:</span> {user.following}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Profile;

