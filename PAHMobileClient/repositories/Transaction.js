import { pageParameters } from "../constants";

async function getTransactionsByCurrentUser(axiosContext, type, pageNumber = 1) {
    const transactionPath = `/transaction/current?type=${type}&PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;
    try {
      let result = [];
      let responseData = await axiosContext.authAxios.get(transactionPath);
      responseData.data.data.forEach(function (responseTransaction) {
        let transaction = {};   
  
        transaction.id = responseTransaction.id ?? 0;
        transaction.walletId = responseTransaction.walletId ?? 0;
        transaction.paymentMethod = responseTransaction.paymentMethod ?? 0;
        transaction.amount = responseTransaction.amount ?? 0;
        transaction.type = responseTransaction.type ?? 0;
        transaction.date = responseTransaction.date ?? '';
        transaction.description = responseTransaction.description ?? '0';
        transaction.status = responseTransaction.status ?? 0;
  
        result.push(transaction);
      });   
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function getTransactionById(axiosContext, id) {
    const transactionPath = `/transaction/${id}`;
    try {
      let responseData = await axiosContext.authAxios.get(transactionPath);
      if (responseData.status != 200) {
        throw responseData.message;
    }
      let responseTransaction=responseData.data.data
      let transaction = {};   
  
        transaction.id = responseTransaction.id ?? 0;
        transaction.walletId = responseTransaction.walletId ?? 0;
        transaction.paymentMethod = responseTransaction.paymentMethod ?? 0;
        transaction.amount = responseTransaction.amount ?? 0;
        transaction.type = responseTransaction.type ?? 0;
        transaction.date = responseTransaction.date ?? '';
        transaction.description = responseTransaction.description ?? '0';
        transaction.status = responseTransaction.status ?? 0;
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  export default {
    getTransactionsByCurrentUser,
    getTransactionById
  }