import type { _jmUser } from "./user"

export namespace _jmAuth {
  export interface LoginData {
    username: string
    password: string
  }
  export interface SignupData {
    email: string
    gender: _jmUser.Gender
    password: string
    password_confirm: string
    username: string
  }
  export const _ = undefined
}