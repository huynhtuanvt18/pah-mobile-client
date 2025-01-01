import axios from "axios";
import config from "../config";

async function getAdrressCurrentUser(axiosContext) {
    const addressPath = `/address/current`;
    try {
        let responseData = await axiosContext.authAxios.get(addressPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseAddress = responseData.data.data;
        let address = {};
        
        address.id = responseAddress.id  ?? 0;
        address.customerId = responseAddress.customerId  ?? 0;
        address.recipientName = responseAddress.recipientName  ?? '';
        address.recipientPhone = responseAddress.recipientPhone ?? '';
        address.province = responseAddress.province ?? '';
        address.district = responseAddress.district ?? '';
        address.districtId = responseAddress.districtId ?? 0;
        address.ward = responseAddress.ward ?? '';
        address.wardCode = responseAddress.wardCode ?? '';
        address.street = responseAddress.street ?? '';
        address.type = responseAddress.type ?? 0;
        address.isDefault = responseAddress.isDefault;
        address.createdAt = responseAddress.createdAt ?? '';
        address.updatedAt = responseAddress.updatedAt ?? '';

        return address;
    } catch (error) {
        throw error;
    }
}

async function getAllAdrressCurrentUser(axiosContext) {
    const addressPath = `/address`;
    try {
        let result = [];
        let responseData = await axiosContext.authAxios.get(addressPath);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.id = item.id;
            myObject.customerId = item.customerId;
            myObject.recipientName = item.recipientName;
            myObject.recipientPhone = item.recipientPhone;
            myObject.province = item.province;
            myObject.provinceId = item.provinceId;
            myObject.district = item.district;
            myObject.districtId = item.districtId;
            myObject.ward = item.ward;
            myObject.wardCode = item.wardCode;
            myObject.street = item.street;
            myObject.type = item.type;
            myObject.isDefault = item.isDefault;
            myObject.createdAt = item.createdAt;
            myObject.updatedAt = item.updatedAt;
            result.push(myObject);
        })

        return result;
    } catch (error) {
        throw error;
    }
}

async function getProvinceList() {
    const shippingPath = `${config.ADDRESS_API_URL}/province`;
    let configAxios = {
        headers: {
            Token: config.GHN_TOKEN
        }
    }
    try {
        let result = [];
        let responseData = await axios.get(shippingPath, configAxios);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.provinceId = item.ProvinceID;
            myObject.provinceName = item.ProvinceName;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

async function getDistrictListByProvinceId(provinceId) {
    const shippingPath = `${config.ADDRESS_API_URL}/district?province_id=${provinceId}`;
    
    let configAxios = {
        headers: {
            Token: config.GHN_TOKEN
        }
    }
    try {
        let result = [];
        let responseData = await axios.get(shippingPath, configAxios);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.districtId = item.DistrictID;
            myObject.districtName = item.DistrictName;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

async function getWardListByDistrictId(districtId) {
    const shippingPath = `${config.ADDRESS_API_URL}/ward?district_id=${districtId}`;

    let configAxios = {
        headers: {
            Token: config.GHN_TOKEN
        }
    }
    try {
        let result = [];
        let responseData = await axios.get(shippingPath, configAxios);
        responseData.data.data.forEach(function (item) {
            let myObject = {};
            myObject.wardCode = item.WardCode;
            myObject.wardName = item.WardName;
            result.push(myObject);
        })
        return result;
    } catch (error) {
        throw error;
    }
}

async function createAddress(axiosContext, address) {
    const addressPath = `/address`;

    try {
        let responseData = await axiosContext.authAxios.post(addressPath, address);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseAddress = responseData.data.data;
        return responseAddress;
    } catch (error) {
        throw error;
    }
}

async function updateAddress(axiosContext, address) {
    const addressPath = `/address`;

    try {
        let responseData = await axiosContext.authAxios.put(addressPath, address);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseAddress = responseData.data.data;
        return responseAddress;
    } catch (error) {
        throw error;
    }
}

async function deleteAddress(axiosContext, addressId) {
    const addressPath = `/address/${addressId}`;

    try {
        let responseData = await axiosContext.authAxios.delete(addressPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseAddress = responseData.data.data;
        return responseAddress;
    } catch (error) {
        throw error;
    }
}

export default {
    getAdrressCurrentUser,
    getAllAdrressCurrentUser,
    getProvinceList,
    getDistrictListByProvinceId,
    getWardListByDistrictId,
    createAddress,
    updateAddress,
    deleteAddress
}