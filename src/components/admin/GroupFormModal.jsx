import { useState } from "react";

export default function GroupFormModal({
  open,
  mode = "create",
  group,
  onClose,
  onSubmit,
  loading,
}) {
  const initialState =
    mode === "edit" && group
      ? {
          name: group.name || "",
          description: group.description || "",
        }
      : { name: "", description: "" };
  const [form, setForm] = useState(initialState);

  if (!open) return null;

  const title = mode === "edit" ? "Edit Group" : "Create Group";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Group name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Group description"
              rows={4}
            />
          </div>
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
