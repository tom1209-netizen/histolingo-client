import axios from "axios";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { SearchQuery } from "../schemas/schema";
import { TestData } from "../interfaces/test.interface";
import api from "./interceptor";

// const domain_api = import.meta.env.VITE_DOMAIN_API;

export const getPlayerTests = async (
  query: SearchQuery = {}
): Promise<AxiosResponse<any>> => {
  try {
    const accessToken = Cookies.get("accessToken");
    const response = await api.get(`/tests`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: query,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Get player tests failed"
      );
    } else {
      throw error;
    }
  }
};

export const createPlayerTest = async (
  body: TestData
): Promise<AxiosResponse<any>> => {
  try {
    const accessToken = Cookies.get("accessToken");
    const response = await api.post(`/tests`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Create player test failed"
      );
    } else {
      throw error;
    }
  }
};

export const updatePlayerTest = async (
  id: string,
  body: any
): Promise<AxiosResponse<any>> => {
  try {
    const accessToken = Cookies.get("accessToken");
    const response = await api.patch(`/tests/${id}`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Update player test failed"
      );
    } else {
      throw error;
    }
  }
};

export const getIndividualPlayerTest = async (
  id: string
): Promise<AxiosResponse<any>> => {
  try {
    const accessToken = Cookies.get("accessToken");
    const response = await api.get(`/tests/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Get individual player test failed"
      );
    } else {
      throw error;
    }
  }
};

export const switchTestStatus = async (
  id: string,
  status: number
): Promise<AxiosResponse<any>> => {
  try {
    const accessToken = Cookies.get("accessToken");
    const response = await api.patch(
      `/tests/${id}`,
      { status },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Update test status failed"
      );
    } else {
      throw error;
    }
  }
};
