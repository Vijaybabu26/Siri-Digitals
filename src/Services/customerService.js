import { supabase } from "../supabase";

export const getCustomers = async () => {

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;
};


export const getCustomerById = async (id) => {

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
};


export const getCustomerByMobile = async (mobile) => {

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile", mobile)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};


export const createCustomer = async ({
    mobile,
    name,
    email
}) => {

    const { data, error } = await supabase
        .from("customers")
        .insert({
            mobile,
            name: name || null,
            email: email || null
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


export const updateCustomer = async (
    id,
    {
        mobile,
        name,
        email
    }
) => {

    const { data, error } = await supabase
        .from("customers")
        .update({
            mobile,
            name: name || null,
            email: email || null,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


export const deleteCustomer = async (id) => {

    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
};


export const getCustomerOrders = async (customerId) => {

    const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (*)
        `)
        .eq("customer_id", customerId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;
};