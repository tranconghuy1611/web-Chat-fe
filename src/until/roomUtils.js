export const isPrivateRoom = (roomId) => roomId?.startsWith("prv_");
export const isGroupRoom = (roomId) => roomId?.startsWith("grp_");
export const getReceiverFromRoomId = (roomId, myUsername) => {
    if (!isPrivateRoom(roomId)) return null;
    // "prv_userA_userB" → ["userA", "userB"]
    const parts = roomId.replace("prv_", "").split("_");
    return parts.find((u) => u !== myUsername) ?? null;
};