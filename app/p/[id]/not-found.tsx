import { Metadata } from "next";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700">
          Paste Not Found
        </h2>
        <p className="text-slate-600 max-w-md">
          This paste may have expired, reached its view limit, or never existed.
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Create New Paste
        </a>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Paste Not Found",
};
