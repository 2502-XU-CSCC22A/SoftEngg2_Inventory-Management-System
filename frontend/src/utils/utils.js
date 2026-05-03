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

export const formatToCents = (pesosStr) => {
    if (pesosStr == null || pesosStr === "") return null;

    if (pesosStr.indexOf('.') === -1) {
        return Number(pesosStr) * 100;
    }
    else {
        const centsStr = pesosStr.replace('.', '');
        return Number(centsStr);
    }
}

export const validatePriceInput = (input) => {
    // Allow only whole numbers or numbers with up to two decimal places
    const regex = /^[0-9]*(\.[0-9][0-9])?$/;
    return regex.test(input);
}