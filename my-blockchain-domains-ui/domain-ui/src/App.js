import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import contractAbi from "./utils/contractABI.json";
import polygonLogo from "./assets/polygonlogo.png";
import ethLogo from "./assets/ethereum.jpeg";
import { networks } from "./utils/networks";

// Constants
const TWITTER_HANDLE = "elonmusk";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const CONTRACT_ADDRESS = "0x572eaDc263C5584dc9E0740ea8DF3B887B557097";
const tld = ".strangers";

const App = () => {
  //Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
  // currentAccount = 0xdB1Ff23Acff7426455988C1789bC5B2BafEA4f81
  const [currentAccount, setCurrentAccount] = useState("");
  const [domain, setDomain] = useState(""); // const domain = ""; setDomain("hello") => const domain = "hello";
  const [record, setRecord] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mints, setMints] = useState([]);

  // Create a State for the network
  const [network, setNetwork] = useState(""); // network = "";

  const connectWallet = async () => {
    try {
      const { ethereum } = window; //const ethereum = window.

      if (!ethereum) {
        alert("GO to Metamask, => https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai Testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it the their metamask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                  chainName: "Polygon Mumbai Testnet",
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExploreUrls: ["https://mumbai.polygonscan.com/"],
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          // If window does not have ethereum, try to install Metamask
          alert("Install Metamask");
        }
      }
    }
  };

  const checkIfWalletIsConnected = async () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // Users can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }

    // Check user's network chain Id
    const chainId = await ethereum.request({ method: "eth_chainId" });
    setNetwork(networks[chainId]);

    // Reload the page when they change networks
    const handleChainChange = () => {
      window.location.reload();
    };

    ethereum.on("chainChange", handleChainChange);
  };

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) return;

    // Alert if the domain name is short
    if (domain.length < 3) {
      alert("Domain must be at least 3 characters long");
      return;
    }

    const price = domain.length === 3 ? "0.5" : domain.length === 4 ? "0.3" : "0.1";

    console.log("Minting domain", domain, "with price", price);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        console.log("Going to pop wallet now to pay gas....");
        let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Check if the transaction was successfully mined
        if (receipt.status === 1) {
          console.log(`Domain minted! https://mumbai.polygonscan.com/tx/${tx.hash}`);

          // Set the record for the Domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();

          console.log(`Record set!https://mumbai.polygonscan.com/tx/${tx.hash}`);

          // Call fetchMints after 3 seconds
          setTimeout(() => {
            fetchMints();
          }, 3000);

          setDomain("");
          setRecord("");
        } else {
          alert("Transaction failed! please try again");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateDomain = async () => {
    if (!record || !domain) {
      return;
    }
    setLoading(true);
    console.log("Updating domain ", domain, "with record ", record);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        let tx = await contract.setRecord(domain, record);
        await tx.wait();
        console.log(`Record Set https://mumbai.polygonscan.com/tx/${tx.hash}`);

        fetchMints();
        setRecord("");
        setDomain("");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://c.tenor.com/zdh6J5UFtHgAAAAC/stranger-things-netflix.gif" alt="Stranger Things gif" />
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
    </div>
  );

  const typingDomain = (e) => {
    setDomain(e.target.value);
  };

  // Form to enter domain name and data
  const renderInputForm = () => {
    if (network !== "Polygon Mumbai Testnet") {
      return (
        <div className="connect-wallet-container">
          <h2>Please connect to the Polygon Mumbai Testent</h2>
          <button className="cta-button mint-button" onClick={switchNetwork}>
            Click here
          </button>
        </div>
      );
    }

    return (
      <div className="form-container">
        <div className="first-row">
          <input type="text" value={domain} placeholder="domain" onChange={typingDomain} />
          <p className="tld"> {tld} </p>
        </div>

        <input
          type="text"
          value={record}
          placeholder="What is your stranger?"
          onChange={(e) => setRecord(e.target.value)}
        />

        {/* If the editing variable is true, return the "Set Record" and "Cancel" Button */}
        {editing ? (
          <div className="button-container">
            <button className="cta-button mint-button" disabled={loading} onClick={updateDomain}>
              Set Record
            </button>
            <button
              className="cta-button mint-button"
              onClick={() => {
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className="cta-button mint-button" disabled={loading} onClick={mintDomain}>
            Mint
          </button>
        )}
        {/* <div className="button-container">
          <button className="cta-button mint-button" onClick={mintDomain}>
            Mint
          </button>
          <button className="cta-button mint-button" onClick={null}>
            Set Data
          </button>
        </div> */}
      </div>
    );
  };

  const fetchMints = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

        // Get All the domain names from out contract

        const names = await contract.getAllNames();

        // For each name, get the record and the address
        const mintRecords = await Promise.all(
          names.map(async (name) => {
            const mintRecord = await contract.records(name);
            const owner = await contract.domains(name);
            return {
              id: names.indexOf(name),
              name: name,
              record: mintRecord,
              owner: owner,
            };
          })
        );
        console.log("Mintes Fetched ", mintRecords);
        setMints(mintRecords);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle"> Recently minted domains!</p>
          <div className="mint-list">
            {mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <div className="mint-row">
                    <a
                      className="link"
                      href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="underlined">
                        {" "}
                        {mint.name}
                        {tld}{" "}
                      </p>
                    </a>
                    {/* If mint.owner is currentAccount, add an "edit" button*/}
                    {mint.owner.toLowerCase() === currentAccount.toLowerCase() ? (
                      <button className="edit-button" onClick={() => editRecord(mint.name)}>
                        <img
                          className="edit-icon"
                          src="https://img.icons8.com/metro/26/000000/pencil.png"
                          alt="Edit button"
                        />
                      </button>
                    ) : (
                      <button className="edit-button" disabled={true}>
                        <img
                          className="edit-icon"
                          src="https://img.icons8.com/metro/26/000000/pencil.png"
                          alt="Edit button"
                        />
                      </button>
                    )}
                  </div>
                  <p> {mint.record} </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  // This will take us into edit mode and show us the edit buttons!
  const editRecord = (name) => {
    console.log("Editing record for", name);
    setEditing(true);
    setDomain(name);
  };

  useEffect(() => {
    if (network === "Polygon Mumbai Testnet") {
      fetchMints();
    }
    console.log("mints ", mints);
  }, [currentAccount, network]);

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">🐱‍👤 Stranger Name Service</p>
              <p className="subtitle">Your immortal API on the blockchain!</p>
            </div>

            <div className="right">
              <img alt="Network Logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
              {currentAccount ? (
                <p>
                  Wallet: {currentAccount.slice(0, 6)}... {currentAccount.slice(-4)}
                </p>
              ) : (
                <p>Not Connected</p>
              )}
            </div>
          </header>
        </div>

        {/* Add your render method here */}
        {!currentAccount && renderNotConnectedContainer()}

        {/* Render the input form if an account is connected */}
        {currentAccount && renderInputForm()}

        {/* Render mints */}
        {mints && renderMints()}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">
            {`built with @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
