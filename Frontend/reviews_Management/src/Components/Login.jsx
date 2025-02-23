import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Box,
} from "@mui/material";
import { useInputValidation } from "6pp";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { emailValidator, passwordValidator } from "../utils/validator.js";
import logo from "../assets/download.jpg";
import { useDispatch } from "react-redux";
import { setRole, userExist } from "../Redux/reducers/auth";
import toast from "react-hot-toast";

const Login = () => {
  const email = useInputValidation("", emailValidator);
  const password = useInputValidation("", passwordValidator);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(email.value,password.value)

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/login", {
        email: email.value,
        password: password.value,
      }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (data) {
        console.log('user login')
        localStorage.setItem("auth", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch(userExist(data));
        dispatch(setRole(data.role));
        toast.success(data.message);

        if (data.role === "user" || data.role==='admin' ) {
          navigate("/dashboard");
        } 
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
    >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "white",
            width:'30rem'
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
            <img src={logo} alt="Logo" style={{ width: 150, height: 75 }} />
          </Box>
          <Typography component="h1" variant="h5" textAlign="center" marginBottom={2}>
            Login
          </Typography>
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <TextField
              required
              fullWidth
              label="Email or Username"
              margin="normal"
              variant="outlined"
              value={email.value}
              onChange={email.changeHandler}
            />
            <TextField
              required
              fullWidth
              label="Password"
              margin="normal"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password.value}
              onChange={password.changeHandler}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handlePasswordVisibilityToggle} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{ marginTop: 2, backgroundColor: "#1976d2", color: "white", fontSize: "16px", height: "50px", borderRadius: "10px" }}
            >
              Login
            </Button>
            <Typography textAlign="center" marginTop={2}>
              <Link href="/forgetPassword" underline="hover" color="primary">
                Forgot Password?
              </Link>
            </Typography>
            <Typography textAlign="center" marginTop={2}>
              Don't have an account? <Link href="/register" underline="hover">Sign up</Link>
            </Typography>
          </form>
        </Paper>
      
    </Grid>
  );
};

export default Login;
