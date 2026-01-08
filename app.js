const CONTRACT_ADDRESS = "0x4E26557258e09a26F27BC1C9038f76A5F97C7517";

const ABI = [
    {
        "inputs": [],
        "name": "activeMilestone",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
        "name": "getMilestone",
        "outputs": [{
            "components": [
                { "internalType": "uint128", "name": "target", "type": "uint128" },
                { "internalType": "uint128", "name": "raised", "type": "uint128" },
                { "internalType": "uint64", "name": "deadline", "type": "uint64" },
                { "internalType": "bool", "name": "finalized", "type": "bool" },
                { "internalType": "bool", "name": "successful", "type": "bool" },
                { "internalType": "bool", "name": "withdrawn", "type": "bool" }
            ],
            "internalType": "struct CharityMilestoneTracker.Milestone",
            "name": "",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, contract;

const connectBtn = document.getElementById("connectBtn");
const donateBtn = document.getElementById("donateBtn");

async function init() {
    if (!window.ethereum) {
        alert("Install MetaMask first.");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);

    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
        await connect();
    }

    connectBtn.onclick = connect;
}

async function connect() {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const addr = await signer.getAddress();
    connectBtn.innerText = addr.slice(0, 6) + "..." + addr.slice(-4);

    loadMilestone();
}

async function loadMilestone() {
    const id = await contract.activeMilestone();
    const m = await contract.getMilestone(id);

    const raised = ethers.utils.formatEther(m.raised);
    const target = ethers.utils.formatEther(m.target);

    document.getElementById("raised").innerText = raised;
    document.getElementById("target").innerText = target;
    document.getElementById("deadline").innerText =
        new Date(m.deadline * 1000).toLocaleString();

    const percent = Math.min((raised / target) * 100, 100);
    document.getElementById("progressBar").style.width = percent + "%";
}

donateBtn.onclick = async () => {
    if (!contract) return alert("Connect wallet first.");

    const amount = document.getElementById("donateAmount").value;
    if (!amount || amount <= 0) return;

    donateBtn.disabled = true;
    donateBtn.innerText = "Processing...";

    try {
        const tx = await contract.donate({
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        loadMilestone();
        alert("Donation successful. May it count.");
    } catch (e) {
        alert("Transaction failed.");
        console.error(e);
    } finally {
        donateBtn.disabled = false;
        donateBtn.innerText = "Donate";
    }
};

window.onload = init;
