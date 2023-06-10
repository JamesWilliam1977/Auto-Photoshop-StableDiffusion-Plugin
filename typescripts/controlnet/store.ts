import { observable, reaction } from 'mobx'

export const DefaultControlNetUnitData = {
    enabled: false,
    input_image: '',
    mask: '',

    module: '',
    model: '',
    weight: 1.0,
    resize_mode: 'Scale to Fit (Inner Fit)',
    lowvram: true,
    processor_res: 512,
    threshold_a: 0,
    threshold_b: 0,

    guidance_start: 0,
    guidance_end: 1,
    guessmode: false,

    control_mode: 'Balanced',
    pixel_perfect: true,
}

export interface controlNetUnitData {
    enabled: boolean
    input_image: string
    mask: string

    module: string
    model: string
    weight: number
    resize_mode: 'Just Resize' | 'Crop and Resize' | 'Resize and Fill'
    lowvram: boolean
    processor_res: number
    threshold_a: number
    threshold_b: number

    guidance_start: number
    guidance_end: number
    guessmode: boolean

    control_mode:
        | 'Balanced'
        | 'My prompt is more important'
        | 'ControlNet is more important'
    pixel_perfect: boolean
}
interface ControlNetMobxStore {
    maxControlNet: number
    controlnetApiVersion: number

    supportedModels: string[]
    supportedPreprocessors: string[]
    preprocessorDetail: { [key: string]: any }

    controlNetUnitData: controlNetUnitData[]
}

var ControlNetStore = observable<ControlNetMobxStore>({
    maxControlNet: 0,
    controlnetApiVersion: 1,

    supportedModels: [],
    supportedPreprocessors: [],
    preprocessorDetail: {},

    controlNetUnitData: [],
})

reaction(
    () => {
        return ControlNetStore.controlNetUnitData.map((data) => data.module)
    },
    (module_, index) => {
        ControlNetStore.controlNetUnitData.forEach((data, index) => {
            const pd = ControlNetStore.preprocessorDetail[module_[index]] || {}
            const pSlider = pd.sliders || []
            data.processor_res = pSlider[0]?.value || 512
            data.threshold_a = pSlider[1]?.value || 0
            data.threshold_b = pSlider[2]?.value || 0
        })
    }
)
reaction(
    () => ControlNetStore.maxControlNet,
    (maxControlNet) => {
        ControlNetStore.controlNetUnitData = Array(maxControlNet)
            .fill(0)
            .map((v, index) => {
                return (
                    ControlNetStore.controlNetUnitData[index] ||
                    DefaultControlNetUnitData
                )
            })
    }
)

export default ControlNetStore
