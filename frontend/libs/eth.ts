import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./contract";


export function getProvider(): ethers.BrowserProvider {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.Signer> {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}

export async function getContract(): Promise<ethers.Contract> {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}