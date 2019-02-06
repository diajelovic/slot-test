import SlotImage from './image'
import config from '../config.json'
import {AppState} from './app'
import {Map, random} from './utils'
import easing from 'eases/quart-out'

const context = require.context('./images', false, /.+\.png$/)
const images = context.keys()
const imageCount = Math.ceil(config.images_count / images.length)
const columnHeight = config.images_count * config.image_height
const overallDistance = columnHeight * config.loops

interface ColumnOptions {
  index: number
  left: number;
  ctx: CanvasRenderingContext2D
}

export default class Column {
  private items: SlotImage[] = []
  private notFilled: Map<number> = {}
  private result: number = 1
  private resultOffset: number = 0
  private index: number
  private startOffset: number = 0

  public constructor(options: ColumnOptions) {
    for (let i = 0; i < images.length; i++) {
      this.notFilled[images[i]] = 0
    }

    this.index = options.index

    for (let i = 0; i < config.images_count; i++) {
      this.items.push(
        new SlotImage({
          left: options.left,
          top: i * config.image_height,
          url: context(this.getImageName()),
          ctx: options.ctx
        })
      )
    }
  }

  private getImageName(): string {
    let notFilledKeys = Object.keys(this.notFilled)
    let index = random(0, notFilledKeys.length - 1)
    let imageName = notFilledKeys[index]

    this.notFilled[imageName]++

    if (this.notFilled[imageName] >= imageCount) {
      delete this.notFilled[imageName]
    }

    return imageName
  }

  public getResult(): string {
    const prevResult = this.result

    this.result = random(0, config.images_count - 1)
    this.resultOffset = (this.result - prevResult) * config.image_height

    return this.items[this.result].getUrl()
  }

  public stop(): void {
    this.startOffset += this.resultOffset
    this.resultOffset = 0
  }

  public render(state: AppState, time: number): void {
    const offset = this.getOffset(time)

    this.items.forEach((item, i) => {
      item.setOffset(offset)
      if (this.needToRenderItem(item)) {
        item.render(
          state,
          time
        )
      }
    })
  }

  private getOffset(time: number): number {
    let overallTime = time / (config.spin_time - (config.columns - this.index - 1) * config.columns_stop_delay)

    if (overallTime > 1) {
      overallTime = 1
    }

    return (this.startOffset + (overallDistance + this.resultOffset) *  easing(overallTime)) % columnHeight
  }

  private needToRenderItem(item: SlotImage): boolean {
    const {top} = item.getPosition()

    return (
      this.isPointVisible(top) ||
      this.isPointVisible(top + config.image_height - 1)
    )
  }

  private isPointVisible(y: number): boolean {
    return y >= 0 && y < config.image_height
  }
}
