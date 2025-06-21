class DoubleEntryLedger {
    constructor() {
        this.transactions = [];
        this.balances = {};
    }

    recordTransfer(description, fromAccount, toAccount, amount) {
        const amt = Number(amount);
        this.transactions.push({ description, from: fromAccount, to: toAccount, amount: amt });
        this.balances[fromAccount] = (this.balances[fromAccount] || 0) - amt;
        this.balances[toAccount] = (this.balances[toAccount] || 0) + amt;
    }

    getBalance(account) {
        return this.balances[account] || 0;
    }

    getAccounts() {
        // All accounts ever used
        const accs = new Set();
        this.transactions.forEach(t => { accs.add(t.from); accs.add(t.to); });
        return Array.from(accs);
    }

    verifyConservation() {
        const total = Object.values(this.balances).reduce((a, b) => a + b, 0);
        return `Total water in system: ${total} liters`;
    }

    printDynamicVerification() {
        let out = '=== Verification ===\n';
        const accounts = this.getAccounts().sort();
        for (const account of accounts) {
            let gained = 0, lost = 0, txns = [];
            for (const t of this.transactions) {
                if (t.to === account) { gained += t.amount; txns.push(`+${t.amount}`); }
                if (t.from === account) { lost += t.amount; txns.push(`-${t.amount}`); }
            }
            const expected = 0 + gained - lost;
            out += `${account}: started with 0, gained ${gained}, lost ${lost} (individual transactions were ${txns.join(", ")}) = ${expected} liters\n`;
            out += `${account} actual: ${this.getBalance(account)} liters\n\n`;
        }
        return out;
    }
}

// --- UI Logic ---
const ledger = new DoubleEntryLedger();
const accountsTable = document.getElementById('accounts-table').querySelector('tbody');
const transactionsTable = document.getElementById('transactions-table').querySelector('tbody');
const outputDiv = document.getElementById('output');

const DEFAULT_ACCOUNTS = [
    'Water_Pump_Source',
    'Tank_A',
    'Tank_B',
    'External_Reservoir',
    'Environment'
];

function clearLedger() {
    ledger.transactions = [];
    ledger.balances = {};
    updateTables();
    outputDiv.textContent = '';
    // Set form defaults
    document.getElementById('desc').value = 'Untitled';
    document.getElementById('from').value = 'Water_Pump_Source';
    document.getElementById('to').value = 'Tank_A';
}

function updateAccountDropdowns() {
    // Always show default accounts, plus any new ones
    const accounts = Array.from(new Set([...DEFAULT_ACCOUNTS, ...ledger.getAccounts()])).sort();
    const fromSel = document.getElementById('from');
    const toSel = document.getElementById('to');
    fromSel.innerHTML = '';
    toSel.innerHTML = '';
    accounts.forEach(acc => {
        const optFrom = document.createElement('option');
        optFrom.value = acc;
        optFrom.textContent = acc;
        fromSel.appendChild(optFrom);
        const optTo = document.createElement('option');
        optTo.value = acc;
        optTo.textContent = acc;
        toSel.appendChild(optTo);
    });
    // Set defaults if present
    fromSel.value = 'Water_Pump_Source';
    toSel.value = 'Tank_A';
}

function updateTables() {
    // Accounts
    accountsTable.innerHTML = '';
    for (const account of ledger.getAccounts().sort()) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${account}</td><td>${ledger.getBalance(account)}</td>`;
        accountsTable.appendChild(row);
    }
    // Transactions
    transactionsTable.innerHTML = '';
    ledger.transactions.forEach((t, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i+1}</td><td>${t.description}</td><td>${t.from}</td><td>${t.to}</td><td>${t.amount}</td>`;
        transactionsTable.appendChild(row);
    });
    updateAccountDropdowns();
}

function resetDemo() {
    ledger.transactions = [];
    ledger.balances = {};
    // Demo transactions
    ledger.recordTransfer('Fill Tank A from reservoir', 'External_Reservoir', 'Tank_A', 100);
    ledger.recordTransfer('Transfer from Tank A to Tank B', 'Tank_A', 'Tank_B', 30);
    ledger.recordTransfer('Pump water into Tank A', 'Water_Pump_Source', 'Tank_A', 20);
    ledger.recordTransfer('Tank B leaks to ground', 'Tank_B', 'Environment', 5);
    updateTables();
    outputDiv.textContent = '';
    // Set form defaults
    document.getElementById('desc').value = 'Untitled';
    document.getElementById('from').value = 'Water_Pump_Source';
    document.getElementById('to').value = 'Tank_A';
}

document.getElementById('transaction-form').onsubmit = function(e) {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const amount = document.getElementById('amount').value;
    ledger.recordTransfer(desc, from, to, amount);
    updateTables();
    // Reset form defaults after submit
    this.reset();
    document.getElementById('desc').value = 'Untitled';
    document.getElementById('from').value = 'Water_Pump_Source';
    document.getElementById('to').value = 'Tank_A';
};

document.getElementById('verify-btn').onclick = function() {
    outputDiv.textContent = ledger.verifyConservation();
};

document.getElementById('dynamic-ver-btn').onclick = function() {
    outputDiv.textContent = ledger.printDynamicVerification();
};

document.getElementById('reset-btn').onclick = function() {
    resetDemo();
};

document.getElementById('clear-btn').onclick = function() {
    clearLedger();
};

// Theme switching logic for radio buttons
const watercssLink = document.getElementById('watercss-link');
const themeRadios = document.querySelectorAll('input[name="theme"]');

function setTheme(theme) {
    if (theme === 'light') {
        watercssLink.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/light.css';
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else if (theme === 'dark') {
        watercssLink.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css';
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        watercssLink.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/water.css';
        document.body.classList.remove('light-theme', 'dark-theme');
    }
    updateOutputTheme(theme);
}

themeRadios.forEach(radio => {
    radio.addEventListener('change', e => {
        if (radio.checked) {
            setTheme(radio.value);
            localStorage.setItem('watercss-theme', radio.value);
        }
    });
});

// On load, restore theme
const savedTheme = localStorage.getItem('watercss-theme') || 'auto';
const radioToCheck = document.getElementById('theme-' + savedTheme);
if (radioToCheck) radioToCheck.checked = true;
setTheme(savedTheme);

// Output area theme fix
function updateOutputTheme(theme) {
    const output = document.getElementById('output');
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        output.style.background = '#222';
        output.style.color = '#fff';
    } else {
        output.style.background = '#f4f4f4';
        output.style.color = '#000';
    }
}

// Initial demo
resetDemo();
