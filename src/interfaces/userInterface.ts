export interface UserInterface {
  first_name: string;
  last_name: string;
  date_of_birth: string; // Date string
  email: string;
  password: string;
}

export interface UserCreateRequestInterface extends UserInterface {}

export interface UserLoginRequestInterface {
  email: string,
  password: string
}

export interface UserResetPasswordInterface {
  email: string
}

export interface UserInvitationInterface {
  email: string,
  first_name: string,
  last_name: string,
  date_of_birth: string
}