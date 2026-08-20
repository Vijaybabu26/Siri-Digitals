import { supabase } from "../supabase";

export const getDashboardData = async () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const startOfDay =
        today.toISOString();


    const {
        data: orders,
        error
    } = await supabase
        .from("orders")
        .select(`
            *,
            customers (
                name,
                mobile
            )
        `)
        .gte(
            "created_at",
            startOfDay
        )
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }


    const totalOrders =
        orders.length;


    const totalSales =
        orders.reduce(
            (sum, order) =>
                sum + Number(order.total || 0),
            0
        );


    const pendingOrders =
        orders.filter(order =>
            ![
                "COMPLETED",
                "CANCELLED"
            ].includes(order.status)
        ).length;


    const pendingPayments =
        orders.reduce(
            (sum, order) =>
                sum + Number(order.balance || 0),
            0
        );


    return {
        orders,
        totalOrders,
        totalSales,
        pendingOrders,
        pendingPayments
    };
};