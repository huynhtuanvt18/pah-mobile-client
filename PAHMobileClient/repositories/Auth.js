async function login(axiosContext, userInfo) {
    const loginPath = `/customer/login`;
    try {
        let responseData = await axiosContext.publicAxios.post(loginPath, userInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        let user = {};
        user.accessToken = responseUser.accessToken  ?? '';
        user.refreshToken = responseUser.refreshToken ?? '';
        
        return user;
    } catch (error) {
        throw error;
    }
}

async function loginWithGoogle(axiosContext, userInfo) {
    const loginPath = `/login/google`;
    try {
        let responseData = await axiosContext.publicAxios.post(loginPath, userInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        let user = {};
        user.accessToken = responseUser.accessToken  ?? '';
        user.refreshToken = responseUser.refreshToken ?? '';
        
        return user;
    } catch (error) {
        throw error;
    }
}

async function register(axiosContext, userInfo) {
    const registerPath = `/register`;
    try {
        let responseData = await axiosContext.publicAxios.post(registerPath, userInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        
        return responseUser;
    } catch (error) {
        throw error;
    }
}

async function verifyResend(axiosContext, email) {
    const verifyResendPath = `/verify/${email}/resend`;
    try {
        let responseData = await axiosContext.publicAxios.get(verifyResendPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        
        return responseUser;
    } catch (error) {
        throw error;
    }
}

async function forgetPassword(axiosContext, email) {
    const forgetPasswordPath = `/password/forgot`;
    try {
        let responseData = await axiosContext.publicAxios.post(forgetPasswordPath,email);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        
        return responseUser;
    } catch (error) {
        throw error;
    }
}

async function resetPassword(axiosContext, userInfo) {
    const resetPasswordPath = `/password/reset`;
    try {
        let responseData = await axiosContext.publicAxios.post(resetPasswordPath,userInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        
        return responseUser;
    } catch (error) {
        throw error;
    }
}



export default {
    login,
    register,
    loginWithGoogle,
    verifyResend,
    forgetPassword,
    resetPassword
}