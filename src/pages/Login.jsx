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
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (isRegister && (!fullname.trim() || !sdt.trim())) {
      setError("Vui lòng nhập đầy đủ thông tin đăng ký");
      return;
    }

    // validate sdt
    if (isRegister && !/^[0-9]+$/.test(sdt)) {
      setError("Số điện thoại chỉ được chứa số");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = isRegister
        ? await register(username, password, fullname, sdt)
        : await login(username, password);

      localStorage.setItem("user", JSON.stringify(user));
      navigate("/chat");
    } catch (e) {
      setError(
        isRegister
          ? "Đăng ký thất bại (username đã tồn tại?)"
          : "Sai tên đăng nhập hoặc mật khẩu"
      );
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
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${!isRegister
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500"}`}
            >
              Đăng nhập
            </button>

            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${isRegister
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500"}`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* username */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập username..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
            />

            {/* password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
            />

            {/* REGISTER EXTRA */}
            {isRegister && (
              <>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />

                <input
                  type="text"
                  value={sdt}
                  onChange={(e) => setSdt(e.target.value)}
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                />
              </>
            )}

            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl"
            >
              {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}