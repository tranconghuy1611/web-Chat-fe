import { useState } from "react";
import { login, register } from "../services/authApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [sdt, setSdt] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập username và mật khẩu");
      return;
    }

    if (isRegister && (!fullname.trim() || !sdt.trim())) {
      setError("Vui lòng nhập đầy đủ thông tin đăng ký");
      return;
    }

    setLoading(true);
    setError("");   // ← Luôn xóa error trước

    try {
      if (isRegister) {
        await register(username, password, fullname, sdt);
        setIsRegister(false);
        setError("Đăng ký thành công! Hãy đăng nhập.");
        setFullname("");
        setSdt("");
        setPassword("");
        return;
      }

      // LOGIN
      const res = await login(username, password);

      if (!res?.accessToken) {
        setError("Không nhận được token từ server");
        return;
      }

      // Lưu thông tin
      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("userId", res.id?.toString());
      localStorage.setItem("username", res.username);
      localStorage.setItem("fullname", res.fullname);
      localStorage.setItem("role", res.role);

      console.log("✅ Đăng nhập thành công, chuyển trang...");
      navigate("/chat");

    } catch (err) {
      console.error("Login error:", err);

      // Chỉ hiện lỗi khi thật sự thất bại
      if (err.response) {
        // Server trả về lỗi (400, 401, 403...)
        setError(err.response.data?.message || "Sai tên đăng nhập hoặc mật khẩu");
      } else if (err.request) {
        // Network error nhưng login lại thành công (hiếm)
        console.warn("Network error nhưng có thể đã login thành công");
        // Không setError ở đây nếu đã navigate
      } else {
        setError("Đã xảy ra lỗi, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WebChat</h1>
          <p className="text-gray-500 text-sm mt-1">Kết nối mọi người, mọi lúc</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${!isRegister ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${isRegister ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mật khẩu"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />

            {isRegister && (
              <>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-medium transition"
            >
              {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}