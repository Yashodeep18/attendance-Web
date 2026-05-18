import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-black">404</h1>
      <p className="mt-3 text-slate-600">Page not found.</p>
      <Link to="/" className="btn-primary mt-6">Go Home</Link>
    </main>
  );
};

export default NotFound;
