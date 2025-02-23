// na

import { isValidUsername} from "6pp";

export const nameValidator = (name) => {
    if (!name.trim()) {
        if(!isValidUsername(name)){
            return {isValid:false , errorMessage:"Name is Invalid"};
        }
     }
    else if (!/^[a-zA-Z\s]*$/.test(name)) {
        return {isValid:false,errorMessage:"Name can only contain letters and spaces"};
      }
  }
  
  export const emailValidator = (value) => {
    if (!value.trim()) {
      return "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    ) {
      return {isValid:false , errorMessage:"Invalid email address"}
    }
    return {isValid:true , errorMessage:""};
  };
  

  export const passwordValidator = (value) => {
    if (!value.trim()) {
      return "Password is required";
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(value) || value.length < 8){
      return {isValid:false ,errorMessage:"Password must be at least 8 characters, and contain at least one uppercase letter, one lowercase letter, one number and one special character"};
    }

    return {isValid:true , errorMessage:""};
  };
  