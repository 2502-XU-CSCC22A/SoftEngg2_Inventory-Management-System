import styles from "./login.module.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.jpg";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Check if fields are empty
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if(!response.ok){
        setError(data.error || "Login failed");
        return;
      }

      setError("");

      if (data?.user?.is_admin) {
        navigate("/welcomeadmin");
      } else {
        navigate("/welcomeuser");
      }
    }catch (err){
      setError("Server error.");
      console.log(`Error during login: ${err}`);
    } finally{
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // Allow Enter key to submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include"
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data?.user?.is_admin) {
          navigate("/welcomeadmin");
        } else {
          navigate("/welcomeuser");
        }
      } catch { }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className={styles.loginpage}>
      <div className={styles.logincontainer}>
        <div className={styles.welcomeWrapper}>
           <img src={logo} alt="53 One Tech" className={styles.welcomeLogo} />
          <h1 className={styles.welcome}>Welcome User!</h1>
          <p className={styles.welcomeCaption}>Please enter your credentials</p>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <h1 className={styles.usernamefont}>Username:</h1>
        <input 
          type="text" 
          placeholder="Enter Username"
          value={username}
          onChange={handleUsernameChange}
          onKeyPress={handleKeyPress}
        />

        <h1 className={styles.passwordfont}>Password:</h1>
        <input 
          type="password" 
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          onKeyPress={handleKeyPress}
        />

        <button className={styles.loginbutton} onClick={handleLogin} disabled={loading}>
          {loading? "Logging in...": "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;
