import { api, getApiMode, demoDb } from "./api";
import { User } from "../types";

export const AuthService = {
  async login(credentials: any): Promise<{ token: string; user: User }> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (credentials.email && credentials.password) {
        const demoUsers = JSON.parse(localStorage.getItem("demo_registered_users") || "[]");
        const matched = demoUsers.find((u: any) => u.email === credentials.email);

        const user: User = matched ? {
          id: matched.id,
          firstname: matched.firstname,
          lastname: matched.lastname,
          email: matched.email
        } : demoDb.getUser();

        const token = "simulated-jwt-token-123456789";
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return { token, user };
      }
      throw new Error("Identifiants incorrects en mode Démo.");
    }

    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token || response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      return response.data;
    } catch (error: any) {
      console.log("--- ERROR DETAILS LOGIN ---", error);
      if (error.response) {
        console.log("Status Code:", error.response.status);
        console.log("Data:", error.response.data);
      } else {
        console.log("Message:", error.message);
      }
      throw error;
    }
  },

  async register(userData: any): Promise<User> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const demoUsers = JSON.parse(localStorage.getItem("demo_registered_users") || "[]");
      const newUser = {
        id: Date.now(),
        firstname: userData.firstname || userData.prenom,
        lastname: userData.lastname || userData.nom,
        email: userData.email,
        password: userData.password
      };
      demoUsers.push(newUser);
      localStorage.setItem("demo_registered_users", JSON.stringify(demoUsers));

      demoDb.saveUser({
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email
      });

      return {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email
      };
    }

    const payload = {
      firstname: userData.firstname || userData.prenom,
      lastname: userData.lastname || userData.nom,
      email: userData.email,
      password: userData.password
    };

    try {
      const response = await api.post("/auth/register", payload);
      return response.data;
    } catch (error: any) {
      console.log("--- ERROR DETAILS REGISTER ---", error);
      if (error.response) {
        console.log("Status Code:", error.response.status);
        console.log("Data:", error.response.data);
      } else {
        console.log("Message:", error.message);
      }
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  updateProfile(user: User): Promise<User> {
    const mode = getApiMode();
    if (mode === "demo") {
      demoDb.saveUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return Promise.resolve(user);
    }
    return api.put(`/profile`, user).then(res => {
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    }).catch(err => {
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    });
  },

  changePassword(data: any): Promise<void> {
    const mode = getApiMode();
    if (mode === "demo") {
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
    return api.post(`/auth/change-password`, data).catch(err => {
      return api.put(`/profile/password`, data);
    }).then(() => {});
  }
};