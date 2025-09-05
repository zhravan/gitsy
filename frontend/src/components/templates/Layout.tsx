import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../atoms/button";
import githubService from "@/lib/github-service";
import { LogOut, Moon, Sun } from "lucide-react";
import logo from "@/assets/gitsy.png";
import { useEffect, useState } from "react";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = githubService.isAuthenticated();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch {
            return 'light';
        }
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try { localStorage.setItem('theme', theme); } catch {}
    }, [theme]);

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
                                <img src={logo} alt="Gitsy logo" className="h-6 w-6 shrink-0 object-contain dark:invert md:dark:invert-0" />
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
                                aria-label="Toggle theme"
                                title="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            {isAuthenticated && (
                                <>
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