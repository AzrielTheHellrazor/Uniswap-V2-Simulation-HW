import path from "path";
import {writeFileSync, readFileSync} from "fs";

const prompt = require("prompt-sync")();
const filePath = path.resolve(__dirname, "./pool.json");
const data = readFileSync(filePath, "utf-8");


function loadData() {
    return JSON.parse(data);
}

function saveData(data: {pool: any, userBalance: any}) {
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function addLiquidity(amountA: number, amountB: number) {
    const data = loadData();
    const { pool, userBalance} = data;

    if( userBalance.tokenA >= amountA && userBalance.tokenB >= amountB) {
        userBalance.tokenA -= amountA;
        userBalance.tokenB -= amountB;
        pool.tokenA += amountA;
        pool.tokenB += amountB;
        pool.K = pool.tokenA * pool.tokenB;
        console.log("Liquidity added");
        saveData(data);
    }
    else {
        console.log("Not enough funds");
    }
}

function removeLiquidity(amountA: number, amountB: number) {
    const data = loadData();
    const { pool, userBalance} = data;

    if( userBalance.tokenA >= amountA && userBalance.tokenB >= amountB) {
        userBalance.tokenA += amountA;
        userBalance.tokenB += amountB;
        pool.tokenA -= amountA;
        pool.tokenB -= amountB;
        pool.K = pool.tokenA * pool.tokenB;
        console.log("Liquidity removed");
        saveData(data);
    }
    else {
        console.log("Not enough funds");
    }
}

function swap(tokenType: string, swapAmount: number) {
    const data = loadData();
    const { pool, userBalance } = data;

    const FEE_RATE = 0.003;

    if (tokenType === "A") {
        if (userBalance.tokenA < swapAmount) {
            console.log("Not enough TokenA to swap");
            return;
        }

        const inputWithFee = swapAmount * (1 - FEE_RATE);
        const outputAmount = (pool.tokenB * inputWithFee) / (pool.tokenA + inputWithFee);

        userBalance.tokenA -= swapAmount;
        userBalance.tokenB += outputAmount;
        pool.tokenA += swapAmount;
        pool.tokenB -= outputAmount;

        console.log(`Swapped ${swapAmount} TokenA for ${outputAmount.toFixed(2)} TokenB`);
        saveData(data);
    } else if (tokenType === "B") {
        if (userBalance.tokenB < swapAmount) {
            console.log("Not enough TokenB to swap");
            return;
        }

        const inputWithFee = swapAmount * (1 - FEE_RATE);
        const outputAmount = (pool.tokenA * inputWithFee) / (pool.tokenB + inputWithFee);

        userBalance.tokenB -= swapAmount;
        userBalance.tokenA += outputAmount;
        pool.tokenB += swapAmount;
        pool.tokenA -= outputAmount;

        console.log(`Swapped ${swapAmount} TokenB for ${outputAmount.toFixed(2)} TokenA`);
        saveData(data);
    } else {
        console.log("Invalid token type. Choose 'A' or 'B'.");
    }
}


function viewPool() {
    const data = loadData();
    console.log(`TokenA: ${data.pool.tokenA}`)
    console.log(`TokenB: ${data.pool.tokenB}`)
    console.log(`K Constant: ${data.pool.K}`)
}

function viewUser() {
    const data = loadData();
    console.log(`TokenA: ${data.userBalance.tokenA}`)
    console.log(`TokenB: ${data.userBalance.tokenB}`)
}

function main() {
    console.log(`
        === Uniswap V2 Simulation ===
        1. Add Liquidity
        2. Remove Liquidity
        3. Swap
        4. View pool
        5. View User Balance
        6. Exit
        `);
    
    const choice = prompt("Chose your operation (1-5): ");

    switch(choice) {
        case "1":
            const addAmountA = prompt("Enter the amount of A you want to add: ");
            const addAmountB = prompt("Enter the amount of B you want to add: ");
            addLiquidity(Number(addAmountA), Number(addAmountB));
            break;
        case "2":
            const removeAmountA = prompt("Enter the amount of A you want to remove: ");
            const removeAmountB = prompt("Enter the amount of B you want to remove: ");
            removeLiquidity(Number(removeAmountA), Number(removeAmountB));
            break;
        case "3":
            const tokenType = prompt("Enter the type of the token you want to swap: ");
            const swapAmount = prompt("Enter the amount of the token you want to swap: ");
            swap(tokenType, Number(swapAmount));
            break;
        case "4":
            viewPool();
            break;
        case "5":
            viewUser();
            break;
        case "6":
            console.log("See you next time");
            process.exit(0);
        default:
            console.log("Wrong entry");
            break;
    }
}

main();