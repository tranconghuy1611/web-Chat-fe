import { useNavigate } from "react-router-dom";

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">Not Authorized</h1>
        <p className="mt-3 text-gray-600">
          You do not have permission to access this page.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => navigate("/chat")}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Go to Chat
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
