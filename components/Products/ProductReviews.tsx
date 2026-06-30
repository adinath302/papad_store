"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, comment: "", name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      const data = await res.json();
      if (data.error) {
        toast(data.error, "error");
      } else {
        setSubmitted(true);
        setReviews((prev) => [data, ...prev]);
        setAvgRating((prev) => (prev * total + form.rating) / (total + 1));
        setTotal((prev) => prev + 1);
        toast("Review submitted!", "success");
      }
    } catch {
      toast("Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-serif text-stone-900">Reviews</h2>
        {!loading && total > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
              ))}
            </div>
            <span className="text-sm text-stone-500">({total})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-stone-400" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-stone-400 text-sm">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-stone-800">{r.name}</span>
                    <span className="text-[10px] text-stone-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {!submitted && (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h3 className="text-sm font-bold text-stone-800 mb-4">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, rating: s }))}>
                        <Star size={22} className={s <= form.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200 hover:fill-amber-300 transition-colors"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Name</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Comment</label>
                  <textarea value={form.comment} onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))} required rows={3} placeholder="Share your experience..." className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 resize-y" />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:bg-stone-300 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
