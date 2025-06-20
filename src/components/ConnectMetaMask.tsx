"use client";

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ExitIcon, WalletIcon, ArrowLine } from "./SvgIcon";

declare global {
  interface Window {
    ethereum?: any;
  }
}


interface ConnectMetaMaskProps {
  showSideBar?: boolean;
}

const ConnectMetaMask: React.FC<ConnectMetaMaskProps> = ({ showSideBar }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading">("disconnected");
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setError(null);
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Install from https://metamask.io/");
      return;
    }
    setStatus("loading");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setStatus("connected");
    } catch (error: any) {
      if (error?.code === 4001) {
        setError("Rejected request. Authorize conection in MetaMask.");
      } else if (error?.code === -32002) {
        setError("Pending request. Open MetaMask and approve.");
      } else {
        setError("Unknown Error: " + (error?.message || error));
      }
      setStatus("disconnected");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setStatus("disconnected");
    setError(null);
    setShowMenu(false);
  };

  const fetchBalance = async (accountAddress: string) => {
    if (typeof window.ethereum !== "undefined" && accountAddress) {
      const web3 = new Web3(window.ethereum);
      const weiBalance = await web3.eth.getBalance(accountAddress);
      const ethBalance = web3.utils.fromWei(weiBalance, "ether");
      setBalance(parseFloat(ethBalance).toFixed(4));
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setStatus("connected");
          setError(null);
        } else {
          setAccount(null);
          setStatus("disconnected");
          setBalance(null);
        }
      };
      const handleChainChanged = () => {
        if (account) fetchBalance(account);
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchBalance(account);
    }
  }, [account]);

  return (
    <div className="flex flex-col items-end text-xs md:text-base w-full">
      { error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 mb-2 rounded text-xs w-full">{error}</div>
      )}
      <button
        className="rounded-xl bg-yellow-400 text-black tracking-[0.32px] py-2 px-4 group relative"
        tabIndex={0}
        onBlur={() => setShowMenu(false)}
        disabled={status === "loading"}
      >
        {account ? (
          <>
            <div
              className="lg:flex md:flex-row items-center justify-center text-[12px] lg:text-[16px]"
              onClick={() => setShowMenu((v) => !v)}
            >
              {status}: {account.slice(0, 4)}....{account.slice(-4)}
            </div>
            <div className={`w-[200px] left-0 top-10 ${showMenu ? "" : "hidden"} group-hover:block z-30`}>
              <ul className="border-[0.75px] border-[#89C7B5] rounded-lg bg-[#162923] p-2 mt-2">
                <li>
                  <div className="flex gap-2 items-center text-white p-2">
                    <WalletIcon />
                    <span className="font-mono">{balance !== null ? `${balance} ETH` : "Loading..."}</span>
                  </div>
                </li>
                <li>
                  <button
                    className="flex gap-2 items-center text-[white] tracking-[-0.32px] w-full p-2"
                    onClick={disconnectWallet}
                  >
                    <ExitIcon /> Disconnect
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center gap-1 text-[12px] lg:text-[16px]"
            onClick={connectWallet}
          >
            <WalletIcon />{" "}
            {showSideBar ? (
              <span>Connect MetaMask</span>
            ) : (
              <div>
                <span className="hidden md:inline">Connect MetaMask</span>
                <span className="md:hidden">Connect</span>
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default ConnectMetaMask;
