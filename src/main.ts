import './styles.scss'
import Slot from './app/app'

window.addEventListener('load', () => {
  const el = document.querySelector('button')
  const slot = new Slot('#app')

  if (el) {
    el.addEventListener('click', () => {
      el.disabled = true;
      slot.start().then(() => el.disabled = false)
    })
  }
})
