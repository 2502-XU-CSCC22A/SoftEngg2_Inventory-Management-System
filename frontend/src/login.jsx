import styles from "./login.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Check if fields are empty
    if (!username) {
      setError("Please enter your username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Check credentials
    if (username === "admin" && password === "password") {
      setError("");
      navigate("/welcomeadmin");
    } else if (username === "user" && password === "password") {
      setError("");
      navigate("/welcomeuser");
    } else {
      setError("Invalid username or password. Please try again.");
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

  return (
    <div className={styles.loginpage}>
      <div className={styles.logincontainer}>
        <div className={styles.welcomeWrapper}>
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

        <button className={styles.loginbutton} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
