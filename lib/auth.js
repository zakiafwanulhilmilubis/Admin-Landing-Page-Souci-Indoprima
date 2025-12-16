import Cookies from "js-cookie";

export const setAuthToken = (token) => {
  Cookies.set("admin_token", token, { expires: 7 }); // 7 days
};

export const getAuthToken = () => {
  return Cookies.get("admin_token");
};

export const removeAuthToken = () => {
  Cookies.remove("admin_token");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
