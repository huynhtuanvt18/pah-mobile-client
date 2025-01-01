async function getMaterials(axiosContext) {
    const materialPath = `/material`;
    try {
        let result = [];
        let responseData = await axiosContext.publicAxios.get(materialPath);
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

export default {
    getMaterials,
}