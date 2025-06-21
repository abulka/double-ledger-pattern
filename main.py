#!/usr/bin/env python3
"""
Double Entry Ledger Demo - Water Tank System
Demonstrates how double-entry principles can track variable changes clearly
"""

class DoubleEntryLedger:
    def __init__(self):
        self.transactions = []
        self.balances = {}
    
    def record_transfer(self, description, from_account, to_account, amount):
        """Record a transfer from one account to another"""
        
        # Record the transaction
        transaction = {
            'description': description,
            'from': from_account,
            'to': to_account,
            'amount': amount
        }
        self.transactions.append(transaction)
        
        # Update balances: decrease source, increase destination
        self.balances[from_account] = self.balances.get(from_account, 0) - amount
        self.balances[to_account] = self.balances.get(to_account, 0) + amount
        
        print(f"✓ {description}")
        print(f"  {from_account}: -{amount} (now {self.balances[from_account]})")
        print(f"  {to_account}: +{amount} (now {self.balances[to_account]})")
        print()
    
    def get_balance(self, account):
        return self.balances.get(account, 0)
    
    def print_balances(self):
        print("Current Balances:")
        for account, balance in self.balances.items():
            print(f"  {account}: {balance} liters")
        print()
    
    def verify_conservation(self):
        """Verify that total water is conserved across all accounts"""
        total = sum(self.balances.values())
        print(f"Total water in system: {total} liters")
        return total

# Demo: Water Tank System
ledger = DoubleEntryLedger()

print("=== Water Tank System Demo ===")
print("Tracking water transfers - every drop must come from somewhere and go somewhere")
print()

def show_status():
    ledger.verify_conservation()
    ledger.print_balances()

# Start with water in an external reservoir
ledger.record_transfer(
    "Fill Tank A from reservoir", 
    from_account="External_Reservoir", 
    to_account="Tank_A", 
    amount=100
)
show_status()

# Transfer water between tanks
ledger.record_transfer(
    "Transfer from Tank A to Tank B",
    from_account="Tank_A",
    to_account="Tank_B", 
    amount=30
)
show_status()

# Add more water to Tank A
ledger.record_transfer(
    "Pump water into Tank A",
    from_account="Water_Pump_Source",
    to_account="Tank_A",
    amount=20
)
show_status()

# Tank B springs a leak
ledger.record_transfer(
    "Tank B leaks to ground",
    from_account="Tank_B",
    to_account="Environment",
    amount=5
)
show_status()

# Show results
ledger.print_balances()

def print_dynamic_verification(ledger):
    print("=== Verification ===")
    # Collect all accounts from transactions
    accounts = set()
    for t in ledger.transactions:
        accounts.add(t['from'])
        accounts.add(t['to'])
    for account in sorted(accounts):
        gained = sum(t['amount'] for t in ledger.transactions if t['to'] == account)
        lost = sum(t['amount'] for t in ledger.transactions if t['from'] == account)
        expected = 0 + gained - lost
        # Collect individual transactions for this account
        txns = []
        for t in ledger.transactions:
            if t['to'] == account:
                txns.append(f"+{t['amount']}")
            if t['from'] == account:
                txns.append(f"-{t['amount']}")
        txns_str = ', '.join(txns)
        print(f"{account}: started with 0, gained {gained}, lost {lost} ({txns_str}) = {expected} liters")
        print(f"{account} actual: {ledger.get_balance(account)} liters\n")

print_dynamic_verification(ledger)

# The key insight: water is conserved!
print("=== Conservation Check ===")
total = ledger.verify_conservation()
print("Notice: Total water = 0 because we track sources as negative")
print("This makes sense: we 'borrowed' 120L from external sources,")
print("and now have 90+25+5 = 120L in our system")
print()

print("=== Transaction History ===")
for i, t in enumerate(ledger.transactions, 1):
    print(f"{i}. {t['description']}: {t['amount']}L from {t['from']} to {t['to']}")