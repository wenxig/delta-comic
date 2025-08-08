import { PromiseContent } from "@/utils/data"
import { importBika } from "./utils"

export namespace _bikaApiAuth {
  export interface LoginData {
    email: string
    password: string
  }
  export const login = PromiseContent.fromAsyncFunction((loginData: LoginData, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<{ token: string }>('/auth/sign-in', loginData, { signal })))

  export interface SignupData {
    email: string,
    password: string,
    name: string,
    birthday: string,
    gender: import("..").bika.user.Gender,
    answer1: string,
    answer2: string,
    answer3: string,
    question1: string,
    question2: string,
    question3: string
  }
  export const signUp = PromiseContent.fromAsyncFunction((data: SignupData, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<void>('/auth/register', data, { allowEmpty: true, signal })))

}