"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload: any = { content };

      if (ttlSeconds) {
        payload.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        payload.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
      setContent("");
      setTtlSeconds("");
      setMaxViews("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="text-center pt-12 pb-6">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            Pastebin Lite
          </h1>
          <p className="text-lg text-slate-600">
            Share text snippets with optional expiry and view limits
          </p>
        </header>

        <Card className="p-8 shadow-xl bg-white/80 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-base font-semibold">
                Paste Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[200px] resize-y font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ttl" className="text-base font-semibold">
                  Expiry Time (seconds)
                </Label>
                <Input
                  id="ttl"
                  type="number"
                  min="1"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  placeholder="Optional (e.g., 3600 for 1 hour)"
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">
                  Leave empty for no expiry
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxViews" className="text-base font-semibold">
                  Max Views
                </Label>
                <Input
                  id="maxViews"
                  type="number"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="Optional (e.g., 10)"
                  className="font-mono"
                />
                <p className="text-xs text-slate-500">
                  Leave empty for unlimited views
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? "Creating Paste..." : "Create Paste"}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">Success</Badge>
                <span className="text-sm font-medium text-green-800">
                  Paste created successfully!
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-green-900">
                  Shareable URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={result.url}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(result.url)}
                    variant="outline"
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-900 underline font-medium"
                >
                  View your paste →
                </a>
              </div>
            </div>
          )}
        </Card>

        <footer className="text-center text-sm text-slate-500 pb-12">
          <p>Pastes can expire based on time or view count limits</p>
        </footer>
      </div>
    </div>
  );
}
