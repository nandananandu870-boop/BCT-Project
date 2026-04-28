'use strict';

let chain = JSON.parse(localStorage.getItem("chain") || "[]");

async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hashBlock(block) {
    const buffer = new TextEncoder().encode(JSON.stringify(block));
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function addBlock(data) {
    const prevHash = chain.length ? chain[chain.length - 1].blockHash : "0";

    const block = {
        index: chain.length + 1,
        timestamp: new Date().toISOString(),
        ...data,
        prevHash
    };

    block.blockHash = await hashBlock(block);

    chain.push(block);
    save();
    notify();

    return block;
}

function findByDocHash(hash) {
    return chain.filter(b => b.docHash === hash);
}

function save() {
    localStorage.setItem("chain", JSON.stringify(chain));
}

function clear() {
    chain = [];
    save();
    notify();
}

function exportJSON() {
    return JSON.stringify(chain, null, 2);
}

async function validate() {
    for (let i = 1; i < chain.length; i++) {
        if (chain[i].prevHash !== chain[i - 1].blockHash) {
            return { valid: false, errors: ["Chain broken"] };
        }
    }
    return { valid: true, errors: [] };
}

let listeners = [];

function notify() {
    listeners.forEach(fn => fn(chain));
}

function onChange(fn) {
    listeners.push(fn);
}

// GLOBAL EXPORT (IMPORTANT)
window.chainDB = {
    get chain() { return chain; },
    get length() { return chain.length; },
    hashFile,
    addBlock,
    findByDocHash,
    clear,
    exportJSON,
    validate,
    onChange
};

window.blockchainUtils = {
    fmtBytes: b => (b / 1024).toFixed(2) + " KB",
    fmtDate: d => new Date(d).toLocaleString(),
    truncHash: (h, n) => h.slice(0, n) + "..."
};