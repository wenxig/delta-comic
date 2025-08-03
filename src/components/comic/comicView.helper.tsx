import { Icon } from "vant"
import type { FunctionalComponent, ReservedProps } from "vue"

export const LoadingMask: FunctionalComponent<{ index: number }> = ({ index }) => (<div class="w-[100vw] h-[100vh] text-center flex justify-center items-center" > <span class="text-3xl text-white" > {index} </span></div >)

export const MenuButton: FunctionalComponent<{ baseIcon?: string, icon?: string, primary?: boolean, size?: 'big' | 'small', width?: string | number } & ReservedProps, { click: [any] }, { default: any }> = ({ width = "auto", baseIcon, size = 'big', primary, icon, onClick, ...props }, ctx) => (
  <div onClick={onClick} {...props} class={["w-full bg-opacity-50 flex justify-center items-center flex-col *:block"]} style={{ width, height: width }}>
    <Icon size={size == 'big' ? '2rem' : '1rem'} name={baseIcon ? (primary ? baseIcon : `${baseIcon}-o`) : icon} class={[size == 'big' && "-mb-1"]} color={primary ? 'var(--p-color)' : 'white'} />
    <span>{ctx.slots.default()}</span>
  </div >
)

export type AutoPlayConfig = {
  enable: boolean
  reverse: boolean
  speedSecond: number
}
export const baseAutoPlayConfig: AutoPlayConfig = {
  enable: false,
  reverse: false,
  speedSecond: 3
}