import { Device } from '@capacitor/device'
import { Capacitor } from "@capacitor/core"

export const deviceInfo = Capacitor.isNativePlatform() ? await Device.getInfo() : undefined
