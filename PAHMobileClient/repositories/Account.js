async function getInfoCurrentUser(axiosContext) {
    const userPath = `/user/current`;
    try {
        let responseData = await axiosContext.authAxios.get(userPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;
        let user = {};

        user.id = responseUser.id ?? 0;
        user.email = responseUser.email ?? '';
        user.name = responseUser.name ?? '';
        user.phone = responseUser.phone ?? '';
        user.profilePicture = responseUser.profilePicture ?? '';
        user.gender = responseUser.gender ?? 1;
        user.dob = responseUser.dob ?? '';
        user.role = responseUser.role ?? 1;

        return user;
    } catch (error) {
        throw error;
    }
}

async function updateProfile(axiosContext, profileInfo) {
    const profilePath = `/user/profile`;
    try {
        let responseData = await axiosContext.authAxios.post(profilePath, profileInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseUser = responseData.data.data;

        return responseUser;
    } catch (error) {
        throw error;
    }
}

async function changePassword(axiosContext, passwordInfo) {
    const profilePath = `/user/password`;
    try {
        let responseData = await axiosContext.authAxios.post(profilePath, passwordInfo);
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
    getInfoCurrentUser,
    updateProfile,
    changePassword
}