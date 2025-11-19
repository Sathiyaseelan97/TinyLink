import { useEffect, useState } from "react";
import api from "./api/api";

const MainPage = () => {
  const [form, setForm] = useState({ url: "", code: "", title: "" });
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all links
  const loadLinks = async () => {
    try {
      const data = await api.get("/links");
      setLinks(data.data.links);
      console.log("data.links", data.data.links);
    } catch (e) {
      console.error("Failed to load links", e);
    }
  };

  // Initial load
  useEffect(() => {
    loadLinks();
  }, []);

  // Create short link
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post("/links", form);

      setForm({ url: "", code: "", title: "" });
      loadLinks();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a link
  const deleteLink = async (code) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.delete(`/link/${code}`);
      loadLinks();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  // View details
  const viewDetails = async (code) => {
    try {
      const { link } = await api.get(`/link/${code}`);

      const events = (link.events || [])
        .map((e) => `${new Date(e.ts).toLocaleString()} — ${e.ip}`)
        .join("\n");

      alert(
        `Short: ${location.origin}/${link.code}\n` +
          `Original: ${link.url}\n` +
          `Clicks: ${link.clicks}\n\n` +
          `Events:\n${events || "None"}`
      );
    } catch (e) {
      alert("Failed to load details");
    }
  };
  const incrementClick = async (code) => {
    try {
      const { data } = await api.post(`/link/${code}/click`);
      // Update local state to reflect new clicks
      setLinks((prev) =>
        prev.map((l) => (l.code === code ? { ...l, clicks: data.clicks } : l))
      );
    } catch (err) {
      console.error("Failed to increment click", err);
    }
  };

  return (
    <div className="min-h-screen flex items-start w-[100vw] justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10">
          URL Shortener Dashboard
        </h1>

        {/* Form */}
        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <input
            placeholder="Paste long URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
          />

          <input
            placeholder="Custom code (optional)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
          />

          <div className="flex gap-2">
            <input
              placeholder="Title (optional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
            />
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex-shrink-0 disabled:opacity-50 font-semibold"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>

        {/* List */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Your Links
        </h2>

        {links?.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">No links yet.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links?.map((l) => {
            const short = `${location.origin}/${l.code}`;
            return (
              <div
                key={l.code}
                className="bg-white dark:bg-gray-700 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition flex flex-col justify-between"
              >
                {/* Title / URL */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg truncate text-gray-900 dark:text-gray-100">
                    {l.title || l.url}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm truncate">
                    Original:{" "}
                    <a
                      href={l.url}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {l.url}
                    </a>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm truncate">
                    Short:{" "}
                    <a
                      href={short}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {short}
                    </a>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Clicks: {l.clicks}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => viewDetails(l.code)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex-1 font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteLink(l.code)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition flex-1 font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => incrementClick(l.code)}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex-1 font-medium"
                  >
                    Add Click
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
