import { createContext, useState, useEffect, useContext } from "react";
// import { fetchStudent } from "../utils/api";
import axios from "axios";


let backend_url = import.meta.env.VITE_APP_SERVER_URL;
export const UserContext = createContext();


export const UserProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState(null);

  const signup = async(data)=>{
    try {
      console.log(data , backend_url)
      let res = await axios.post(backend_url + "auth/signup",data,
        {
          withCredentials : true,
        }
      )
      console.log(res);
      return true;
    } catch (e) {
      console.log(e);
      return false
    }
  }
  const login = async(data)=>{
    try {
      console.log(data , backend_url)
      let res = await axios.post(backend_url + "auth/login",data,
        {
          withCredentials : true,
        }
      )
      console.log(res);
      return true;
    } catch (e) {
      console.log(e);
      return false
    }
  }
  const logout = async()=>{
    try {
     
      let res = await fetch(`${backend_url}auth/logout`, {
        credentials: "include",
      });
      res = await res.json();
      console.log(res);
      setUser(null)
      return true;
    } catch (e) {
      console.log(e);
      return false
    }

  }

  useEffect(() => {
    const getUser = async () => {
         let res = await axios.get(backend_url + "auth/get-user",{
              withCredentials: true,
          })
        //   return res.data;
        console.log(res.data);
      setUser(res?.data?.user);
    };
    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, allUsers, setAllUsers, signup,login,logout}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

