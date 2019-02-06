import config from '../config.json'
import {AppState} from './app'

const columnHeight = config.images_count * config.image_height

interface ImageOptions {
  left: number,
  top: number,
  url: string,
  ctx: CanvasRenderingContext2D
}

interface Position {
  left: number,
  top: number,
}

interface ImageCache {
  [key: string]: HTMLImageElement
}

const caches: ImageCache = {}

function getImage(url: string): Promise<HTMLImageElement> {
  if (caches[url]) {
    return Promise.resolve(caches[url])
  }

  return new Promise((res, rej) => {
    const image = new Image()

    image.onload = () => {
      caches[url] = image
      res(image)
    }
    image.src = url
  })

}

export default class SlotImage {
  private options: ImageOptions
  private spritePosition: number = 0
  private lastUpdate: number = 0
  private offset: number = 0

  constructor(options: ImageOptions) {
    this.options = options

    this.initImage()
  }

  private initImage(): void {
    getImage(this.options.url)
  }

  public getPosition(): Position {
    const topWithOffset = (columnHeight + (this.options.top - this.offset) % columnHeight) % columnHeight

    return {
      left: this.options.left,
      top: -topWithOffset + config.image_height
    }
  }

  public setOffset(offset: number): void {
    this.offset = offset
  }

  public getUrl(): string {
    return this.options.url
  }

  public render(state: AppState, time: number): void {
    if (state === AppState.Prize) {
      this.updateSpritePosition(time)
    }
    if (state === AppState.Stop) {
      this.spritePosition = 0
      this.lastUpdate = 0
    }

    const {left, top} = this.getPosition()

    getImage(this.options.url).then(img =>
      this.options.ctx.drawImage(
        img,
        this.spritePosition,
        0,
        config.image_width,
        config.image_height,
        left,
        top,
        config.image_width,
        config.image_height
      )
    )
  }

  private updateSpritePosition(time: number): void {
    const lastUpdateDiff: number = (time - this.lastUpdate) / config.prize_animation_speed

    if (lastUpdateDiff > 1) {
      this.lastUpdate = time
      this.spritePosition += config.image_width

      if (this.spritePosition / config.image_width >= config.image_slides_count) {
        this.spritePosition = 0
      }
    }
  }
}
