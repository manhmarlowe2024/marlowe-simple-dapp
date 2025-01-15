import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const amountRef = useRef<HTMLInputElement>(null);
  const receiverAddrRef = useRef<HTMLInputElement>(null);

  // Options for the dropdown
  const options: string[] = ['Lace', 'Nami', 'Eternl'];

  async function handleSubmit() {
    const amount = amountRef.current?.value || "";
    const receiverAddr = receiverAddrRef.current?.value || "";

    console.log(`The amount you entered is ${amount} ADA`);
    console.log(`The receiver's address you entered is ${receiverAddr}`);
  }

  // Handle selection change
  const handleWalletChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(event.target.value);
  };

  return (
    <div className="container">
      <h1>My Simple DApp</h1>

      <label htmlFor="dropdown">Connect wallet </label>
      <select
        id="dropdown"
        value={selectedWallet}
        onChange={handleWalletChange}
      >
        <option value="" disabled>
          Select a wallet
        </option>
        
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>

      {selectedWallet && (
        <div className="contractParams">
          <div>
            <label htmlFor="amountInput">Amount (ADA): </label>
            <input id="amountInput" type="number" ref={amountRef} />
          </div>
          <div>
            <label htmlFor="receiverAddrInput">Receiver address: </label>
            <input id="receiverAddrInput" type="text" ref={receiverAddrRef} />
          </div>
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}

export default App;
