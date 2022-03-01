import React, { useEffect, useState } from "react";

import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants"


export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;

}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => (
        setFormData((prevState) => ({...prevState, [name]: e.target.value}))
    )

    const getAllTransactions = async() => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map(trans => ({
                addressTo: trans.receiver,
                addressFrom: trans.sender,
                timestamp: new Date(trans.timestamp.toNumber() * 1000).toLocaleString(),
                message: trans.message,
                keyword: trans.keyword,
                amount: parseInt(trans.amount._hex) / (10 ** 18)
            }))
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log("no accounts found")
            }
            console.log(accounts);
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const checkIfTransactionsExist = async() => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch(error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    const sendTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            
            const {addressTo, amount, keyword, message} = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEi
                    value: parsedAmount._hex,
                }]
            })

            const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log("loading")
            console.log(transactionHash.hash);
            await transactionHash.wait();
            setIsLoading(false);
            console.log("success")
            console.log(transactionHash.hash);

            const transactionCount = await transactionContract.getTransactionCount
            setTransactionCount(transactionCount.toNumber());

            window.reload();

        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, 
                                              setFormData, handleChange, sendTransactions, isLoading, transactions }}>
            {children}
        </TransactionContext.Provider >
    )
}