import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginuserDto: LoginUserDto) {
    return this.authService.login(loginuserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,

    @GetUser() user: User,
    @GetUser('roles') userRole: User,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    // console.log({user: request.user })
    // console.log(request );

    return {
      ok: true,
      message: 'Hello world private',
      user: user,
      userRole,
      rawHeaders,
      headers
    };
  }


  // @SetMetadata('roles',['admin','super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.superAdmin, ValidRoles.admin, ValidRoles.user)
  @UseGuards( AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user:User
  ){

    return {
      ok: true,
      user
    }
  }
  
  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user:User
  ){

    return {
      ok: true,
      user
    }
  }



}
