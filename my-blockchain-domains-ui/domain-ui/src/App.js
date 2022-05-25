import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";

function App() {
  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => {
    <div className="connect-wallet-container">
      <img src="https://c.tenor.com/zdh6J5UFtHgAAAAC/stranger-things-netflix.gif" alt="Stranger Things" />
      <button className="cta-button connect-wallet-button">Connect Button</button>
    </div>;
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">Stranger Name Service</p>
              <p className="subtitle">Your domain on blockchain</p>
            </div>
          </header>
        </div>

        {renderNotConnectedContainer()}

        <div className="footer-container">
          <img src={twitterLogo} className="twitter-logo" alt="twitter Logo" />
          <a className="footer-text" target="_blank" href="https://twitter.com/" rel="noreferrer">
            twitterLogo
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
