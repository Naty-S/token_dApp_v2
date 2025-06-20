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
  const [showMenu, setShowMenu] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } catch (error) {
        alert("Access denied MetaMask");
      }
    } else {
      alert("PLease Install MetaMask");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setShowMenu(false);
  };


  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
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
            {account.slice(0, 4)}....{account.slice(-4)}
          </div>
          <div className={`w-[200px] left-0 top-10 ${showMenu ? "" : "hidden"} group-hover:block z-30`}>
            <ul className="border-[0.75px] border-[#89C7B5] rounded-lg bg-[#162923] p-2 mt-2">
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
