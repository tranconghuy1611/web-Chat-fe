export default function AdminGroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreate,
  onOpenEdit,
}) {
  return (
    <aside className="w-full md:w-80 border-r bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
        <button
          onClick={onOpenCreate}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
        >
          New Group
        </button>
      </div>

      <div className="mt-4 space-y-2 max-h-[calc(100vh-180px)] overflow-auto">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {group.description || "No description"}
                  </p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {group.memberCount ?? 0}
                </span>
              </div>

              <div className="mt-3">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEdit(group);
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Edit
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
