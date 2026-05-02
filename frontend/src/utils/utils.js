export const formatToPesos = (centsAmt) => {
    if (centsAmt == null || centsAmt === "") return "N/A";

    // Pad with zero to ensure we always have at least two digits for cents
    // Example: "5" becomes "05"
    const amtStr = String(centsAmt).padStart(2, '0');

    // Slice the string into pesos and cents
    const pesosPart = amtStr.slice(0, -2) || "0";
    const centsPart = amtStr.slice(-2);

    // Format ONLY the integer pesos part with commas, then append cents
    const formattedPesos = parseInt(pesosPart, 10).toLocaleString('en-PH');

    return `₱${formattedPesos}.${centsPart}`;
};