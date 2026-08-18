import "./styles.css";
export const metadata = { title: "Infrastructure Intelligence", description: "Authorized public infrastructure discovery" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header className="site-header"><a className="brand" href="/"><span className="brand-mark">I</span> Infrastructure Intelligence</a><span className="header-note">Public infrastructure intelligence</span></header><main>{children}</main><footer>Infrastructure Intelligence · Authorized discovery only</footer></body></html>; }
