import { supabase } from "../supabase";

export const loginUser = async (email, password) => {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        throw error;
    }

    return data;
};

export const logoutUser = async () => {
    const { error } =
        await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};

export const getCurrentUser = async () => {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return user;
};

export const getSession = async () => {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return session;
};

export const resetPassword = async (email) => {
    const { error } =
        await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        throw error;
    }
};