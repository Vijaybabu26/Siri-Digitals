import { supabase } from "../supabase";

export const getProducts = async () => {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (error) {
        throw error;
    }

    return data;
};


export const getAllProducts = async () => {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

    if (error) {
        throw error;
    }

    return data;
};


export const getProductById = async (id) => {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
};


export const createProduct = async ({
    name,
    pricing_type,
    price,
    unit,
    allow_size,
    description
}) => {

    const { data, error } = await supabase
        .from("products")
        .insert({
            name,
            pricing_type,
            price,
            unit: unit || null,
            allow_size: allow_size || false,
            description: description || null
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};


export const updateProduct = async (
    id,
    {
        name,
        pricing_type,
        price,
        unit,
        allow_size,
        description
    }
) => {

    const { data, error } = await supabase
        .from("products")
        .update({
            name,
            pricing_type,
            price,
            unit: unit || null,
            allow_size: allow_size || false,
            description: description || null,
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


export const deactivateProduct = async (id) => {

    const { error } = await supabase
        .from("products")
        .update({
            is_active: false,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);

    if (error) {
        throw error;
    }
};


export const activateProduct = async (id) => {

    const { error } = await supabase
        .from("products")
        .update({
            is_active: true,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);

    if (error) {
        throw error;
    }
};