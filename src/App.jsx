import { useState } from 'react'
import './App.css'
import AppRoutes from './route/AppRoutes';
import Sidebar from './components/chat/Sidebar';
import Chat from './pages/Chat';

function App() {
   const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  // return <>{user ? <Chat user={user} /> : <Login onLogin={setUser} />}</>;
  return (
  <>
  {/* <Chat user={user} />   */}
  <AppRoutes />;
  {/* <Sidebar /> */}
  </>
  )
}

export default App
