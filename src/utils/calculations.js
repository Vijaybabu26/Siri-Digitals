import { supabase } from "./supabase";

export const calculateItemAmount = ({
    pricingType,
    price,
    width = 0,
    height = 0,
    quantity = 1
}) => {

    const rate = Number(price) || 0;
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    const qty = Number(quantity) || 0;

    switch (pricingType) {

        case "FIXED":
            return rate;

        case "PER_PIECE":
            return qty * rate;

        case "PER_SQ_FT":
            return w * h * qty * rate;

        case "PER_SQ_METER":
            return w * h * qty * rate;

        case "PER_100":
            return (qty / 100) * rate;

        case "PER_1000":
            return (qty / 1000) * rate;

        default:
            return 0;
    }
};


export const calculateArea = (
    width,
    height
) => {

    return (
        (Number(width) || 0) *
        (Number(height) || 0)
    );
};


export const calculateOrderTotal = (items) => {

    return items.reduce(
        (total, item) =>
            total + Number(item.amount || 0),
        0
    );
};


export const calculateBalance = (
    total,
    paid
) => {

    return Math.max(
        Number(total || 0) -
        Number(paid || 0),
        0
    );
};