import { ethers } from "./ethers-5.1.esm.min.js"

const network = [{
    chainName: 'Ethereum',
    chainId: '0x1',
    nativeCurrency: {
        name: 'ether',
        symbol: 'Ξ',
        decimals: 18
    },
},
{
    chainName: 'Rinkeby',
    chainId: '0x4',
    nativeCurrency: {
        name: 'ether',
        symbol: 'Ξ',
        decimals: 18
    },
},
{
    chainName: 'Polygon',
    chainId: '0x89',
    nativeCurrency: {
        name: 'matic',
        symbol: 'MATIC',
        decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    iconUrls: [''],
},
{
    chainName: 'Polygon Testnet Mumbai',
    chainId: '0x13881', // A 0x-prefixed hexadecimal string
    nativeCurrency: {
        name: 'matic',
        symbol: 'MATIC', // 2-6 characters long
        decimals: 18
    },
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    iconUrls: [''],
}
];

const initialize = async () => {
    //You will start here
    console.log('wallet initialized');

    //Basic Actions Section
    let currentAccount = null;
    let contract = null;
    let provider = null;
    const { ethereum } = window;
    const targetChain = network.find(x => x.chainId === chainId);
    const onboardButton = document.getElementById('connectWalletButton');
    const mintAmount = document.getElementById('mintAmount');
    const mintNewNftButton = document.getElementById('mintNewNftButton');
    mintNewNftButton.disabled = true;

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
            showAlert(error.message, 'danger');
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
            return window.location.reload();
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [targetChain],
                    });
                    // We recommend reloading the page, unless you must do otherwise
                    return window.location.reload();
                } catch (addError) {
                    console.log('Did not add network', addError);
                    onboardButton.disabled = false;
                    showAlert(addError.message, 'danger');
                }
            } else {
                // console.log('Did not switch network', switchError);
                onboardButton.disabled = false;
                showAlert(switchError.message, 'danger');
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
                showAlert(err.message, 'danger');
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

            const balanceStr = (+ethers.utils.formatEther(await provider.getBalance(currentAccount))).toFixed(3);
            onboardButton.innerText = shortAddress + '  /  ' + balanceStr + ' ' + targetChain.nativeCurrency.symbol || 'Not able to get accounts';

            ethereum
                .request({ method: 'eth_chainId' })
                .then(handleChainChanged)
                .catch((err) => {
                    // Some unexpected error.
                    console.error(err);
                    showAlert(err.message, 'danger');
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
            onboardButton.innerText = `Switch To ${targetChain.chainName} Network >>`;
            onboardButton.onclick = onClickSwitchChain;
            onboardButton.disabled = false;
            mintNewNftButton.disabled = true;
        } else {
            mintNewNftButton.disabled = false;
            populateUserNft();
        }
    }

    async function populateUserNft() {
        const userCollectionMsg = document.getElementById("userCollectionMsg");
        const userCollectionHolder = document.getElementById("userCollectionHolder");
        const numberNftOwned = (await contract.balanceOf(currentAccount)).toNumber();
        if (numberNftOwned > 0) {
            let collection = '';
            for (let i = 0; i < numberNftOwned; i++) {
                let tokenId = (await contract.tokenOfOwnerByIndex(currentAccount, i)).toNumber();
                collection += `<div class="card mb-2" style="min-width: 252px; max-width: 252px;">
                    <a href="/${projectPath}/asset/${tokenId}">
                        <img src="/${projectPath}/img/${tokenId}" class="card-img-top" alt="">
                    </a>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <div class="h5">#${tokenId}
                            <a href="${openseaAssetUrl}/${contractAddress}/${tokenId}">
                                <img style="width:30px;" class="ml-2" src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"/>
                            </a>
                        </div>
                        <div>
                            <a href="/${projectPath}/asset/${tokenId}" class="btn btn-sm btn-outline-primary">Details</a>
                        </div>
                    </div>
                </div>`;
            }
            userCollectionMsg.innerHTML = '';
            userCollectionHolder.innerHTML = collection;
        } else {
            userCollectionMsg.innerHTML = 'You currently have no NFT.';
            userCollectionHolder.innerHTML = '';
        }
    }

    mintAmount.addEventListener('change', async () => {
        const nftTotalPrice = ($('#mintAmount').val() * mintPrice).toFixed(5);
        $('#mintTotalPrice').html(`NFT for ${nftTotalPrice} ${targetChain.nativeCurrency.name}`);
    });

    mintNewNftButton.addEventListener('click', async () => {
        $('#metamaskAlerts').html('');
        try {
            console.log("About to mint")
            const nftPrice = await contract.getNFTPrice();
            if (!nftPrice) {
                console.log("Cannot find the mint fee, aborting minting")
                return
            }
            const amount = $('#mintAmount').val();
            const tx = await contract.mintAndRefundExcess(amount, { value: nftPrice.mul(amount) })
            handleTransaction(tx);
        } catch (error) {
            console.error(error);
            if (error.data) error = error.data;
            showAlert(error.message, 'danger');
        }
    });

    async function handleTransaction(tx) {
        console.log("Tx is ", tx);

        $('#mintDiv').html('');

        const mintMessage = `<div class="d-flex flex-row">
        <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span></div>
        <div class="pl-5">Transaction in progress.... waiting for confirmation. 
        The transaction hash is <a target='_blank' href='https://etherscan.io/tx/${tx.hash}'>${tx.hash}</a></div></div>`
        showAlert(mintMessage, 'info');

        const confirmed = await tx.wait();
        console.log("confirmed is ", confirmed);
        const events = confirmed.events
        const newTokenEvents = events.filter((e) => e.event === "NewTokenHash")
        console.log(newTokenEvents);

        const numberMinted = newTokenEvents.length;
        const mintSuccessMsg = "You have successfully minted " + numberMinted + " NFT! See your NFT below:"
        showAlert(mintSuccessMsg, 'success');

        const firstTokenId = newTokenEvents[0].args.tokenId.toNumber();
        let html = `<div id="carouselvideo" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">
                <li data-target="#carouselvideo" data-slide-to="0" class="active"></li>`
        for (let i = 1; i < numberMinted; i++) {
            html += `<li data-target="#carouselvideo" data-slide-to="${i}"></li>`;
        }
        html += `</ol>
        <div class="carousel-inner">
            <div class="carousel-item active">
                <div class="d-flex justify-content-center">
                    <div class="embed-responsive embed-responsive-1by1" style="max-width: 400px;">
                        <iframe class="embed-responsive-item" src="/${projectPath}/asset/full/${firstTokenId}"></iframe>
                    </div>
                    <div class="carousel-caption">
                        <h5>New NFT #${firstTokenId}</h5>
                    </div>
                </div>
            </div>`
        for (let i = 1; i < numberMinted; i++) {
            const tokenId = newTokenEvents[i].args.tokenId.toNumber();
            html += `<div class="carousel-item">
                <div class="d-flex justify-content-center">
                    <div class="embed-responsive embed-responsive-1by1" style="max-width: 400px;">
                        <iframe class="embed-responsive-item" src="/${projectPath}/asset/full/${tokenId}"></iframe>
                    </div>
                    <div class="carousel-caption">
                        <h5>New NFT #${tokenId}</h5>
                    </div>
                </div>
            </div>`;
        }

        html += `</div></div>`;
        if (numberMinted > 1) {
            html += `<div class="d-flex justify-content-center">
                <button class="btn-lg btn-secondary" type="button" data-target="#carouselvideo" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Prev</span>
                </button>
                <button class="btn-lg btn-secondary ml-3" type="button" data-target="#carouselvideo" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </button>
            </div>`;
        }
        $('#mintDiv').html(html);

        setTimeout(populateUserNft, 10000);
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
const itemPerPage = 8;
const pageTotal = Math.ceil(totalSupply / itemPerPage);
let currentPage = 1;
$('#galleryPage' + currentPage).addClass('disabled');

$('#galleryPagePrev').click(function () {
    if (currentPage > 1) {
        currentPage--;
        updateGallery();
    }
});
$('#galleryPageNext').click(function () {
    if (currentPage < pageTotal) {
        currentPage++;
        updateGallery();
    }
});
for (let i = 1; i <= pageTotal; i++) {
    $('#galleryPage' + i).click(function () {
        currentPage = i;
        updateGallery();
    });
}

function updateGallery() {
    $('.page-item').removeClass('disabled');
    if (currentPage === 1) $('#galleryPagePrev').addClass('disabled');
    if (currentPage === pageTotal) $('#galleryPageNext').addClass('disabled');
    $('#galleryPage' + currentPage).addClass('disabled');

    let startItem = ((currentPage - 1) * itemPerPage) + 1;
    let endItem = Math.min(totalSupply, currentPage * itemPerPage);
    let tokenId = startItem;
    let html = '';
    for (; tokenId <= endItem; tokenId++) {
        html += `<div class="card mb-2" style="min-width: 252px; max-width: 252px;">
                    <a href="/${projectPath}/asset/${tokenId}">
                        <img src="/${projectPath}/img/${tokenId}" class="card-img-top" alt="">
                    </a>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <div class="h5">#${tokenId}
                            <a href="${openseaAssetUrl}/${contractAddress}/${tokenId}">
                                <img style="width:30px;" class="ml-2" src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"/>
                            </a>
                        </div>
                        <div>
                            <a href="/${projectPath}/asset/${tokenId}" class="btn btn-sm btn-outline-primary">Details</a>
                        </div>
                    </div>
                </div>`
    }
    $('#galleryHolder').html(html);
}

function showAlert(message, status) {
    const alertMsg =
        "<div class='alert alert-" + status + " alert-dismissible fade show' role='alert'>" +
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

