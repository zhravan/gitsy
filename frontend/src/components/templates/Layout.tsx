import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../atoms/button";
import githubService from "@/lib/github-service";
import { LogOut, Search } from "lucide-react";
import logo from "@/assets/gitsy.png";
import { useState } from "react";
import { Input } from "../atoms/input";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const isAuthenticated = githubService.isAuthenticated();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        githubService.clearToken();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="flex items-center space-x-2">
                                <img src={logo} alt="Gitsy logo" className="h-6 w-6" />
                                <span className="text-lg font-semibold font-brand">Gitsy</span>
                            </Link>

                            {isAuthenticated && (
                                <nav className="hidden md:flex items-center space-x-4">
                                    <Link
                                        to="/repositories"
                                        className={`text-sm px-3 py-2 rounded-md transition-colors ${location.pathname === '/repositories'
                                            ? 'bg-secondary text-secondary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Repositories
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className={`text-sm px-3 py-2 rounded-md transition-colors ${location.pathname === '/profile'
                                            ? 'bg-secondary text-secondary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Profile
                                    </Link>
                                </nav>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated && (
                                <>
                                    <form onSubmit={handleSearch} className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search repositories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-64"
                                        />
                                    </form>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}


export default Layout;