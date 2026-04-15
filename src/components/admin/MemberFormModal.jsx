import { useState } from "react";

export default function MemberFormModal({ open, onClose, onSubmit, loading }) {
  const [username, setUsername] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username });
    setUsername("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900">Add Member</h2>

        <div className="mt-4">
          <label className="block text-sm text-gray-700">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Enter username"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
