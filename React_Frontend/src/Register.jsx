import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const nav = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    psw: ""
  });

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async () => {
  try {
    const res = await axios.post("http://localhost:8080/reg", {
      username: data.username,
      email: data.email,
      password: data.psw
    });

    if (res.data === "registration done") {
      alert("Registration successful");
      nav("/Login");
    } else {
      alert(res.data); // "already exists with this username"
    }

  } catch (err) {
    console.error(err);
    alert("Backend not reachable");
  }
};


  return (
    <div>
      <h2>Register Page</h2>

      <input
        name="username"
        placeholder="username"
        value={data.username}
        onChange={change}
      />
      <br />

      <input
        name="email"
        placeholder="gmail"
        value={data.email}
        onChange={change}
      />
      <br />

      <input
        name="psw"
        placeholder="password"
        type="password"
        value={data.psw}
        onChange={change}
      />
      <br />

      <button onClick={submit}>submit</button>
    </div>
  );
}

export default Register;
