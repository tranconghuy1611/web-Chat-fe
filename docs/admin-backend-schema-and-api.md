# Admin Management Backend (Node.js + Express + MongoDB)

This frontend expects a backend with JWT auth and role-based authorization.

## Database Schema (Mongoose)

```js
// models/User.js
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  fullname: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// models/Group.js
const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
```

## Auth Middleware

```js
// middleware/auth.js
export const requireAuth = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload;
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
```

## Admin Group APIs

All routes below must include `requireAuth` and `requireRole("admin")`.

- `GET /api/admin/groups` - list all groups
- `POST /api/admin/groups` - create group `{ name, description }`
- `PUT /api/admin/groups/:groupId` - update group info
- `GET /api/admin/groups/:groupId/members` - get members in group
- `POST /api/admin/groups/:groupId/members` - add member `{ username }`
- `DELETE /api/admin/groups/:groupId/members/:userId` - remove member

## Route Registration

```js
app.use("/api/admin/groups", requireAuth, requireRole("admin"), adminGroupRouter);
```
