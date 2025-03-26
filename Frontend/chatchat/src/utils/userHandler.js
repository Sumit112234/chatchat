import axios from 'axios';

let backend_url = import.meta.env.VITE_APP_SERVER_URL;


export const getUser = async()=>{
    let res = await axios.get(backend_url + "auth/get-user",{
        withCredentials: true,
    })
    return res.data;
    
}


export const login = async(data)=>{
    let res = await axios.post(backend_url + "auth/login",data,{
        withCredentials: true,
    })
   

    

    return res.data;
}


export const signup = async(data)=>{
    let res = await axios.post(backend_url + "auth/signup",data,{
        withCredentials: true,
    })

    return res;
}