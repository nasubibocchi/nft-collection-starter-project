import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = "nasubibocchi";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const RARIBLE_LINK =
  "https://testnet.rarible.com/explore/search/0xC4883c9899D4d9abC128aC23EA7e86f9Aad3eb37/collections";
const TOTAL_MINT_COUNT = 60;

const CONTRACT_ADDRESS = "0xC4883c9899D4d9abC128aC23EA7e86f9Aad3eb37";

const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);

  const [currentNftCount, setCurrentNftCount] = useState("");
  const [isLoading, setIsLoading] = useState("");

  // ユーザーがMetaMaskを持っているか確認
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x4 は　Rinkeby の ID です。
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);

      // イベントリスナーを設定
      setUpEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // イベントリスナーを設定
      setUpEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setUpEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId, nftCount) => {
          console.log(from, tokenId.toNumber(), nftCount.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setCurrentNftCount(nftCount.toNumber());
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");

        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...plese wait.");
        setIsLoading("Loading...");

        await nftTxn.wait();
        setIsLoading("");

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onPressRalibleButton = () => {
    window.open(RARIBLE_LINK, "_blank");
  };

  // ページがロードされたときに呼び出される
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // renderNotConnectedContainer メソッド（ Connect to Wallet を表示する関数）を定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  // Mint NFT ボタンをレンダリングするメソッドを定義します。
  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
          <div className="sub-sub-text">
            <text>※Mint 1回につき 1weiかかります</text>
          </div>
        </div>
        {isLoading !== "" && <div className="loading-text"> {isLoading}</div>}
        {currentNftCount !== "" && (
          <div className="body-container">
            <p className="sub-text">
              これまでに作成された {TOTAL_MINT_COUNT - currentNftCount} /{" "}
              {TOTAL_MINT_COUNT} NFT
            </p>
          </div>
        )}
        <div className="footer-components">
          <div className="Rarible-link">
            <button
              onClick={onPressRalibleButton}
              className="cta-button rarible-link-button"
            >
              Raribleでコレクションを表示
            </button>
          </div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
