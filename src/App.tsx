import * as wallet from "@marlowe.io/wallet";
import { mkRuntimeLifecycle } from "@marlowe.io/runtime-lifecycle/browser";
import { SupportedWalletName } from "@marlowe.io/wallet/browser";
import {
  Party,
  IDeposit,
  lovelace,
  Input,
  datetoTimeout,
} from "@marlowe.io/language-core-v1";
import mkSimpleDemoContract from "./SimpleDemoContract";
import { ApplyApplicableInputRequest } from "@marlowe.io/runtime-lifecycle/api";
import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const amountRef = useRef<HTMLInputElement>(null);
  const receiverAddrRef = useRef<HTMLInputElement>(null);

  // Options for the dropdown
  const options: string[] = wallet
    .getInstalledWalletExtensions()
    .map((walletExtension) => walletExtension.name)
    .map(
      (walletName) => walletName.charAt(0).toUpperCase() + walletName.slice(1)
    );

  async function handleSubmit() {
    const amount = amountRef.current?.value || "";
    const receiverAddr = receiverAddrRef.current?.value || "";

    console.log(`The amount you entered is ${amount} ADA`);
    console.log(`The receiver's address you entered is ${receiverAddr}`);

    const amtLovelace = parseInt(amount) * 1000000;
    console.log(`We converted that to: ${amtLovelace} Lovelaces`);

    // connect to the runtime instance
    const supportedWallet = selectedWallet.toLowerCase() as SupportedWalletName;
    console.log(`supportedWallet ${supportedWallet}`);
    
    const runtimeLifecycle = await mkRuntimeLifecycle({
      walletName: supportedWallet,
      runtimeURL: "https://preprod.100.runtime.marlowe-lang.org",
    });

    // get inputs from the user
    const browserWallet = await wallet.mkBrowserWallet(supportedWallet);

    // get the address from the contract deployer
    const senderAddr = await browserWallet.getChangeAddress();
    const sender: Party = { address: senderAddr };

    // get the address from the UI
    const receiver: Party = { address: receiverAddr };

    // create the contract from ./src/SimpleDemoContract.ts
    const myContract = mkSimpleDemoContract(amtLovelace, sender, receiver);

    // deploy contract, initiate signing
    const contract = await runtimeLifecycle.newContractAPI.create({
      contract: myContract,
    });

    // wait for confirmation of that transaction
    // we must wait for the contract creation to finalize before deposits are available
    // Wait for the transaction that created the contract to be confirmed on the Cardano blockchain.
    // const contractConfirm = await browserWallet.waitConfirmation(txId);
    await contract.waitForConfirmation();

    // build and submit a deposit
    const bintAmount = BigInt(amtLovelace);

    const deposit: IDeposit = {
      input_from_party: sender,
      that_deposits: bintAmount,
      of_token: lovelace,
      into_account: receiver,
    };

    // prepare deposit input
    const inputs: Input[] = [deposit];

    const depositRequest: ApplyApplicableInputRequest = {
      input: {
        inputs: inputs,
        environment: {
          timeInterval: {
            from: datetoTimeout(new Date("2025-01-15")),
            to: datetoTimeout(new Date("2025-01-16")),
          },
        },
      },
    };

    const depositTxId = await contract.applyInput(depositRequest);

    // verify the deposit
    const depositConfirm = await browserWallet.waitConfirmation(depositTxId);
    console.log(
      `Tx confirmed ${depositConfirm} \nHere is your receipt: ${depositTxId}`
    );
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
