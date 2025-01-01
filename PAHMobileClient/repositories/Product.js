import { pageParameters } from "../constants";

async function getProductsHome(axiosContext) {
    const productPath = `/product?type=1&PageSize=8&PageNumber=1`;
    try {
        let result = {
            productList: {},
            count: 0
        };
        let responseData = await axiosContext.publicAxios.get(productPath);
        result.productList = responseData.data.data.productList;
        result.count = responseData.data.data.count;
        return result;
    } catch (error) {
        throw error;
    }
}

async function getProducts(axiosContext, query) {
    const { nameSearch = '', materialId = 0, categoryId = 0,
        type = 1, priceMin = 0, priceMax = 0, orderBy = 0, pageNumber = 1 } = query
    const productPath = `/product?nameSearch=${nameSearch}&materialId=${materialId}&categoryId=${categoryId}&type=${type}&priceMin=${priceMin}&priceMax=${priceMax}&orderBy=${orderBy}&PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;

    try {
        let result = {
            productList: {},
            count: 0
        };
        let responseData = await axiosContext.publicAxios.get(productPath);
        result.productList = responseData.data.data.productList;
        result.count = responseData.data.data.count;
        return result;
    } catch (error) {
        throw error;
    }
}

async function getProductDetail(axiosContext, product_id) {
    const productPath = `/product/${product_id}`;
    try {
        let responseData = await axiosContext.publicAxios.get(productPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseProduct = responseData.data.data;
        let product = {};

        product.id = responseProduct.id ?? 0;
        product.name = responseProduct.name ?? '';
        product.description = responseProduct.description ?? '';
        product.price = responseProduct.price ?? 0;
        product.dimension = responseProduct.dimension ?? '';
        product.weight = responseProduct.weight ?? '';
        product.origin = responseProduct.origin ?? '';
        product.packageMethod = responseProduct.packageMethod ?? '';
        product.packageContent = responseProduct.packageContent ?? '';
        product.condition = responseProduct.condition ?? '';
        product.type = responseProduct.type ?? '';
        product.ratings = responseProduct.ratings ?? '';
        product.categoryId = responseProduct.categoryId ?? '';
        product.categoryName = responseProduct.categoryName ?? '';
        product.materialId = responseProduct.materialId ?? '';
        product.materialName = responseProduct.materialName ?? '';
        product.sellerName = responseProduct.sellerName ?? '';
        product.imageUrls = responseProduct.imageUrls ?? [];
        product.seller = responseProduct.seller ?? {};
        product.feedbacks = responseProduct.feedbacks ?? [];

        return product;
    } catch (error) {
        throw error;
    }
}

async function createProduct(axiosContext, productinfo) {
    const productPath = `/product`;
    try {
        let responseData = await axiosContext.authAxios.post(productPath, productinfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseProduct = responseData.data.data;

        return responseProduct;
    } catch (error) {
        throw error;
    }
}

async function updateProduct(axiosContext, productId,productInfo) {
    const updateProductPath = `/product/${productId}`;
    try {
        let responseData = await axiosContext.authAxios.put(updateProductPath,productInfo);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseProduct = responseData.data.data;

        return responseProduct;
    } catch (error) {
        throw error;
    }
}

async function getProductsBySeller(axiosContext, seller_id, pageNumber = 1) {
    const productPath = `/product/seller/${seller_id}?PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;
    try {
        let result = [];
        let responseData = await axiosContext.authAxios.get(productPath);
        responseData.data.data.forEach(function (responseProduct) {
            let product = {};

            product.id = responseProduct.id ?? 0;
            product.name = responseProduct.name ?? '';
            product.price = responseProduct.price ?? 0;
            product.ratings = responseProduct.ratings ?? 0;
            product.sellerName = responseProduct.sellerName ?? '';
            product.imageUrl = responseProduct.imageUrl ?? '';

            result.push(product);
        });
        return result;
    } catch (error) {
        throw error;
    }
}

async function deleteProduct(axiosContext, productId) {
    const productPath = `/product/${productId}`;

    try {
        let responseData = await axiosContext.authAxios.delete(productPath);
        if (responseData.status != 200) {
            throw responseData.message;
        }
        let responseProduct = responseData.data.data;
        return responseProduct;
    } catch (error) {
        throw error;
    }
}

export default {
    getProductsHome,
    getProducts,
    getProductDetail,
    createProduct,
    getProductsBySeller,
    updateProduct,
    deleteProduct
}