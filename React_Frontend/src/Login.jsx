import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const nav = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      const res = await axios.post("http://localhost:8080/login", {
        username: data.username,
        password: data.password
      });

      if (res.data === "success") {
        localStorage.setItem("uname", data.username);
        alert("Login successful");
        nav("/h");
      } else {
        alert("Invalid username or password");
        nav("/Login");
      }

    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        name="username"
        placeholder="Username"
        value={data.username}
        onChange={change}
      />
      <br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={change}
      />
      <br />

      <button onClick={submit}>Login</button>
    </div>
  );
}

export default Login;
