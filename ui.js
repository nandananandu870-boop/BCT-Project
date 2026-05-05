'use strict';

// ================= REGISTER =================
const regInput = document.getElementById("registerFileInput");
const regDrop = document.getElementById("registerDrop");
const regFileCard = document.getElementById("registerFileCard");
const regFileName = document.getElementById("regFileName");
const regFileMeta = document.getElementById("regFileMeta");
const regHash = document.getElementById("regHashValue");
const regBtn = document.getElementById("registerBtn");

let currentHash = null;

// Drag drop only (NO click)
regDrop.addEventListener("dragover", e => e.preventDefault());
regDrop.addEventListener("drop", e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
});

// File select
regInput.addEventListener("change", e => {
    handleFile(e.target.files[0]);
});

// Handle file
async function handleFile(file) {
    if (!file) return;

    regFileCard.classList.remove("hidden");
    regFileName.innerText = file.name;
    regFileMeta.innerText = (file.size / 1024).toFixed(2) + " KB";

    regHash.innerText = "⏳ Computing...";

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    currentHash = hash;
    regHash.innerText = hash;

    regBtn.disabled = false;
}

// REGISTER BUTTON
regBtn.addEventListener("click", async () => {
    if (!currentHash) {
        alert("⚠️ Upload file first!");
        return;
    }

    regBtn.innerText = "⏳ Processing...";
    regBtn.disabled = true;

    try {
        const owner = document.getElementById("regOwner").value;
        const desc = document.getElementById("regDesc").value;

        const res = await fetch("http://127.0.0.1:5000/add", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                docHash: currentHash,
                owner,
                description: desc
            })
        });

        const data = await res.json();

        regBtn.innerText = "✅ Added!";
        loadLedger();

    } catch (err) {
        console.error(err);
        regBtn.innerText = "❌ Error";
    }

    setTimeout(() => {
        regBtn.innerText = "Write Block to Chain";
        regBtn.disabled = false;
    }, 2000);
});


// ================= VERIFY =================
const verInput = document.getElementById("verifyFileInput");
const verDrop = document.getElementById("verifyDrop");
const verifyBtn = document.getElementById("verifyBtn");

let verifyHash = null;

// ❌ REMOVE CLICK EVENT HERE (IMPORTANT)

// Drag drop only
verDrop.addEventListener("dragover", e => e.preventDefault());

verDrop.addEventListener("drop", e => {
    e.preventDefault();
    processVerifyFile(e.dataTransfer.files[0]);
});

// File select
verInput.addEventListener("change", e => {
    processVerifyFile(e.target.files[0]);
});

async function processVerifyFile(file) {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    verifyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    verifyBtn.disabled = false;
}

// VERIFY BUTTON
verifyBtn.addEventListener("click", async () => {
    if (!verifyHash) {
        alert("Upload file first!");
        return;
    }

    const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ hash: verifyHash })
    });

    const data = await res.json();

    if (data.found) {
        alert("✅ Verified!");
    } else {
        alert("❌ Not Verified");
    }
});


// ================= EXPORT =================
document.getElementById("exportBtn").addEventListener("click", async () => {
    const res = await fetch("http://127.0.0.1:5000/chain");
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "blockchain.json";
    a.click();

    URL.revokeObjectURL(url);
});


// ================= CLEAR =================
document.getElementById("clearChainBtn").addEventListener("click", async () => {
    await fetch("http://127.0.0.1:5000/clear", {method: "POST"});
    alert("Blockchain cleared!");
    loadLedger();
});


// ================= LEDGER =================
const chainBlocks = document.getElementById("chainBlocks");
const chainEmpty = document.getElementById("chainEmpty");

async function loadLedger() {
    const res = await fetch("http://127.0.0.1:5000/chain");
    const chain = await res.json();

    if (chain.length === 0) {
        chainEmpty.style.display = "block";
        chainBlocks.innerHTML = "";
        return;
    }

    chainEmpty.style.display = "none";
    chainBlocks.innerHTML = "";

    chain.forEach(block => {
        const div = document.createElement("div");
        div.className = "ledger-block";

        div.innerHTML = `
            <strong>Block #${block.index}</strong><br>
            Owner: ${block.owner}<br>
            Hash: ${block.docHash.substring(0, 20)}...<br>
            Time: ${new Date(block.timestamp).toLocaleString()}
        `;

        chainBlocks.appendChild(div);
    });
}

// Load at start
loadLedger();