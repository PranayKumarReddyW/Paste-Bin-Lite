import { notFound } from "next/navigation";
import { getPaste } from "@/lib/paste";
import { Card } from "@/components/ui/card";

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPaste(id, true);

  if (!paste) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Paste View</h1>
          <a
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Create New Paste
          </a>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-semibold text-slate-700">
                Paste Content
              </h2>
              <div className="flex gap-4 text-sm text-slate-500">
                {paste.remainingViews !== null && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {paste.remainingViews} views remaining
                  </span>
                )}
                {paste.expiresAt && (
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                    Expires: {new Date(paste.expiresAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div
                className="ProseMirror"
                dangerouslySetInnerHTML={{ __html: paste.content }}
              />
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-slate-500">
          <p>This paste is shareable via this URL</p>
        </div>
      </div>
    </div>
  );
}
