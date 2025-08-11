import { PromiseContent } from "@/utils/data"
import { importBika } from "./utils"
import type { bika as BikaType } from '..'

export namespace _bikaApiAuth {
  export const login = PromiseContent.fromAsyncFunction((loginData: BikaType.auth.LoginData, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<{ token: string }>('/auth/sign-in', loginData, { signal })))

  export const signUp = PromiseContent.fromAsyncFunction((data: BikaType.auth.SignupData, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<void>('/auth/register', data, { allowEmpty: true, signal })))

}