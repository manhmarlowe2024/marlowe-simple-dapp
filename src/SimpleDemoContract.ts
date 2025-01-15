import {Contract, lovelace, Party, datetoTimeout} from "@marlowe.io/language-core-v1";

function mkSimpleDemoContract(amountLoveLace: number, sender: Party, receiver: Party) {
    const bintAmount = BigInt(amountLoveLace);

    const simpleDemoContract: Contract = {
      when: [
        {
          then: "close",
          case: {
            party: sender,
            of_token: lovelace,
            into_account: receiver,
            deposits: bintAmount,
          },
        },
      ],
      timeout_continuation: "close",
      timeout: datetoTimeout(new Date("2025-01-16 12:00:00")),
    };

    return simpleDemoContract;
}

export default mkSimpleDemoContract;