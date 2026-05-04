import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto, LoginDto, GoogleLoginDto } from "./dto/auth.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully, returns access token",
  })
  @ApiResponse({ status: 409, description: "Email already exists" })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 201,
    description: "Login successful, returns access token",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("google")
  @ApiOperation({ summary: "Login or register with Google" })
  @ApiResponse({
    status: 201,
    description: "Google login successful, returns access token",
  })
  @ApiResponse({ status: 401, description: "Invalid Google token" })
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.idToken);
  }
}
