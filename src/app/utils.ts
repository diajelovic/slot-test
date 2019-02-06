export const delay = (time: number): Promise<void> => {
  return new Promise(res => setTimeout(res, time))
}

export const random = (start:number, finish:number): number => {
  const range = finish - start;

  return Math.round(Math.random() * range) + start
}

export interface Map<T> {
  [key: string]: number
}
