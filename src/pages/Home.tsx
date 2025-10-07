import { Link } from "react-router-dom";

function Home() {
  return <ul>
    <li><Link to="/play">Play</Link></li>
    <li><Link to="/guide">How to Play</Link></li>
    <li><Link to="/settings">Settings</Link></li>
  </ul>
}

export default Home;