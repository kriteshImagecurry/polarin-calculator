"use strict";
const capacityRange = {
  "50M": {
    id: "50M",
    title: "50 Mbps", //Bandwidth
    polarinCost: 273, //Polarin costs (1xPort, 1xVC)
    polarinPDR: 0.03, //Port Dollar rate per hour
    IILCost: 200, //ILL Costs (1x Port, 1xConnection)
    awsPDR: 0.05, //AWS Port Dollar rate per hour
  },
  "100M": {
    id: "100M",
    title: "100 Mbps",
    polarinCost: 302,
    polarinPDR: 0.06,
    IILCost: 250,
    awsPDR: 0.05,
  },
  "200M": {
    id: "200M",
    title: "200 Mbps",
    polarinCost: 362,
    polarinPDR: 0.08,
    IILCost: 300,
    awsPDR: 0.05,
  },
  "300M": {
    id: "300M",
    title: "300 Mbps",
    polarinCost: 422,
    polarinPDR: 0.12,
    IILCost: 350,
    awsPDR: 0.05,
  },
  "400M": {
    id: "400M",
    title: "400 Mbps",
    polarinCost: 482,
    polarinPDR: 0.16,
    IILCost: 400,
    awsPDR: 0.05,
  },
  "500M": {
    id: "500M",
    title: "500 Mbps",
    polarinCost: 542,
    polarinPDR: 0.2,
    IILCost: 450,
    awsPDR: 0.05,
  },
  "1G": {
    id: "1G",
    title: "1G",
    polarinCost: 844,
    polarinPDR: 0.33,
    IILCost: 700,
    awsPDR: 0.05,
  },
  "2G": {
    id: "2G",
    title: "2G",
    polarinCost: 1300,
    polarinPDR: 0.66,
    IILCost: 1200,
    awsPDR: 0.05,
  },
  "5G": {
    id: "5G",
    title: "5G",
    polarinCost: 2332,
    polarinPDR: 1.65,
    IILCost: 2000,
    awsPDR: 0.05,
  },
  "10G": {
    id: "10G",
    title: "10G",
    polarinCost: 3821,
    polarinPDR: 2.48,
    IILCost: 2500,
    awsPDR: 0.05,
  },
};
const dataTransferOut = {
  10: {
    id: "10TB",
    title: "First 10 TB / Month",
    polarinCostPerGB: 0.045,
    internetCostPerGB: 0.1093,
  },
  40: {
    id: 40,
    title: "Next 40 TB / Month",
    polarinCostPerGB: 0.045,
    internetCostPerGB: 0.085,
  },
  100: {
    id: 100,
    title: "Next 100 TB / Month",
    polarinCostPerGB: 0.045,
    internetCostPerGB: 0.082,
  },
  150: {
    id: 150,
    title: "Greater than 150 TB / Month",
    polarinCostPerGB: 0.045,
    internetCostPerGB: 0.08,
  },
};
const portCharges = 730;

const calculateCost = () => {
  console.log("Calculating cost");
  const inputDataToTransfer = document.getElementById("data-to-transfer").value;
  const inputCapacity = document.getElementById("capacity").value;
  console.log({ inputDataToTransfer, inputCapacity });

  let polarinTCO = calculateTCO(inputCapacity, inputDataToTransfer, "polarin");
  let internetTCO = calculateTCO(
    inputCapacity,
    inputDataToTransfer,
    "internet"
  );

  let [savingsPerYear, savingsPercentage] = calculateSavings(
    polarinTCO,
    internetTCO
  );
  console.log({
    polarinTCO,
    internetTCO,
    savingsPerYear,
    savingsPercentage,
  });
};

const calculateTCO = (inputCapacity, inputDataToTransfer, entity) => {
  //entity can be polarin or internet
  let entitykeyObj = {
    polarin: {
      connectionCharges: "polarinCost",
      PDR: "polarinPDR",
    },
    internet: {
      connectionCharges: "IILCost",
      PDR: "awsPDR",
    },
  };
  let entityObj = entitykeyObj[entity];

  let connectionCharges =
    capacityRange[inputCapacity][entityObj.connectionCharges];

  let awsPortChargesPerMonth =
    portCharges * capacityRange[inputCapacity][entityObj.PDR];

  let dataTransferOutCharges = calculatePortCharges(
    inputDataToTransfer,
    entity
  );

  let totalMRC =
    connectionCharges + awsPortChargesPerMonth + dataTransferOutCharges;

  let OTC = 1;

  let TCOPerYear = OTC * 12 * totalMRC;

  console.log({
    connectionCharges,
    awsPortChargesPerMonth,
    dataTransferOutCharges,
    totalMRC,
    TCOPerYear,
  });

  //set data to table
  document.getElementById(`connection-charges-${entity}`).innerHTML =
    numberToCurrency(connectionCharges);
  document.getElementById(`port-charges-${entity}`).innerHTML =
    numberToCurrency(awsPortChargesPerMonth);
  document.getElementById(`data-out-charges-${entity}`).innerHTML =
    numberToCurrency(dataTransferOutCharges);
  document.getElementById(`total-mrc-${entity}`).innerHTML =
    numberToCurrency(totalMRC);
  document.getElementById(`tco-${entity}`).innerHTML = numberToCurrency(
    TCOPerYear.toFixed(2)
  );
  return TCOPerYear.toFixed(2);
};

const calculatePortCharges = (inputDataToTransfer, entity) => {
  //entity can be polarin or internet
  let entitykeyObj = {
    polarin: "polarinCostPerGB",
    internet: "internetCostPerGB",
  };
  let entityObj = entitykeyObj[entity];
  // inputDataToTransfer is in GB
  let inputDataTransferTB = inputDataToTransfer / 1000;
  let tierArrayMap = Object.keys(dataTransferOut);
  const tier = tierArrayMap.find((tier) => inputDataTransferTB <= tier);
  return dataTransferOut[tier]?.[entityObj] * inputDataToTransfer;
};

const calculateSavings = (polarinTCO, internetTCO) => {
  let savingsPerYear = (polarinTCO - internetTCO).toFixed(2);
  savingsPerYear = savingsPerYear < 1 ? -savingsPerYear : savingsPerYear;
  let savingsPercentage = Math.round((savingsPerYear / polarinTCO) * 100);

  document.getElementById(`savings-per-year`).innerHTML =
    numberToCurrency(savingsPerYear);
  document.getElementById(`savings-percentage`).innerHTML = savingsPercentage;

  return [savingsPerYear, savingsPercentage];
};

const numberToCurrency = (num) => {
  return Number(num).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
// =IF(D48<=10240,D48*E37,
//     IF(D48<=51200,10240*E37+(D48-10240)*E38,
//     IF(D48<=153600,10240*E37+40960*E38+(D48-51200)*E39,
//     10240*E37+40960*E38+102400*E39+(D48-153600)*E40)))
calculateCost()