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
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");
  const [showMenu, setShowMenu] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setStatus("connected");
      } catch (error) {
        alert("Access denied MetaMask");
      }
    } else {
      alert("PLease Install MetaMask");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setStatus("disconnected");
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
    <button
      className="rounded-xl bg-yellow-400 text-black tracking-[0.32px] py-2 px-4 group relative"
      tabIndex={0}
      onBlur={() => setShowMenu(false)}
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
  );
};

export default ConnectMetaMask;
