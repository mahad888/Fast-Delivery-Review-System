import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  MenuItem,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useInputValidation } from "6pp";
import {
  emailValidator,
  nameValidator,
  passwordValidator,
} from "../utils/validator";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/download.jpg";

const SignUp = () => {
  const name = useInputValidation("", nameValidator);
  const email = useInputValidation("", emailValidator);
  const password = useInputValidation("", passwordValidator);
  const confirmPassword = useInputValidation("", (value) => {
    if (value !== password.value) {
      return { isValid: false, errorMessage: "Passwords do not match" };
    }
    return { isValid: true, errorMessage: "" };
  });

  const role = useInputValidation("user"); // Default role
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/register",
        {
          name: name.value,
          email: email.value,
          password: password.value,
          role: role.value, // Send role
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Registration successful");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: "16px",
          mt: 10,
          textAlign: "center",
          backgroundColor: "white",
          color: "#f9f9f9",
        }}
      >
        <Avatar src={logo} alt="App Logo" sx={{ width: 80, height: 80, margin: "auto" }} />
        <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: "bold", color: "#000000" }}>
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ color: "white", mt: 1 }}>
          Join us today!
        </Typography>

        <form onSubmit={handleRegister} style={{ marginTop: "1.5rem" }}>
          {/* Full Name */}
          <TextField
            label="Full Name"
            fullWidth
            value={name.value}
            onChange={name.changeHandler}
            error={!!name.error}
            helperText={name.error}
            margin="normal"
            // sx={{ "& .MuiInputLabel-root": { color: "black" } }}
          />

          {/* Email */}
          <TextField
            label="Email"
            fullWidth
            value={email.value}
            onChange={email.changeHandler}
            error={!!email.error}
            helperText={email.error}
            margin="normal"
            // sx={{ "& .MuiInputLabel-root": { color: "black" } }}
          />

          {/* Password */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password.value}
            onChange={password.changeHandler}
            error={!!password.error}
            helperText={password.error}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={togglePasswordVisibility} aria-label="Toggle password visibility">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </Button>
              ),
            }}
          />

          {/* Confirm Password */}
          <TextField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={confirmPassword.value}
            onChange={confirmPassword.changeHandler}
            error={!!confirmPassword.error}
            helperText={confirmPassword.error}
            margin="normal"
          />

          {/* Role Selection */}
          <TextField
            select
            label="Role"
            fullWidth
            value={role.value}
            onChange={role.changeHandler}
            margin="normal"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 3, color: "white", height: "50px" }}
          >
            Register
          </Button>

          {/* Link to Login */}
          <Typography sx={{ mt: 2, color:"#000000"}}>
            Already have an account?{" "}
            <Button component="a" href="/" sx={{ textTransform: "none", fontWeight: "bold" }}>
              Login
            </Button>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUp;
