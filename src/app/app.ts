import Column from './column'
import config from '../config.json'
import {delay} from './utils'

export enum AppState {
  Stop = 'stop',
  Spin = 'spin',
  Prize = 'prize',
}

export default class Slot {
  private columns: Column[] = []
  private width: number
  private canvas: HTMLCanvasElement | null
  private state: AppState = AppState.Stop
  private phaseStartTimestamp: number = 0

  constructor(selector: string) {
    this.width = 0
    this.canvas = document.querySelector(selector)

    if (!this.canvas) {
      return
    }

    for (let i = 0; i < config.columns; i++) {
      let column = new Column({
        index: i,
        left: this.width,
        ctx: this.canvas.getContext('2d')!,
      })

      this.width += config.image_width
      this.columns.push(column)
    }

    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = config.image_height + 'px'
    this.canvas.width = this.width
    this.canvas.height = config.image_height

    this.render()
  }

  public start(): Promise<void> {
    return new Promise(resolve => {
      this.state = AppState.Spin
      this.phaseStartTimestamp = Date.now()

      const hasPrize: boolean = this.columns
        .map(col => col.getResult())
        .reduce((acc, colResult) => acc.add(colResult), new Set())
        .size === config.columns - config.need_same_images_to_win + 1

      delay(config.spin_time).then(() => {
        this.state = hasPrize ? AppState.Prize : AppState.Stop
        this.columns.forEach(col => col.stop())

        return hasPrize ? delay(config.prize_time) : Promise.resolve(null)
      }).then(() => {
        this.state = AppState.Stop
        resolve()
      })

      this.render()
    })
  }

  public render = (): void => {
    if (!this.canvas) {
      return
    }

    const time = this.phaseStartTimestamp ? Date.now() - this.phaseStartTimestamp : 0
    const ctx = this.canvas.getContext('2d')!

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.columns.forEach(column => column.render(this.state, time))

    if (this.state !== AppState.Stop) {
      window.requestAnimationFrame(this.render)
    }
  }
}
