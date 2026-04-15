export default function GroupMembersPanel({
  group,
  members,
  loading,
  onOpenAddMember,
  onKickMember,
}) {
  if (!group) {
    return (
      <section className="flex-1 flex items-center justify-center text-gray-500">
        Select a group to manage details and members.
      </section>
    );
  }

  return (
    <section className="flex-1 p-6 bg-gray-50">
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
            <p className="mt-1 text-gray-600">{group.description || "No description"}</p>
          </div>
          <button
            onClick={onOpenAddMember}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Group Members</h2>

        {loading ? (
          <p className="mt-4 text-gray-500">Loading members...</p>
        ) : (
          <div className="mt-4 divide-y">
            {members.length === 0 ? (
              <p className="text-gray-500">No members yet.</p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id || member.userId || member.username}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.fullname || member.username}
                    </p>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  </div>
                  <button
                    onClick={() => onKickMember(member)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                  >
                    Kick
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
