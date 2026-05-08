export const saveToken = (token) => {
  localStorage.setItem("pg_token", token);
};

export const getToken = () => {
  return localStorage.getItem("pg_token");
};

export const removeToken = () => {
  localStorage.removeItem("pg_token");
};

export const saveUser = (user) => {
  localStorage.setItem(
    "pg_user",
    JSON.stringify(user)
  );
};

export const getUser = () => {
  const user =
    localStorage.getItem("pg_user");

  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("pg_user");
};

export const generateToken = () => {
  return (
    "pg_" +
    Math.random()
      .toString(36)
      .substring(2) +
    Date.now()
  );
};