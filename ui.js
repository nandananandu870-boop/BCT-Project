'use strict';

const db = window.chainDB;

// ================= REGISTER =================
const regInput = document.getElementById("registerFileInput");
const regDrop = document.getElementById("registerDrop");
const regHash = document.getElementById("regHashValue");
const regBtn = document.getElementById("registerBtn");

let currentHash = null;

// Click to open file
regDrop.addEventListener("click", () => regInput.click());

// Drag and drop
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

    regHash.innerText = "Computing...";

    const hash = await db.hashFile(file);
    currentHash = hash;

    regHash.innerText = hash;
    regBtn.disabled = false;
}

// Register block
regBtn.addEventListener("click", async () => {
    if (!currentHash) return;

    const owner = document.getElementById("regOwner").value;
    const desc = document.getElementById("regDesc").value;

    const block = await db.addBlock({
        docHash: currentHash,
        fileName: "file",
        fileSize: 0,
        fileType: "",
        owner,
        description: desc
    });

    alert("✅ Block Added!\nBlock #" + block.index);
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
    const hash = await db.hashFile(file);

    const result = db.findByDocHash(hash);

    if (result.length > 0) {
        alert("✅ Verified! Document exists in blockchain");
    } else {
        alert("❌ Not Verified (Tampered or not registered)");
    }
}
// ================= EXPORT & CLEAR =================

const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearChainBtn");

// EXPORT JSON
exportBtn.addEventListener("click", () => {
    if (db.length === 0) {
        alert("No blocks to export!");
        return;
    }

    const data = db.exportJSON();

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "blockchain.json";
    a.click();

    URL.revokeObjectURL(url);
});

// CLEAR CHAIN
clearBtn.addEventListener("click", () => {
    if (db.length === 0) {
        alert("No blocks to clear!");
        return;
    }

    const confirmClear = confirm("Are you sure you want to delete all blocks?");

    if (confirmClear) {
        db.clear();
        alert("Blockchain cleared!");
    }
});


// ================= LEDGER =================
const chainContainer = document.getElementById("chainBlocks");
const emptyMsg = document.getElementById("chainEmpty");
const blockCount = document.getElementById("headerBlockCount");
const docCount = document.getElementById("headerDocCount");

function renderLedger(chain) {
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

// 🔥 IMPORTANT (connect blockchain to UI)
db.onChange(renderLedger);
renderLedger(db.chain);