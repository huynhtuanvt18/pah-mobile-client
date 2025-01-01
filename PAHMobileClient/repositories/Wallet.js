import { pageParameters } from "../constants";

async function getWalletCurrentUser(axiosContext) {
  const walletPath = `/wallet/current`;
  try {
    let responseData = await axiosContext.authAxios.get(walletPath);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let responseWallet = responseData.data.data;
    let wallet = {};

    wallet.id = responseWallet.id ?? 0;
    wallet.availableBalance = responseWallet.availableBalance ?? 0;
    wallet.lockedBalance = responseWallet.lockedBalance ?? 0;

    return wallet;
  } catch (error) {
    throw error;
  }
}

async function topup(axiosContext, topupInfo) {
  const walletPath = `/wallet/topup`;
  try {
    let responseData = await axiosContext.authAxios.post(walletPath, topupInfo);
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let responseWallet = responseData.data.data;

    return responseWallet;
  } catch (error) {
    throw error;
  }
}

async function withdraw(axiosContext, withdrawInfo) {
  const walletPath = `/wallet/withdraw`;
  try {
    let responseData = await axiosContext.authAxios.post(
      walletPath,
      withdrawInfo,
    );
    if (responseData.status != 200) {
      throw responseData.message;
    }
    let responseWallet = responseData.data.data;

    return responseWallet;
  } catch (error) {
    throw error;
  }
}

async function getWithdrawalHistory(axiosContext, pageNumber = 1) {
  const walletPath = `/wallet/withdraw?PageSize=${pageParameters.DEFAULT_PAGE_SIZE}&PageNumber=${pageNumber}`;
  try {
    let result = [];
    let responseData = await axiosContext.authAxios.get(walletPath);
    responseData.data.data.forEach(function (responseWithdrawal) {
      let withdrawal = {};

      withdrawal.id = responseWithdrawal.id ?? 0;
      withdrawal.walletId = responseWithdrawal.walletId ?? 0;
      withdrawal.managerId = responseWithdrawal.managerId ?? 0;
      withdrawal.amount = responseWithdrawal.amount ?? 0;
      withdrawal.bank = responseWithdrawal.bank ?? '';
      withdrawal.bankNumber = responseWithdrawal.bankNumber ?? '';
      withdrawal.createdAt = responseWithdrawal.createdAt ?? '';
      withdrawal.updatedAt = responseWithdrawal.updatedAt ?? '';
      withdrawal.status = responseWithdrawal.status ?? 0;
      withdrawal.managerName = responseWithdrawal.managerName ?? '';

      result.push(withdrawal);
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export default {
  getWalletCurrentUser,
  topup,
  withdraw,
  getWithdrawalHistory,
};
