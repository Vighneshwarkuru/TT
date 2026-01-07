import axios from "axios";
import { useState } from "react";

function Home() {
  const name = localStorage.getItem("uname");
  const [details, setDetails] = useState(null);

  const vdetails = async () => {
    if (!name) {
      alert("No username found. Please log in again.");
      return;
    }

    try {
      const res = await axios.get(
  `http://localhost:8080/vdetails/${name}`
);


      setDetails(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not load details");
    }
  };

  return (
    <>
      <h1>Welcome TO Home Page</h1>

      <button onClick={vdetails}>View Your Details</button>

      {details && (
        <div>
          <h3>Your Details:</h3>
          <p>Username: {details.username}</p>
          <p>Email: {details.email}</p>
          <p>password : {details.password}</p>
        </div>
      )}
    </>
  );
}

export default Home;
