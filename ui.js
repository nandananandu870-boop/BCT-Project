'use strict';

// ================= REGISTER =================
const regInput = document.getElementById("registerFileInput");
const regDrop = document.getElementById("registerDrop");
const regHash = document.getElementById("regHashValue");
const regBtn = document.getElementById("registerBtn");

let currentHash = null;

// Click to open file
regDrop.addEventListener("click", () => regInput.click());

// Drag & drop
regDrop.addEventListener("dragover", e => e.preventDefault());

regDrop.addEventListener("drop", e => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
});

// File select
regInput.addEventListener("change", e => {
    handleFile(e.target.files[0]);
});

// Generate hash
async function handleFile(file) {
    if (!file) return;

    regHash.innerText = "Computing...";

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    currentHash = hash;
    regHash.innerText = hash;

    regBtn.disabled = false;
}

// Register block (BACKEND)
regBtn.addEventListener("click", async () => {
    if (!currentHash) return;

    const owner = document.getElementById("regOwner").value;
    const desc = document.getElementById("regDesc").value;

    const res = await fetch("http://127.0.0.1:5000/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            docHash: currentHash,
            owner: owner,
            description: desc
        })
    });

    const data = await res.json();

    alert("✅ Block Added (Backend)\nBlock #" + data.index);

    loadLedger(); // refresh ledger
});


// ================= VERIFY =================
const verInput = document.getElementById("verifyFileInput");
const verDrop = document.getElementById("verifyDrop");

verDrop.addEventListener("click", () => verInput.click());

verDrop.addEventListener("dragover", e => e.preventDefault());

verDrop.addEventListener("drop", e => {
    e.preventDefault();
    verifyFile(e.dataTransfer.files[0]);
});

verInput.addEventListener("change", e => {
    verifyFile(e.target.files[0]);
});

async function verifyFile(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ hash })
    });

    const data = await res.json();

    if (data.found) {
        alert("✅ Verified (Backend)");
    } else {
        alert("❌ Not Verified");
    }
}


// ================= EXPORT =================
const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", async () => {
    const res = await fetch("http://127.0.0.1:5000/chain");
    const data = await res.json();

    if (data.length === 0) {
        alert("No blocks to export!");
        return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "blockchain.json";
    a.click();

    URL.revokeObjectURL(url);
});


// ================= CLEAR =================
const clearBtn = document.getElementById("clearChainBtn");

clearBtn.addEventListener("click", async () => {
    const confirmClear = confirm("Delete all blocks?");
    if (!confirmClear) return;

    await fetch("http://127.0.0.1:5000/clear", {
        method: "POST"
    });

    alert("Blockchain cleared (Backend)");

    loadLedger();
});


// ================= LEDGER =================
const chainContainer = document.getElementById("chainBlocks");
const emptyMsg = document.getElementById("chainEmpty");
const blockCount = document.getElementById("headerBlockCount");
const docCount = document.getElementById("headerDocCount");

async function loadLedger() {
    const res = await fetch("http://127.0.0.1:5000/chain");
    const chain = await res.json();

    blockCount.innerText = chain.length;
    docCount.innerText = chain.length;

    if (chain.length === 0) {
        emptyMsg.style.display = "block";
        chainContainer.innerHTML = "";
        return;
    }

    emptyMsg.style.display = "none";
    chainContainer.innerHTML = "";

    chain.forEach(block => {
        const div = document.createElement("div");

        div.style.border = "1px solid #444";
        div.style.padding = "10px";
        div.style.margin = "10px";
        div.style.borderRadius = "8px";

        div.innerHTML = `
            <strong>Block #${block.index}</strong><br>
            Owner: ${block.owner}<br>
            Hash: ${block.docHash.substring(0, 20)}...<br>
            Time: ${new Date(block.timestamp).toLocaleString()}
        `;

        chainContainer.appendChild(div);
    });
}

// Load on start
loadLedger();