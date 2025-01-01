async function getCategories(axiosContext) {
    const categoryPath = `/category`;
    try {
        let result = [];
        let responseData = await axiosContext.publicAxios.get(categoryPath);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.id = item.id;
            myObject.name = item.name;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

async function getCategoriesHome(axiosContext) {
    const categoryPath = `/category`;
    try {
        let result = [];
        let responseData = await axiosContext.publicAxios.get(categoryPath);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.id = item.id;
            myObject.name = item.name;
            myObject.imageUrl = item.imageUrl;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

export default {
    getCategories,
    getCategoriesHome
}