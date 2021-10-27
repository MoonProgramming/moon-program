import { ethers } from "./ethers-5.1.esm.min.js"

const network = {
    ethereumChain: {
        chainId: '0x1',
    },
    rinkebyChain: {
        chainId: '0x4',
    },
    polygonChain: {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com/'],
        iconUrls: [''],
    },
    mumbaiChain: {
        chainId: '0x13881', // A 0x-prefixed hexadecimal string
        chainName: 'Mumbai Testnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC', // 2-6 characters long
            decimals: 18
        },
        rpcUrls: ['https://rpc-mumbai.matic.today'],
        blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/'],
        iconUrls: [''],
    }
}

const initialize = async () => {
    //You will start here
    console.log('wallet initialized');

    //Basic Actions Section
    let currentAccount = null;
    let contract = null;
    let provider = null;
    let mintPrice = null;
    const { ethereum } = window;
    const targetChain = network.rinkebyChain;
    const onboardButton = document.getElementById('connectWalletButton');
    const mintNewNftButton = document.getElementById('mintNewNftButton');


    function onClickInstall() {
        window.open('https://metamask.io/download.html', '_blank');
    }

    /*********************************************/
    /* Access the user's accounts (per EIP-1102) */
    /*********************************************/
    const onClickConnect = async () => {
        onboardButton.disabled = true;
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
            onboardButton.disabled = false;
            showAlert(error.message);
        }
    };

    const onClickSwitchChain = async () => {
        onboardButton.disabled = true;
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChain.chainId }],
            });
            // We recommend reloading the page, unless you must do otherwise
            window.location.reload();
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [targetChain],
                    });
                    // We recommend reloading the page, unless you must do otherwise
                    window.location.reload();
                } catch (addError) {
                    console.log('Did not add network', addError);
                    onboardButton.disabled = false;
                    showAlert(addError.message);
                }
            } else {
                // console.log('Did not switch network', switchError);
                onboardButton.disabled = false;
                showAlert(switchError.message);
            }
        }
    };

    /*****************************************/
    /* Detect the MetaMask Ethereum provider */
    /*****************************************/
    if (ethereum && ethereum.isMetaMask) {
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('disconnect', handleDisconnect);
        ethereum.on('message', handleMessage);
        provider = new ethers.providers.Web3Provider(ethereum);
        contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());

        ethereum
            .request({ method: 'eth_accounts' })
            .then(handleAccountsChanged)
            .catch((err) => {
                // Some unexpected error.
                // For backwards compatibility reasons, if no accounts are available,
                // eth_accounts will return an empty array.
                console.error(err);
                showAlert(err.message);
            });
    } else {
        console.log('MetaMask not Installed');
        onboardButton.innerText = 'Click here to install MetaMask >>';
        onboardButton.onclick = onClickInstall;
    }

    /***********************************************************/
    /* Handle user accounts and accountsChanged (per EIP-1193) */
    /***********************************************************/
    async function handleAccountsChanged(accounts) {
        console.log('handleAccountsChanged,', 'metamask installed');
        if (accounts.length === 0) {
            currentAccount = null;
            onboardButton.innerText = 'Connect Metamask >>';
            onboardButton.onclick = onClickConnect;
            onboardButton.disabled = false;
            console.log('MetaMask not connected or is locked.');
        } else if (accounts[0] !== currentAccount) {
            currentAccount = accounts[0];
            onboardButton.disabled = true;
            const shortAddress = currentAccount.replace(currentAccount.slice(6, 38), '...');


            const balanceStr = (+ethers.utils.formatEther(await provider.getBalance(currentAccount))).toFixed(3)
            console.log("Wallet balance", balanceStr)

            onboardButton.innerText = shortAddress + '  /  ' + balanceStr + 'ETH' || 'Not able to get accounts';

            ethereum
                .request({ method: 'eth_chainId' })
                .then(handleChainChanged)
                .catch((err) => {
                    // Some unexpected error.
                    console.error(err);
                    showAlert(err.message);
                });
        }
        console.log('currentAccount', currentAccount);
    }

    /**********************************************************/
    /* Handle chain (network) and chainChanged (per EIP-1193) */
    /**********************************************************/
    async function handleChainChanged(_chainId) {
        console.log('handleChainChanged, current chain: ' + _chainId);
        if (_chainId !== targetChain.chainId) {
            onboardButton.innerText = `Switch To Ethereum Network >>`;
            onboardButton.onclick = onClickSwitchChain;
            onboardButton.disabled = false;
        }
    }

    mintNewNftButton.addEventListener('click', async () => {
        try {
            console.log("About to mint")
            const nftPrice = await contract.getNFTPrice()
            if (!nftPrice) {
                console.log("Cannot find the mint fee, aborting minting")
                return
            }
            const nftPrice2 = ethers.utils.formatEther(nftPrice);
            console.log(nftPrice2);
            const tx = await contract.mintAndRefundExcess(1, { value: nftPrice.mul(1) })
            console.log(tx);
            handleTransaction(tx);
        } catch (error) {
            console.error(error)
        }
    });

    async function handleTransaction(tx) {
        console.log("Tx is ", tx)
        mintMessage = `<img src="./images/loading-spinner.gif" width="20px" /> Transaction in progress.... waiting for confirmation. The transaction hash is <a target='_blank' href='https://etherscan.io/tx/${tx.hash}'>${tx.hash}</a>`
        showAlert(mintMessage);
        const confirmed = await tx.wait()
        const events = confirmed.events
        const newTokenEvents = events.filter((e) => e.event === "NewTokenHash")
        console.log(newTokenEvents);
      }

    function handleDisconnect(error) {
        console.log('Metamask disconnected, please connect to MetaMask.');
        console.error(error);
    }

    function handleMessage(message) {
        console.log(message);
    }
};

window.addEventListener('DOMContentLoaded', initialize);

function showAlert(message) {
    const alertMsg =
        "<div class='alert alert-" + 'danger' + " alert-dismissible fade show' role='alert'>" +
        message +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span></button></div>";

    $('#metamaskAlerts').html(alertMsg);
}

// for mobile
// window.addEventListener('ethereum#initialized', initialize, {
//     once: true,
// });
// If the event is not dispatched by the end of the timeout,
// the user probably doesn't have MetaMask installed.
// setTimeout(initialize, 3000); // 3 seconds
